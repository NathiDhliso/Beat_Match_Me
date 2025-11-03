/**
 * Calculate Queue Position Lambda Function
 * Determines queue order based on request type, price, user tier, and timing
 */

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Tier weights for queue priority
const TIER_WEIGHTS = {
  PLATINUM: 4,
  GOLD: 3,
  SILVER: 2,
  BRONZE: 1,
};

// Request type multipliers
const TYPE_MULTIPLIERS = {
  spotlight: 3,
  dedication: 2,
  standard: 1,
};

// Calculate priority score for a request
function calculatePriority(request, userTier) {
  const tierWeight = TIER_WEIGHTS[userTier] || 1;
  const typeMultiplier = TYPE_MULTIPLIERS[request.requestType] || 1;
  const priceWeight = request.price / 10; // Normalize price
  const timeWeight = (Date.now() - request.submittedAt) / (1000 * 60 * 5); // 5 min increments

  return tierWeight * typeMultiplier * priceWeight + timeWeight;
}

// Get user tier from DynamoDB
async function getUserTier(userId) {
  const result = await dynamodb
    .get({
      TableName: 'beatmatchme-users',
      Key: { userId },
      ProjectionExpression: 'tier',
    })
    .promise();

  return result.Item?.tier || 'BRONZE';
}

// Get all pending requests for an event
async function getPendingRequests(eventId) {
  const result = await dynamodb
    .query({
      TableName: 'beatmatchme-requests',
      IndexName: 'EventStatusIndex',
      KeyConditionExpression: 'eventId = :eventId AND #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':eventId': eventId,
        ':status': 'PENDING',
      },
    })
    .promise();

  return result.Items || [];
}

// Update queue positions in DynamoDB
async function updateQueuePositions(requests) {
  const updatePromises = requests.map((request, index) =>
    dynamodb
      .update({
        TableName: 'beatmatchme-requests',
        Key: { requestId: request.requestId },
        UpdateExpression: 'SET queuePosition = :position',
        ExpressionAttributeValues: {
          ':position': index + 1,
        },
      })
      .promise()
  );

  await Promise.all(updatePromises);
}

// Update queue record in DynamoDB
async function updateQueueRecord(eventId, sortedRequests) {
  const queueId = `queue-${eventId}`;

  await dynamodb
    .put({
      TableName: 'beatmatchme-queues',
      Item: {
        queueId,
        eventId,
        requests: sortedRequests.map((r, index) => ({
          requestId: r.requestId,
          queuePosition: index + 1,
          priority: r.priority,
        })),
        updatedAt: Date.now(),
      },
    })
    .promise();

  return queueId;
}

exports.handler = async (event) => {
  console.log('Calculating queue positions:', JSON.stringify(event, null, 2));

  try {
    const { eventId } = event.arguments || event;

    // Get all pending requests for the event
    const requests = await getPendingRequests(eventId);

    if (requests.length === 0) {
      console.log('No pending requests found');
      return {
        queueId: `queue-${eventId}`,
        eventId,
        requests: [],
      };
    }

    // Get user tiers for all requests
    const requestsWithTiers = await Promise.all(
      requests.map(async (request) => {
        const tier = await getUserTier(request.userId);
        return { ...request, userTier: tier };
      })
    );

    // Calculate priority scores
    const requestsWithPriority = requestsWithTiers.map((request) => ({
      ...request,
      priority: calculatePriority(request, request.userTier),
    }));

    // Sort by priority (highest first)
    const sortedRequests = requestsWithPriority.sort((a, b) => b.priority - a.priority);

    // Update queue positions in requests table
    await updateQueuePositions(sortedRequests);

    // Update queue record
    const queueId = await updateQueueRecord(eventId, sortedRequests);

    console.log(`Queue updated: ${sortedRequests.length} requests sorted`);

    return {
      queueId,
      eventId,
      requests: sortedRequests.map((r, index) => ({
        requestId: r.requestId,
        songTitle: r.songTitle,
        artistName: r.artistName,
        queuePosition: index + 1,
        priority: r.priority,
        requestType: r.requestType,
        price: r.price,
        userTier: r.userTier,
      })),
    };
  } catch (error) {
    console.error('Queue calculation failed:', error);
    throw new Error(`Failed to calculate queue: ${error.message}`);
  }
};
