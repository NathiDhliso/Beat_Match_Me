# AWS Amplify Hosting Migration Guide

This document guides you through migrating from S3 static hosting to AWS Amplify Hosting while maintaining CloudFront and Route 53 integration.

## Overview

### What's Changing
- **Before**: S3 bucket with static website hosting → (Optional) CloudFront → Route 53
- **After**: AWS Amplify Hosting (includes built-in CDN) → Route 53

### What's Staying
- Route 53 for DNS management (if you have a custom domain)
- S3 bucket for assets (QR codes, images, user uploads)
- All backend infrastructure (Cognito, DynamoDB, Lambda, AppSync)

### Why Migrate to Amplify?
✅ **Built-in CI/CD**: Automatic deployments from Git pushes  
✅ **Free SSL certificates**: Automatic HTTPS with custom domains  
✅ **Built-in CDN**: Global content delivery included  
✅ **Preview deployments**: Test pull requests before merging  
✅ **Environment variables**: Secure configuration management  
✅ **Atomic deployments**: Zero-downtime deployments  
✅ **Rollback support**: Easy rollback to previous versions  
✅ **Cost effective**: Free tier includes 1000 build minutes/month  

## Prerequisites

### 1. GitHub Repository Setup
Ensure your code is in a GitHub repository:
```powershell
# If not already done
cd c:\Users\dhlisob\Downloads\BeatMatchMe-main
git init
git remote add origin https://github.com/NathiDhliso/Beat_Match_Me.git
git add .
git commit -m "Prepare for Amplify migration"
git push -u origin main
```

### 2. AWS CLI Access Token for GitHub
Amplify needs access to your GitHub repository. You'll need to create a GitHub personal access token:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name: "AWS Amplify BeatMatchMe"
4. Select scopes:
   - ✅ `repo` (all)
   - ✅ `admin:repo_hook` (all)
5. Generate and copy the token
6. Store it in AWS Secrets Manager or AWS Systems Manager Parameter Store

```powershell
# Store in AWS Systems Manager Parameter Store
aws ssm put-parameter `
  --name "/beatmatchme/github-token" `
  --value "ghp_YOUR_TOKEN_HERE" `
  --type "SecureString" `
  --region us-east-1
```

### 3. Required Terraform Variables
Create or update `terraform/environments/dev.tfvars`:
```hcl
environment        = "dev"
aws_region        = "us-east-1"
project_name      = "beatmatchme"

# Amplify Configuration
github_repository = "https://github.com/NathiDhliso/Beat_Match_Me"
git_branch       = "main"

# Optional: Custom domain (leave empty to use Amplify default)
domain_name      = ""  # e.g., "beatmatchme.com" or leave empty

# Optional: Enable basic auth for staging
enable_basic_auth = false

# Other existing variables...
yoco_public_key  = "pk_test_YOUR_KEY"
yoco_secret_key  = "sk_test_YOUR_KEY"  # Sensitive
alert_email      = "alerts@beatmatchme.com"
```

## Migration Steps

### Step 1: Connect GitHub to Amplify via AWS Console (One-time Setup)

Before running Terraform, you need to authorize AWS Amplify to access your GitHub account:

1. **Go to AWS Console** → Amplify → Get Started
2. Click "Host web app" 
3. Select "GitHub" as the repository service
4. Click "Authorize AWS Amplify" to connect your GitHub account
5. **DON'T complete the setup** - we'll do it via Terraform

Alternatively, set the GitHub token in Terraform:
```hcl
# In amplify.tf, add to aws_amplify_app resource:
resource "aws_amplify_app" "web" {
  # ... existing config ...
  
  access_token = var.github_access_token  # Add this
}

# In variables.tf:
variable "github_access_token" {
  description = "GitHub personal access token for Amplify"
  type        = string
  sensitive   = true
}
```

### Step 2: Update Terraform Configuration

```powershell
cd c:\Users\dhlisob\Downloads\BeatMatchMe-main\terraform

# Review the new Amplify configuration
cat amplify.tf

# Review updated S3 configuration (web bucket removed)
cat s3.tf

# Review new variables
cat variables.tf
```

### Step 3: Initialize Terraform with New Provider

AWS Amplify requires no additional Terraform providers - it uses the AWS provider.

```powershell
# Initialize Terraform (refresh providers)
terraform init -upgrade

# Review the changes
terraform plan -var-file="environments/dev.tfvars"
```

### Step 4: Apply Terraform Changes

```powershell
# Apply the changes
# This will:
# 1. Create the Amplify app
# 2. Create the main branch configuration
# 3. Remove the S3 web hosting bucket
# 4. Keep the S3 assets bucket
terraform apply -var-file="environments/dev.tfvars"

# Confirm by typing 'yes'
```

### Step 5: Trigger First Build

After Terraform creates the Amplify app, trigger the first build:

```powershell
# Get the Amplify app ID from Terraform output
terraform output amplify_app_id

# Trigger a build via AWS CLI
aws amplify start-job `
  --app-id YOUR_APP_ID `
  --branch-name main `
  --job-type RELEASE `
  --region us-east-1
```

