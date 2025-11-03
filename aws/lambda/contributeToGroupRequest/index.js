/**
 * Contribute to Group Request Lambda Function
 * Handles contributions to group funding requests
 */

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log('Contributing to group request:', JSON.stringify(event, null, 2));

  try {
    const { groupRequestId, amount } = event.arguments;
    const userId = event.identity.sub; // From Cognito

    // Get group request
    const groupResult = await dynamodb
      .get({
        TableName: 'beatmatchme-group-requests',
        Key: { groupRequestId },
      })
      .promise();

    if (!groupResult.Item) {
      throw new Error('Group request not found');
    }

    const groupRequest = groupResult.Item;

    // Validate group request status
    if (groupRequest.status !== 'FUNDING') {
      throw new Error(`Group request is ${groupRequest.status}`);
    }

    // Check if expired
    if (Date.now() > groupRequest.expiresAt) {
      await dynamodb
        .update({
          TableName: 'beatmatchme-group-requests',
          Key: { groupRequestId },
          UpdateExpression: 'SET #status = :status',
          ExpressionAttributeNames: {
            '#status': 'status',
          },
          ExpressionAttributeValues: {
            ':status': 'EXPIRED',
          },
        })
        .promise();

      throw new Error('Group request has expired');
    }

    // Check if user already contributed
    const existingContributor = groupRequest.contributors.find(
      (c) => c.userId === userId
    );

    if (existingContributor) {
      throw new Error('You have already contributed to this request');
    }

    // Add contribution
    const contributor = {
      userId,
      amount,
      contributedAt: Date.now(),
    };

    const newCurrentAmount = groupRequest.currentAmount + amount;
    const newContributors = [...groupRequest.contributors, contributor];

    // Check if fully funded
    const isFunded = newCurrentAmount >= groupRequest.targetAmount;

    const updateExpression = isFunded
      ? 'SET currentAmount = :amount, contributors = :contributors, #status = :status'
      : 'SET currentAmount = :amount, contributors = :contributors';

    const expressionAttributeValues = isFunded
      ? {
          ':amount': newCurrentAmount,
          ':contributors': newContributors,
          ':status': 'FUNDED',
        }
      : {
          ':amount': newCurrentAmount,
          ':contributors': newContributors,
        };

    const result = await dynamodb
      .update({
        TableName: 'beatmatchme-group-requests',
        Key: { groupRequestId },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: isFunded ? { '#status': 'status' } : undefined,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      })
      .promise();

    // If fully funded, create the actual request
    if (isFunded) {
      const { v4: uuidv4 } = require('uuid');
      const requestId = uuidv4();

      const request = {
        requestId,
        eventId: groupRequest.eventId,
        userId: groupRequest.initiatorUserId,
        songTitle: groupRequest.songTitle,
        artistName: groupRequest.artistName,
        status: 'PENDING',
        requestType: 'GROUP',
        price: groupRequest.targetAmount,
        groupRequestId,
        submittedAt: Date.now(),
        upvotes: 0,
      };

      await dynamodb
        .put({
          TableName: 'beatmatchme-requests',
          Item: request,
        })
        .promise();

      // Update group request with requestId
      await dynamodb
        .update({
          TableName: 'beatmatchme-group-requests',
          Key: { groupRequestId },
          UpdateExpression: 'SET requestId = :requestId, #status = :status',
          ExpressionAttributeNames: {
            '#status': 'status',
          },
          ExpressionAttributeValues: {
            ':requestId': requestId,
            ':status': 'COMPLETED',
          },
        })
        .promise();

      console.log('Group request fully funded and request created:', requestId);
    }

    console.log('Contribution added successfully');
    return result.Attributes;
  } catch (error) {
    console.error('Contribution failed:', error);
    throw error;
  }
};
