/**
 * Create Group Request Lambda Function
 * Creates a new group funding request
 */

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log('Creating group request:', JSON.stringify(event, null, 2));

  try {
    const input = event.arguments.input;
    const userId = event.identity.sub; // From Cognito

    // Validate event exists
    const eventResult = await dynamodb
      .get({
        TableName: 'beatmatchme-events',
        Key: { eventId: input.eventId },
      })
      .promise();

    if (!eventResult.Item) {
      throw new Error('Event not found');
    }

    if (!eventResult.Item.settings.allowGroupRequests) {
      throw new Error('Group requests not allowed for this event');
    }

    // Create group request
    const groupRequestId = uuidv4();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    const groupRequest = {
      groupRequestId,
      eventId: input.eventId,
      initiatorUserId: userId,
      songTitle: input.songTitle,
      artistName: input.artistName,
      targetAmount: input.targetAmount,
      currentAmount: 0,
      contributors: [],
      status: 'FUNDING',
      expiresAt,
      createdAt: Date.now(),
    };

    await dynamodb
      .put({
        TableName: 'beatmatchme-group-requests',
        Item: groupRequest,
      })
      .promise();

    console.log('Group request created:', groupRequestId);

    // Generate shareable link
    const shareLink = `beatmatchme://group/${groupRequestId}`;

    return {
      ...groupRequest,
      shareLink,
    };
  } catch (error) {
    console.error('Group request creation failed:', error);
    throw error;
  }
};
