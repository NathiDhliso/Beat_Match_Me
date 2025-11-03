# Lambda Functions Deployment Guide

## Overview

This directory contains all Lambda functions for BeatMatchMe. Each function handles a specific backend operation.

## Functions

### 1. processPayment
**Purpose**: Process payments via Yoco API  
**Trigger**: AppSync GraphQL mutation  
**Runtime**: Node.js 18.x  
**Memory**: 512 MB  
**Timeout**: 30 seconds

**Environment Variables**:
- None (uses AWS Secrets Manager)

**IAM Permissions**:
- DynamoDB: PutItem, UpdateItem (transactions, requests tables)
- Secrets Manager: GetSecretValue

### 2. calculateQueuePosition
**Purpose**: Calculate and update queue positions based on priority  
**Trigger**: AppSync GraphQL mutation / DynamoDB stream  
**Runtime**: Node.js 18.x  
**Memory**: 256 MB  
**Timeout**: 15 seconds

**IAM Permissions**:
- DynamoDB: Query, UpdateItem, PutItem (requests, queues, users tables)

### 3. updateTier
**Purpose**: Update user tier based on activity  
**Trigger**: DynamoDB stream (users table)  
**Runtime**: Node.js 18.x  
**Memory**: 256 MB  
**Timeout**: 10 seconds

**IAM Permissions**:
- DynamoDB: GetItem, UpdateItem (users table)
- Cognito: AdminUpdateUserAttributes

## Deployment Steps

### Option 1: AWS CLI (Recommended)

#### 1. Create IAM Role

```powershell
# Create trust policy
@"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
"@ | Out-File -FilePath trust-policy.json

# Create role
aws iam create-role `
  --role-name BeatMatchMeLambdaRole `
  --assume-role-policy-document file://trust-policy.json

# Attach basic execution policy
aws iam attach-role-policy `
  --role-name BeatMatchMeLambdaRole `
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

#### 2. Create Custom Policy

```powershell
@"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:*:table/beatmatchme-*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:*:secret:beatmatchme/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cognito-idp:AdminUpdateUserAttributes"
      ],
      "Resource": "arn:aws:cognito-idp:us-east-1:*:userpool/us-east-1_m1PhjZ4yD"
    }
  ]
}
"@ | Out-File -FilePath lambda-policy.json

# Create and attach policy
aws iam create-policy `
  --policy-name BeatMatchMeLambdaPolicy `
  --policy-document file://lambda-policy.json

aws iam attach-role-policy `
  --role-name BeatMatchMeLambdaRole `
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/BeatMatchMeLambdaPolicy
```

#### 3. Deploy Each Function

```powershell
# Process Payment
cd processPayment
Compress-Archive -Path index.js -DestinationPath function.zip -Force

aws lambda create-function `
  --function-name beatmatchme-processPayment `
  --runtime nodejs18.x `
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/BeatMatchMeLambdaRole `
  --handler index.handler `
  --zip-file fileb://function.zip `
  --timeout 30 `
  --memory-size 512

# Calculate Queue Position
cd ../calculateQueuePosition
Compress-Archive -Path index.js -DestinationPath function.zip -Force

aws lambda create-function `
  --function-name beatmatchme-calculateQueuePosition `
  --runtime nodejs18.x `
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/BeatMatchMeLambdaRole `
  --handler index.handler `
  --zip-file fileb://function.zip `
  --timeout 15 `
  --memory-size 256

# Update Tier
cd ../updateTier
Compress-Archive -Path index.js -DestinationPath function.zip -Force

aws lambda create-function `
  --function-name beatmatchme-updateTier `
  --runtime nodejs18.x `
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/BeatMatchMeLambdaRole `
  --handler index.handler `
  --zip-file fileb://function.zip `
  --timeout 10 `
  --memory-size 256
```

#### 4. Configure DynamoDB Stream Trigger

```powershell
# Get stream ARN
$streamArn = aws dynamodb describe-table `
  --table-name beatmatchme-users `
  --query 'Table.LatestStreamArn' `
  --output text

# Create event source mapping
aws lambda create-event-source-mapping `
  --function-name beatmatchme-updateTier `
  --event-source-arn $streamArn `
  --starting-position LATEST `
  --batch-size 10
