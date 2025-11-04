/**
 * Test Environment Variables
 * Run this to verify .env is loading correctly
 * 
 * Usage:
 * 1. Import this file in App.js temporarily
 * 2. Check console output
 * 3. Remove import after testing
 */

console.log('\n========================================');
console.log('ENVIRONMENT VARIABLES TEST');
console.log('========================================');

console.log('\n📋 Checking environment variables...\n');

const envVars = {
  'EXPO_PUBLIC_AWS_REGION': process.env.EXPO_PUBLIC_AWS_REGION,
  'EXPO_PUBLIC_USER_POOL_ID': process.env.EXPO_PUBLIC_USER_POOL_ID,
  'EXPO_PUBLIC_USER_POOL_CLIENT_ID': process.env.EXPO_PUBLIC_USER_POOL_CLIENT_ID,
  'EXPO_PUBLIC_IDENTITY_POOL_ID': process.env.EXPO_PUBLIC_IDENTITY_POOL_ID,
  'EXPO_PUBLIC_APPSYNC_ENDPOINT': process.env.EXPO_PUBLIC_APPSYNC_ENDPOINT,
  'EXPO_PUBLIC_S3_BUCKET': process.env.EXPO_PUBLIC_S3_BUCKET,
  'EXPO_PUBLIC_ENVIRONMENT': process.env.EXPO_PUBLIC_ENVIRONMENT,
};

let allGood = true;

Object.entries(envVars).forEach(([key, value]) => {
  const status = value ? '✅' : '❌';
  const displayValue = value || 'MISSING';
  console.log(`${status} ${key}: ${displayValue}`);
  
  if (!value) {
    allGood = false;
  }
});

console.log('\n========================================');
if (allGood) {
  console.log('✅ ALL ENVIRONMENT VARIABLES LOADED');
  console.log('✅ Ready to test authentication');
} else {
  console.log('❌ SOME ENVIRONMENT VARIABLES MISSING');
  console.log('⚠️  Make sure mobile/.env exists');
  console.log('⚠️  Restart Expo with: npm start -- --clear');
}
console.log('========================================\n');

export default envVars;
