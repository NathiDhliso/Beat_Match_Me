# BeatMatchMe AWS Infrastructure Setup

This directory contains AWS CloudFormation templates and deployment scripts for the BeatMatchMe backend infrastructure.

## Prerequisites

1. **AWS CLI installed and configured**
   ```powershell
   aws --version
   aws configure
   ```

2. **AWS Account with appropriate permissions**
   - CloudFormation
   - Cognito
   - DynamoDB
   - S3
   - IAM

## Quick Start

### Deploy All Infrastructure (Dev Environment)

```powershell
cd aws
.\deploy.ps1 -Environment dev -Region us-east-1
```

### Deploy Specific Components

```powershell
# Deploy only Cognito
.\deploy.ps1 -Environment dev -SkipDynamoDB -SkipS3

# Deploy only DynamoDB
.\deploy.ps1 -Environment dev -SkipCognito -SkipS3

# Deploy only S3
.\deploy.ps1 -Environment dev -SkipCognito -SkipDynamoDB
```

### Deploy to Different Environments

```powershell
# Staging
.\deploy.ps1 -Environment staging -Region us-east-1

# Production
.\deploy.ps1 -Environment production -Region us-east-1
```

## Infrastructure Components

### 1. Cognito User Pool (`cognito-user-pool.yaml`)

**Creates:**
- User Pool for authentication
- User Groups (performers, audience)
- Web App Client
- Mobile App Client
- Identity Pool for AWS resource access
- IAM roles for authenticated users

**Outputs:**
- `UserPoolId` - Use in frontend config
- `WebAppClientId` - Use in web app
- `MobileAppClientId` - Use in mobile app
- `IdentityPoolId` - For AWS SDK

### 2. DynamoDB Tables (`dynamodb-tables.yaml`)

**Creates 7 tables:**
- `beatmatchme-users-{env}` - User profiles and stats
- `beatmatchme-events-{env}` - Event information
- `beatmatchme-requests-{env}` - Song requests
- `beatmatchme-queues-{env}` - Queue management
- `beatmatchme-transactions-{env}` - Payment transactions
- `beatmatchme-achievements-{env}` - User achievements
- `beatmatchme-group-requests-{env}` - Group request pooling

**Features:**
- Pay-per-request billing
- Global Secondary Indexes for efficient queries
- DynamoDB Streams enabled for real-time updates
- Point-in-time recovery enabled
- Encryption at rest
- TTL enabled on group requests (15 min expiry)

### 3. S3 Bucket

**Creates:**
- `beatmatchme-{env}-assets` bucket

**Features:**
- Versioning enabled
- CORS configured for web access
- Server-side encryption (AES256)
- Lifecycle policies (optional)

**Folder structure:**
```
beatmatchme-{env}-assets/
├── users/
│   └── {userId}/
│       ├── profile.jpg
│       └── profile-thumb.jpg
├── events/
│   └── {eventId}/
│       └── qr-code.png
└── public/
    └── assets/
```

## Getting Configuration Values

After deployment, get the configuration values for your frontend:

```powershell
# Get Cognito configuration
aws cloudformation describe-stacks `
  --stack-name beatmatchme-cognito-dev `
  --region us-east-1 `
  --query 'Stacks[0].Outputs'

# Get DynamoDB table names
aws cloudformation describe-stacks `
  --stack-name beatmatchme-dynamodb-dev `
  --region us-east-1 `
  --query 'Stacks[0].Outputs'
```

## Frontend Configuration

### Web App (`.env`)

Create `web/.env`:

```env
# AWS Configuration
VITE_AWS_REGION=us-east-1
VITE_AWS_USER_POOL_ID=us-east-1_XXXXXXXXX
VITE_AWS_WEB_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_AWS_IDENTITY_POOL_ID=us-east-1:XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX

# S3 Bucket
VITE_AWS_S3_BUCKET=beatmatchme-dev-assets

# AppSync (after GraphQL API deployment)
VITE_AWS_APPSYNC_ENDPOINT=https://XXXXX.appsync-api.us-east-1.amazonaws.com/graphql
VITE_AWS_APPSYNC_API_KEY=da2-XXXXXXXXXXXXXXXXXXXX

# Environment
VITE_ENVIRONMENT=dev
```

