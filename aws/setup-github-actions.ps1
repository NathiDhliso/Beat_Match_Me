# Setup IAM User for GitHub Actions CI/CD

Write-Host "🔐 Setting up IAM user for GitHub Actions..." -ForegroundColor Cyan

$USERNAME = "github-actions-beatmatchme"
$BUCKET = "beatmatchme-assets-2407"
$DISTRIBUTION_ID = "E2X5X2SKCOIO3E"
$ACCOUNT_ID = "202717921808"

# Create IAM user
Write-Host "👤 Creating IAM user: $USERNAME..." -ForegroundColor Yellow
aws iam create-user --user-name $USERNAME 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Host "ℹ️ User already exists, continuing..." -ForegroundColor Gray
}

# Create policy document
$policyDoc = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::$BUCKET",
        "arn:aws:s3:::$BUCKET/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::${ACCOUNT_ID}:distribution/$DISTRIBUTION_ID"
    }
  ]
}
"@

$policyDoc | Out-File -FilePath "github-actions-policy.json" -Encoding utf8

# Attach policy
Write-Host "📋 Attaching deployment policy..." -ForegroundColor Yellow
aws iam put-user-policy `
  --user-name $USERNAME `
  --policy-name GitHubActionsDeployPolicy `
  --policy-document file://github-actions-policy.json

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Policy attached successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to attach policy" -ForegroundColor Red
    exit 1
}

# Create access key
Write-Host "🔑 Creating access keys..." -ForegroundColor Yellow
$keys = aws iam create-access-key --user-name $USERNAME --output json | ConvertFrom-Json

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ IAM user created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  🔐 SAVE THESE CREDENTIALS - YOU WON'T SEE THEM AGAIN!" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "AWS_ACCESS_KEY_ID:" -ForegroundColor White
    Write-Host $keys.AccessKey.AccessKeyId -ForegroundColor Green
    Write-Host ""
    Write-Host "AWS_SECRET_ACCESS_KEY:" -ForegroundColor White
    Write-Host $keys.AccessKey.SecretAccessKey -ForegroundColor Green
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📝 Add these to GitHub Secrets:" -ForegroundColor Cyan
    Write-Host "   1. Go to: https://github.com/NathiDhliso/Beat_Match_Me/settings/secrets/actions" -ForegroundColor White
    Write-Host "   2. Click 'New repository secret'" -ForegroundColor White
    Write-Host "   3. Add each of these secrets:" -ForegroundColor White
    Write-Host ""
    Write-Host "      Name: AWS_ACCESS_KEY_ID" -ForegroundColor Yellow
    Write-Host "      Value: $($keys.AccessKey.AccessKeyId)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "      Name: AWS_SECRET_ACCESS_KEY" -ForegroundColor Yellow
    Write-Host "      Value: $($keys.AccessKey.SecretAccessKey)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "      Name: AWS_REGION" -ForegroundColor Yellow
    Write-Host "      Value: us-east-1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "      Name: S3_BUCKET" -ForegroundColor Yellow
    Write-Host "      Value: $BUCKET" -ForegroundColor Gray
    Write-Host ""
    Write-Host "      Name: CLOUDFRONT_DISTRIBUTION_ID" -ForegroundColor Yellow
    Write-Host "      Value: $DISTRIBUTION_ID" -ForegroundColor Gray
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✅ After adding secrets, push to main branch to trigger deployment!" -ForegroundColor Green
    Write-Host ""
    
    # Save to file as well
    $credFile = "github-actions-credentials.txt"
    @"
GitHub Actions AWS Credentials
Generated: $(Get-Date)

AWS_ACCESS_KEY_ID=$($keys.AccessKey.AccessKeyId)
AWS_SECRET_ACCESS_KEY=$($keys.AccessKey.SecretAccessKey)
AWS_REGION=us-east-1
S3_BUCKET=$BUCKET
CLOUDFRONT_DISTRIBUTION_ID=$DISTRIBUTION_ID

Add these to GitHub Secrets:
https://github.com/NathiDhliso/Beat_Match_Me/settings/secrets/actions

⚠️ DELETE THIS FILE AFTER ADDING TO GITHUB!
"@ | Out-File -FilePath $credFile -Encoding utf8
    
    Write-Host "💾 Credentials also saved to: $credFile" -ForegroundColor Cyan
    Write-Host "⚠️  DELETE THIS FILE after adding to GitHub!" -ForegroundColor Yellow
    
} else {
    Write-Host "❌ Failed to create access keys" -ForegroundColor Red
    Write-Host "User may already have maximum access keys (2)" -ForegroundColor Yellow
    Write-Host "Delete old keys with: aws iam delete-access-key --user-name $USERNAME --access-key-id <KEY_ID>" -ForegroundColor Gray
}

# Clean up policy file
Remove-Item "github-actions-policy.json" -ErrorAction SilentlyContinue
