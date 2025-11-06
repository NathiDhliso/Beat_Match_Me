/**
 * Process Refund Lambda Function
 * Handles refunds for vetoed requests via Yoco API
 */

const AWS = require('aws-sdk');
const https = require('https');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const secretsManager = new AWS.SecretsManager();
const sns = new AWS.SNS();

// Environment configuration - allows override for testing
const REQUESTS_TABLE = process.env.REQUESTS_TABLE || 'beatmatchme-requests';
const TRANSACTIONS_TABLE = process.env.TRANSACTIONS_TABLE || 'beatmatchme-transactions';
const FAILED_REFUNDS_TABLE = process.env.FAILED_REFUNDS_TABLE || 'beatmatchme-failed-refunds';

// Get Yoco API key from Secrets Manager
async function getYocoApiKey() {
  const secret = await secretsManager
    .getSecretValue({ SecretId: 'beatmatchme/yoco/api-key' })
    .promise();
  return JSON.parse(secret.SecretString).apiKey;
}

// Process refund via Yoco API
async function processYocoRefund(apiKey, chargeId, amount) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      amountInCents: Math.round(amount * 100),
    });

    const options = {
      hostname: 'online.yoco.com',
      path: `/v1/charges/${chargeId}/refund`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
        Authorization: `Bearer ${apiKey}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Yoco refund error: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

exports.handler = async (event) => {
  console.log('Processing refund:', JSON.stringify(event, null, 2));

  const { requestId, reason } = event.arguments;
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      // Get original transaction
      const requestResult = await dynamodb
        .get({
          TableName: REQUESTS_TABLE,
          Key: { requestId },
        })
        .promise();

      if (!requestResult.Item) {
        throw new Error('Request not found');
      }

      const request = requestResult.Item;
      const transactionId = request.transactionId;

      // Get transaction details
      const transactionResult = await dynamodb
        .get({
          TableName: TRANSACTIONS_TABLE,
          Key: { transactionId },
        })
        .promise();

      if (!transactionResult.Item) {
        throw new Error('Transaction not found');
      }

      const transaction = transactionResult.Item;

      // Check if already refunded
      if (transaction.status === 'REFUNDED') {
        console.log('Transaction already refunded');
        return {
          success: true,
          message: 'Already refunded',
          transactionId,
        };
      }

      // Validate transaction is refundable
      if (transaction.status !== 'COMPLETED') {
        throw new Error(`Transaction not refundable. Status: ${transaction.status}`);
      }

      // Get Yoco API key
      const apiKey = await getYocoApiKey();

      // Process refund with Yoco
      const refundResponse = await processYocoRefund(
        apiKey,
        transaction.yocoChargeId,
        transaction.amount
      );

      // Create refund transaction record
      const refundTransaction = {
        transactionId: `refund-${Date.now()}`,
        originalTransactionId: transactionId,
        requestId,
        eventId: request.eventId,
        userId: request.userId,
        amount: transaction.amount,
        type: 'REFUND',
        status: 'COMPLETED',
        paymentMethod: 'YOCO',
        yocoRefundId: refundResponse.id,
        reason: reason || 'Request vetoed',
        createdAt: Date.now(),
      };

      await dynamodb
        .put({
          TableName: TRANSACTIONS_TABLE,
          Item: refundTransaction,
        })
        .promise();

      // Update original transaction status
      await dynamodb
        .update({
          TableName: TRANSACTIONS_TABLE,
          Key: { transactionId },
          UpdateExpression: 'SET #status = :status, refundedAt = :refundedAt',
          ExpressionAttributeNames: {
            '#status': 'status',
          },
          ExpressionAttributeValues: {
            ':status': 'REFUNDED',
            ':refundedAt': Date.now(),
          },
        })
        .promise();

      // Update request status
      await dynamodb
        .update({
          TableName: REQUESTS_TABLE,
          Key: { requestId },
          UpdateExpression: 'SET #status = :status, vetoedAt = :vetoedAt, vetoReason = :reason',
          ExpressionAttributeNames: {
            '#status': 'status',
          },
          ExpressionAttributeValues: {
            ':status': 'VETOED',
            ':vetoedAt': Date.now(),
            ':reason': reason || 'Request vetoed by DJ',
          },
        })
        .promise();

      // Send notification to user
      await sns
        .publish({
          TopicArn: process.env.USER_NOTIFICATIONS_TOPIC,
          Message: JSON.stringify({
            type: 'REFUND_PROCESSED',
            userId: request.userId,
            requestId,
            amount: transaction.amount,
            reason: reason || 'Request vetoed',
          }),
          Subject: 'Refund Processed - BeatMatchMe',
        })
        .promise();

      console.log('Refund processed successfully:', refundTransaction.transactionId);

      return {
        success: true,
        transactionId: refundTransaction.transactionId,
        amount: refundTransaction.amount,
        requestId,
      };
    } catch (error) {
      retryCount++;
      console.error(`Refund attempt ${retryCount} failed:`, error);

      if (retryCount >= maxRetries) {
        // Log failed refund for manual processing
        await dynamodb
          .put({
            TableName: FAILED_REFUNDS_TABLE,
            Item: {
              requestId,
              attempts: retryCount,
              lastError: error.message,
              createdAt: Date.now(),
              status: 'NEEDS_MANUAL_REVIEW',
            },
          })
          .promise();

        throw new Error(`Refund failed after ${maxRetries} attempts: ${error.message}`);
      }

      // Wait before retry (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
    }
  }
};