### Mobile App (`mobile/src/aws-config.ts`)

```typescript
export const awsConfig = {
  region: 'us-east-1',
  userPoolId: 'us-east-1_XXXXXXXXX',
  userPoolWebClientId: 'XXXXXXXXXXXXXXXXXXXXXXXXXX',
  identityPoolId: 'us-east-1:XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
  s3Bucket: 'beatmatchme-dev-assets',
};
```

## Stack Management

### Update a Stack

```powershell
# The deploy script automatically updates if stack exists
.\deploy.ps1 -Environment dev
```

### Delete a Stack

```powershell
# Delete Cognito
aws cloudformation delete-stack --stack-name beatmatchme-cognito-dev --region us-east-1

# Delete DynamoDB
aws cloudformation delete-stack --stack-name beatmatchme-dynamodb-dev --region us-east-1

# Delete S3 bucket (must be empty first)
aws s3 rm s3://beatmatchme-dev-assets --recursive
aws s3 rb s3://beatmatchme-dev-assets
```

### View Stack Status

```powershell
aws cloudformation describe-stacks --stack-name beatmatchme-cognito-dev --region us-east-1
```

## Cost Estimation

### Development Environment (Low Usage)
- **Cognito**: Free tier (50,000 MAU)
- **DynamoDB**: ~$5-10/month (pay-per-request)
- **S3**: ~$1-5/month (storage + requests)
- **Total**: ~$6-15/month

### Production Environment (1000 active users)
- **Cognito**: Free tier covers it
- **DynamoDB**: ~$50-100/month
- **S3**: ~$10-20/month
- **AppSync**: ~$20-40/month
- **Lambda**: ~$10-20/month
- **Total**: ~$90-180/month

## Security Best Practices

1. **Never commit AWS credentials to Git**
2. **Use IAM roles with least privilege**
3. **Enable MFA for production accounts**
4. **Rotate access keys regularly**
5. **Use AWS Secrets Manager for API keys**
6. **Enable CloudTrail for audit logging**
7. **Set up billing alerts**

## Troubleshooting

### Stack Creation Failed

```powershell
# View stack events
aws cloudformation describe-stack-events --stack-name beatmatchme-cognito-dev --region us-east-1

# Check specific resource
aws cloudformation describe-stack-resource --stack-name beatmatchme-cognito-dev --logical-resource-id BeatMatchMeUserPool --region us-east-1
```

### Permission Denied

Ensure your IAM user/role has these policies:
- `AWSCloudFormationFullAccess`
- `IAMFullAccess`
- `AmazonCognitoPowerUser`
- `AmazonDynamoDBFullAccess`
- `AmazonS3FullAccess`

### Region Not Supported

Some services may not be available in all regions. Recommended regions:
- `us-east-1` (N. Virginia) - Most services available
- `us-west-2` (Oregon)
- `eu-west-1` (Ireland)
- `ap-southeast-1` (Singapore)

## Next Steps

After infrastructure is deployed:

1. **Configure Amplify in Frontend**
   ```bash
   cd web
   npm install aws-amplify @aws-amplify/ui-react
   ```

2. **Set up AppSync GraphQL API**
   - Create GraphQL schema
   - Configure resolvers
   - Enable subscriptions

3. **Deploy Lambda Functions**
   - Payment processing
   - Queue management
   - Tier calculation

4. **Configure Yoco Payment Provider**
   - Store API keys in Secrets Manager
   - Set up webhook endpoints

5. **Test Authentication Flow**
   - Sign up new user
   - Verify email
   - Assign to group
   - Test login

## Support

For issues or questions:
1. Check CloudFormation stack events
2. Review CloudWatch logs
3. Consult AWS documentation
4. Check Tasks.md for implementation details

## License

Copyright © 2025 BeatMatchMe. All rights reserved.
