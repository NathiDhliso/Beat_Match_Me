# Create DynamoDB tables with correct attribute definitions
$ErrorActionPreference = "Continue"
$region = "us-east-1"

Write-Host "Creating DynamoDB tables for BeatMatchMe..." -ForegroundColor Green

# 1. Users Table
Write-Host "`n1. Creating beatmatchme-users table..." -ForegroundColor Yellow
aws dynamodb create-table `
    --table-name beatmatchme-users `
    --attribute-definitions AttributeName=userId,AttributeType=S AttributeName=email,AttributeType=S `
    --key-schema AttributeName=userId,KeyType=HASH `
    --global-secondary-indexes "IndexName=email-index,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL}" `
    --billing-mode PAY_PER_REQUEST `
    --sse-specification Enabled=true `
    --region $region

if ($LASTEXITCODE -eq 0) { Write-Host "✓ Users table created" -ForegroundColor Green }

# 2. Events Table
Write-Host "`n2. Creating beatmatchme-events table..." -ForegroundColor Yellow
aws dynamodb create-table `
    --table-name beatmatchme-events `
    --attribute-definitions AttributeName=eventId,AttributeType=S AttributeName=performerId,AttributeType=S AttributeName=startTime,AttributeType=N AttributeName=status,AttributeType=S `
    --key-schema AttributeName=eventId,KeyType=HASH `
    --global-secondary-indexes "IndexName=performerId-startTime-index,KeySchema=[{AttributeName=performerId,KeyType=HASH},{AttributeName=startTime,KeyType=RANGE}],Projection={ProjectionType=ALL}" "IndexName=status-startTime-index,KeySchema=[{AttributeName=status,KeyType=HASH},{AttributeName=startTime,KeyType=RANGE}],Projection={ProjectionType=ALL}" `
    --billing-mode PAY_PER_REQUEST `
    --sse-specification Enabled=true `
    --region $region

if ($LASTEXITCODE -eq 0) { Write-Host "✓ Events table created" -ForegroundColor Green }

# 3. Requests Table
Write-Host "`n3. Creating beatmatchme-requests table..." -ForegroundColor Yellow
aws dynamodb create-table `
    --table-name beatmatchme-requests `
    --attribute-definitions AttributeName=requestId,AttributeType=S AttributeName=eventId,AttributeType=S AttributeName=userId,AttributeType=S AttributeName=submittedAt,AttributeType=N AttributeName=status,AttributeType=S `
    --key-schema AttributeName=requestId,KeyType=HASH `
    --global-secondary-indexes "IndexName=eventId-submittedAt-index,KeySchema=[{AttributeName=eventId,KeyType=HASH},{AttributeName=submittedAt,KeyType=RANGE}],Projection={ProjectionType=ALL}" "IndexName=userId-submittedAt-index,KeySchema=[{AttributeName=userId,KeyType=HASH},{AttributeName=submittedAt,KeyType=RANGE}],Projection={ProjectionType=ALL}" "IndexName=eventId-status-index,KeySchema=[{AttributeName=eventId,KeyType=HASH},{AttributeName=status,KeyType=RANGE}],Projection={ProjectionType=ALL}" `
    --billing-mode PAY_PER_REQUEST `
    --sse-specification Enabled=true `
    --region $region

if ($LASTEXITCODE -eq 0) { Write-Host "✓ Requests table created" -ForegroundColor Green }

# 4. Transactions Table
Write-Host "`n4. Creating beatmatchme-transactions table..." -ForegroundColor Yellow
aws dynamodb create-table `
    --table-name beatmatchme-transactions `
    --attribute-definitions AttributeName=transactionId,AttributeType=S AttributeName=userId,AttributeType=S AttributeName=eventId,AttributeType=S AttributeName=createdAt,AttributeType=N `
    --key-schema AttributeName=transactionId,KeyType=HASH `
    --global-secondary-indexes "IndexName=userId-createdAt-index,KeySchema=[{AttributeName=userId,KeyType=HASH},{AttributeName=createdAt,KeyType=RANGE}],Projection={ProjectionType=ALL}" "IndexName=eventId-createdAt-index,KeySchema=[{AttributeName=eventId,KeyType=HASH},{AttributeName=createdAt,KeyType=RANGE}],Projection={ProjectionType=ALL}" `
    --billing-mode PAY_PER_REQUEST `
    --sse-specification Enabled=true `
    --region $region

if ($LASTEXITCODE -eq 0) { Write-Host "✓ Transactions table created" -ForegroundColor Green }

# 5. Group Requests Table
Write-Host "`n5. Creating beatmatchme-group-requests table..." -ForegroundColor Yellow
aws dynamodb create-table `
    --table-name beatmatchme-group-requests `
    --attribute-definitions AttributeName=groupRequestId,AttributeType=S AttributeName=eventId,AttributeType=S AttributeName=status,AttributeType=S `
    --key-schema AttributeName=groupRequestId,KeyType=HASH `
    --global-secondary-indexes "IndexName=eventId-status-index,KeySchema=[{AttributeName=eventId,KeyType=HASH},{AttributeName=status,KeyType=RANGE}],Projection={ProjectionType=ALL}" `
    --billing-mode PAY_PER_REQUEST `
    --sse-specification Enabled=true `
    --region $region

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Group Requests table created" -ForegroundColor Green
    Start-Sleep -Seconds 5
    aws dynamodb update-time-to-live `
        --table-name beatmatchme-group-requests `
        --time-to-live-specification "Enabled=true,AttributeName=expiresAt" `
        --region $region
    if ($LASTEXITCODE -eq 0) { Write-Host "  ✓ TTL enabled" -ForegroundColor Green }
}

Write-Host "`nWaiting for tables to become active..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "`nListing all tables:" -ForegroundColor Cyan
aws dynamodb list-tables --region $region
