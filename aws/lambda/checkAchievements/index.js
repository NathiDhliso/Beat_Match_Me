/**
 * Check Achievements Lambda Function
 * Triggered by DynamoDB Streams to check and unlock achievements
 */

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();

const ACHIEVEMENTS = {
  FIRST_REQUEST: {
    id: 'first_request',
    name: 'First Request',
    description: 'Make your first song request',
    tier: 'BRONZE',
    icon: '🎵',
    check: (stats) => stats.totalRequests >= 1,
  },
  SOCIAL_BUTTERFLY: {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Participate in 5 group requests',
    tier: 'SILVER',
    icon: '🦋',
    check: (stats) => stats.groupRequests >= 5,
  },
  VIBE_CURATOR: {
    id: 'vibe_curator',
    name: 'Vibe Curator',
    description: 'Get 50 upvotes on your requests',
    tier: 'GOLD',
    icon: '⭐',
    check: (stats) => stats.totalUpvotes >= 50,
  },
  TRENDSETTER: {
    id: 'trendsetter',
    name: 'Trendsetter',
    description: 'Request a song that gets 20+ upvotes',
    tier: 'GOLD',
    icon: '🔥',
    check: (stats) => stats.maxUpvotesOnSingleRequest >= 20,
  },
  GENRE_EXPLORER: {
    id: 'genre_explorer',
    name: 'Genre Explorer',
    description: 'Request songs from 10 different genres',
    tier: 'SILVER',
    icon: '🌍',
    check: (stats) => stats.genresExplored.length >= 10,
  },
  DEDICATION_KING: {
    id: 'dedication_king',
    name: 'Dedication King/Queen',
    description: 'Send 25 dedications',
    tier: 'GOLD',
    icon: '👑',
    check: (stats) => stats.dedicationsSent >= 25,
  },
  NIGHT_OWL: {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Attend 10 events',
    tier: 'SILVER',
    icon: '🦉',
    check: (stats) => stats.eventsAttended >= 10,
  },
  REQUEST_MASTER: {
    id: 'request_master',
    name: 'Request Master',
    description: 'Make 50 successful requests',
    tier: 'GOLD',
    icon: '🏆',
    check: (stats) => stats.successfulRequests >= 50,
  },
  PLATINUM_DJ: {
    id: 'platinum_dj',
    name: 'Platinum DJ',
    description: 'Reach Platinum tier',
    tier: 'PLATINUM',
    icon: '💎',
    check: (stats) => stats.tier === 'PLATINUM',
  },
};

async function getUserStats(userId) {
  // Get user data
  const userResult = await dynamodb
    .get({
      TableName: 'beatmatchme-users',
      Key: { userId },
    })
    .promise();

  if (!userResult.Item) {
    throw new Error('User not found');
  }

  const user = userResult.Item;

  // Get user's requests
  const requestsResult = await dynamodb
    .query({
      TableName: 'beatmatchme-requests',
      IndexName: 'userId-submittedAt-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    })
    .promise();

  const requests = requestsResult.Items || [];

  // Calculate stats
  const stats = {
    totalRequests: requests.length,
    successfulRequests: requests.filter((r) => r.status === 'COMPLETED').length,
    eventsAttended: new Set(requests.map((r) => r.eventId)).size,
    genresExplored: [...new Set(requests.map((r) => r.genre).filter(Boolean))],
    groupRequests: requests.filter((r) => r.requestType === 'GROUP').length,
    dedicationsSent: requests.filter((r) => r.dedication).length,
    totalUpvotes: requests.reduce((sum, r) => sum + (r.upvotes || 0), 0),
    maxUpvotesOnSingleRequest: Math.max(...requests.map((r) => r.upvotes || 0), 0),
    tier: user.tier,
  };

  return stats;
}

async function getUnlockedAchievements(userId) {
  const achievementsResult = await dynamodb
    .get({
      TableName: 'beatmatchme-achievements',
      Key: { userId },
    })
    .promise();

  return achievementsResult.Item?.badges || [];
}

async function unlockAchievement(userId, achievement) {
  const badge = {
    badgeId: achievement.id,
    name: achievement.name,
    tier: achievement.tier,
    unlockedAt: Date.now(),
  };

  // Add badge to user's achievements
  await dynamodb
    .update({
      TableName: 'beatmatchme-achievements',
      Key: { userId },
      UpdateExpression:
        'SET badges = list_append(if_not_exists(badges, :empty_list), :badge), score = score + :points',
      ExpressionAttributeValues: {
        ':badge': [badge],
        ':empty_list': [],
        ':points': achievement.tier === 'PLATINUM' ? 100 : achievement.tier === 'GOLD' ? 50 : achievement.tier === 'SILVER' ? 25 : 10,
      },
    })
    .promise();

  // Send notification
  await sns
    .publish({
      TopicArn: process.env.USER_NOTIFICATIONS_TOPIC,
      Message: JSON.stringify({
        type: 'ACHIEVEMENT_UNLOCKED',
        userId,
        achievement: {
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          tier: achievement.tier,
          icon: achievement.icon,
        },
      }),
      Subject: 'Achievement Unlocked! - BeatMatchMe',
    })
    .promise();

  return badge;
}

exports.handler = async (event) => {
  console.log('Checking achievements:', JSON.stringify(event, null, 2));

  const newlyUnlocked = [];

  try {
    // Process each DynamoDB Stream record
    for (const record of event.Records) {
      if (record.eventName === 'INSERT' || record.eventName === 'MODIFY') {
        const newImage = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
        const userId = newImage.userId;

        if (!userId) continue;

        // Get current stats
        const stats = await getUserStats(userId);

        // Get already unlocked achievements
        const unlockedBadges = await getUnlockedAchievements(userId);
        const unlockedIds = new Set(unlockedBadges.map((b) => b.badgeId));

        // Check each achievement
        for (const [key, achievement] of Object.entries(ACHIEVEMENTS)) {
          // Skip if already unlocked
          if (unlockedIds.has(achievement.id)) continue;

          // Check if criteria met
          if (achievement.check(stats)) {
            console.log(`Unlocking achievement: ${achievement.name} for user ${userId}`);
            const badge = await unlockAchievement(userId, achievement);
            newlyUnlocked.push(badge);
          }
        }

        // Check if tier should be updated
        const newTier = calculateTier(stats.successfulRequests);
        if (newTier !== stats.tier) {
          await dynamodb
            .update({
              TableName: 'beatmatchme-users',
              Key: { userId },
              UpdateExpression: 'SET tier = :tier',
              ExpressionAttributeValues: {
                ':tier': newTier,
              },
            })
            .promise();

          console.log(`Updated tier for user ${userId}: ${stats.tier} -> ${newTier}`);
        }
      }
    }

    console.log(`Unlocked ${newlyUnlocked.length} new achievements`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Achievements checked successfully',
        newlyUnlocked,
      }),
    };
  } catch (error) {
    console.error('Achievement check failed:', error);
    throw error;
  }
};

function calculateTier(successfulRequests) {
  if (successfulRequests >= 50) return 'PLATINUM';
  if (successfulRequests >= 16) return 'GOLD';
  if (successfulRequests >= 6) return 'SILVER';
  return 'BRONZE';
}
