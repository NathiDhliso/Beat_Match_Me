/**
 * Update User Tier Lambda Function
 * Triggered by DynamoDB stream on user stats updates
 * Calculates and updates user tier based on activity
 */

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Tier thresholds
const TIER_THRESHOLDS = {
  PLATINUM: {
    minRequests: 50,
    minSuccessful: 40,
    minEvents: 10,
  },
  GOLD: {
    minRequests: 20,
    minSuccessful: 15,
    minEvents: 5,
  },
  SILVER: {
    minRequests: 5,
    minSuccessful: 3,
    minEvents: 2,
  },
  BRONZE: {
    minRequests: 0,
    minSuccessful: 0,
    minEvents: 0,
  },
};

// Calculate tier based on user stats
function calculateTier(stats) {
  const { totalRequests, successfulRequests, eventsAttended } = stats;

  if (
    totalRequests >= TIER_THRESHOLDS.PLATINUM.minRequests &&
    successfulRequests >= TIER_THRESHOLDS.PLATINUM.minSuccessful &&
    eventsAttended >= TIER_THRESHOLDS.PLATINUM.minEvents
  ) {
    return 'PLATINUM';
  }

  if (
    totalRequests >= TIER_THRESHOLDS.GOLD.minRequests &&
    successfulRequests >= TIER_THRESHOLDS.GOLD.minSuccessful &&
    eventsAttended >= TIER_THRESHOLDS.GOLD.minEvents
  ) {
    return 'GOLD';
  }

  if (
    totalRequests >= TIER_THRESHOLDS.SILVER.minRequests &&
    successfulRequests >= TIER_THRESHOLDS.SILVER.minSuccessful &&
    eventsAttended >= TIER_THRESHOLDS.SILVER.minEvents
  ) {
    return 'SILVER';
  }

  return 'BRONZE';
}

// Get user stats from DynamoDB
async function getUserStats(userId) {
  const result = await dynamodb
    .get({
      TableName: 'beatmatchme-users',
      Key: { userId },
      ProjectionExpression: 'stats, tier',
    })
    .promise();

  return result.Item;
}

// Update user tier in DynamoDB and Cognito
async function updateUserTier(userId, newTier, oldTier) {
  // Update DynamoDB
  await dynamodb
    .update({
      TableName: 'beatmatchme-users',
      Key: { userId },
      UpdateExpression: 'SET tier = :tier, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':tier': newTier,
        ':updatedAt': Date.now(),
      },
    })
    .promise();

  // Update Cognito user attribute
  const cognito = new AWS.CognitoIdentityServiceProvider();
  try {
    await cognito
      .adminUpdateUserAttributes({
        UserPoolId: 'us-east-1_g5ri75gFs',
        Username: userId,
        UserAttributes: [
          {
            Name: 'custom:tier',
            Value: newTier,
          },
        ],
      })
      .promise();
  } catch (error) {
    console.error('Failed to update Cognito attribute:', error);
    // Don't fail the whole operation if Cognito update fails
  }

  console.log(`User ${userId} tier updated: ${oldTier} → ${newTier}`);
}

// Create tier change notification
async function createTierNotification(userId, newTier, oldTier) {
  const notification = {
    notificationId: `notif-${Date.now()}-${userId}`,
    userId,
    type: 'tier_upgrade',
    title: `Congratulations! You're now ${newTier}!`,
    message: `You've been upgraded from ${oldTier} to ${newTier} tier. Enjoy your new benefits!`,
    timestamp: Date.now(),
    read: false,
  };

  // In production, this would publish to SNS for push notifications
  console.log('Tier upgrade notification:', notification);

  return notification;
}

exports.handler = async (event) => {
  console.log('Processing tier update:', JSON.stringify(event, null, 2));

  try {
    // Handle DynamoDB Stream event
    for (const record of event.Records) {
      if (record.eventName === 'MODIFY' || record.eventName === 'INSERT') {
        const userId = record.dynamodb.Keys.userId.S;

        // Get current user data
        const userData = await getUserStats(userId);

        if (!userData || !userData.stats) {
          console.log(`No stats found for user ${userId}`);
          continue;
        }

        const currentTier = userData.tier || 'BRONZE';
        const newTier = calculateTier(userData.stats);

        // Only update if tier has changed
        if (newTier !== currentTier) {
          await updateUserTier(userId, newTier, currentTier);

          // Create notification if it's an upgrade
          const tierOrder = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
          if (tierOrder.indexOf(newTier) > tierOrder.indexOf(currentTier)) {
            await createTierNotification(userId, newTier, currentTier);
          }
        } else {
          console.log(`User ${userId} tier unchanged: ${currentTier}`);
        }
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Tier updates processed successfully' }),
    };
  } catch (error) {
    console.error('Tier update failed:', error);
    throw new Error(`Failed to update tier: ${error.message}`);
  }
};
