/**
 * Reorder Queue Lambda Function
 * Handles queue reordering by performers
 */

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log('Reordering queue:', JSON.stringify(event, null, 2));

  try {
    const { eventId, orderedRequestIds } = event.arguments;
    const performerId = event.identity.sub; // From Cognito

    // Verify performer owns this event
    const eventResult = await dynamodb
      .get({
        TableName: 'beatmatchme-events',
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
        TableName: 'beatmatchme-queues',
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
          TableName: 'beatmatchme-requests',
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
