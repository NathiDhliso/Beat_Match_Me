# Master setup script for BeatMatchMe Phase 0
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BeatMatchMe Phase 0 Infrastructure Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check AWS CLI
Write-Host "Checking AWS CLI configuration..." -ForegroundColor Yellow
$identity = aws sts get-caller-identity 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ AWS CLI not configured. Please run 'aws configure' first." -ForegroundColor Red
    exit 1
}
Write-Host "✓ AWS CLI configured" -ForegroundColor Green
Write-Host ""

# Step 1: Create DynamoDB Tables
Write-Host "Step 1: Creating DynamoDB Tables" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
& "$PSScriptRoot\create-dynamodb-tables.ps1"
Write-Host ""

# Step 2: Setup S3
Write-Host "Step 2: Setting up S3 Bucket" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
& "$PSScriptRoot\setup-phase0.ps1"
Write-Host ""

# Step 3: Setup Cognito
Write-Host "Step 3: Setting up Cognito User Pools" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
& "$PSScriptRoot\setup-cognito.ps1"
Write-Host ""

# Step 4: Setup AppSync
Write-Host "Step 4: Setting up AppSync GraphQL API" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
& "$PSScriptRoot\setup-appsync.ps1"
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "Phase 0 Infrastructure Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Configuration files created:" -ForegroundColor Cyan
Write-Host "  - infrastructure/cognito-config.json" -ForegroundColor White
Write-Host "  - infrastructure/appsync-config.json" -ForegroundColor White
Write-Host "  - infrastructure/bucket-name.txt" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Upload GraphQL schema to AppSync" -ForegroundColor White
Write-Host "  2. Configure AppSync resolvers" -ForegroundColor White
Write-Host "  3. Set up CloudFront distribution (optional)" -ForegroundColor White
Write-Host "  4. Configure Amplify for web hosting (optional)" -ForegroundColor White
