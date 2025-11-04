/**
 * AWS Amplify Configuration
 * Connects frontend to backend services
 */

import { Amplify } from 'aws-amplify';

// Build Cognito config - Identity Pool is optional
const cognitoConfig: any = {
  userPoolId: import.meta.env.VITE_USER_POOL_ID || 'us-east-1_XXXXXXXXX',
  userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID || 'XXXXXXXXXXXXXXXXXXXXXXXXXX',
  loginWith: {
    email: true,
    oauth: {
      domain: import.meta.env.VITE_COGNITO_DOMAIN || 'beatmatchme-dev.auth.us-east-1.amazoncognito.com',
      scopes: ['email', 'openid', 'profile'],
      redirectSignIn: [import.meta.env.VITE_OAUTH_REDIRECT_SIGNIN || 'http://localhost:5173'],
      redirectSignOut: [import.meta.env.VITE_OAUTH_REDIRECT_SIGNOUT || 'http://localhost:5173'],
      responseType: 'code' as const,
    },
  },
  signUpVerificationMethod: 'code' as const,
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
    requireSpecialCharacters: true,
  },
};

// Only add Identity Pool if it's defined and in correct region
if (import.meta.env.VITE_IDENTITY_POOL_ID && import.meta.env.VITE_IDENTITY_POOL_ID.startsWith('us-east-1:')) {
  cognitoConfig.identityPoolId = import.meta.env.VITE_IDENTITY_POOL_ID;
}

const amplifyConfig = {
  Auth: {
    Cognito: cognitoConfig,
  },
  API: {
    GraphQL: {
      endpoint: import.meta.env.VITE_APPSYNC_ENDPOINT || 'https://XXXXXXXXXXXXXXXXXXXXXXXXXX.appsync-api.us-east-1.amazonaws.com/graphql',
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      defaultAuthMode: 'userPool' as const,
    },
  },
  Storage: {
    S3: {
      bucket: import.meta.env.VITE_S3_BUCKET || 'beatmatchme-assets',
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
    },
  },
};

// Configure Amplify
Amplify.configure(amplifyConfig);

export default amplifyConfig;