Or trigger via webhook:
```powershell
# Get webhook URL
terraform output amplify_webhook_url

# Trigger deployment
$webhookUrl = terraform output -raw amplify_webhook_url
Invoke-WebRequest -Uri $webhookUrl -Method POST
```

### Step 6: Monitor the Build

1. Go to AWS Console → Amplify
2. Click on your app "beatmatchme-dev"
3. Watch the build progress:
   - Provision
   - Build
   - Deploy
   - Verify

Build typically takes 2-5 minutes.

### Step 7: Verify Deployment

```powershell
# Get the Amplify URL
terraform output amplify_branch_url

# Open in browser
$amplifyUrl = terraform output -raw amplify_branch_url
Start-Process $amplifyUrl
```

Test your application:
- ✅ Homepage loads
- ✅ Authentication works (Cognito)
- ✅ Assets load from S3 bucket
- ✅ GraphQL queries work (AppSync)
- ✅ Routing works (SPA navigation)

### Step 8: Update Environment Variables (if needed)

```powershell
# If you need to update environment variables in Amplify
aws amplify update-app `
  --app-id YOUR_APP_ID `
  --environment-variables "VITE_CUSTOM_VAR=value" `
  --region us-east-1
```

Or update in `amplify.tf` and reapply Terraform.

### Step 9: Set Up Custom Domain (Optional)

If you have a custom domain like `beatmatchme.com`:

#### Option A: Update Terraform Variables
```hcl
# In environments/dev.tfvars
domain_name = "beatmatchme.com"
```

```powershell
# Apply changes
terraform apply -var-file="environments/dev.tfvars"
```

#### Option B: Manual Setup via Console
1. Go to Amplify Console → Your App → Domain management
2. Click "Add domain"
3. Enter your domain name
4. Amplify will provide DNS records
5. Add these records to Route 53

#### Route 53 DNS Configuration
Amplify will automatically create the necessary DNS records, but you can also manage them in Route 53:

```powershell
# Get your hosted zone ID
aws route53 list-hosted-zones

# Amplify will provide CNAME records - add them to Route 53
# Example:
# _abc123.beatmatchme.com CNAME _xyz456.acm-validations.aws
```

Terraform will handle this automatically if you set `domain_name` variable.

### Step 10: Clean Up Old S3 Web Bucket

⚠️ **Important**: Only do this after confirming Amplify is working!

```powershell
# List the old web bucket
aws s3 ls s3://beatmatchme-dev-web/

# Back up if needed
aws s3 sync s3://beatmatchme-dev-web/ ./backup-s3-web/

# Delete the bucket (Terraform already removed it from state)
aws s3 rm s3://beatmatchme-dev-web/ --recursive
aws s3 rb s3://beatmatchme-dev-web/
```

### Step 11: Update CloudFront (if you have one)

If you previously had a CloudFront distribution pointing to S3, you can now delete it as Amplify has its own CDN:

```powershell
# List distributions
aws cloudfront list-distributions

# Disable the old distribution
aws cloudfront update-distribution `
  --id YOUR_DISTRIBUTION_ID `
  --distribution-config file://disable-distribution.json

# After it's disabled, delete it
aws cloudfront delete-distribution `
  --id YOUR_DISTRIBUTION_ID `
  --if-match ETAG_VALUE
```

Or keep CloudFront if you need custom caching rules by pointing it to the Amplify URL instead of S3.

### Step 12: Update Frontend Redirect URLs

Update your Cognito OAuth redirect URLs to use the new Amplify URL:

```powershell
# Get the Amplify URL
$amplifyUrl = terraform output -raw amplify_branch_url

# Update Cognito (will be done automatically via Terraform on next apply)
# Or manually:
aws cognito-idp update-user-pool-client `
  --user-pool-id YOUR_POOL_ID `
  --client-id YOUR_CLIENT_ID `
  --callback-urls "https://$amplifyUrl","https://beatmatchme.com" `
  --logout-urls "https://$amplifyUrl","https://beatmatchme.com" `
  --region us-east-1
```

## Environment-Specific Configurations

### Development Environment
```hcl
# terraform/environments/dev.tfvars
environment       = "dev"
domain_name       = ""  # Use Amplify default domain
enable_basic_auth = false
git_branch        = "develop"
```

### Staging Environment
```hcl
# terraform/environments/staging.tfvars
environment       = "staging"
domain_name       = "staging.beatmatchme.com"
enable_basic_auth = true  # Optional: protect with password
git_branch        = "staging"
```

### Production Environment
```hcl
# terraform/environments/production.tfvars
environment       = "production"
domain_name       = "beatmatchme.com"
enable_basic_auth = false
git_branch        = "main"
```

## CI/CD Workflow

After migration, your deployment workflow is:

```
1. Developer pushes code to GitHub
2. Amplify automatically detects the push
3. Amplify builds the app using amplify.yml
4. Amplify runs tests (if configured)
5. Amplify deploys to CDN
6. App is live at the Amplify URL
```

### Manual Deployment
```powershell
# Trigger via webhook
Invoke-WebRequest -Uri (terraform output -raw amplify_webhook_url) -Method POST

# Or via AWS CLI
aws amplify start-job `
  --app-id (terraform output -raw amplify_app_id) `
  --branch-name main `
  --job-type RELEASE
