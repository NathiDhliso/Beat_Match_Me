# Complete Deployment Script
# Deploys infrastructure and configures environment

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('dev','staging','production')]
    [string]$Environment
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting BeatMatchMe Deployment - $Environment" -ForegroundColor Cyan

# Step 1: Deploy Terraform Infrastructure
Write-Host "`n📦 Step 1: Deploying Infrastructure..." -ForegroundColor Yellow
Set-Location terraform

terraform init
terraform apply -var-file="environments/$Environment.tfvars" -auto-approve

# Get outputs
$outputs = terraform output -json | ConvertFrom-Json

Write-Host "✅ Infrastructure deployed" -ForegroundColor Green

# Step 2: Create .env file
Write-Host "`n🔧 Step 2: Creating environment configuration..." -ForegroundColor Yellow
Set-Location ../web

$envContent = @"
# AWS Configuration - Auto-generated from Terraform
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=$($outputs.cognito_user_pool_id.value)
VITE_USER_POOL_CLIENT_ID=$($outputs.cognito_user_pool_client_id.value)
VITE_IDENTITY_POOL_ID=$($outputs.cognito_identity_pool_id.value)
VITE_APPSYNC_ENDPOINT=https://REPLACE_WITH_APPSYNC_ENDPOINT.appsync-api.us-east-1.amazonaws.com/graphql
VITE_S3_BUCKET=$($outputs.s3_assets_bucket.value)
VITE_ENVIRONMENT=$Environment
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "✅ Environment file created: web/.env" -ForegroundColor Green

# Step 3: Package Lambda Functions
Write-Host "`n📦 Step 3: Packaging Lambda functions..." -ForegroundColor Yellow
Set-Location ../aws/lambda

npm install

$functions = @(
    "processPayment",
    "processRefund",
    "calculateQueuePosition",
    "updateTier",
    "reorderQueue",
    "createRequest",
    "upvoteRequest",
    "createGroupRequest",
    "contributeToGroupRequest",
    "checkAchievements",
    "vetoRequest",
    "createEvent",
    "updateEventStatus"
)

foreach ($func in $functions) {
    if (Test-Path $func) {
        Write-Host "  Packaging $func..." -ForegroundColor Gray
        Set-Location $func
        
        if (-not (Test-Path "node_modules")) {
            Copy-Item -Path "../node_modules" -Destination "./" -Recurse -Force
        }
        
        $zipFile = "../$func.zip"
        if (Test-Path $zipFile) { Remove-Item $zipFile }
        
        Compress-Archive -Path "./*" -DestinationPath $zipFile
        Set-Location ..
    }
}

Write-Host "✅ Lambda functions packaged" -ForegroundColor Green

# Step 4: Install Frontend Dependencies
Write-Host "`n📦 Step 4: Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location ../../web
npm install
Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Step 5: Build Frontend
Write-Host "`n🏗️  Step 5: Building frontend..." -ForegroundColor Yellow
npm run build
Write-Host "✅ Frontend built" -ForegroundColor Green

# Summary
Write-Host "`n✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "`n📝 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Configure AppSync GraphQL API in AWS Console"
Write-Host "2. Update VITE_APPSYNC_ENDPOINT in web/.env"
Write-Host "3. Deploy frontend: aws s3 sync dist/ s3://$($outputs.s3_web_bucket.value)"
Write-Host "4. Test the application"
Write-Host "`n🌐 Resources Created:" -ForegroundColor Cyan
Write-Host "  User Pool ID: $($outputs.cognito_user_pool_id.value)"
Write-Host "  S3 Web Bucket: $($outputs.s3_web_bucket.value)"
Write-Host "  S3 Assets Bucket: $($outputs.s3_assets_bucket.value)"
