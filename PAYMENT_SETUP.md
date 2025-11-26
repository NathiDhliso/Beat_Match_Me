# BeatMatchMe Payment System Setup

## Overview

BeatMatchMe uses **Yoco** as the payment provider for South African Rand (ZAR) transactions. The system implements a secure payment flow with server-side verification.

## Payment Flow

```
1. User selects song → 2. Create payment intent → 3. Yoco popup → 4. User pays
                                                                        ↓
5. Server verifies charge ← 6. Submit request with chargeId ← 7. Payment succeeds
                                                                        ↓
8. Request added to queue → 9. DJ sees request → 10. User notified
```

## Environment Variables

### Web App (`web/.env`)

```env
VITE_YOCO_PUBLIC_KEY=pk_live_YOUR_LIVE_PUBLIC_KEY
```

### Lambda Functions

Set these in AWS Lambda environment variables or AWS Secrets Manager:

```
YOCO_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
```

### DynamoDB Tables Required

- `beatmatchme-transactions` - Stores all payment transactions
- `beatmatchme-requests` - Stores song requests
- `beatmatchme-djsets` - Stores DJ set information
- `beatmatchme-users` - Stores user balances
- `beatmatchme-queues` - Stores queue data
- `beatmatchme-failed-refunds` - Stores failed refunds for manual review

### DynamoDB GSI Indexes Required

1. **idempotencyKey-index** on `beatmatchme-transactions`
   - Partition key: `idempotencyKey`
   
2. **providerTransactionId-index** on `beatmatchme-transactions`
   - Partition key: `providerTransactionId`

## Yoco Account Setup

1. Create account at https://www.yoco.com/za/
2. Go to Developer Portal: https://developer.yoco.com/
3. Get your API keys:
   - **Test keys** (pk_test_*, sk_test_*) for development
   - **Live keys** (pk_live_*, sk_live_*) for production

## Lambda Deployment

### 1. Deploy submitRequestWithPayment Lambda

```bash
cd aws/lambda/submitRequestWithPayment
zip -r ../submitRequestWithPayment.zip .
aws lambda update-function-code \
  --function-name submitRequestWithPayment \
  --zip-file fileb://../submitRequestWithPayment.zip
```

### 2. Deploy processPayment Lambda

```bash
cd aws/lambda/processPayment
zip -r ../processPayment.zip .
aws lambda update-function-code \
  --function-name processPayment \
  --zip-file fileb://../processPayment.zip
```

### 3. Deploy processRefund Lambda

```bash
cd aws/lambda/processRefund
zip -r ../processRefund.zip .
aws lambda update-function-code \
  --function-name processRefund \
  --zip-file fileb://../processRefund.zip
```

## AppSync Resolver Setup

### 1. Deploy GraphQL Schema

```bash
cd infrastructure
node deploy-schema.js
```

### 2. Attach Resolvers

The following resolvers need to be attached to Lambda functions:

| Mutation | Lambda Function |
|----------|-----------------|
| `submitRequestWithPayment` | submitRequestWithPayment |
| `processRefund` | processRefund |

## Testing

### Test Card Numbers (Yoco Sandbox)

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0000 0000 9995 | Insufficient funds |

- **Expiry**: Any future date
- **CVV**: Any 3 digits

### Test the Flow

1. Start the web app: `cd web && npm run dev`
2. Navigate to `/yoco-test` to test payments directly
3. Use test card numbers above

## Security Features

### 1. Idempotency Keys
- Prevents duplicate charges if user clicks pay multiple times
- Generated client-side, verified server-side

### 2. Server-Side Verification
- All charges are verified with Yoco API before creating requests
- Amount validation ensures charge matches expected price

### 3. Duplicate Charge Detection
- Each Yoco charge ID can only be used once
- Prevents replay attacks

### 4. Automatic Rollback
- If request creation fails after payment, automatic refund is triggered

## Commission Structure

- **Platform Fee**: 15%
- **Performer Share**: 85%

Example: R20 request
- Platform receives: R3
- DJ receives: R17

## Monitoring

### CloudWatch Logs

All payment operations are logged with structured JSON:

```json
{
  "level": "INFO",
  "correlationId": "uuid",
  "message": "Payment processing started",
  "requestId": "req_123",
  "amount": 20,
  "userId": "user_456"
}
```

### Failed Refunds Table

Check `beatmatchme-failed-refunds` for any refunds that need manual processing.

## Troubleshooting

### "Payment verification failed"
- Check Yoco API key is correct
- Verify charge ID is valid
- Check Yoco dashboard for charge status

### "Payment already used"
- User tried to reuse a charge ID
- This is expected behavior - each charge can only be used once

### "Amount mismatch"
- Price changed between payment and submission
- Check DJ set settings for current base price

## Going Live Checklist

- [ ] Replace test keys with live keys
- [ ] Update CORS settings for production domain
- [ ] Enable CloudWatch alarms for payment failures
- [ ] Set up SNS notifications for failed refunds
- [ ] Test full flow with real card (small amount)
- [ ] Verify webhook endpoints (if using)
