/**
 * AWS Configuration - Auto-generated
 * This file is created by the deployment script
 */

export const awsConfig = {
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  userPoolId: import.meta.env.VITE_USER_POOL_ID,
  userPoolWebClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
  identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID,
  appsyncEndpoint: import.meta.env.VITE_APPSYNC_ENDPOINT,
  s3Bucket: import.meta.env.VITE_S3_BUCKET,
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',
};

// Validate configuration
export function validateConfig() {
  const required = [
    'userPoolId',
    'userPoolWebClientId',
    'identityPoolId',
    'appsyncEndpoint',
  ];

  const missing = required.filter(key => !awsConfig[key as keyof typeof awsConfig]);

  if (missing.length > 0) {
    console.error('Missing AWS configuration:', missing);
    return false;
  }

  return true;
}

// Log configuration status (without sensitive data)
if (import.meta.env.DEV) {
  console.log('AWS Config Status:', {
    region: awsConfig.region,
    environment: awsConfig.environment,
    configured: validateConfig(),
  });
}
