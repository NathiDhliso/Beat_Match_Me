/**
 * Process Payment Lambda Function
 * Integrates with Yoco API to process payments for song requests
 */

const AWS = require('aws-sdk');
const https = require('https');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const secretsManager = new AWS.SecretsManager();

// Get Yoco API key from Secrets Manager
async function getYocoApiKey() {
  const secret = await secretsManager
    .getSecretValue({ SecretId: 'beatmatchme/yoco/api-key' })
    .promise();
  return JSON.parse(secret.SecretString).apiKey;
}

// Call Yoco API to process payment
async function processYocoPayment(apiKey, paymentData) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      token: paymentData.token,
      amountInCents: Math.round(paymentData.amount * 100), // Convert to cents
      currency: 'ZAR',
      metadata: {
        requestId: paymentData.requestId,
        eventId: paymentData.eventId,
        userId: paymentData.userId,
      },
    });

    const options = {
      hostname: 'online.yoco.com',
      path: '/v1/charges/',
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
        if (res.statusCode === 201) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Yoco API error: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

exports.handler = async (event) => {
  console.log('Processing payment:', JSON.stringify(event, null, 2));

  try {
    const { requestId, eventId, userId, amount, paymentToken } = event.arguments.input;

    // Get Yoco API key
    const apiKey = await getYocoApiKey();

    // Process payment with Yoco
    const yocoResponse = await processYocoPayment(apiKey, {
      token: paymentToken,
      amount,
      requestId,
      eventId,
      userId,
    });

    // Create transaction record in DynamoDB
    const transaction = {
      transactionId: yocoResponse.id,
      requestId,
      eventId,
      userId,
      amount,
      status: 'COMPLETED',
      paymentMethod: 'YOCO',
      yocoChargeId: yocoResponse.id,
      createdAt: Date.now(),
      metadata: yocoResponse.metadata,
    };

    await dynamodb
      .put({
        TableName: 'beatmatchme-transactions',
        Item: transaction,
      })
      .promise();

    // Update request status to PAID
    await dynamodb
      .update({
        TableName: 'beatmatchme-requests',
        Key: { requestId },
        UpdateExpression: 'SET #status = :status, transactionId = :transactionId',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': 'PENDING',
          ':transactionId': transaction.transactionId,
        },
      })
      .promise();

    console.log('Payment processed successfully:', transaction.transactionId);

    return {
      transactionId: transaction.transactionId,
      status: 'COMPLETED',
      amount: transaction.amount,
      requestId: transaction.requestId,
    };
  } catch (error) {
    console.error('Payment processing failed:', error);

    // Create failed transaction record
    const failedTransaction = {
      transactionId: `failed-${Date.now()}`,
      requestId: event.arguments.input.requestId,
      eventId: event.arguments.input.eventId,
      userId: event.arguments.input.userId,
      amount: event.arguments.input.amount,
      status: 'FAILED',
      errorMessage: error.message,
      createdAt: Date.now(),
    };

    await dynamodb
      .put({
        TableName: 'beatmatchme-transactions',
        Item: failedTransaction,
      })
      .promise();

    throw new Error(`Payment failed: ${error.message}`);
  }
};
