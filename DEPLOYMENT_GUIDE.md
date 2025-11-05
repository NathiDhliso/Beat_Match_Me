# 🚀 Quick Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Setup ✅

Create a `.env` file in `web/` directory:

```env
# Yoco Payment Integration (REQUIRED for payment processing)
REACT_APP_YOCO_PUBLIC_KEY=pk_test_your_key_here
REACT_APP_YOCO_SECRET_KEY=sk_test_your_key_here

# Analytics (OPTIONAL)
REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
REACT_APP_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# AWS Configuration (if not using aws-exports)
REACT_APP_AWS_REGION=us-east-1
REACT_APP_COGNITO_USER_POOL_ID=us-east-1_xxxxxx
REACT_APP_COGNITO_CLIENT_ID=xxxxxxxxx
REACT_APP_APPSYNC_ENDPOINT=https://xxxxx.appsync-api.us-east-1.amazonaws.com/graphql
```

### 2. Install Dependencies

```bash
cd web
npm install
```

### 3. Run Tests (if available)

```bash
npm test
```

### 4. Build for Production

```bash
npm run build
```

---

## Backend Deployment

### GraphQL Resolvers to Deploy

Two new resolvers need to be created:

#### 1. Query.getUserActiveRequests

**Template:** `Query.getUserActiveRequests.request.vtl`
```vtl
{
  "version": "2017-02-28",
  "operation": "Query",
  "query": {
    "expression": "userId = :userId AND eventId = :eventId AND #status IN (:pending, :accepted)",
    "expressionNames": {
      "#status": "status"
    },
    "expressionValues": {
      ":userId": $util.dynamodb.toDynamoDBJson($ctx.args.userId),
      ":eventId": $util.dynamodb.toDynamoDBJson($ctx.args.eventId),
      ":pending": $util.dynamodb.toDynamoDBJson("PENDING"),
      ":accepted": $util.dynamodb.toDynamoDBJson("ACCEPTED")
    }
  },
  "index": "userId-eventId-index",
  "limit": 10
}
```

**Response:** `Query.getUserActiveRequests.response.vtl`
```vtl
$util.toJson($ctx.result.items)
```

#### 2. Mutation.updateSetStatus

**Template:** `Mutation.updateSetStatus.request.vtl`
```vtl
{
  "version": "2017-02-28",
  "operation": "UpdateItem",
  "key": {
    "setId": $util.dynamodb.toDynamoDBJson($ctx.args.setId)
  },
  "update": {
    "expression": "SET #status = :status, endedAt = :endedAt",
    "expressionNames": {
      "#status": "status"
    },
    "expressionValues": {
      ":status": $util.dynamodb.toDynamoDBJson($ctx.args.status),
      ":endedAt": $util.dynamodb.toDynamoDBJson($util.time.nowEpochMilliSeconds())
    }
  }
}
```

**Response:** `Mutation.updateSetStatus.response.vtl`
```vtl
$util.toJson($ctx.result)
```

### Deploy Resolvers

```bash
# Option 1: Using AWS CLI
cd infrastructure
node deploy-schema.js
./deploy-resolvers-quick.ps1

# Option 2: Manual via AWS AppSync Console
# 1. Go to AWS AppSync Console
# 2. Select your API
# 3. Go to Schema > Resolvers
# 4. Add the two resolvers above
```

---

## Lambda Configuration

### Process Refund Lambda (Already Deployed ✅)

Verify environment variables:

```bash
aws lambda get-function-configuration \
  --function-name beatmatchme-processRefund
```

Should have:
```json
{
  "Environment": {
    "Variables": {
      "USER_NOTIFICATIONS_TOPIC": "arn:aws:sns:region:account:beatmatchme-notifications"
    }
  }
}
```

### AWS Secrets Manager

Ensure Yoco API key is stored:

```bash
aws secretsmanager create-secret \
  --name beatmatchme/yoco/api-key \
  --secret-string '{"apiKey":"sk_live_xxxxxxx"}'
```

---

## Frontend Deployment

### Option 1: AWS Amplify

```bash
amplify publish
```

