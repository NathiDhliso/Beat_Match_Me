# AWS Amplify Migration Checklist

Use this checklist to track your migration progress.

## 📋 Pre-Migration Setup

### GitHub Setup
- [ ] Code is in GitHub repository: `https://github.com/NathiDhliso/Beat_Match_Me`
- [ ] Repository is accessible (not private, or you have permissions)
- [ ] Latest code is pushed to `main` branch
- [ ] Build works locally: `cd web && npm ci && npm run build`

### AWS Setup
- [ ] AWS CLI installed: `aws --version`
- [ ] AWS credentials configured: `aws sts get-caller-identity`
- [ ] Correct AWS region set: `us-east-1`
- [ ] IAM user has Amplify permissions

### GitHub Token
- [ ] Created GitHub Personal Access Token
- [ ] Token has `repo` scope
- [ ] Token has `admin:repo_hook` scope
- [ ] Token stored in AWS SSM Parameter Store

### Terraform Setup
- [ ] Terraform installed: `terraform --version`
- [ ] Terraform state backend configured
- [ ] Variables file created: `terraform/environments/dev.tfvars`
- [ ] Review new files:
  - [ ] `terraform/amplify.tf`
  - [ ] `terraform/s3.tf` (modified)
  - [ ] `terraform/variables.tf` (modified)
  - [ ] `terraform/outputs.tf` (modified)
  - [ ] `web/amplify.yml`

---

## 🔧 Configuration

### Update Terraform Variables
Edit `terraform/environments/dev.tfvars`:

- [ ] `github_repository` = "https://github.com/NathiDhliso/Beat_Match_Me"
- [ ] `git_branch` = "main"
- [ ] `domain_name` = "" (or your domain)
- [ ] `environment` = "dev"
- [ ] `aws_region` = "us-east-1"
- [ ] `yoco_public_key` set
- [ ] `alert_email` set

