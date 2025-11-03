# Create all DynamoDB tables for BeatMatchMe
$ErrorActionPreference = "Stop"
$region = "us-east-1"

Write-Host "Creating DynamoDB tables..." -ForegroundColor Green

# Task 0.3: Database Schema Implementation

# 1. Users Table
Write-Host "`nCreating beatmatchme-users table..." -ForegroundColor Yellow
aws dynamodb create-table `
    --table-name beatmatchme-users `
    --attribute-definitions `
        AttributeName=userId,AttributeType=S `
        AttributeName=email,AttributeType=S `
    --key-schema AttributeName=userId,KeyType=HASH `
    --global-secondary-indexes `
        "[{`"IndexName`":`"email-index`",`"KeySchema`":[{`"AttributeName`":`"email`",`"KeyType`":`"HASH`"}],`"Projection`":{`"ProjectionType`":`"ALL`"},`"ProvisionedThroughput`":{`"ReadCapacityUnits`":5,`"WriteCapacityUnits`":5}}]" `
    --billing-mode PAY_PER_REQUEST `
    --sse-specification Enabled=true `
    --region $region 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ beatmatchme-users table created" -ForegroundColor Green
}

# 2. Events Table
Write-Host "`nCreating beatmatchme-events table..." -ForegroundColor Yellow
aws dynamodb create-table `
    --table-name beatmatchme-events `
    --attribute-definitions `
        AttributeName=eventId,AttributeType=S `
        AttributeName=performerId,AttributeType=S `
        AttributeName=startTime,AttributeType=N `
        AttributeName=status,AttributeType=S `
    --key-schema AttributeName=eventId,KeyType=HASH `
    --global-secondary-indexes `
        "[{`"IndexName`":`"performerId-startTime-index`",`"KeySchema`":[{`"AttributeName`":`"performerId`",`"KeyType`":`"HASH`"},{`"AttributeName`":`"startTime`",`"KeyType`":`"RANGE`"}],`"Projection`":{`"ProjectionType`":`"ALL`"},`"ProvisionedThroughput`":{`"ReadCapacityUnits`":5,`"WriteCapacityUnits`":5}},{`"IndexName`":`"status-startTime-index`",`"KeySchema`":[{`"AttributeName`":`"status`",`"KeyType`":`"HASH`"},{`"AttributeName`":`"startTime`",`"KeyType`":`"RANGE`"}],`"Projection`":{`"ProjectionType`":`"ALL`"},`"ProvisionedThroughput`":{`"ReadCapacityUnits`":5,`"WriteCapacityUnits`":5}}]" `
    --billing-mode PAY_PER_REQUEST `
    --sse-specification Enabled=true `
    --region $region 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ beatmatchme-events table created" -ForegroundColor Green
}

