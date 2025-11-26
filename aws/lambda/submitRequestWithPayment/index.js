/**
 * Submit Request With Payment Lambda
 * Secure mutation that verifies Yoco payment before creating request
 * Handles the complete flow: verify payment -> create request -> update queue
 */

const AWS = require('aws-sdk');
const https = require('https');
const crypto = require('crypto');

const dynamodb = new AWS.DynamoDB.DocumentClient({
  maxRetries: 3,
  httpOptions: {
    timeout: 5000,
    connectTimeout: 3000,
    agent: new https.Agent({
      keepAlive: true,
      maxSockets: 50,
    }),
  },
});

const PLATFORM_COMMISSION_RATE = 0.15;
const PERFORMER_SHARE_RATE = 0.85;

const REQUESTS_TABLE = process.env.REQUESTS_TABLE || 'beatmatchme-requests';
const TRANSACTIONS_TABLE = process.env.TRANSACTIONS_TABLE || 'beatmatchme-transactions';
const SETS_TABLE = process.env.SETS_TABLE || 'beatmatchme-djsets';
const EVENTS_TABLE = process.env.EVENTS_TABLE || 'beatmatchme-events';
const USERS_TABLE = process.env.USERS_TABLE || 'beatmatchme-users';
const QUEUES_TABLE = process.env.QUEUES_TABLE || 'beatmatchme-queues';

