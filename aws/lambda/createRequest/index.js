/**
 * Create Request Lambda Function
 * Creates a new song request and adds to queue
 */

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();

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
  console.log('Creating request:', JSON.stringify(event, null, 2));

  try {
    const input = event.arguments.input;
    const userId = event.identity.sub; // From Cognito

    // Validate event exists and is active
    const eventResult = await dynamodb
      .get({
        TableName: 'beatmatchme-events',
        Key: { eventId: input.eventId },
      })
      .promise();

    if (!eventResult.Item) {
      throw new Error('Event not found');
    }

    if (eventResult.Item.status !== 'ACTIVE') {
      throw new Error('Event is not active');
    }

    const eventData = eventResult.Item;

    // Calculate price
    let price = eventData.settings.basePrice;
    if (input.requestType === 'SPOTLIGHT') {
      price *= 2.5;
    }
    if (input.dedication) {
      price += 10;
    }
    if (input.shoutout) {
      price += 15;
    }

    // Calculate queue position
    const queuePosition = await calculateQueuePosition(
      input.eventId,
      input.requestType
    );

    // Create request
    const requestId = uuidv4();
    const request = {
      requestId,
      eventId: input.eventId,
      userId,
      songTitle: input.songTitle,
      artistName: input.artistName,
      genre: input.genre || 'Unknown',
      status: 'PENDING',
      requestType: input.requestType,
      price,
      queuePosition,
      dedication: input.dedication,
      shoutout: input.shoutout,
      submittedAt: Date.now(),
      upvotes: 0,
      transactionId: '', // Will be updated after payment
    };

    await dynamodb
      .put({
        TableName: 'beatmatchme-requests',
        Item: request,
      })
      .promise();

    // Update queue
    const queueResult = await dynamodb
      .get({
        TableName: 'beatmatchme-queues',
        Key: { eventId: input.eventId },
      })
      .promise();

    let orderedRequestIds = queueResult.Item?.orderedRequestIds || [];

    if (input.requestType === 'SPOTLIGHT') {
      // Add to front
      orderedRequestIds.unshift(requestId);
    } else {
      // Add to end
      orderedRequestIds.push(requestId);
    }

    await dynamodb
      .put({
        TableName: 'beatmatchme-queues',
        Item: {
          eventId: input.eventId,
          orderedRequestIds,
          lastUpdated: Date.now(),
        },
      })
      .promise();

    // Update event stats
    await dynamodb
      .update({
        TableName: 'beatmatchme-events',
        Key: { eventId: input.eventId },
        UpdateExpression: 'SET totalRequests = totalRequests + :inc',
        ExpressionAttributeValues: {
          ':inc': 1,
        },
      })
      .promise();

    console.log('Request created successfully:', requestId);

    return request;
  } catch (error) {
    console.error('Request creation failed:', error);
    throw error;
  }
};