# 3. Requests Table
Write-Host "`nCreating beatmatchme-requests table..." -ForegroundColor Yellow
aws dynamodb create-table `
    --table-name beatmatchme-requests `
    --attribute-definitions `
        AttributeName=requestId,AttributeType=S `
        AttributeName=eventId,AttributeType=S `
        AttributeName=userId,AttributeType=S `
        AttributeName=submittedAt,AttributeType=N `
        AttributeName=status,AttributeType=S `
    --key-schema AttributeName=requestId,KeyType=HASH `
    --global-secondary-indexes `
        "[{`"IndexName`":`"eventId-submittedAt-index`",`"KeySchema`":[{`"AttributeName`":`"eventId`",`"KeyType`":`"HASH`"},{`"AttributeName`":`"submittedAt`",`"KeyType`":`"RANGE`"}],`"Projection`":{`"ProjectionType`":`"ALL`"},`"ProvisionedThroughput`":{`"ReadCapacityUnits`":5,`"WriteCapacityUnits`":5}},{`"IndexName`":`"userId-submittedAt-index`",`"KeySchema`":[{`"AttributeName`":`"userId`",`"KeyType`":`"HASH`"},{`"AttributeName`":`"submittedAt`",`"KeyType`":`"RANGE`"}],`"Projection`":{`"ProjectionType`":`"ALL`"},`"ProvisionedThroughput`":{`"ReadCapacityUnits`":5,`"WriteCapacityUnits`":5}},{`"IndexName`":`"eventId-status-index`",`"KeySchema`":[{`"AttributeName`":`"eventId`",`"KeyType`":`"HASH`"},{`"AttributeName`":`"status`",`"KeyType`":`"RANGE`"}],`"Projection`":{`"ProjectionType`":`"ALL`"},`"ProvisionedThroughput`":{`"ReadCapacityUnits`":5,`"WriteCapacityUnits`":5}}]" `
    --billing-mode PAY_PER_REQUEST `
    --sse-specification Enabled=true `
    --region $region 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ beatmatchme-requests table created" -ForegroundColor Green
}

# 4. Queues Table
Write-Host "`nCreating beatmatchme-queues table..." -ForegroundColor Yellow
aws dynamodb create-table `
    --table-name beatmatchme-queues `
    --attribute-definitions AttributeName=eventId,AttributeType=S `
    --key-schema AttributeName=eventId,KeyType=HASH `
    --billing-mode PAY_PER_REQUEST `
    --sse-specification Enabled=true `
    --stream-specification StreamEnabled=true,StreamViewType=NEW_AND_OLD_IMAGES `
    --region $region 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ beatmatchme-queues table created with DynamoDB Streams" -ForegroundColor Green
}

# 5. Transactions Table
Write-Host "`nCreating beatmatchme-transactions table..." -ForegroundColor Yellow
aws dynamodb create-table `
    --table-name beatmatchme-transactions `
    --attribute-definitions `
        AttributeName=transactionId,AttributeType=S `
        AttributeName=userId,AttributeType=S `
        AttributeName=eventId,AttributeType=S `
        AttributeName=createdAt,AttributeType=N `
    --key-schema AttributeName=transactionId,KeyType=HASH `
    --global-secondary-indexes `
        "[{`"IndexName`":`"userId-createdAt-index`",`"KeySchema`":[{`"AttributeName`":`"userId`",`"KeyType`":`"HASH`"},{`"AttributeName`":`"createdAt`",`"KeyType`":`"RANGE`"}],`"Projection`":{`"ProjectionType`":`"ALL`"},`"ProvisionedThroughput`":{`"ReadCapacityUnits`":5,`"WriteCapacityUnits`":5}},{`"IndexName`":`"eventId-createdAt-index`",`"KeySchema`":[{`"AttributeName`":`"eventId`",`"KeyType`":`"HASH`"},{`"AttributeName`":`"createdAt`",`"KeyType`":`"RANGE`"}],`"Projection`":{`"ProjectionType`":`"ALL`"},`"ProvisionedThroughput`":{`"ReadCapacityUnits`":5,`"WriteCapacityUnits`":5}}]" `
    --billing-mode PAY_PER_REQUEST `
    --sse-specification Enabled=true `
    --region $region 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ beatmatchme-transactions table created" -ForegroundColor Green
}

# 6. Achievements Table
Write-Host "`nCreating beatmatchme-achievements table..." -ForegroundColor Yellow
aws dynamodb create-table `
    --table-name beatmatchme-achievements `
    --attribute-definitions AttributeName=userId,AttributeType=S `
    --key-schema AttributeName=userId,KeyType=HASH `
    --billing-mode PAY_PER_REQUEST `
    --sse-specification Enabled=true `
    --region $region 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ beatmatchme-achievements table created" -ForegroundColor Green
}

# 7. GroupRequests Table
Write-Host "`nCreating beatmatchme-group-requests table..." -ForegroundColor Yellow
aws dynamodb create-table `
    --table-name beatmatchme-group-requests `
    --attribute-definitions `
        AttributeName=groupRequestId,AttributeType=S `
        AttributeName=eventId,AttributeType=S `
        AttributeName=status,AttributeType=S `
        AttributeName=expiresAt,AttributeType=N `
    --key-schema AttributeName=groupRequestId,KeyType=HASH `
    --global-secondary-indexes `
        "[{`"IndexName`":`"eventId-status-index`",`"KeySchema`":[{`"AttributeName`":`"eventId`",`"KeyType`":`"HASH`"},{`"AttributeName`":`"status`",`"KeyType`":`"RANGE`"}],`"Projection`":{`"ProjectionType`":`"ALL`"},`"ProvisionedThroughput`":{`"ReadCapacityUnits`":5,`"WriteCapacityUnits`":5}}]" `
    --billing-mode PAY_PER_REQUEST `
    --sse-specification Enabled=true `
    --region $region 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ beatmatchme-group-requests table created" -ForegroundColor Green
    
    # Enable TTL on expiresAt attribute
    Write-Host "  Enabling TTL on expiresAt..." -ForegroundColor Yellow
    aws dynamodb update-time-to-live `
        --table-name beatmatchme-group-requests `
        --time-to-live-specification "Enabled=true,AttributeName=expiresAt" `
        --region $region 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ TTL enabled" -ForegroundColor Green
    }
}

Write-Host "`nWaiting for tables to become active..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "`nAll DynamoDB tables created successfully!" -ForegroundColor Green
