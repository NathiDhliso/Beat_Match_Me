# 🚀 BeatMatchMe - Deployment Guide

## Quick Start Deployment

### Prerequisites
- AWS Account with CLI configured
- Node.js 18+ installed
- PowerShell (Windows) or Bash (Linux/Mac)

---

## 📦 Step 1: Deploy Lambda Functions

```powershell
# Navigate to infrastructure folder
cd infrastructure

# Run deployment script
.\deploy-lambdas.ps1
```

This will:
- Install dependencies
- Package all 13 Lambda functions
- Deploy to AWS Lambda
- Configure permissions

---

## 📡 Step 2: Configure AppSync

### Create AppSync API
```bash
aws appsync create-graphql-api \
  --name BeatMatchMe \
  --authentication-type AMAZON_COGNITO_USER_POOLS \
  --user-pool-config userPoolId=<YOUR_USER_POOL_ID>,awsRegion=us-east-1
```

### Upload Schema
```bash
aws appsync start-schema-creation \
  --api-id <YOUR_API_ID> \
  --definition file://schema.graphql
```

### Configure Resolvers
```bash
# Use appsync-resolvers.json to configure all resolvers
# This can be done via AWS Console or CLI
```

---

## 💾 Step 3: Set Up DynamoDB

Tables are already defined in CloudFormation:
```bash
cd ../aws/cloudformation
aws cloudformation create-stack \
  --stack-name beatmatchme-dynamodb \
  --template-body file://dynamodb-tables.yaml
```

---

## 🔐 Step 4: Configure Cognito

```bash
aws cloudformation create-stack \
  --stack-name beatmatchme-cognito \
  --template-body file://cognito-user-pool.yaml
```

---

## 🌐 Step 5: Deploy Frontend

```bash
cd ../../web

# Install dependencies
npm install

# Build for production
npm run build

# Deploy to S3 + CloudFront (or Amplify)
aws s3 sync dist/ s3://beatmatchme-web
```

---

## 🔧 Step 6: Environment Variables

### Lambda Environment Variables
Set these for all Lambda functions:
- `S3_BUCKET_NAME`: beatmatchme-assets
- `USER_NOTIFICATIONS_TOPIC`: arn:aws:sns:...

### Frontend Environment Variables
Create `.env.production`:
```
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=<YOUR_USER_POOL_ID>
VITE_USER_POOL_CLIENT_ID=<YOUR_CLIENT_ID>
VITE_APPSYNC_ENDPOINT=<YOUR_APPSYNC_URL>
```

---

## ✅ Step 7: Verify Deployment

### Test Lambda Functions
```bash
# Test processPayment
aws lambda invoke \
  --function-name beatmatchme-processPayment \
  --payload file://test-events/payment.json \
  response.json
```

### Test GraphQL API
```bash
# Use AppSync console or Postman to test queries/mutations
```

### Test Frontend
```bash
# Navigate to CloudFront URL or S3 website endpoint
```

---

## 📊 Monitoring Setup

### CloudWatch Dashboards
```bash
# Create dashboard for monitoring
aws cloudwatch put-dashboard \
  --dashboard-name BeatMatchMe \
  --dashboard-body file://cloudwatch-dashboard.json
```

### Alarms
```bash
# Set up alarms for errors, latency, etc.
aws cloudwatch put-metric-alarm \
  --alarm-name beatmatchme-lambda-errors \
  --alarm-description "Lambda error rate > 5%" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 5
```

---

## 🔄 CI/CD Pipeline (Optional)

### GitHub Actions
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy BeatMatchMe

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy Lambdas
        run: ./infrastructure/deploy-lambdas.ps1
      - name: Deploy Frontend
        run: |
          cd web
          npm install
          npm run build
          aws s3 sync dist/ s3://beatmatchme-web
```

---

## 🧪 Testing

### Unit Tests
```bash
cd aws/lambda
npm test
```

### Integration Tests
```bash
cd web
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

---

## 📝 Post-Deployment Checklist

- [ ] All Lambda functions deployed
- [ ] AppSync API configured
- [ ] DynamoDB tables created
- [ ] Cognito user pool set up
- [ ] Frontend deployed
- [ ] Environment variables set
- [ ] Monitoring configured
- [ ] Test payments working
- [ ] Real-time subscriptions working
- [ ] QR code generation working
- [ ] Refunds processing correctly

---

## 🆘 Troubleshooting

### Lambda Errors
Check CloudWatch Logs:
```bash
aws logs tail /aws/lambda/beatmatchme-processPayment --follow
```

### AppSync Errors
Enable detailed logging in AppSync console

### DynamoDB Issues
Check table status and capacity

### Frontend Issues
Check browser console and network tab

---

## 📞 Support

For issues or questions:
1. Check CloudWatch Logs
2. Review error messages
3. Verify IAM permissions
4. Check environment variables

---

**Deployment Complete!** 🎉

Your BeatMatchMe application is now live and ready for users!