```

#### 5. Connect to AppSync

```powershell
# Get Lambda ARN
$paymentArn = aws lambda get-function `
  --function-name beatmatchme-processPayment `
  --query 'Configuration.FunctionArn' `
  --output text

$queueArn = aws lambda get-function `
  --function-name beatmatchme-calculateQueuePosition `
  --query 'Configuration.FunctionArn' `
  --output text

# Create AppSync data sources
aws appsync create-data-source `
  --api-id v7emm7lqsjbkvoligy4udwru6i `
  --name ProcessPaymentFunction `
  --type AWS_LAMBDA `
  --lambda-config lambdaFunctionArn=$paymentArn `
  --service-role-arn arn:aws:iam::YOUR_ACCOUNT_ID:role/AppSyncServiceRole

aws appsync create-data-source `
  --api-id v7emm7lqsjbkvoligy4udwru6i `
  --name CalculateQueueFunction `
  --type AWS_LAMBDA `
  --lambda-config lambdaFunctionArn=$queueArn `
  --service-role-arn arn:aws:iam::YOUR_ACCOUNT_ID:role/AppSyncServiceRole
```

### Option 2: AWS Console

1. Go to AWS Lambda Console
2. Click "Create function"
3. Choose "Author from scratch"
4. Configure:
   - Function name: `beatmatchme-processPayment`
   - Runtime: Node.js 18.x
   - Role: Create new role or use existing
5. Upload code:
   - Copy code from `index.js`
   - Or upload ZIP file
6. Configure settings:
   - Memory, timeout, environment variables
7. Add triggers:
   - AppSync or DynamoDB stream
8. Test function

## Testing

### Test processPayment

```powershell
aws lambda invoke `
  --function-name beatmatchme-processPayment `
  --payload '{
    "arguments": {
      "input": {
        "requestId": "test-123",
        "eventId": "event-123",
        "userId": "user-123",
        "amount": 50,
        "paymentToken": "test-token"
      }
    }
  }' `
  response.json

cat response.json
```

### Test calculateQueuePosition

```powershell
aws lambda invoke `
  --function-name beatmatchme-calculateQueuePosition `
  --payload '{
    "arguments": {
      "eventId": "event-123"
    }
  }' `
  response.json

cat response.json
```

## Monitoring

### View Logs

```powershell
# Get recent logs
aws logs tail /aws/lambda/beatmatchme-processPayment --follow

# Get specific log stream
aws logs get-log-events `
  --log-group-name /aws/lambda/beatmatchme-processPayment `
  --log-stream-name '2024/11/03/[$LATEST]abc123'
```

### CloudWatch Metrics

Monitor in AWS Console:
- Invocations
- Duration
- Errors
- Throttles
- Concurrent executions

## Updating Functions

```powershell
# Update function code
cd processPayment
Compress-Archive -Path index.js -DestinationPath function.zip -Force

aws lambda update-function-code `
  --function-name beatmatchme-processPayment `
  --zip-file fileb://function.zip

# Update configuration
aws lambda update-function-configuration `
  --function-name beatmatchme-processPayment `
  --timeout 45 `
  --memory-size 1024
```

## Secrets Setup

### Store Yoco API Key

```powershell
aws secretsmanager create-secret `
  --name beatmatchme/yoco/api-key `
  --description "Yoco API key for payment processing" `
  --secret-string '{
    "apiKey": "YOUR_YOCO_SECRET_KEY"
  }'
```

## Troubleshooting

### Common Issues

**1. Permission Denied**
- Check IAM role has correct policies
- Verify resource ARNs are correct

**2. Timeout**
- Increase timeout in function configuration
- Optimize code for performance

**3. DynamoDB Errors**
- Verify table names are correct
- Check table exists in same region
- Ensure indexes are created

**4. Yoco API Errors**
- Verify API key is correct
- Check Yoco account is active
- Test with Yoco test keys first

## Cost Optimization

- Use appropriate memory allocation
- Set reasonable timeouts
- Enable Lambda Insights for monitoring
- Use provisioned concurrency only if needed

## Security Best Practices

- Store secrets in Secrets Manager
- Use least privilege IAM policies
- Enable CloudWatch Logs encryption
- Rotate API keys regularly
- Use VPC for sensitive operations

## Next Steps

1. Deploy all Lambda functions
2. Test each function individually
3. Connect to AppSync resolvers
4. Set up CloudWatch alarms
5. Configure auto-scaling if needed
6. Enable X-Ray tracing for debugging
