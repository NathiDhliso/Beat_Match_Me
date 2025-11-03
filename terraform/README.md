# BeatMatchMe Terraform Infrastructure

## Multi-Environment Deployment

This Terraform configuration manages infrastructure for dev, staging, and production environments.

## Quick Start

```bash
# Initialize Terraform
terraform init

# Deploy to dev
terraform apply -var-file="environments/dev.tfvars"

# Deploy to staging
terraform apply -var-file="environments/staging.tfvars"

# Deploy to production
terraform apply -var-file="environments/production.tfvars"
```

## Resources Created

- **DynamoDB Tables**: 8 tables with GSIs
- **Lambda Functions**: 13 functions
- **Cognito**: User pool + Identity pool
- **S3**: Assets + Web hosting buckets
- **SNS**: Notification topics
- **IAM**: Roles and policies

## Environments

- **dev**: Development environment
- **staging**: Pre-production testing
- **production**: Live production environment
