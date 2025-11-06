/**
 * Update Event Status Lambda Function
 * Updates event status (SCHEDULED -> ACTIVE -> COMPLETED)
 */

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Environment configuration - allows override for testing
const EVENTS_TABLE = process.env.EVENTS_TABLE || 'beatmatchme-events';
const REQUESTS_TABLE = process.env.REQUESTS_TABLE || 'beatmatchme-requests';

exports.handler = async (event) => {
  console.log('Updating event status:', JSON.stringify(event, null, 2));

  try {
    const { eventId, status } = event.arguments;
    const performerId = event.identity.sub; // From Cognito

    // Verify performer owns this event
    const eventResult = await dynamodb
      .get({
        TableName: EVENTS_TABLE,
        Key: { eventId },
      })
      .promise();

    if (!eventResult.Item) {
      throw new Error('Event not found');
    }

    if (eventResult.Item.performerId !== performerId) {
      throw new Error('Unauthorized: Only event performer can update status');
    }

    // Validate status transition
    const currentStatus = eventResult.Item.status;
    const validTransitions = {
      SCHEDULED: ['ACTIVE', 'CANCELLED'],
      ACTIVE: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (!validTransitions[currentStatus]?.includes(status)) {
      throw new Error(`Invalid status transition: ${currentStatus} -> ${status}`);
    }

    // Update status
    const result = await dynamodb
      .update({
        TableName: EVENTS_TABLE,
        Key: { eventId },
        UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': status,
          ':updatedAt': Date.now(),
        },
        ReturnValues: 'ALL_NEW',
      })
      .promise();

    // If event is being completed, finalize all pending requests
    if (status === 'COMPLETED') {
      // Get all pending requests
      const requestsResult = await dynamodb
        .query({
          TableName: REQUESTS_TABLE,
          IndexName: 'eventId-submittedAt-index',
          KeyConditionExpression: 'eventId = :eventId',
          FilterExpression: '#status = :pending',
          ExpressionAttributeNames: {
            '#status': 'status',
          },
          ExpressionAttributeValues: {
            ':eventId': eventId,
            ':pending': 'PENDING',
          },
        })
        .promise();

      // Mark all as vetoed and trigger refunds
      const lambda = new AWS.Lambda();
      for (const request of requestsResult.Items || []) {
        await lambda
          .invoke({
            FunctionName: 'beatmatchme-vetoRequest',
            InvocationType: 'Event',
            Payload: JSON.stringify({
              arguments: {
                requestId: request.requestId,
                reason: 'Event ended',
              },
              identity: { sub: performerId },
            }),
          })
          .promise();
      }
    }

    console.log('Event status updated successfully');

    return result.Attributes;
  } catch (error) {
    console.error('Event status update failed:', error);
    throw error;
  }
};