async function verifyYocoCharge(apiKey, chargeId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'online.yoco.com',
      path: `/v1/charges/${chargeId}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Yoco verification failed: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Yoco API timeout'));
    });
    req.end();
  });
}

function calculatePaymentSplit(grossAmount) {
  const platformFee = grossAmount * PLATFORM_COMMISSION_RATE;
  const performerEarnings = grossAmount * PERFORMER_SHARE_RATE;
  
  return {
    grossAmount,
    platformFee: parseFloat(platformFee.toFixed(2)),
    performerEarnings: parseFloat(performerEarnings.toFixed(2)),
  };
}

exports.handler = async (event) => {
  const startTime = Date.now();
  const correlationId = crypto.randomUUID();
  
  console.log(JSON.stringify({
    level: 'INFO',
    correlationId,
    message: 'submitRequestWithPayment started',
    input: event.arguments?.input,
    userId: event.identity?.sub,
  }));

  try {
    const input = event.arguments.input;
    const userId = event.identity?.sub;
    
    if (!userId) {
      return {
        success: false,
        errorCode: 'UNAUTHORIZED',
        errorMessage: 'User not authenticated',
      };
    }

    const {
      eventId,
      setId,
      songTitle,
      artistName,
      genre,
      requestType,
      dedication,
      shoutout,
      yocoChargeId,
      idempotencyKey,
    } = input;

    const apiKey = process.env.YOCO_SECRET_KEY;
    if (!apiKey) {
      return {
        success: false,
        errorCode: 'CONFIG_ERROR',
        errorMessage: 'Payment system not configured',
      };
    }

    const existingTxn = await dynamodb.query({
      TableName: TRANSACTIONS_TABLE,
      IndexName: 'idempotencyKey-index',
      KeyConditionExpression: 'idempotencyKey = :key',
      ExpressionAttributeValues: { ':key': idempotencyKey },
    }).promise();

    if (existingTxn.Items && existingTxn.Items.length > 0) {
      console.log('Duplicate request detected via idempotency key');
      const existingRequest = await dynamodb.get({
        TableName: REQUESTS_TABLE,
        Key: { requestId: existingTxn.Items[0].requestId },
      }).promise();
      
      return {
        success: true,
        request: existingRequest.Item,
        transaction: existingTxn.Items[0],
      };
    }

    console.log('Verifying Yoco charge:', yocoChargeId);
    const chargeVerification = await verifyYocoCharge(apiKey, yocoChargeId);
    
    if (chargeVerification.status !== 'successful') {
      return {
        success: false,
        errorCode: 'PAYMENT_VERIFICATION_FAILED',
        errorMessage: `Payment not successful. Status: ${chargeVerification.status}`,
      };
    }

    const duplicateCharge = await dynamodb.query({
      TableName: TRANSACTIONS_TABLE,
      IndexName: 'providerTransactionId-index',
      KeyConditionExpression: 'providerTransactionId = :chargeId',
      ExpressionAttributeValues: { ':chargeId': yocoChargeId },
    }).promise();

    if (duplicateCharge.Items && duplicateCharge.Items.length > 0) {
      return {
        success: false,
        errorCode: 'PAYMENT_ALREADY_USED',
        errorMessage: 'This payment has already been used',
      };
    }

    let djSet;
    let performerId;
    let amount;
    
    if (setId) {
      const setResult = await dynamodb.get({
        TableName: SETS_TABLE,
        Key: { setId },
      }).promise();
      djSet = setResult.Item;
      
      if (!djSet) {
        return {
          success: false,
          errorCode: 'SET_NOT_FOUND',
          errorMessage: 'DJ set not found',
        };
      }
      
      if (djSet.status !== 'ACTIVE' || !djSet.isAcceptingRequests) {
        return {
          success: false,
          errorCode: 'SET_NOT_ACCEPTING',
          errorMessage: 'This DJ is not currently accepting requests',
        };
      }
      
      performerId = djSet.performerId;
      amount = djSet.settings?.basePrice || 20;
    } else {
      const eventResult = await dynamodb.get({
        TableName: EVENTS_TABLE,
        Key: { eventId },
      }).promise();
      
      if (!eventResult.Item) {
        return {
          success: false,
          errorCode: 'EVENT_NOT_FOUND',
          errorMessage: 'Event not found',
        };
      }
      
      performerId = eventResult.Item.createdBy;
      amount = 20;
    }

    const expectedAmountCents = Math.round(amount * 100);
    if (Math.abs(chargeVerification.amount - expectedAmountCents) > 100) {
      return {
        success: false,
        errorCode: 'AMOUNT_MISMATCH',
        errorMessage: 'Payment amount does not match request price',
      };
    }

    const now = Date.now();
    const requestId = `req_${now}_${crypto.randomUUID().substring(0, 8)}`;
    const transactionId = yocoChargeId;
    
    const paymentSplit = calculatePaymentSplit(amount);

    const transaction = {
      transactionId,
      requestId,
      eventId,
      setId: setId || null,
      performerId,
      userId,
      amount: paymentSplit.grossAmount,
      platformFee: paymentSplit.platformFee,
      performerEarnings: paymentSplit.performerEarnings,
      status: 'COMPLETED',
      type: 'CHARGE',
      paymentProvider: 'YOCO',
      providerTransactionId: yocoChargeId,
      idempotencyKey,
      createdAt: now,
      completedAt: now,
    };

    await dynamodb.put({
      TableName: TRANSACTIONS_TABLE,
      Item: transaction,
      ConditionExpression: 'attribute_not_exists(transactionId)',
    }).promise();

    let queuePosition = 1;
    if (setId) {
      const queueResult = await dynamodb.get({
        TableName: QUEUES_TABLE,
        Key: { setId },
      }).promise();
      
      if (queueResult.Item && queueResult.Item.orderedRequests) {
        queuePosition = queueResult.Item.orderedRequests.length + 1;
      }
    }

    const request = {
      requestId,
      eventId,
      setId: setId || null,
      performerId,
      userId,
      songTitle,
      artistName,
      genre: genre || 'Unknown',
      status: 'PENDING',
      requestType: requestType || 'STANDARD',
      price: amount,
      queuePosition,
      dedication: dedication || null,
      shoutout: shoutout || null,
      transactionId,
      submittedAt: now,
      upvotes: 0,
    };

    await dynamodb.put({
      TableName: REQUESTS_TABLE,
      Item: request,
    }).promise();

    if (setId) {
      await dynamodb.update({
        TableName: QUEUES_TABLE,
        Key: { setId },
        UpdateExpression: 'SET orderedRequests = list_append(if_not_exists(orderedRequests, :empty), :newRequest), lastUpdated = :now',
        ExpressionAttributeValues: {
          ':empty': [],
          ':newRequest': [{ requestId, queuePosition }],
          ':now': now,
        },
      }).promise();

      await dynamodb.update({
        TableName: SETS_TABLE,
        Key: { setId },
        UpdateExpression: 'ADD revenue :earnings, requestCount :one SET updatedAt = :now',
        ExpressionAttributeValues: {
          ':earnings': paymentSplit.performerEarnings,
          ':one': 1,
          ':now': now,
        },
      }).promise();
    }

    await dynamodb.update({
      TableName: USERS_TABLE,
      Key: { userId: performerId },
      UpdateExpression: 'ADD availableBalance :earnings, totalEarnings :amount SET updatedAt = :now',
      ExpressionAttributeValues: {
        ':earnings': paymentSplit.performerEarnings,
        ':amount': paymentSplit.grossAmount,
        ':now': now,
      },
    }).promise();

    console.log(JSON.stringify({
      level: 'INFO',
      correlationId,
      message: 'Request submitted successfully',
      requestId,
      transactionId,
      duration: Date.now() - startTime,
    }));

    return {
      success: true,
      request,
      transaction,
    };

  } catch (error) {
    console.error(JSON.stringify({
      level: 'ERROR',
      correlationId,
      message: 'submitRequestWithPayment failed',
      error: error.message,
      stack: error.stack,
      duration: Date.now() - startTime,
    }));

    return {
      success: false,
      errorCode: 'INTERNAL_ERROR',
      errorMessage: error.message || 'An unexpected error occurred',
    };
  }
};
