/**
 * AWS Amplify Configuration for Mobile
 */

import { Amplify } from 'aws-amplify';

// Log environment variables for debugging
console.log('=== Amplify Configuration ===');
console.log('User Pool ID:', process.env.EXPO_PUBLIC_USER_POOL_ID);
console.log('User Pool Client ID:', process.env.EXPO_PUBLIC_USER_POOL_CLIENT_ID);
console.log('Region:', process.env.EXPO_PUBLIC_AWS_REGION);
console.log('Identity Pool ID:', process.env.EXPO_PUBLIC_IDENTITY_POOL_ID);
console.log('============================');

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.EXPO_PUBLIC_USER_POOL_ID || 'us-east-1_XXXXXXXXX',
      userPoolClientId: process.env.EXPO_PUBLIC_USER_POOL_CLIENT_ID || 'XXXXXXXXXXXXXXXXXXXXXXXXXX',
      identityPoolId: process.env.EXPO_PUBLIC_IDENTITY_POOL_ID || 'us-east-1:XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
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
        requireSpecialCharacters: true,
      },
    },
  },
  API: {
    GraphQL: {
      endpoint: process.env.EXPO_PUBLIC_APPSYNC_ENDPOINT || 'https://XXXXXXXXXXXXXXXXXXXXXXXXXX.appsync-api.us-east-1.amazonaws.com/graphql',
      region: process.env.EXPO_PUBLIC_AWS_REGION || 'us-east-1',
      defaultAuthMode: 'userPool',
    },
  },
};

console.log('Amplify config created:', JSON.stringify(amplifyConfig, null, 2));

// Configure Amplify
try {
  Amplify.configure(amplifyConfig);
  console.log('✓ Amplify configured successfully');
} catch (configError) {
  console.error('✗ Amplify configuration failed:', configError);
  console.error('Config error details:', JSON.stringify(configError, null, 2));
}

// Test if Amplify is properly configured
try {
  const currentConfig = Amplify.getConfig();
  console.log('Current Amplify config:', JSON.stringify(currentConfig, null, 2));
} catch (getConfigError) {
  console.error('Could not get Amplify config:', getConfigError);
}

export default amplifyConfig;
