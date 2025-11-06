/**
 * Process Payment Lambda Function
 * Integrates with Yoco API to process payments for song requests
 * Handles BeatMatchMe 15% commission and performer 85% split
 */

const AWS = require('aws-sdk');
const https = require('https');
const crypto = require('crypto');

const dynamodb = new AWS.DynamoDB.DocumentClient();

// Commission configuration
const PLATFORM_COMMISSION_RATE = 0.15; // 15%
const PERFORMER_SHARE_RATE = 0.85;     // 85%

/**
 * CRITICAL FIX: Structured CloudWatch logging helper
 * Provides consistent logging format with correlation tracking
 */
function logStructured(level, message, context = {}) {
  const correlationId = context.correlationId || context.requestId || crypto.randomUUID();
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    service: 'processPayment',
    correlationId,
    message,
    ...context,
  };
  
  // Add stack trace for errors
  if (level === 'error' && context.error) {
    logEntry.errorMessage = context.error.message || String(context.error);
    logEntry.errorStack = context.error.stack;
    logEntry.errorCode = context.errorCode || 'UNKNOWN_ERROR';
  }
  
  console.log(JSON.stringify(logEntry));
  return correlationId;
}

/**
 * Determine which stage of payment processing failed
 * @param {Error} error - The error object
 * @returns {string} Failure stage identifier
 */
function determineFailureStage(error) {
  const message = error.message.toLowerCase();
  
  if (message.includes('verification failed') || message.includes('charge status')) {
    return 'PAYMENT_VERIFICATION';
  } else if (message.includes('amount mismatch')) {
    return 'AMOUNT_VALIDATION';
  } else if (message.includes('already used')) {
    return 'DUPLICATE_CHARGE';
  } else if (message.includes('yoco api')) {
    return 'PAYMENT_PROVIDER';
  } else if (message.includes('dynamodb') || message.includes('attribute_not_exists')) {
    return 'DATABASE_WRITE';
  } else if (message.includes('request') && message.includes('update')) {
    return 'REQUEST_UPDATE';
  } else if (message.includes('balance') || message.includes('earnings')) {
    return 'BALANCE_UPDATE';
  } else {
    return 'UNKNOWN';
  }
}

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

