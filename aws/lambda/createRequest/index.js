/**
 * Create Request Lambda Function
 * Creates a new song request and adds to queue
 */

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const dynamodb = new AWS.DynamoDB.DocumentClient();

/**
 * CRITICAL FIX: Structured CloudWatch logging helper
 * Provides consistent logging format with correlation tracking
 */
function logStructured(level, message, context = {}) {
  const correlationId = context.correlationId || context.requestId || crypto.randomUUID();
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    service: 'createRequest',
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
 * Calculate request price based on event settings and request type
 * @param {Object} eventData - Event configuration
 * @param {Object} input - Request input data
 * @returns {number} Calculated price in ZAR
 */
function calculatePrice(eventData, input) {
  let price = eventData.settings.basePrice || 50;
  
  if (input.requestType === 'SPOTLIGHT') {
    price *= 2.5;
  }
  if (input.dedication) {
    price += 10;
  }
  if (input.shoutout) {
    price += 15;
  }
  
  return price;
}

async function calculateQueuePosition(eventId, requestType) {
  // Get current queue
  const queueResult = await dynamodb
    .get({
      TableName: 'beatmatchme-queues',
      Key: { eventId },
    })
    .promise();

  const currentQueue = queueResult.Item?.orderedRequestIds || [];

  // Spotlight requests go to front
  if (requestType === 'SPOTLIGHT') {
    return 1;
  }

  // Standard requests go to end
  return currentQueue.length + 1;
}

exports.handler = async (event) => {
  const correlationId = crypto.randomUUID();
  const startTime = Date.now();
  
  logStructured('info', 'Request creation started', {
    correlationId,
    userId: event.identity?.sub,
    eventId: event.arguments?.input?.eventId,
    songTitle: event.arguments?.input?.songTitle,
    artistName: event.arguments?.input?.artistName,
  });

  try {
    const input = event.arguments.input;
    const userId = event.identity.sub; // From Cognito
    const now = Date.now();

    // ===== CRITICAL FIX: Pre-Creation Validations =====
    
    // VALIDATION 1: Check event exists and is active
    logStructured('info', 'Validating event status', {
      correlationId,
      eventId: input.eventId,
    });
    
    const eventResult = await dynamodb
      .get({
        TableName: 'beatmatchme-events',
        Key: { eventId: input.eventId },
      })
      .promise();

    if (!eventResult.Item) {
      const error = new Error('EVENT_NOT_FOUND');
      logStructured('error', 'Event not found', {
        correlationId,
        eventId: input.eventId,
        error,
        errorCode: 'EVENT_NOT_FOUND',
      });
      throw error;
    }

    if (eventResult.Item.status !== 'ACTIVE') {
      const error = new Error('EVENT_NOT_ACTIVE');
      logStructured('error', 'Event not active', {
        correlationId,
        eventId: input.eventId,
        eventStatus: eventResult.Item.status,
        error,
        errorCode: 'EVENT_NOT_ACTIVE',
      });
      throw error;
    }

    const eventData = eventResult.Item;
    
    // VALIDATION 2: Rate limiting - max 3 requests per user per hour
    logStructured('info', 'Checking rate limit', {
      correlationId,
      userId,
    });
    
    const oneHourAgo = now - (60 * 60 * 1000);
    const recentRequestsResult = await dynamodb
      .query({
        TableName: 'beatmatchme-requests',
        IndexName: 'userId-submittedAt-index',
        KeyConditionExpression: 'userId = :userId AND submittedAt > :oneHourAgo',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':oneHourAgo': oneHourAgo,
        },
        Select: 'COUNT',
      })
      .promise();

    if (recentRequestsResult.Count >= 3) {
      throw new Error('RATE_LIMIT_EXCEEDED');
    }

    // VALIDATION 3: Check for duplicate song (enhanced with time-based deduplication)
    // First check: Exact duplicate in last 5 minutes (likely accidental double-click)
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    const recentDuplicateResult = await dynamodb
      .query({
        TableName: 'beatmatchme-requests',
        IndexName: 'userId-submittedAt-index',
        KeyConditionExpression: 'userId = :userId AND submittedAt > :fiveMinutesAgo',
        FilterExpression: 'eventId = :eventId AND songTitle = :songTitle AND artistName = :artistName AND #status <> :cancelled',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':userId': userId,
          ':eventId': input.eventId,
          ':fiveMinutesAgo': fiveMinutesAgo,
          ':songTitle': input.songTitle,
          ':artistName': input.artistName,
          ':cancelled': 'CANCELLED',
        },
      })
      .promise();

    if (recentDuplicateResult.Items && recentDuplicateResult.Items.length > 0) {
      const existingRequest = recentDuplicateResult.Items[0];
      console.log('⚠️ Duplicate request detected within 5 minutes, returning existing:', existingRequest.requestId);
      
      // GRACEFUL HANDLING: Return existing request instead of error
      // This prevents user frustration from accidental double-clicks
      return {
        __typename: 'SubmitRequestResult',
        success: true,
        request: {
          requestId: existingRequest.requestId,
          userId: existingRequest.userId,
          eventId: existingRequest.eventId,
          songTitle: existingRequest.songTitle,
          artistName: existingRequest.artistName,
          queuePosition: existingRequest.queuePosition,
          status: existingRequest.status,
          price: existingRequest.price,
          submittedAt: existingRequest.submittedAt,
        },
        transaction: existingRequest.transactionId ? {
          transactionId: existingRequest.transactionId,
          amount: existingRequest.price,
          status: 'succeeded',
          paymentMethod: 'YOCO',
        } : null,
      };
    }

    // Second check: Same title+artist anywhere in event (prevents duplicate songs in queue)
    const duplicateCheckResult = await dynamodb
      .query({
        TableName: 'beatmatchme-requests',
        IndexName: 'eventId-userId-index',
        KeyConditionExpression: 'eventId = :eventId AND userId = :userId',
        FilterExpression: 'songTitle = :songTitle AND artistName = :artistName AND #status <> :cancelled',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':eventId': input.eventId,
          ':userId': userId,
          ':songTitle': input.songTitle,
          ':artistName': input.artistName,
          ':cancelled': 'CANCELLED',
        },
      })
      .promise();

    if (duplicateCheckResult.Items && duplicateCheckResult.Items.length > 0) {
      throw new Error('DUPLICATE_SONG_REQUEST');
    }

    // VALIDATION 4: Check event capacity (max requests if configured)
    const maxRequestsPerEvent = eventData.settings?.maxRequests || 100;
    const currentRequestsResult = await dynamodb
      .query({
        TableName: 'beatmatchme-requests',
        IndexName: 'eventId-submittedAt-index',
        KeyConditionExpression: 'eventId = :eventId',
        FilterExpression: '#status <> :cancelled AND #status <> :rejected',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':eventId': input.eventId,
          ':cancelled': 'CANCELLED',
          ':rejected': 'REJECTED',
        },
        Select: 'COUNT',
      })
      .promise();

    if (currentRequestsResult.Count >= maxRequestsPerEvent) {
      throw new Error('EVENT_CAPACITY_EXCEEDED');
    }

    // VALIDATION 5: Payment verification check (if transactionId provided)
    if (input.transactionId) {
      const transactionResult = await dynamodb
        .get({
          TableName: 'beatmatchme-transactions',
          Key: { transactionId: input.transactionId },
        })
        .promise();

      if (!transactionResult.Item) {
        throw new Error('PAYMENT_NOT_FOUND');
      }

      if (transactionResult.Item.status !== 'COMPLETED') {
        throw new Error('PAYMENT_NOT_COMPLETED');
      }

      // Verify payment amount matches calculated price
      const calculatedPrice = calculatePrice(eventData, input);
      if (Math.abs(transactionResult.Item.amount - calculatedPrice) > 0.01) {
        throw new Error('PAYMENT_AMOUNT_MISMATCH');
      }

      // Check if transaction already used for another request
      const transactionUsageResult = await dynamodb
        .query({
          TableName: 'beatmatchme-requests',
          IndexName: 'transactionId-index',
          KeyConditionExpression: 'transactionId = :transactionId',
          ExpressionAttributeValues: {
            ':transactionId': input.transactionId,
          },
        })
        .promise();

      if (transactionUsageResult.Items && transactionUsageResult.Items.length > 0) {
        throw new Error('PAYMENT_ALREADY_USED');
      }
    }

    // ===== All Validations Passed - Proceed with Creation =====

    // ===== All Validations Passed - Proceed with Creation =====

    // Calculate price using helper function
    const price = calculatePrice(eventData, input);

    // Create request first (before queue position assignment)
    const requestId = uuidv4();
    const request = {
      requestId,
      eventId: input.eventId,
      userId,
      songTitle: input.songTitle,
      artistName: input.artistName,
      genre: input.genre || 'Unknown',
      status: input.transactionId ? 'PENDING' : 'UNPAID', // Only PENDING if already paid
      requestType: input.requestType,
      price,
      queuePosition: 0, // Temporary - will be updated atomically
      dedication: input.dedication,
      shoutout: input.shoutout,
      submittedAt: now,
      updatedAt: now,
      upvotes: 0,
      transactionId: input.transactionId || null, // Link to payment transaction
    };

    await dynamodb
      .put({
        TableName: 'beatmatchme-requests',
        Item: request,
        // Prevent accidental overwrites
        ConditionExpression: 'attribute_not_exists(requestId)',
      })
      .promise();

    // CRITICAL FIX: Atomic queue position assignment using DynamoDB atomic counters
    // This prevents race conditions when multiple users submit simultaneously
    let finalQueuePosition;
    
    try {
      if (input.requestType === 'SPOTLIGHT') {
        // SPOTLIGHT requests: Add to front and shift others
        // Use atomic list prepend operation
        const updateResult = await dynamodb
          .update({
            TableName: 'beatmatchme-queues',
            Key: { eventId: input.eventId },
            UpdateExpression: `
              SET orderedRequestIds = list_append(:newRequest, if_not_exists(orderedRequestIds, :emptyList)),
                  lastUpdated = :timestamp,
                  spotlightCount = if_not_exists(spotlightCount, :zero) + :inc
            `,
            ExpressionAttributeValues: {
              ':newRequest': [requestId],
              ':emptyList': [],
              ':timestamp': now,
              ':zero': 0,
              ':inc': 1,
            },
            ReturnValues: 'ALL_NEW',
          })
          .promise();
        
        finalQueuePosition = 1; // Always position 1 for spotlight
        
      } else {
        // STANDARD requests: Add to end atomically
        // Use atomic list append operation
        const updateResult = await dynamodb
          .update({
            TableName: 'beatmatchme-queues',
            Key: { eventId: input.eventId },
            UpdateExpression: `
              SET orderedRequestIds = list_append(if_not_exists(orderedRequestIds, :emptyList), :newRequest),
                  lastUpdated = :timestamp,
                  standardCount = if_not_exists(standardCount, :zero) + :inc
            `,
            ExpressionAttributeValues: {
              ':newRequest': [requestId],
              ':emptyList': [],
              ':timestamp': now,
              ':zero': 0,
              ':inc': 1,
            },
            ReturnValues: 'ALL_NEW',
          })
          .promise();
        
        // Calculate position from returned queue
        const queueLength = updateResult.Attributes.orderedRequestIds.length;
        finalQueuePosition = queueLength;
      }

      // Update request with final queue position (atomic update)
      await dynamodb
        .update({
          TableName: 'beatmatchme-requests',
          Key: { requestId },
          UpdateExpression: 'SET queuePosition = :position, updatedAt = :timestamp',
          ExpressionAttributeValues: {
            ':position': finalQueuePosition,
            ':timestamp': now,
          },
          ConditionExpression: 'attribute_exists(requestId)', // Ensure request still exists
        })
        .promise();

      // Update final request object for return
      request.queuePosition = finalQueuePosition;

    } catch (queueError) {
      // Rollback: Delete the request if queue update failed
      console.error('❌ Queue update failed, rolling back request creation:', queueError);
      
      try {
        await dynamodb
          .delete({
            TableName: 'beatmatchme-requests',
            Key: { requestId },
          })
          .promise();
      } catch (deleteError) {
        console.error('⚠️ Failed to rollback request creation:', deleteError);
      }
      
      throw new Error('QUEUE_UPDATE_FAILED');
    }

    // Update event stats atomically (safe for concurrent updates)
    await dynamodb
      .update({
        TableName: 'beatmatchme-events',
        Key: { eventId: input.eventId },
        UpdateExpression: 'ADD totalRequests :inc SET updatedAt = :timestamp',
        ExpressionAttributeValues: {
          ':inc': 1,
          ':timestamp': now,
        },
      })
      .promise();

    console.log('✅ Request created successfully:', requestId, 'at position', finalQueuePosition);

    return request;
  } catch (error) {
    console.error('❌ Request creation failed:', error);
    
    // Map internal errors to user-friendly error codes
    const errorMessage = error.message;
    const errorCode = mapErrorToCode(errorMessage);
    
    // Log structured error for CloudWatch
    console.error({
      errorCode,
      originalError: errorMessage,
      userId: event.identity?.sub,
      eventId: event.arguments?.input?.eventId,
      timestamp: Date.now(),
    });
    
    // Return structured error for GraphQL
    throw new Error(
      JSON.stringify({
        errorCode,
        message: getUserFriendlyMessage(errorCode),
        details: errorMessage,
      })
    );
  }
};

