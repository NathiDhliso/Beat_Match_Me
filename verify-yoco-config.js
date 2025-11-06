/**
 * Quick test to verify Yoco integration is configured correctly
 * Run with: node verify-yoco-config.js
 */

require('dotenv').config({ path: '.env.test' });

const yocoSecretKey = process.env.YOCO_SECRET_KEY;
const yocoPublicKey = process.env.YOCO_PUBLIC_KEY;

console.log('\n🔍 Verifying Yoco Test Configuration...\n');

// Check if keys are loaded
if (!yocoSecretKey || yocoSecretKey.includes('YOUR_')) {
  console.error('❌ YOCO_SECRET_KEY not configured properly');
  process.exit(1);
}

if (!yocoPublicKey || yocoPublicKey.includes('YOUR_')) {
  console.error('❌ YOCO_PUBLIC_KEY not configured properly');
  process.exit(1);
}

// Verify key format
const secretKeyValid = yocoSecretKey.startsWith('sk_test_');
const publicKeyValid = yocoPublicKey.startsWith('pk_test_');

console.log(`✅ YOCO_SECRET_KEY: ${yocoSecretKey.substring(0, 15)}... (${secretKeyValid ? 'valid' : 'invalid'} format)`);
console.log(`✅ YOCO_PUBLIC_KEY: ${yocoPublicKey.substring(0, 15)}... (${publicKeyValid ? 'valid' : 'invalid'} format)`);

if (!secretKeyValid || !publicKeyValid) {
  console.error('\n❌ Key format validation failed');
  process.exit(1);
}

console.log('\n🎉 Yoco test keys are configured correctly!');
console.log('\n📝 Test Card Details:');
console.log('   Card Number: 4111 1111 1111 1111');
console.log('   Expiry: 12/25');
console.log('   CVV: 123');
console.log('\n✅ Ready for payment testing!\n');
