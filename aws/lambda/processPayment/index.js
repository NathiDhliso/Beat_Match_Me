/**
 * Process Payment Lambda Function
 * Integrates with Yoco API to process payments for song requests
 * Handles BeatMatchMe 15% commission and performer 85% split
 */

const AWS = require('aws-sdk');
const https = require('https');

const dynamodb = new AWS.DynamoDB.DocumentClient();

// Commission configuration
const PLATFORM_COMMISSION_RATE = 0.15; // 15%
const PERFORMER_SHARE_RATE = 0.85;     // 85%

/**
 * Calculate payment split between platform and performer
 */
function calculatePaymentSplit(grossAmount) {
  // Yoco fees are deducted from gross by Yoco automatically
  // We split the net amount that hits our account
  const platformFee = grossAmount * PLATFORM_COMMISSION_RATE;
  const performerEarnings = grossAmount * PERFORMER_SHARE_RATE;
  
  return {
    grossAmount,
    platformFee: parseFloat(platformFee.toFixed(2)),
    performerEarnings: parseFloat(performerEarnings.toFixed(2)),
  };
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
    const { requestId, eventId, setId, performerId, userId, amount, paymentToken } = event.arguments.input;

    // Calculate payment split
    const paymentSplit = calculatePaymentSplit(amount);
    console.log('Payment split:', paymentSplit);

    // Get Yoco API key from environment variables
    const apiKey = process.env.YOCO_SECRET_KEY;
    
    if (!apiKey) {
      throw new Error('Yoco API key not configured');
    }

    // Process payment with Yoco
    const yocoResponse = await processYocoPayment(apiKey, {
      token: paymentToken,
      amount,
      requestId,
      eventId,
      userId,
    });

    const now = Date.now();

    // Create transaction record in DynamoDB
    const transaction = {
      transactionId: yocoResponse.id,
      requestId,
      eventId,
      setId,
      performerId,
      userId,
      amount: paymentSplit.grossAmount,
      platformFee: paymentSplit.platformFee,
      performerEarnings: paymentSplit.performerEarnings,
      status: 'COMPLETED',
      type: 'CHARGE',
      paymentProvider: 'YOCO',
      providerTransactionId: yocoResponse.id,
      createdAt: now,
      completedAt: now,
      metadata: {
        ...yocoResponse.metadata,
        commissionRate: PLATFORM_COMMISSION_RATE,
        performerShareRate: PERFORMER_SHARE_RATE,
      },
    };

    await dynamodb
      .put({
        TableName: process.env.TRANSACTIONS_TABLE || 'beatmatchme-transactions',
        Item: transaction,
      })
      .promise();

    // Update request status to PENDING (awaiting DJ acceptance)
    await dynamodb
      .update({
        TableName: process.env.REQUESTS_TABLE || 'beatmatchme-requests',
        Key: { requestId },
        UpdateExpression: 'SET #status = :status, transactionId = :transactionId, paidAmount = :amount, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': 'PENDING',
          ':transactionId': transaction.transactionId,
          ':amount': amount,
          ':updatedAt': now,
        },
      })
      .promise();

    // Update performer balance
    await dynamodb
      .update({
        TableName: process.env.USERS_TABLE || 'beatmatchme-users',
        Key: { userId: performerId },
        UpdateExpression: 'ADD availableBalance :earnings, totalEarnings :amount, transactionCount :one SET updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':earnings': paymentSplit.performerEarnings,
          ':amount': paymentSplit.grossAmount,
          ':one': 1,
          ':updatedAt': now,
        },
      })
      .promise();

    // Update event/set revenue
    if (setId) {
      await dynamodb
        .update({
          TableName: process.env.SETS_TABLE || 'beatmatchme-djsets',
          Key: { setId },
          UpdateExpression: 'ADD revenue :amount, requestCount :one SET updatedAt = :updatedAt',
          ExpressionAttributeValues: {
            ':amount': paymentSplit.performerEarnings,
            ':one': 1,
            ':updatedAt': now,
          },
        })
        .promise();
    }

    console.log('Payment processed successfully:', transaction.transactionId);

    return {
      transactionId: transaction.transactionId,
      status: 'COMPLETED',
      amount: transaction.amount,
      platformFee: transaction.platformFee,
      performerEarnings: transaction.performerEarnings,
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
      type: 'CHARGE',
      errorMessage: error.message,
      createdAt: Date.now(),
    };

    await dynamodb
      .put({
        TableName: process.env.TRANSACTIONS_TABLE || 'beatmatchme-transactions',
        Item: failedTransaction,
      })
      .promise();

    throw new Error(`Payment failed: ${error.message}`);
  }
};
