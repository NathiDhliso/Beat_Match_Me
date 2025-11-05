# 🚀 Quick Start: Amplify Migration

This is a quick reference for migrating to AWS Amplify Hosting.

## 📋 Pre-Migration Checklist

- [ ] Code pushed to GitHub repository
- [ ] GitHub personal access token created
- [ ] AWS CLI configured
- [ ] Terraform installed
- [ ] Backed up current S3 web bucket (optional)

## ⚡ Quick Migration (5 Steps)

### 1. Prepare GitHub Token
```powershell
# Store GitHub token in AWS
aws ssm put-parameter `
  --name "/beatmatchme/github-token" `
  --value "ghp_YOUR_TOKEN" `
  --type "SecureString" `
  --region us-east-1
```

### 2. Update Terraform Variables
Edit `terraform/environments/dev.tfvars`:
```hcl
github_repository = "https://github.com/NathiDhliso/Beat_Match_Me"
git_branch        = "main"
domain_name       = ""  # Leave empty for now
```

### 3. Authorize Amplify (One-time)
- Go to AWS Console → Amplify
- Click "Get Started" → "Host web app"
- Select GitHub and authorize
- Close the wizard (we'll use Terraform)

### 4. Deploy Infrastructure
```powershell
cd terraform
terraform init -upgrade
terraform plan -var-file="environments/dev.tfvars"
terraform apply -var-file="environments/dev.tfvars"
```

### 5. Trigger First Build
```powershell
# Get app ID
$appId = terraform output -raw amplify_app_id

# Start build
aws amplify start-job `
  --app-id $appId `
  --branch-name main `
  --job-type RELEASE `
  --region us-east-1

# Get URL
terraform output amplify_branch_url
```

## 🔗 Important URLs

```powershell
# Get all important URLs
terraform output

# Specific outputs:
terraform output amplify_branch_url      # Your app URL
terraform output amplify_webhook_url     # For manual deploys
terraform output web_url                 # Public URL
```

## 🔄 Daily Workflow

### Deploy Changes
Just push to GitHub - automatic deployment!
```powershell
git add .
git commit -m "Update feature"
git push origin main
# Amplify automatically builds and deploys
```

### Manual Deploy
```powershell
# Via webhook
$webhook = terraform output -raw amplify_webhook_url
Invoke-WebRequest -Uri $webhook -Method POST

# Via CLI
aws amplify start-job `
  --app-id (terraform output -raw amplify_app_id) `
  --branch-name main `
  --job-type RELEASE
```

### View Build Status
```powershell
# AWS Console
Start-Process "https://console.aws.amazon.com/amplify/home?region=us-east-1"

# Or via CLI
aws amplify list-jobs `
  --app-id (terraform output -raw amplify_app_id) `
  --branch-name main `
  --max-results 5
```

## 🎯 Custom Domain Setup

### Option 1: Via Terraform
```hcl
# In environments/dev.tfvars
domain_name = "beatmatchme.com"
```
```powershell
terraform apply -var-file="environments/dev.tfvars"
```

### Option 2: Via Console
1. Amplify Console → Your App → Domain management
2. Add domain
3. Add DNS records to Route 53 (Amplify provides them)
4. Wait for SSL certificate (10-15 minutes)

## 🔧 Common Tasks

### Update Environment Variables
```powershell
# Method 1: Update amplify.tf and reapply Terraform

# Method 2: Via CLI
aws amplify update-app `
  --app-id YOUR_APP_ID `
  --environment-variables "VITE_NEW_VAR=value" `
  --region us-east-1
```

### Rollback Deployment
```powershell
# List recent builds
aws amplify list-jobs `
  --app-id YOUR_APP_ID `
  --branch-name main

# Redeploy specific build
aws amplify start-job `
  --app-id YOUR_APP_ID `
  --branch-name main `
  --job-type RELEASE `
  --job-id OLD_JOB_ID
```

### View Logs
```powershell
# Build logs in console
Start-Process "https://console.aws.amazon.com/amplify/home?region=us-east-1"

# CloudWatch logs
aws logs tail /aws/amplify/YOUR_APP_ID --follow
```

## 🐛 Troubleshooting

### Build Fails
1. Check `web/amplify.yml` syntax
2. Verify environment variables
3. Check build logs in console
4. Ensure `npm ci` and `npm run build` work locally

### Domain Won't Verify
1. Check DNS records in Route 53
2. Wait 15-30 minutes for propagation
3. Verify CNAME records match Amplify's requirements

### OAuth/Login Issues
Update Cognito redirect URLs:
```powershell
# Get new Amplify URL
$amplifyUrl = terraform output -raw amplify_branch_url

# Update Cognito (done automatically via Terraform)
terraform apply -var-file="environments/dev.tfvars"
```

### App Shows Old Version
1. Hard refresh browser: Ctrl+F5
2. Check build completed successfully
3. Clear CloudFront/CDN cache (if applicable)

## 📊 Cost Monitoring

### Amplify Free Tier
- 1000 build minutes/month
- 15 GB stored
- 100 GB served/month

### Beyond Free Tier
- $0.01 per build minute
- $0.023 per GB stored
- $0.15 per GB served

### Check Usage
```powershell
# Via AWS Console
Start-Process "https://console.aws.amazon.com/amplify/home?region=us-east-1#/billing"
```

## 📝 Files Changed

- ✅ `web/amplify.yml` - Build configuration
- ✅ `terraform/amplify.tf` - Amplify resources
- ✅ `terraform/s3.tf` - Removed web bucket
- ✅ `terraform/variables.tf` - Added Amplify variables
- ✅ `terraform/outputs.tf` - Updated outputs
- ✅ `AMPLIFY_MIGRATION.md` - Full migration guide

## 🎓 Learn More

- [Full Migration Guide](./AMPLIFY_MIGRATION.md)
- [AWS Amplify Docs](https://docs.aws.amazon.com/amplify/)
- [Amplify Pricing](https://aws.amazon.com/amplify/pricing/)

## ✅ Validation Checklist

After migration, verify:
- [ ] App loads at Amplify URL
- [ ] Login/authentication works
- [ ] Images load from S3 assets bucket
- [ ] GraphQL queries work
- [ ] SPA routing works (refresh page on any route)
- [ ] Mobile responsiveness
- [ ] Performance (should be faster with CDN)

## 🆘 Need Help?

1. Check [AMPLIFY_MIGRATION.md](./AMPLIFY_MIGRATION.md) for detailed guide
2. Review Terraform plan output
3. Check AWS Amplify Console logs
4. Review CloudWatch logs

---

**Quick Start Time**: ~15 minutes  
**Full Migration**: ~30-60 minutes  
**Rollback Time**: ~5 minutes (if needed)