```

### Rollback
```powershell
# List recent builds
aws amplify list-jobs `
  --app-id YOUR_APP_ID `
  --branch-name main `
  --max-results 10

# Redeploy a previous build
aws amplify start-job `
  --app-id YOUR_APP_ID `
  --branch-name main `
  --job-type RELEASE `
  --job-id JOB_ID_TO_ROLLBACK_TO
```

## Monitoring and Logs

### Build Logs
```powershell
# View build logs in AWS Console
# Amplify → Your App → Build logs

# Or via CLI
aws amplify get-job `
  --app-id YOUR_APP_ID `
  --branch-name main `
  --job-id JOB_ID
```

### Access Logs
Amplify access logs are sent to CloudWatch automatically:
```powershell
# View in CloudWatch
aws logs tail /aws/amplify/YOUR_APP_ID --follow
```

### Performance Monitoring
Use CloudWatch Metrics:
- Request count
- Bytes downloaded
- 4xx/5xx errors
- Latency

## Cost Comparison

### Before (S3 + CloudFront)
- S3 hosting: ~$0.50/month
- CloudFront: ~$5-20/month
- **Total**: ~$5.50-20.50/month

### After (Amplify Hosting)
- Amplify free tier: 1000 build minutes, 15 GB storage, 100 GB served/month
- Beyond free tier: $0.01/build minute, $0.023/GB stored, $0.15/GB served
- **Estimated**: $0-10/month (depending on traffic)

**Savings**: ~$5-15/month + better CI/CD experience

## Troubleshooting

### Build Fails

**Check build logs**:
```powershell
aws amplify get-job --app-id YOUR_APP_ID --branch-name main --job-id LATEST_JOB_ID
```

**Common issues**:
1. **Missing environment variables**: Add them in Terraform `amplify.tf`
2. **Build command fails**: Check `amplify.yml` build commands
3. **Node version**: Amplify uses Node 18 by default (matching your package.json)

### Domain Verification Fails

1. Check Route 53 records
2. Wait 15-30 minutes for DNS propagation
3. Verify CNAME records match Amplify's requirements

### App Not Loading

1. Check build completed successfully
2. Verify custom routing rules in `amplify.tf`
3. Check browser console for errors
4. Verify environment variables are set correctly

### OAuth Redirect Issues

Update Cognito callback URLs:
```powershell
# Update in Terraform or via CLI
aws cognito-idp update-user-pool-client `
  --user-pool-id YOUR_POOL_ID `
  --client-id YOUR_CLIENT_ID `
  --callback-urls "https://YOUR_AMPLIFY_URL" `
  --logout-urls "https://YOUR_AMPLIFY_URL"
```

## Rollback Plan

If something goes wrong, you can rollback:

### Rollback to S3 Hosting

1. **Restore S3 web bucket from Terraform**:
```powershell
# Checkout old version
git checkout HEAD~1 terraform/s3.tf terraform/outputs.tf

# Reapply
terraform apply -var-file="environments/dev.tfvars"
```

2. **Redeploy to S3**:
```powershell
cd web
npm run build
aws s3 sync dist/ s3://beatmatchme-dev-web/ --delete
```

3. **Update DNS** back to S3/CloudFront

### Keep Both (Recommended During Testing)

You can keep both S3 and Amplify running:
- Amplify: Test at amplify URL
- S3: Keep live at your domain

Then switch DNS once confident.

## Best Practices

### 1. Use Branch Deployments
- `main` → Production
- `staging` → Staging environment
- `develop` → Development environment
- Feature branches → Preview deployments

### 2. Environment Variables
- Never commit secrets to Git
- Store in Terraform (encrypted state)
- Use AWS Secrets Manager for sensitive data

### 3. Custom Headers
Already configured in `amplify.yml`:
- HSTS
- X-Frame-Options
- CSP
- Cache-Control

### 4. Performance
- Enable compression (already set)
- Use immutable caching for assets
- Monitor CloudWatch metrics

### 5. Security
- Use HTTPS only (enforced by Amplify)
- Enable AWS WAF if needed
- Set up CloudWatch alarms for anomalies

## Next Steps

After successful migration:

1. ✅ Set up staging environment
2. ✅ Configure production domain
3. ✅ Set up CloudWatch alarms
4. ✅ Enable AWS WAF (optional)
5. ✅ Configure backup strategy
6. ✅ Document deployment process for team
7. ✅ Set up Slack/email notifications for builds

## Resources

- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [Amplify Hosting Pricing](https://aws.amazon.com/amplify/pricing/)
- [Terraform AWS Amplify Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/amplify_app)
- [Custom Domain Setup](https://docs.aws.amazon.com/amplify/latest/userguide/custom-domains.html)

## Support

If you encounter issues:
1. Check AWS Amplify Console logs
2. Review CloudWatch logs
3. Check this migration guide
4. Review Terraform plan output

---

**Migration Status**: Ready to proceed
**Estimated Time**: 30-60 minutes
**Risk Level**: Low (can rollback to S3)
**Recommended**: Test in dev environment first