// Call Yoco API to verify an existing charge
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
    req.end();
  });
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
  const correlationId = crypto.randomUUID();
  const startTime = Date.now();
  
  logStructured('info', 'Payment processing started', {
    correlationId,
    requestId: event.arguments?.input?.requestId,
    eventId: event.arguments?.input?.eventId,
    userId: event.identity?.sub,
    amount: event.arguments?.input?.amount,
  });

  try {
    const { 
      requestId, 
      eventId, 
      setId, 
      performerId, 
      userId, 
      amount, 
      paymentToken,
      yocoChargeId,    // NEW: Charge ID from client (already created via Yoco SDK)
      idempotencyKey   // NEW: Prevent duplicate charges
    } = event.arguments.input;

    // Get Yoco API key from environment variables
    const apiKey = process.env.YOCO_SECRET_KEY;
    
    if (!apiKey) {
      throw new Error('Yoco API key not configured');
    }

    // CRITICAL FIX 1: Check idempotency key to prevent duplicate processing
    if (idempotencyKey) {
      logStructured('info', 'Checking idempotency key', {
        correlationId,
        idempotencyKey,
        requestId,
      });
      
      const existingTransaction = await dynamodb
        .query({
          TableName: process.env.TRANSACTIONS_TABLE || 'beatmatchme-transactions',
          IndexName: 'idempotencyKey-index',
          KeyConditionExpression: 'idempotencyKey = :key',
          ExpressionAttributeValues: {
            ':key': idempotencyKey,
          },
        })
        .promise();

      if (existingTransaction.Items && existingTransaction.Items.length > 0) {
        logStructured('warn', 'Duplicate transaction detected via idempotency key', {
          correlationId,
          idempotencyKey,
          existingTransactionId: existingTransaction.Items[0].transactionId,
        });
        return existingTransaction.Items[0]; // Return existing transaction
      }
      
      logStructured('info', 'Idempotency check passed - new transaction', {
        correlationId,
        idempotencyKey,
      });
    }

    // CRITICAL FIX 2: Verify payment with Yoco if chargeId provided
    let yocoResponse;
    if (yocoChargeId) {
      logStructured('info', 'Verifying Yoco charge', {
        correlationId,
        yocoChargeId,
        expectedAmount: amount,
      });
      
      // Verify charge exists and is valid
      const chargeVerification = await verifyYocoCharge(apiKey, yocoChargeId);
      
      logStructured('info', 'Charge verification response', {
        correlationId,
        yocoChargeId,
        status: chargeVerification.status,
        amount: chargeVerification.amount,
      });
      
      // Validate charge status
      if (chargeVerification.status !== 'successful') {
        const error = new Error(`Payment verification failed: charge status is ${chargeVerification.status}`);
        logStructured('error', 'Charge verification failed - invalid status', {
          correlationId,
          yocoChargeId,
          status: chargeVerification.status,
          error,
          errorCode: 'PAYMENT_STATUS_INVALID',
        });
        throw error;
      }
      
      // Validate amount matches
      const expectedAmountCents = Math.round(amount * 100);
      if (chargeVerification.amount !== expectedAmountCents) {
        const error = new Error(
          `Payment amount mismatch: expected ${expectedAmountCents} cents, got ${chargeVerification.amount} cents`
        );
        logStructured('error', 'Amount validation failed', {
          correlationId,
          yocoChargeId,
          expectedCents: expectedAmountCents,
          actualCents: chargeVerification.amount,
          error,
          errorCode: 'AMOUNT_MISMATCH',
        });
        throw error;
      }
      
      // Check if charge already used for another transaction
      const duplicateCheck = await dynamodb
        .query({
          TableName: process.env.TRANSACTIONS_TABLE || 'beatmatchme-transactions',
          IndexName: 'providerTransactionId-index',
          KeyConditionExpression: 'providerTransactionId = :chargeId',
          ExpressionAttributeValues: {
            ':chargeId': yocoChargeId,
          },
        })
        .promise();

      if (duplicateCheck.Items && duplicateCheck.Items.length > 0) {
        const error = new Error('Payment charge already used for another transaction');
        logStructured('error', 'Duplicate charge detected', {
          correlationId,
          yocoChargeId,
          existingTransactionId: duplicateCheck.Items[0].transactionId,
          error,
          errorCode: 'DUPLICATE_CHARGE',
        });
        throw error;
      }
      
      logStructured('info', 'Payment verification successful', {
        correlationId,
        yocoChargeId,
        amount: chargeVerification.amount,
      });
      
      yocoResponse = chargeVerification;
    } else if (paymentToken) {
      // Legacy flow: process new payment with token
      console.log('💳 Processing new payment with token');
      yocoResponse = await processYocoPayment(apiKey, {
        token: paymentToken,
        amount,
        requestId,
        eventId,
        userId,
      });
    } else {
      throw new Error('Either yocoChargeId or paymentToken must be provided');
    }

    // Calculate payment split
    const paymentSplit = calculatePaymentSplit(amount);
    console.log('Payment split:', paymentSplit);

    const now = Date.now();

    // Create transaction record in DynamoDB with idempotency tracking
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
      idempotencyKey: idempotencyKey || null, // NEW: Store for duplicate prevention
      metadata: {
        ...yocoResponse.metadata,
        commissionRate: PLATFORM_COMMISSION_RATE,
        performerShareRate: PERFORMER_SHARE_RATE,
        chargeStatus: yocoResponse.status,
        verificationMethod: yocoChargeId ? 'server-verified' : 'legacy-token', // Track verification method
      },
    };

    await dynamodb
      .put({
        TableName: process.env.TRANSACTIONS_TABLE || 'beatmatchme-transactions',
        Item: transaction,
        // Prevent overwriting existing transaction with same ID
        ConditionExpression: 'attribute_not_exists(transactionId)',
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

    logStructured('info', 'Payment processing completed successfully', {
      correlationId,
      transactionId: transaction.transactionId,
      requestId: transaction.requestId,
      amount: transaction.amount,
      duration: Date.now() - startTime,
    });

    return {
      transactionId: transaction.transactionId,
      status: 'COMPLETED',
      amount: transaction.amount,
      platformFee: transaction.platformFee,
      performerEarnings: transaction.performerEarnings,
      requestId: transaction.requestId,
    };
  } catch (error) {
    const failureStage = determineFailureStage(error);
    const errorCode = determineErrorCode(error);
    
    logStructured('error', 'Payment processing failed', {
      correlationId,
      error,
      errorCode,
      failureStage,
      userId: event.identity?.sub,
      requestId: event.arguments?.input?.requestId,
      eventId: event.arguments?.input?.eventId,
      amount: event.arguments?.input?.amount,
      yocoChargeId: event.arguments?.input?.yocoChargeId,
      duration: Date.now() - startTime,
    });

    const { 
      yocoChargeId, 
      requestId, 
      eventId, 
      userId, 
      amount,
      performerId,
      idempotencyKey,
    } = event.arguments.input || {};

    let rollbackStatus = null;
    let refundTransactionId = null;

    // CRITICAL FIX: Automatic rollback - refund the charge if it succeeded
    if (yocoChargeId && error.message !== 'Payment verification failed: charge status is successful') {
      try {
        console.log('🔄 Attempting automatic rollback/refund for charge:', yocoChargeId);
        
        // Call processRefund Lambda to refund the charge
        const lambda = new AWS.Lambda();
        const refundPayload = {
          chargeId: yocoChargeId,
          amount, // Full refund
          reason: 'TRANSACTION_ROLLBACK',
          metadata: {
            originalError: error.message,
            requestId,
            eventId,
            userId,
          },
        };

        const refundResult = await lambda
          .invoke({
            FunctionName: process.env.REFUND_LAMBDA_NAME || 'processRefund',
            InvocationType: 'RequestResponse',
            Payload: JSON.stringify(refundPayload),
          })
          .promise();

        const refundResponse = JSON.parse(refundResult.Payload);
        if (refundResponse.statusCode === 200) {
          rollbackStatus = 'ROLLED_BACK';
          refundTransactionId = refundResponse.body.refundId;
          console.log('✅ Rollback successful, refund ID:', refundTransactionId);
        } else {
          rollbackStatus = 'ROLLBACK_FAILED';
          console.error('⚠️ Rollback failed:', refundResponse);
        }
      } catch (rollbackError) {
        rollbackStatus = 'ROLLBACK_FAILED';
        console.error('⚠️ Rollback error:', rollbackError);
        // Continue to log failed transaction even if rollback fails
      }
    } else {
      rollbackStatus = 'NO_ROLLBACK_NEEDED';
    }

    // Create failed transaction record with rollback metadata
    const now = Date.now();
    const failedTransaction = {
      transactionId: `failed_${now}_${Math.random().toString(36).substring(7)}`,
      requestId: requestId || 'unknown',
      eventId: eventId || 'unknown',
      userId: userId || 'unknown',
      performerId: performerId || 'unknown',
      amount: amount || 0,
      status: rollbackStatus === 'ROLLED_BACK' ? 'ROLLED_BACK' : 'FAILED',
      type: 'CHARGE',
      paymentProvider: 'YOCO',
      providerTransactionId: yocoChargeId || null,
      errorMessage: error.message,
      errorStack: error.stack,
      createdAt: now,
      failedAt: now,
      idempotencyKey: idempotencyKey || null,
      metadata: {
        rollbackStatus,
        refundTransactionId,
        errorType: error.name,
        failureStage: determineFailureStage(error),
      },
    };

    await dynamodb
      .put({
        TableName: process.env.TRANSACTIONS_TABLE || 'beatmatchme-transactions',
        Item: failedTransaction,
      })
      .promise();

    // Mark request as FAILED if it exists
    if (requestId && requestId !== 'unknown') {
      try {
        await dynamodb
          .update({
            TableName: process.env.REQUESTS_TABLE || 'beatmatchme-requests',
            Key: { requestId },
            UpdateExpression: 'SET #status = :status, failureReason = :reason, updatedAt = :updatedAt',
            ExpressionAttributeNames: {
              '#status': 'status',
            },
            ExpressionAttributeValues: {
              ':status': 'PAYMENT_FAILED',
              ':reason': error.message,
              ':updatedAt': now,
            },
            ConditionExpression: 'attribute_exists(requestId)', // Only update if request exists
          })
          .promise();
      } catch (updateError) {
        console.error('⚠️ Failed to update request status:', updateError);
        // Don't throw - transaction record already created
      }
    }

    // Return structured error for GraphQL response
    throw new Error(
      JSON.stringify({
        errorCode: determineErrorCode(error),
        message: error.message,
        transactionId: failedTransaction.transactionId,
        rollbackStatus,
        refundTransactionId,
      })
    );
  }
};

/**
 * Map error to user-friendly error code
 */
function determineErrorCode(error) {
  const message = error.message.toLowerCase();
  
  if (message.includes('verification failed')) {
    return 'PAYMENT_VERIFICATION_FAILED';
  } else if (message.includes('amount mismatch')) {
    return 'AMOUNT_MISMATCH';
  } else if (message.includes('already used') || message.includes('already processed')) {
    return 'DUPLICATE_PAYMENT';
  } else if (message.includes('yoco api')) {
    return 'PAYMENT_PROVIDER_ERROR';
  } else {
    return 'PAYMENT_PROCESSING_ERROR';
  }
}
