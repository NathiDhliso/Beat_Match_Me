# Quick AWS Test Setup (Simplified)
# Creates test resources directly without CloudFormation

param(
    [string]$Region = "us-east-1",
    [string]$Environment = "test"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Quick setup of BeatMatchMe test environment..." -ForegroundColor Cyan
Write-Host ""

# Table names
$eventsTable = "beatmatchme-$Environment-events"
$requestsTable = "beatmatchme-$Environment-requests"
$transactionsTable = "beatmatchme-$Environment-transactions"

Write-Host "Creating DynamoDB tables..." -ForegroundColor Yellow

# Create Events table
Write-Host "  📊 Creating $eventsTable..." -ForegroundColor Gray
aws dynamodb create-table `
    --table-name $eventsTable `
    --attribute-definitions `
        AttributeName=eventId,AttributeType=S `
        AttributeName=performerId,AttributeType=S `
        AttributeName=createdAt,AttributeType=S `
    --key-schema AttributeName=eventId,KeyType=HASH `
    --billing-mode PAY_PER_REQUEST `
    --global-secondary-indexes `
        "[{\"IndexName\":\"performerId-createdAt-index\",\"KeySchema\":[{\"AttributeName\":\"performerId\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"createdAt\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" `
    --region $Region `
    --no-cli-pager 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "    ✅ Created" -ForegroundColor Green
} else {
    Write-Host "    ℹ️  May already exist" -ForegroundColor Gray
}

# Create Requests table
Write-Host "  📊 Creating $requestsTable..." -ForegroundColor Gray
aws dynamodb create-table `
    --table-name $requestsTable `
    --attribute-definitions `
        AttributeName=requestId,AttributeType=S `
        AttributeName=eventId,AttributeType=S `
        AttributeName=userId,AttributeType=S `
        AttributeName=submittedAt,AttributeType=S `
    --key-schema AttributeName=requestId,KeyType=HASH `
    --billing-mode PAY_PER_REQUEST `
    --global-secondary-indexes `
        "[{\"IndexName\":\"eventId-submittedAt-index\",\"KeySchema\":[{\"AttributeName\":\"eventId\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"submittedAt\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}},{\"IndexName\":\"userId-submittedAt-index\",\"KeySchema\":[{\"AttributeName\":\"userId\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"submittedAt\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}},{\"IndexName\":\"eventId-userId-index\",\"KeySchema\":[{\"AttributeName\":\"eventId\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"userId\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" `
    --region $Region `
    --no-cli-pager 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "    ✅ Created" -ForegroundColor Green
} else {
    Write-Host "    ℹ️  May already exist" -ForegroundColor Gray
}

# Create Transactions table
Write-Host "  📊 Creating $transactionsTable..." -ForegroundColor Gray
aws dynamodb create-table `
    --table-name $transactionsTable `
    --attribute-definitions `
        AttributeName=transactionId,AttributeType=S `
        AttributeName=userId,AttributeType=S `
        AttributeName=createdAt,AttributeType=S `
        AttributeName=idempotencyKey,AttributeType=S `
        AttributeName=providerTransactionId,AttributeType=S `
    --key-schema AttributeName=transactionId,KeyType=HASH `
    --billing-mode PAY_PER_REQUEST `
    --global-secondary-indexes `
        "[{\"IndexName\":\"userId-createdAt-index\",\"KeySchema\":[{\"AttributeName\":\"userId\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"createdAt\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}},{\"IndexName\":\"idempotencyKey-index\",\"KeySchema\":[{\"AttributeName\":\"idempotencyKey\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}},{\"IndexName\":\"providerTransactionId-index\",\"KeySchema\":[{\"AttributeName\":\"providerTransactionId\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}]" `
    --region $Region `
    --no-cli-pager 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "    ✅ Created" -ForegroundColor Green
} else {
    Write-Host "    ℹ️  May already exist" -ForegroundColor Gray
}

Write-Host ""
Write-Host "⏳ Waiting for tables to be active (30 seconds)..." -ForegroundColor Cyan
Start-Sleep -Seconds 30

# Create .env.test file
Write-Host "📄 Creating .env.test file..." -ForegroundColor Cyan
$envContent = @"
# BeatMatchMe Test Environment Configuration
# Auto-generated on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

AWS_REGION=$Region
TEST_EVENTS_TABLE=$eventsTable
TEST_REQUESTS_TABLE=$requestsTable
TEST_TRANSACTIONS_TABLE=$transactionsTable

# Yoco Test Credentials (use sandbox)
YOCO_SECRET_KEY=sk_test_YOUR_SANDBOX_KEY_HERE
YOCO_PUBLIC_KEY=pk_test_YOUR_SANDBOX_KEY_HERE

# Test Configuration
TEST_ENVIRONMENT=$Environment
"@

$envContent | Out-File -FilePath "../../.env.test" -Encoding UTF8

Write-Host "✅ Test environment setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Resources Created:" -ForegroundColor Cyan
Write-Host "  Events Table:       $eventsTable" -ForegroundColor Gray
Write-Host "  Requests Table:     $requestsTable" -ForegroundColor Gray
Write-Host "  Transactions Table: $transactionsTable" -ForegroundColor Gray
Write-Host ""
Write-Host "📌 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Update .env.test with your Yoco sandbox keys (if testing payments)"
Write-Host "  2. Run: npm run test:integration"
Write-Host "  3. View results in console and CloudWatch Logs"
Write-Host ""
Write-Host "💰 Estimated cost: <`$1/month (pay-per-request billing)" -ForegroundColor Green
Write-Host ""
Write-Host "🗑️  To cleanup:" -ForegroundColor Yellow
Write-Host "  Run: .\quick-cleanup.ps1"
