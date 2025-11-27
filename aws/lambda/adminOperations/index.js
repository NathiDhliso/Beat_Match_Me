/**
 * Admin Operations Lambda Function
 * Handles admin-specific operations: getAdminStats, refundTransaction, processAdminPayout
 */

const AWS = require('aws-sdk');
const https = require('https');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const secretsManager = new AWS.SecretsManager();

// Table names
const USERS_TABLE = process.env.USERS_TABLE || 'beatmatchme-users';
const TRANSACTIONS_TABLE = process.env.TRANSACTIONS_TABLE || 'beatmatchme-transactions';
const DISPUTES_TABLE = process.env.DISPUTES_TABLE || 'beatmatchme-disputes';
const PAYOUTS_TABLE = process.env.PAYOUTS_TABLE || 'beatmatchme-payouts';

/**
 * Get Yoco API key from Secrets Manager
 */
async function getYocoApiKey() {
  const secret = await secretsManager
    .getSecretValue({ SecretId: 'beatmatchme/yoco/api-key' })
    .promise();
  return JSON.parse(secret.SecretString).apiKey;
}

/**
 * Get admin statistics aggregated from multiple tables
 */
async function getAdminStats() {
  const now = Date.now();
  const startOfDay = new Date().setHours(0, 0, 0, 0);

  // Scan users table for DJ and Fan counts
  const usersResult = await dynamodb.scan({ TableName: USERS_TABLE }).promise();
  const users = usersResult.Items || [];

  const totalDJs = users.filter(u => u.role === 'PERFORMER').length;
  const activeDJs = users.filter(u => u.role === 'PERFORMER' && u.status === 'ACTIVE').length;
  const totalFans = users.filter(u => u.role === 'AUDIENCE').length;
  const activeFans = users.filter(u => u.role === 'AUDIENCE' && u.status === 'ACTIVE').length;

  // Scan transactions table
  const transactionsResult = await dynamodb.scan({ TableName: TRANSACTIONS_TABLE }).promise();
  const transactions = transactionsResult.Items || [];

  const totalTransactions = transactions.length;
  const heldFunds = transactions
    .filter(t => t.status === 'HELD')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const releasedToday = transactions
    .filter(t => t.status === 'RELEASED' && t.releasedAt >= startOfDay)
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const platformRevenue = transactions
    .reduce((sum, t) => sum + (t.platformFee || 0), 0);
  const platformRevenueToday = transactions
    .filter(t => t.createdAt >= startOfDay)
    .reduce((sum, t) => sum + (t.platformFee || 0), 0);

  // Scan disputes table
  const disputesResult = await dynamodb.scan({ TableName: DISPUTES_TABLE }).promise();
  const disputes = disputesResult.Items || [];
  const openDisputes = disputes.filter(d => d.status !== 'RESOLVED').length;

  // Scan payouts table
  const payoutsResult = await dynamodb.scan({ TableName: PAYOUTS_TABLE }).promise();
  const payouts = payoutsResult.Items || [];
  const pendingPayouts = payouts
    .filter(p => p.status === 'PENDING')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return {
    totalDJs,
    activeDJs,
    totalFans,
    activeFans,
    totalTransactions,
    heldFunds,
    releasedToday,
    pendingPayouts,
    openDisputes,
    platformRevenue,
    platformRevenueToday
  };
}


/**
 * Process refund via Yoco API
 */
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

/**
 * Refund a transaction (admin action)
 */
async function refundTransaction(transactionId, reason, adminUser) {
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
    return { ...transaction, message: 'Already refunded' };
  }

  // Validate transaction is refundable
  if (!['HELD', 'COMPLETED'].includes(transaction.status)) {
    throw new Error(`Transaction not refundable. Status: ${transaction.status}`);
  }

  // Get Yoco API key and process refund
  const apiKey = await getYocoApiKey();
  const refundResponse = await processYocoRefund(
    apiKey,
    transaction.providerTransactionId,
    transaction.amount
  );

  const now = Date.now();

  // Update transaction status
  const updateResult = await dynamodb
    .update({
      TableName: TRANSACTIONS_TABLE,
      Key: { transactionId },
      UpdateExpression: 'SET #status = :status, refundedAt = :refundedAt, refundedBy = :refundedBy, refundReason = :reason, yocoRefundId = :refundId, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': 'REFUNDED',
        ':refundedAt': now,
        ':refundedBy': adminUser,
        ':reason': reason,
        ':refundId': refundResponse.id,
        ':updatedAt': now,
      },
      ReturnValues: 'ALL_NEW',
    })
    .promise();

  return updateResult.Attributes;
}

/**
 * Process admin payout (bank transfer)
 */
async function processAdminPayout(payoutId, adminUser) {
  // Get payout details
  const payoutResult = await dynamodb
    .get({
      TableName: PAYOUTS_TABLE,
      Key: { payoutId },
    })
    .promise();

  if (!payoutResult.Item) {
    throw new Error('Payout not found');
  }

  const payout = payoutResult.Item;

  // Validate payout status
  if (payout.status !== 'PENDING') {
    throw new Error(`Payout not processable. Status: ${payout.status}`);
  }

  const now = Date.now();

  // Update to PROCESSING status
  await dynamodb
    .update({
      TableName: PAYOUTS_TABLE,
      Key: { payoutId },
      UpdateExpression: 'SET #status = :status, processedBy = :processedBy, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': 'PROCESSING',
        ':processedBy': adminUser,
        ':updatedAt': now,
      },
    })
    .promise();

  try {
    // TODO: Integrate with actual bank transfer API
    // For now, simulate successful transfer
    console.log(`Processing payout ${payoutId} for ${payout.amount} to ${payout.performerName}`);

    // Update to COMPLETED status
    const updateResult = await dynamodb
      .update({
        TableName: PAYOUTS_TABLE,
        Key: { payoutId },
        UpdateExpression: 'SET #status = :status, processedAt = :processedAt, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': 'COMPLETED',
          ':processedAt': now,
          ':updatedAt': now,
        },
        ReturnValues: 'ALL_NEW',
      })
      .promise();

    return updateResult.Attributes;
  } catch (error) {
    // Update to FAILED status
    await dynamodb
      .update({
        TableName: PAYOUTS_TABLE,
        Key: { payoutId },
        UpdateExpression: 'SET #status = :status, failureReason = :failureReason, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': 'FAILED',
          ':failureReason': error.message,
          ':updatedAt': now,
        },
      })
      .promise();

    throw error;
  }
}

/**
 * Main handler
 */
exports.handler = async (event) => {
  console.log('Admin operation:', JSON.stringify(event, null, 2));

  const { action } = event;

  try {
    switch (action) {
      case 'getAdminStats':
        return await getAdminStats();

      case 'refundTransaction':
        return await refundTransaction(
          event.transactionId,
          event.reason,
          event.adminUser
        );

      case 'processAdminPayout':
        return await processAdminPayout(event.payoutId, event.adminUser);

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Admin operation error:', error);
    return { error: error.message };
  }
};
