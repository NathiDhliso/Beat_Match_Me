# BeatMatchMe Infrastructure

This directory contains all AWS infrastructure setup scripts and configuration files for the BeatMatchMe platform.

## Quick Start

### Prerequisites
- AWS CLI installed and configured
- PowerShell (Windows) or PowerShell Core (cross-platform)
- AWS account with appropriate permissions

### Initial Setup

Run the master setup script to create all infrastructure:

```powershell
.\infrastructure\setup-all.ps1
```

This will create:
- 7 DynamoDB tables
- 1 S3 bucket
- 1 Cognito User Pool with 2 groups
- 1 AppSync GraphQL API

### Individual Setup Scripts

If you need to run components separately:

```powershell
# Create DynamoDB tables only
.\infrastructure\create-tables-fixed.ps1

# Setup Cognito only
.\infrastructure\setup-cognito.ps1

# Setup AppSync only
.\infrastructure\setup-appsync.ps1

# Setup S3 only
.\infrastructure\setup-phase0.ps1
```

## Configuration Files

### For Applications

- **aws-exports.js** - JavaScript/React configuration
- **aws-exports.ts** - TypeScript configuration
- **schema.graphql** - Complete GraphQL schema

Import these in your web/mobile apps:

```javascript
// JavaScript/React
import awsconfig from './infrastructure/aws-exports';

// TypeScript
import awsconfig from './infrastructure/aws-exports';
```

### Infrastructure State

- **cognito-config.json** - Cognito User Pool IDs
- **appsync-config.json** - AppSync API configuration
- **bucket-name.txt** - S3 bucket name
- **PHASE0-COMPLETE.md** - Complete infrastructure documentation

## AWS Resources

### DynamoDB Tables

| Table Name | Purpose | Primary Key | GSIs |
|------------|---------|-------------|------|
| beatmatchme-users | User profiles | userId | email-index |
| beatmatchme-events | Event details | eventId | performerId-startTime-index, status-startTime-index |
| beatmatchme-requests | Song requests | requestId | eventId-submittedAt-index, userId-submittedAt-index, eventId-status-index |
| beatmatchme-queues | Request queues | eventId | - |
| beatmatchme-transactions | Payments | transactionId | userId-createdAt-index, eventId-createdAt-index |
| beatmatchme-achievements | User badges | userId | - |
| beatmatchme-group-requests | Group funding | groupRequestId | eventId-status-index |

### Cognito

- **User Pool**: beatmatchme-users
- **Groups**: performers, audience
- **Authentication**: Email/password with verification

### AppSync

- **Type**: GraphQL API
- **Auth**: Cognito User Pools + API Key
- **Features**: Real-time subscriptions enabled

### S3

- **Bucket**: beatmatchme-assets-2407
- **Features**: Versioning, encryption, CORS, lifecycle policies

## Verification

Check that all resources are created:

```powershell
# List DynamoDB tables
aws dynamodb list-tables --region us-east-1

# Check Cognito User Pool
aws cognito-idp describe-user-pool --user-pool-id us-east-1_m1PhjZ4yD --region us-east-1

# List S3 buckets
aws s3 ls | Select-String "beatmatchme"

# Check AppSync APIs
aws appsync list-graphql-apis --region us-east-1
```

## Cleanup

To delete all resources (use with caution):

```powershell
# Delete DynamoDB tables
aws dynamodb delete-table --table-name beatmatchme-users --region us-east-1
aws dynamodb delete-table --table-name beatmatchme-events --region us-east-1
aws dynamodb delete-table --table-name beatmatchme-requests --region us-east-1
aws dynamodb delete-table --table-name beatmatchme-queues --region us-east-1
aws dynamodb delete-table --table-name beatmatchme-transactions --region us-east-1
aws dynamodb delete-table --table-name beatmatchme-achievements --region us-east-1
aws dynamodb delete-table --table-name beatmatchme-group-requests --region us-east-1

# Delete S3 bucket (must be empty first)
aws s3 rb s3://beatmatchme-assets-2407 --force

# Delete Cognito User Pool
aws cognito-idp delete-user-pool --user-pool-id us-east-1_m1PhjZ4yD --region us-east-1

# Delete AppSync API (get API ID first)
aws appsync delete-graphql-api --api-id <API_ID> --region us-east-1
```

## Cost Management

All resources use pay-per-request/on-demand billing:

- **DynamoDB**: Free tier covers 25 GB storage
- **Cognito**: Free tier covers 50,000 MAUs
- **AppSync**: $4/million requests
- **S3**: $0.023/GB storage

Estimated monthly cost for development: $5-20

## Troubleshooting

### Tables not creating
- Check AWS CLI is configured: `aws sts get-caller-identity`
- Verify IAM permissions for DynamoDB, Cognito, AppSync, S3
- Check region is set to us-east-1

### Cognito errors
- MFA requires SMS configuration (currently disabled)
- Email verification uses Cognito default (limited to 50/day)

### AppSync schema not uploaded
- Schema must be uploaded manually via AWS Console or CLI
- Use `schema.graphql` file in this directory

## Next Steps

1. Upload GraphQL schema to AppSync
2. Configure AppSync resolvers
3. Integrate AWS Amplify in web/mobile apps
4. Set up CloudFront CDN (optional)
5. Configure custom domain (optional)

## Support

For issues or questions:
1. Check AWS CloudWatch logs
2. Review AWS service quotas
3. Verify IAM permissions
4. Check AWS service health dashboard

---

**Infrastructure Version**: Phase 0
**Last Updated**: November 3, 2025
**AWS Region**: us-east-1
