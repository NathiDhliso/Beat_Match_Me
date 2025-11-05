// AWS Configuration for BeatMatchMe Mobile
// Synced with web configuration

const awsconfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_g5ri75gFs',
      userPoolClientId: '5k2gpu9k57710ck1dcu93lo93t',
      region: 'us-east-1',
      loginWith: {
        email: true,
      },
      signUpVerificationMethod: 'code',
      userAttributes: {
        email: {
          required: true,
        },
        name: {
          required: true,
        },
      },
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: false,
      },
    },
  },
  API: {
    GraphQL: {
      endpoint: 'https://v7emm7lqsjbkvoligy4udwru6i.appsync-api.us-east-1.amazonaws.com/graphql',
      region: 'us-east-1',
      defaultAuthMode: 'userPool',
    },
  },
  Storage: {
    S3: {
      bucket: 'beatmatchme-assets-2407',
      region: 'us-east-1',
    },
  },
};

export default awsconfig;