/**
 * Map error messages to standardized error codes
 */
function mapErrorToCode(errorMessage) {
  if (errorMessage.includes('EVENT_NOT_FOUND')) return 'EVENT_NOT_FOUND';
  if (errorMessage.includes('EVENT_NOT_ACTIVE')) return 'EVENT_NOT_ACTIVE';
  if (errorMessage.includes('RATE_LIMIT_EXCEEDED')) return 'RATE_LIMIT_EXCEEDED';
  if (errorMessage.includes('DUPLICATE_SONG_REQUEST')) return 'DUPLICATE_SONG';
  if (errorMessage.includes('EVENT_CAPACITY_EXCEEDED')) return 'CAPACITY_EXCEEDED';
  if (errorMessage.includes('PAYMENT_NOT_FOUND')) return 'PAYMENT_NOT_FOUND';
  if (errorMessage.includes('PAYMENT_NOT_COMPLETED')) return 'PAYMENT_FAILED';
  if (errorMessage.includes('PAYMENT_AMOUNT_MISMATCH')) return 'PAYMENT_AMOUNT_MISMATCH';
  if (errorMessage.includes('PAYMENT_ALREADY_USED')) return 'PAYMENT_ALREADY_USED';
  if (errorMessage.includes('QUEUE_UPDATE_FAILED')) return 'QUEUE_UPDATE_FAILED';
  return 'REQUEST_CREATION_ERROR';
}

/**
 * Get user-friendly error messages
 */
function getUserFriendlyMessage(errorCode) {
  const messages = {
    EVENT_NOT_FOUND: 'This event could not be found.',
    EVENT_NOT_ACTIVE: 'This event is not currently accepting requests.',
    RATE_LIMIT_EXCEEDED: 'You can only submit 3 requests per hour. Please try again later.',
    DUPLICATE_SONG: 'You have already requested this song for this event.',
    CAPACITY_EXCEEDED: 'This event has reached its maximum capacity for requests.',
    PAYMENT_NOT_FOUND: 'Payment verification failed. Please contact support.',
    PAYMENT_FAILED: 'Payment is not completed. Please try again.',
    PAYMENT_AMOUNT_MISMATCH: 'Payment amount does not match the request price.',
    PAYMENT_ALREADY_USED: 'This payment has already been used for another request.',
    QUEUE_UPDATE_FAILED: 'Failed to add request to queue. Please try again.',
    REQUEST_CREATION_ERROR: 'Failed to create request. Please try again.',
  };
  
  return messages[errorCode] || 'An unexpected error occurred.';
}
