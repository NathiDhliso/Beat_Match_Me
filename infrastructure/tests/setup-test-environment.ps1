# BeatMatchMe - Test Environment Setup (PowerShell)
# Creates isolated AWS resources for integration testing

param(
    [string]$Region = "us-east-1",
    [string]$StackName = "beatmatchme-test-stack",
    [string]$Environment = "test"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Setting up BeatMatchMe test environment..." -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 This will create:" -ForegroundColor Yellow
Write-Host "  - DynamoDB tables (test-events, test-requests, test-transactions)"
Write-Host "  - IAM role for test Lambda execution"
Write-Host "  - CloudWatch log groups"
Write-Host ""
Write-Host "💰 Estimated cost: `$0.50-2/month" -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Continue? (y/n)"
if ($confirmation -ne 'y') {
    Write-Host "Setup cancelled" -ForegroundColor Red
    exit
}

# Check if AWS CLI is installed
try {
    aws --version | Out-Null
} catch {
    Write-Host "❌ AWS CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

# Check if stack already exists
Write-Host "🔍 Checking for existing stack..." -ForegroundColor Cyan
$existingStack = aws cloudformation describe-stacks --stack-name $StackName --region $Region 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "⚠️  Stack already exists. Updating..." -ForegroundColor Yellow
    
    aws cloudformation update-stack `
        --stack-name $StackName `
        --template-body file://test-infrastructure.yaml `
        --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM `
        --parameters ParameterKey=Environment,ParameterValue=$Environment `
        --region $Region
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "⏳ Waiting for stack update..." -ForegroundColor Cyan
        aws cloudformation wait stack-update-complete --stack-name $StackName --region $Region
    } else {
        Write-Host "ℹ️  No changes to deploy" -ForegroundColor Gray
    }
} else {
    # Create new stack
    Write-Host "✅ Creating CloudFormation stack..." -ForegroundColor Green
    
    aws cloudformation create-stack `
        --stack-name $StackName `
        --template-body file://test-infrastructure.yaml `
        --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM `
        --parameters ParameterKey=Environment,ParameterValue=$Environment `
        --region $Region
    
    Write-Host "⏳ Waiting for stack creation (this takes 2-3 minutes)..." -ForegroundColor Cyan
    aws cloudformation wait stack-create-complete --stack-name $StackName --region $Region
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Stack creation/update failed. Check AWS Console for details." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Stack ready!" -ForegroundColor Green
Write-Host ""

# Get outputs
Write-Host "📝 Retrieving resource details..." -ForegroundColor Cyan
$outputs = aws cloudformation describe-stacks `
    --stack-name $StackName `
    --region $Region `
    --query 'Stacks[0].Outputs' `
    --output json | ConvertFrom-Json

# Extract table names
$eventsTable = ($outputs | Where-Object { $_.OutputKey -eq "EventsTableName" }).OutputValue
$requestsTable = ($outputs | Where-Object { $_.OutputKey -eq "RequestsTableName" }).OutputValue
$transactionsTable = ($outputs | Where-Object { $_.OutputKey -eq "TransactionsTableName" }).OutputValue
$lambdaRole = ($outputs | Where-Object { $_.OutputKey -eq "LambdaRoleArn" }).OutputValue

# Create .env.test file
Write-Host "📄 Creating .env.test file..." -ForegroundColor Cyan
$envContent = @"
# BeatMatchMe Test Environment Configuration
# Auto-generated on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

AWS_REGION=$Region
TEST_EVENTS_TABLE=$eventsTable
TEST_REQUESTS_TABLE=$requestsTable
TEST_TRANSACTIONS_TABLE=$transactionsTable
TEST_LAMBDA_ROLE=$lambdaRole

# Yoco Test Credentials (use sandbox)
YOCO_SECRET_KEY=sk_test_YOUR_SANDBOX_KEY_HERE
YOCO_PUBLIC_KEY=pk_test_YOUR_SANDBOX_KEY_HERE

# Test Configuration
TEST_ENVIRONMENT=$Environment
STACK_NAME=$StackName
"@

$envContent | Out-File -FilePath ".env.test" -Encoding UTF8

Write-Host "✅ Test environment setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Resources Created:" -ForegroundColor Cyan
Write-Host "  Events Table:       $eventsTable" -ForegroundColor Gray
Write-Host "  Requests Table:     $requestsTable" -ForegroundColor Gray
Write-Host "  Transactions Table: $transactionsTable" -ForegroundColor Gray
Write-Host "  Lambda Role:        $lambdaRole" -ForegroundColor Gray
Write-Host ""
Write-Host "📌 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Update .env.test with your Yoco sandbox keys"
Write-Host "  2. Run: npm run test:integration"
Write-Host "  3. View results in CloudWatch Logs"
Write-Host ""
Write-Host "🗑️  To cleanup:" -ForegroundColor Yellow
Write-Host "  Run: .\cleanup-test-environment.ps1"
Write-Host ""
Write-Host "💡 Tip: Seed test data with:" -ForegroundColor Cyan
Write-Host "  npm run seed:test-data"
