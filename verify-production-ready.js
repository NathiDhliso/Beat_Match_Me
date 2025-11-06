/**
 * Comprehensive verification that all Lambda functions are production-ready
 * Checks that environment variable pattern is correctly implemented
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Verifying Production Readiness of All Lambda Functions...\n');

const lambdaFunctions = [
  'createRequest',
  'processPayment',
  'reorderQueue',
  'updateEventStatus',
  'vetoRequest',
  'processRefund',
  'createEvent',
  'calculateQueuePosition'
];

const tableEnvVars = [
  'EVENTS_TABLE',
  'REQUESTS_TABLE',
  'TRANSACTIONS_TABLE',
  'QUEUES_TABLE',
  'USERS_TABLE',
  'SETS_TABLE',
  'FAILED_REFUNDS_TABLE'
];

let allPassed = true;
const results = [];

// Check each Lambda function
lambdaFunctions.forEach(lambdaName => {
  const lambdaPath = path.join(__dirname, 'aws', 'lambda', lambdaName, 'index.js');
  
  if (!fs.existsSync(lambdaPath)) {
    console.error(`❌ ${lambdaName}: File not found at ${lambdaPath}`);
    allPassed = false;
    return;
  }
  
  const code = fs.readFileSync(lambdaPath, 'utf8');
  
  const checks = {
    name: lambdaName,
    hasEnvPattern: false,
    noHardcodedTables: true,
    usesConstants: true,
    envVarsFound: []
  };
  
  // Check 1: Has environment variable pattern with fallback
  tableEnvVars.forEach(envVar => {
    const pattern = new RegExp(`process\\.env\\.${envVar}\\s*\\|\\|\\s*'beatmatchme-`, 'g');
    if (pattern.test(code)) {
      checks.envVarsFound.push(envVar);
      checks.hasEnvPattern = true;
    }
  });
  
  // Check 2: No hardcoded table names in TableName
  const hardcodedPattern = /TableName:\s*['"]beatmatchme-/g;
  if (hardcodedPattern.test(code)) {
    checks.noHardcodedTables = false;
  }
  
  // Check 3: Uses constants (EVENTS_TABLE, etc.)
  const constantPattern = /TableName:\s*(?:EVENTS_TABLE|REQUESTS_TABLE|TRANSACTIONS_TABLE|QUEUES_TABLE|USERS_TABLE|SETS_TABLE|FAILED_REFUNDS_TABLE|process\.env)/g;
  checks.usesConstants = constantPattern.test(code);
  
  results.push(checks);
});

// Print results
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Lambda Function Verification Results');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

results.forEach(result => {
  const status = result.hasEnvPattern && result.noHardcodedTables && result.usesConstants ? '✅' : '❌';
  console.log(`${status} ${result.name}`);
  
  if (result.envVarsFound.length > 0) {
    console.log(`   Environment variables: ${result.envVarsFound.join(', ')}`);
  }
  
  if (!result.noHardcodedTables) {
    console.log(`   ⚠️  WARNING: Hardcoded table names found!`);
    allPassed = false;
  }
  
  if (!result.usesConstants) {
    console.log(`   ⚠️  WARNING: Not using constants for table names!`);
    allPassed = false;
  }
  
  console.log('');
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Summary
const passedCount = results.filter(r => r.hasEnvPattern && r.noHardcodedTables && r.usesConstants).length;
const totalCount = results.length;

console.log('📊 Summary:');
console.log(`   Lambdas checked: ${totalCount}`);
console.log(`   Production-ready: ${passedCount}/${totalCount}`);
console.log('');

// Production deployment verification
if (allPassed && passedCount === totalCount) {
  console.log('🎉 All Lambda functions are PRODUCTION READY! ✅\n');
  console.log('Production Deployment Checklist:');
  console.log('');
  console.log('1. Set environment variables in AWS Lambda console:');
  console.log('   ✅ EVENTS_TABLE=beatmatchme-events');
  console.log('   ✅ REQUESTS_TABLE=beatmatchme-requests');
  console.log('   ✅ TRANSACTIONS_TABLE=beatmatchme-transactions');
  console.log('   ✅ QUEUES_TABLE=beatmatchme-queues');
  console.log('   ✅ USERS_TABLE=beatmatchme-users');
  console.log('   ✅ SETS_TABLE=beatmatchme-djsets');
  console.log('   ✅ FAILED_REFUNDS_TABLE=beatmatchme-failed-refunds');
  console.log('   ✅ YOCO_SECRET_KEY=<production-key-from-secrets-manager>');
  console.log('');
  console.log('2. OR use AWS CLI to update all functions:');
  console.log('');
  console.log('   aws lambda update-function-configuration \\');
  console.log('     --function-name <function-name> \\');
  console.log('     --environment Variables="{');
  console.log('       EVENTS_TABLE=beatmatchme-events,');
  console.log('       REQUESTS_TABLE=beatmatchme-requests,');
  console.log('       TRANSACTIONS_TABLE=beatmatchme-transactions,');
  console.log('       QUEUES_TABLE=beatmatchme-queues,');
  console.log('       USERS_TABLE=beatmatchme-users,');
  console.log('       SETS_TABLE=beatmatchme-djsets,');
  console.log('       FAILED_REFUNDS_TABLE=beatmatchme-failed-refunds');
  console.log('     }"');
  console.log('');
  console.log('3. Test in staging environment first:');
  console.log('   - Set EVENTS_TABLE=beatmatchme-events-staging');
  console.log('   - Run integration tests');
  console.log('   - Verify all functionality');
  console.log('');
  console.log('4. Deploy to production with confidence! 🚀');
  console.log('');
  
  process.exit(0);
} else {
  console.log('❌ Some Lambda functions need fixes before production deployment.\n');
  console.log('Please review the warnings above and fix any issues.\n');
  process.exit(1);
}
