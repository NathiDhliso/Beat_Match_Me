/**
 * Veto Request Lambda Function
 * Handles vetoing requests and triggering refunds
 */

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const lambda = new AWS.Lambda();

// Environment configuration - allows override for testing
const EVENTS_TABLE = process.env.EVENTS_TABLE || 'beatmatchme-events';
const REQUESTS_TABLE = process.env.REQUESTS_TABLE || 'beatmatchme-requests';
const QUEUES_TABLE = process.env.QUEUES_TABLE || 'beatmatchme-queues';

exports.handler = async (event) => {
  console.log('Vetoing request:', JSON.stringify(event, null, 2));

  try {
    const { requestId, reason } = event.arguments;
    const performerId = event.identity.sub; // From Cognito

    // Get request details
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

    // Verify performer owns this event
    const eventResult = await dynamodb
      .get({
        TableName: EVENTS_TABLE,
        Key: { eventId: request.eventId },
      })
      .promise();

    if (!eventResult.Item) {
      throw new Error('Event not found');
    }

    if (eventResult.Item.performerId !== performerId) {
      throw new Error('Unauthorized: Only event performer can veto requests');
    }

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
          ':reason': reason || 'Vetoed by DJ',
        },
      })
      .promise();

    // Remove from queue
    const queueResult = await dynamodb
      .get({
        TableName: QUEUES_TABLE,
        Key: { eventId: request.eventId },
      })
      .promise();

    if (queueResult.Item) {
      const orderedRequestIds = queueResult.Item.orderedRequestIds.filter(
        (id) => id !== requestId
      );

      await dynamodb
        .put({
          TableName: QUEUES_TABLE,
          Item: {
            eventId: request.eventId,
            orderedRequestIds,
            lastUpdated: Date.now(),
          },
        })
        .promise();
    }

    // Trigger refund Lambda
    await lambda
      .invoke({
        FunctionName: 'beatmatchme-processRefund',
        InvocationType: 'Event', // Async
        Payload: JSON.stringify({
          arguments: {
            requestId,
            reason: reason || 'Request vetoed by DJ',
          },
        }),
      })
      .promise();

    console.log('Request vetoed successfully, refund triggered');

    return {
      ...request,
      status: 'VETOED',
      vetoedAt: Date.now(),
      vetoReason: reason || 'Vetoed by DJ',
    };
  } catch (error) {
    console.error('Veto failed:', error);
    throw error;
  }
};
