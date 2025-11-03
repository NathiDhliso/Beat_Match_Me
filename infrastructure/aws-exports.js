// AWS Configuration for BeatMatchMe
// This file contains all AWS resource identifiers for the application
// Import this in your web and mobile apps to connect to AWS services

const awsconfig = {
  // AWS Region
  region: 'us-east-1',
  
  // Amazon Cognito
  cognito: {
    userPoolId: 'us-east-1_m1PhjZ4yD',
    userPoolWebClientId: '748pok6842ocsr2bpkm4nhtqnl',
    region: 'us-east-1',
    // Optional: Configure OAuth if needed
    oauth: {
      domain: '', // Configure later if using hosted UI
      scope: ['email', 'openid', 'profile'],
      redirectSignIn: 'http://localhost:3000/',
      redirectSignOut: 'http://localhost:3000/',
      responseType: 'code'
    }
  },
  
  // AWS AppSync GraphQL API
  appsync: {
    graphqlEndpoint: 'https://v7emm7lqsjbkvoligy4udwru6i.appsync-api.us-east-1.amazonaws.com/graphql',
    region: 'us-east-1',
    authenticationType: 'AMAZON_COGNITO_USER_POOLS',
    // API Key authentication (for public queries if needed)
    apiKey: null // Configure if using API key auth
  },
  
  // Amazon S3
  s3: {
    bucket: 'beatmatchme-assets-2407',
    region: 'us-east-1'
  },
  
  // DynamoDB Tables (for direct SDK access if needed)
  dynamodb: {
    tables: {
      users: 'beatmatchme-users',
      events: 'beatmatchme-events',
      requests: 'beatmatchme-requests',
      queues: 'beatmatchme-queues',
      transactions: 'beatmatchme-transactions',
      achievements: 'beatmatchme-achievements',
      groupRequests: 'beatmatchme-group-requests'
    },
    region: 'us-east-1'
  }
};

// For ES6 modules
export default awsconfig;

// For CommonJS
module.exports = awsconfig;
