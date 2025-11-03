/**
 * Upvote Request Lambda Function
 * Handles upvoting song requests
 */

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log('Upvoting request:', JSON.stringify(event, null, 2));

  try {
    const { requestId } = event.arguments;
    const userId = event.identity.sub; // From Cognito

    // Check if user already upvoted
    const upvoteKey = `${requestId}:${userId}`;
    
    const existingUpvote = await dynamodb
      .get({
        TableName: 'beatmatchme-upvotes',
        Key: { upvoteKey },
      })
      .promise();

    if (existingUpvote.Item) {
      // Remove upvote
      await dynamodb
        .delete({
          TableName: 'beatmatchme-upvotes',
          Key: { upvoteKey },
        })
        .promise();

      // Decrement upvote count
      const result = await dynamodb
        .update({
          TableName: 'beatmatchme-requests',
          Key: { requestId },
          UpdateExpression: 'SET upvotes = upvotes - :dec',
          ExpressionAttributeValues: {
            ':dec': 1,
          },
          ReturnValues: 'ALL_NEW',
        })
        .promise();

      console.log('Upvote removed');
      return result.Attributes;
    } else {
      // Add upvote
      await dynamodb
        .put({
          TableName: 'beatmatchme-upvotes',
          Item: {
            upvoteKey,
            requestId,
            userId,
            createdAt: Date.now(),
          },
        })
        .promise();

      // Increment upvote count
      const result = await dynamodb
        .update({
          TableName: 'beatmatchme-requests',
          Key: { requestId },
          UpdateExpression: 'SET upvotes = upvotes + :inc',
          ExpressionAttributeValues: {
            ':inc': 1,
          },
          ReturnValues: 'ALL_NEW',
        })
        .promise();

      console.log('Upvote added');
      return result.Attributes;
    }
  } catch (error) {
    console.error('Upvote failed:', error);
    throw error;
  }
};