### Option 2: S3 + CloudFront

```bash
# Build
npm run build

# Upload to S3
aws s3 sync web/build/ s3://your-bucket-name/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### Option 3: Vercel/Netlify

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod
```

---

## Post-Deployment Verification

### 1. Test Payment Flow

```bash
# User Portal Test:
1. Login as AUDIENCE user
2. Browse to an event
3. Select a song
4. Click "Request Song"
5. Verify payment modal appears
6. Enter test card (Yoco test mode)
7. Verify "Locked In" animation
8. Check queue position is saved
9. Refresh page - position should persist
```

### 2. Test Refund Flow

```bash
# DJ Portal Test:
1. Login as PERFORMER user
2. View queue with pending requests
3. Click on a request
4. Click "Veto"
5. Verify refund notification appears
6. Check DynamoDB for refund transaction
7. Check user received refund notification
```

### 3. Test Rate Limiting

```bash
# Spam Test:
1. Try requesting same song 5 times quickly
2. Should see "Too Many Requests" after 3rd attempt
3. Wait 1 minute
4. Try again - should work
```

### 4. Test Offline Mode

```bash
# Offline Test:
1. Open app in browser
2. Open DevTools > Network
3. Set "Offline" mode
4. Verify yellow banner appears
5. Re-enable network
6. Verify banner disappears
```

### 5. Test End Set Refunds

```bash
# End Set Test:
1. Login as DJ with active set
2. Have multiple pending requests
3. Click "End Set"
4. Verify refund count in notification
5. Check all requests refunded
6. Check users notified
```

---

## Monitoring Setup

### Enable Analytics

**Google Analytics:**
1. Create GA4 property
2. Get Measurement ID
3. Add to `.env` as `REACT_APP_GA_MEASUREMENT_ID`

**Sentry:**
1. Create Sentry project
2. Get DSN
3. Add to `.env` as `REACT_APP_SENTRY_DSN`

### CloudWatch Dashboards

Create dashboards for:
- Payment success/failure rates
- Refund processing times
- Request validation failures
- API error rates

---

## Troubleshooting

### Payment Not Processing

```bash
# Check:
1. YOCO_PUBLIC_KEY is set correctly
2. YOCO_SECRET_KEY is set correctly
3. Network connectivity to Yoco API
4. Browser console for errors
5. Lambda logs for processRefund function
```

### Refunds Not Working

```bash
# Check:
1. ProcessRefund Lambda has correct permissions
2. Secrets Manager has Yoco API key
3. DynamoDB tables exist and are accessible
4. SNS topic for notifications exists
5. Lambda CloudWatch logs for errors
```

### Queue Position Not Persisting

```bash
# Check:
1. getUserActiveRequests resolver is deployed
2. DynamoDB has userId-eventId index
3. Request status is PENDING or ACCEPTED
4. Browser console for GraphQL errors
```

### Rate Limiting Too Strict

```bash
# Adjust in code:
// web/src/services/rateLimiter.ts
export const requestRateLimiter = createRateLimiter({
  maxRequests: 5,  // Increase from 3
  windowMs: 60000,  // Keep 1 minute window
});
```

---

## Rollback Plan

If issues occur after deployment:

### Quick Rollback

```bash
# Revert frontend
git checkout <previous-commit>
npm run build
amplify publish

# Revert backend
aws appsync update-resolver --revert
```

### Gradual Rollout

Enable features one by one:

1. Week 1: Payment integration only
2. Week 2: Add request validation
3. Week 3: Add refund system
4. Week 4: Enable all features

---

## Success Metrics

Track these metrics post-deployment:

- ✅ Payment success rate > 95%
- ✅ Refund processing time < 5 seconds
- ✅ Request validation accuracy 100%
- ✅ Zero double charges
- ✅ Offline mode detection working
- ✅ Rate limiting preventing abuse
- ✅ Analytics capturing all events

---

## Support

For issues:
1. Check CloudWatch logs
2. Check browser console
3. Review `CRITICAL_FIXES_IMPLEMENTED.md`
4. Contact team

**Deployment complete! 🎉**
