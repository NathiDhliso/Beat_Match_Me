/**
 * Reorder Queue Lambda Function
 * Handles queue reordering by performers
 */

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Environment configuration - allows override for testing
const EVENTS_TABLE = process.env.EVENTS_TABLE || 'beatmatchme-events';
const REQUESTS_TABLE = process.env.REQUESTS_TABLE || 'beatmatchme-requests';
const QUEUES_TABLE = process.env.QUEUES_TABLE || 'beatmatchme-queues';

exports.handler = async (event) => {
  console.log('Reordering queue:', JSON.stringify(event, null, 2));

  try {
    const { eventId, orderedRequestIds } = event.arguments;
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
      throw new Error('Unauthorized: Only event performer can reorder queue');
    }

    // Update queue order
    await dynamodb
      .put({
        TableName: QUEUES_TABLE,
        Item: {
          eventId,
          orderedRequestIds,
          lastUpdated: Date.now(),
        },
      })
      .promise();

    // Update queue positions for each request
    const updatePromises = orderedRequestIds.map((requestId, index) =>
      dynamodb
        .update({
          TableName: REQUESTS_TABLE,
          Key: { requestId },
          UpdateExpression: 'SET queuePosition = :position',
          ExpressionAttributeValues: {
            ':position': index + 1,
          },
        })
        .promise()
    );

    await Promise.all(updatePromises);

    // Fetch full queue data for response
    const requestsResult = await dynamodb
      .batchGet({
        RequestItems: {
          'beatmatchme-requests': {
            Keys: orderedRequestIds.map((id) => ({ requestId: id })),
          },
        },
      })
      .promise();

    const requests = requestsResult.Responses['beatmatchme-requests'];

    console.log('Queue reordered successfully');

    return {
      eventId,
      orderedRequests: requests.sort(
        (a, b) => a.queuePosition - b.queuePosition
      ),
      lastUpdated: Date.now(),
    };
  } catch (error) {
    console.error('Queue reorder failed:', error);
    throw error;
  }
};