### GitHub Authorization (One-time)
- [ ] Go to AWS Console → Amplify
- [ ] Click "Get Started" → "Host web app"
- [ ] Select "GitHub" and authorize AWS Amplify
- [ ] Close the wizard (don't complete it)

---

## 🚀 Migration Execution

### Step 1: Backup (Optional but Recommended)
- [ ] Backup current S3 web bucket:
  ```powershell
  aws s3 sync s3://beatmatchme-dev-web/ ./backup-s3-web/
  ```
- [ ] Note current website URL
- [ ] Screenshot current app for reference

### Step 2: Terraform Init
```powershell
cd terraform
terraform init -upgrade
```
- [ ] Terraform initialized successfully
- [ ] No errors shown

### Step 3: Terraform Plan
```powershell
terraform plan -var-file="environments/dev.tfvars"
```
Review the plan:
- [ ] `aws_amplify_app.web` will be created
- [ ] `aws_amplify_branch.main` will be created
- [ ] `aws_amplify_webhook.main` will be created
- [ ] `aws_s3_bucket.web` will be destroyed
- [ ] `aws_s3_bucket_website_configuration.web` will be destroyed
- [ ] `aws_s3_bucket.assets` will be updated (not destroyed)
- [ ] Plan looks correct, no unexpected changes

### Step 4: Terraform Apply
```powershell
terraform apply -var-file="environments/dev.tfvars"
```
- [ ] Type `yes` to confirm
- [ ] Apply completes without errors
- [ ] Note the outputs:
  - [ ] `amplify_app_id`
  - [ ] `amplify_branch_url`
  - [ ] `amplify_webhook_url`

### Step 5: First Build
```powershell
$appId = terraform output -raw amplify_app_id
aws amplify start-job --app-id $appId --branch-name main --job-type RELEASE --region us-east-1
```
- [ ] Build job started
- [ ] Build job ID received

### Step 6: Monitor Build
Go to AWS Console → Amplify → Your App
- [ ] Provision phase completed
- [ ] Build phase completed
- [ ] Deploy phase completed
- [ ] Verify phase completed
- [ ] Build time: _____ minutes

---

## ✅ Verification

### App Functionality
```powershell
$appUrl = terraform output -raw amplify_branch_url
Start-Process $appUrl
```
Test the following:
- [ ] Homepage loads correctly
- [ ] Static assets load (images, CSS, JS)
- [ ] Navigation works (SPA routing)
- [ ] Refresh page works (should not 404)
- [ ] Login page loads
- [ ] Can authenticate (sign in)
- [ ] Images from S3 assets bucket load
- [ ] GraphQL queries work
- [ ] Mobile responsive design works
- [ ] No console errors

### Performance
- [ ] Page load time acceptable
- [ ] Assets cached properly (check Network tab)
- [ ] CDN serving content (check headers)
- [ ] HTTPS enabled automatically

### Security Headers
Check in browser DevTools → Network → Response Headers:
- [ ] `Strict-Transport-Security` present
- [ ] `X-Frame-Options` present
- [ ] `X-Content-Type-Options` present
- [ ] `X-XSS-Protection` present

---

## 🔒 Post-Migration

### Update OAuth Redirects
- [ ] Cognito callback URLs updated (check in Terraform)
- [ ] Can login successfully
- [ ] Can logout successfully
- [ ] OAuth flow works

### Custom Domain (If Applicable)
- [ ] Domain added to Amplify
- [ ] DNS records created in Route 53
- [ ] SSL certificate issued (wait 10-15 min)
- [ ] Domain resolves to app
- [ ] HTTPS works on custom domain
- [ ] www redirects to non-www (if configured)

### Clean Up Old Resources
⚠️ Only after confirming Amplify works!
- [ ] Old S3 web bucket deleted:
  ```powershell
  aws s3 rm s3://beatmatchme-dev-web/ --recursive
  aws s3 rb s3://beatmatchme-dev-web/
  ```
- [ ] Old CloudFront distribution disabled (if you had one)
- [ ] Old CloudFront distribution deleted (after 24h)
- [ ] Removed any manual deployment scripts

### Update Documentation
- [ ] Update README with new deployment process
- [ ] Update team documentation
- [ ] Share Amplify URL with team
- [ ] Document webhook URL for manual deploys

---

## 📊 Monitoring Setup

### CloudWatch
- [ ] Build logs accessible in CloudWatch
- [ ] Access logs being generated
- [ ] No errors in logs

### Amplify Console
- [ ] Bookmarked Amplify console URL
- [ ] Team members have access
- [ ] Notifications configured (optional)

### Cost Monitoring
- [ ] Set up billing alert for Amplify
- [ ] Check current month's usage
- [ ] Confirm within free tier

---

## 🎓 Team Onboarding

### New Deployment Process
Ensure team knows:
- [ ] Push to GitHub = automatic deploy
- [ ] Build takes 2-5 minutes
- [ ] Can monitor in Amplify Console
- [ ] Can rollback with one click
- [ ] Webhook available for manual deploys

### Documentation Shared
- [ ] AMPLIFY_QUICKSTART.md
- [ ] AMPLIFY_MIGRATION.md
- [ ] AMPLIFY_ARCHITECTURE.md
- [ ] AMPLIFY_SUMMARY.md

---

## 🔄 Test CI/CD Flow

### Make a Test Change
- [ ] Make small change in web app (e.g., update text)
- [ ] Commit and push to GitHub
- [ ] Amplify automatically starts build
- [ ] Build completes successfully
- [ ] Changes appear on live site
- [ ] Total time: _____ minutes

### Test Rollback
- [ ] Note current build ID
- [ ] Make a breaking change
- [ ] Push to trigger build
- [ ] Verify broken state
- [ ] Rollback to previous build in Console
- [ ] Verify working state restored

---

## 🌍 Additional Environments

### Staging Environment (Optional)
- [ ] Create `terraform/environments/staging.tfvars`
- [ ] Set `git_branch = "staging"`
- [ ] Set `domain_name = "staging.beatmatchme.com"` (if applicable)
- [ ] Apply Terraform for staging
- [ ] Verify staging deployment

### Production Environment
- [ ] Create `terraform/environments/production.tfvars`
- [ ] Set `git_branch = "main"`
- [ ] Set `domain_name = "beatmatchme.com"`
- [ ] Review production settings
- [ ] Apply Terraform for production
- [ ] Test production thoroughly
- [ ] Update DNS to point to production

---

## 📈 Success Metrics

Track these after migration:
- [ ] Deployment time: Before _____ min → After _____ min
- [ ] Deployment frequency: Before _____ /week → After _____ /week
- [ ] Failed deployments: Before _____ % → After _____ %
- [ ] Monthly cost: Before $_____ → After $_____
- [ ] Team satisfaction: 😞 → 😃

---

## 🐛 Troubleshooting Log

Document any issues encountered:

### Issue 1:
- **Problem**: 
- **Solution**: 
- **Time to resolve**: 

### Issue 2:
- **Problem**: 
- **Solution**: 
- **Time to resolve**: 

---

## ✅ Final Sign-Off

- [ ] All tests passing
- [ ] Team trained on new process
- [ ] Documentation updated
- [ ] Monitoring configured
- [ ] Backup plan documented
- [ ] Old resources cleaned up
- [ ] Custom domain working (if applicable)

### Sign-Off
- **Migrated by**: _________________
- **Date**: _________________
- **Total time**: _____ hours
- **Issues encountered**: _____
- **Overall experience**: 😞 😐 😊 😃 😍

---

## 📞 Support Resources

- **Amplify Quick Start**: `AMPLIFY_QUICKSTART.md`
- **Migration Guide**: `AMPLIFY_MIGRATION.md`
- **Architecture Docs**: `AMPLIFY_ARCHITECTURE.md`
- **AWS Amplify Docs**: https://docs.aws.amazon.com/amplify/
- **Terraform AWS Provider**: https://registry.terraform.io/providers/hashicorp/aws/latest/docs

---

**Migration Status**: 
- [ ] Not Started
- [ ] In Progress
- [ ] Completed
- [ ] Issues (see troubleshooting)

**Next Steps**: _________________

---

Good luck with your migration! 🚀
