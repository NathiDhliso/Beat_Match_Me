# DynamoDB GSI Creation Script
# Creates Global Secondary Indexes for idempotency and payment deduplication
# Run this script to add indexes to existing DynamoDB tables

$Region = "us-east-1"
$ErrorActionPreference = "Stop"

Write-Host "🚀 Creating DynamoDB Global Secondary Indexes..." -ForegroundColor Cyan

# ============================================
# TRANSACTIONS TABLE GSIs
# ============================================

Write-Host "`n📋 Creating idempotencyKey-index on beatmatchme-transactions..." -ForegroundColor Yellow

try {
    aws dynamodb update-table `
        --table-name beatmatchme-transactions `
        --region $Region `
        --attribute-definitions `
            AttributeName=idempotencyKey,AttributeType=S `
        --global-secondary-index-updates `
            "[{
                \"Create\": {
                    \"IndexName\": \"idempotencyKey-index\",
                    \"KeySchema\": [{\"AttributeName\": \"idempotencyKey\", \"KeyType\": \"HASH\"}],
                    \"Projection\": {\"ProjectionType\": \"ALL\"},
                    \"ProvisionedThroughput\": {\"ReadCapacityUnits\": 5, \"WriteCapacityUnits\": 5}
                }
            }]"
    
    Write-Host "✅ idempotencyKey-index creation initiated" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Error creating idempotencyKey-index: $_" -ForegroundColor Red
}

Write-Host "`n⏳ Waiting 60 seconds for index creation..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

Write-Host "`n📋 Creating providerTransactionId-index on beatmatchme-transactions..." -ForegroundColor Yellow

try {
    aws dynamodb update-table `
        --table-name beatmatchme-transactions `
        --region $Region `
        --attribute-definitions `
            AttributeName=providerTransactionId,AttributeType=S `
        --global-secondary-index-updates `
            "[{
                \"Create\": {
                    \"IndexName\": \"providerTransactionId-index\",
                    \"KeySchema\": [{\"AttributeName\": \"providerTransactionId\", \"KeyType\": \"HASH\"}],
                    \"Projection\": {\"ProjectionType\": \"ALL\"},
                    \"ProvisionedThroughput\": {\"ReadCapacityUnits\": 5, \"WriteCapacityUnits\": 5}
                }
            }]"
    
    Write-Host "✅ providerTransactionId-index creation initiated" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Error creating providerTransactionId-index: $_" -ForegroundColor Red
}

Write-Host "`n⏳ Waiting 60 seconds for index creation..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

Write-Host "`n📋 Creating userId-createdAt-index on beatmatchme-transactions..." -ForegroundColor Yellow

try {
    aws dynamodb update-table `
        --table-name beatmatchme-transactions `
        --region $Region `
        --attribute-definitions `
            AttributeName=userId,AttributeType=S `
            AttributeName=createdAt,AttributeType=N `
        --global-secondary-index-updates `
            "[{
                \"Create\": {
                    \"IndexName\": \"userId-createdAt-index\",
                    \"KeySchema\": [
                        {\"AttributeName\": \"userId\", \"KeyType\": \"HASH\"},
                        {\"AttributeName\": \"createdAt\", \"KeyType\": \"RANGE\"}
                    ],
                    \"Projection\": {\"ProjectionType\": \"ALL\"},
                    \"ProvisionedThroughput\": {\"ReadCapacityUnits\": 5, \"WriteCapacityUnits\": 5}
                }
            }]"
    
    Write-Host "✅ userId-createdAt-index creation initiated" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Error creating userId-createdAt-index: $_" -ForegroundColor Red
}

# ============================================
# REQUESTS TABLE GSIs
# ============================================
# Note: These indexes may already exist from initial table setup
# Included here for completeness

Write-Host "`n⏳ Waiting 60 seconds before requests table indexes..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

Write-Host "`n📋 Verifying userId-submittedAt-index on beatmatchme-requests..." -ForegroundColor Yellow

try {
    $RequestsTable = aws dynamodb describe-table --table-name beatmatchme-requests --region $Region | ConvertFrom-Json
    $HasUserIdIndex = $RequestsTable.Table.GlobalSecondaryIndexes | Where-Object { $_.IndexName -eq "userId-submittedAt-index" }
    
    if ($HasUserIdIndex) {
        Write-Host "✅ userId-submittedAt-index already exists" -ForegroundColor Green
    } else {
        Write-Host "⚠️ userId-submittedAt-index not found - creating..." -ForegroundColor Yellow
        
        aws dynamodb update-table `
            --table-name beatmatchme-requests `
            --region $Region `
            --attribute-definitions `
                AttributeName=userId,AttributeType=S `
                AttributeName=submittedAt,AttributeType=N `
            --global-secondary-index-updates `
                "[{
                    \"Create\": {
                        \"IndexName\": \"userId-submittedAt-index\",
                        \"KeySchema\": [
                            {\"AttributeName\": \"userId\", \"KeyType\": \"HASH\"},
                            {\"AttributeName\": \"submittedAt\", \"KeyType\": \"RANGE\"}
                        ],
                        \"Projection\": {\"ProjectionType\": \"ALL\"},
                        \"ProvisionedThroughput\": {\"ReadCapacityUnits\": 5, \"WriteCapacityUnits\": 5}
                    }
                }]"
        
        Write-Host "✅ userId-submittedAt-index creation initiated" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Error with userId-submittedAt-index: $_" -ForegroundColor Red
}

Write-Host "`n⏳ Waiting 60 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

Write-Host "`n📋 Verifying eventId-userId-index on beatmatchme-requests..." -ForegroundColor Yellow

try {
    $RequestsTable = aws dynamodb describe-table --table-name beatmatchme-requests --region $Region | ConvertFrom-Json
    $HasEventUserIndex = $RequestsTable.Table.GlobalSecondaryIndexes | Where-Object { $_.IndexName -eq "eventId-userId-index" }
    
    if ($HasEventUserIndex) {
        Write-Host "✅ eventId-userId-index already exists" -ForegroundColor Green
    } else {
        Write-Host "⚠️ eventId-userId-index not found - creating..." -ForegroundColor Yellow
        
        aws dynamodb update-table `
            --table-name beatmatchme-requests `
            --region $Region `
            --attribute-definitions `
                AttributeName=eventId,AttributeType=S `
                AttributeName=userId,AttributeType=S `
            --global-secondary-index-updates `
                "[{
                    \"Create\": {
                        \"IndexName\": \"eventId-userId-index\",
                        \"KeySchema\": [
                            {\"AttributeName\": \"eventId\", \"KeyType\": \"HASH\"},
                            {\"AttributeName\": \"userId\", \"KeyType\": \"RANGE\"}
                        ],
                        \"Projection\": {\"ProjectionType\": \"ALL\"},
                        \"ProvisionedThroughput\": {\"ReadCapacityUnits\": 5, \"WriteCapacityUnits\": 5}
                    }
                }]"
        
        Write-Host "✅ eventId-userId-index creation initiated" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Error with eventId-userId-index: $_" -ForegroundColor Red
}

Write-Host "`n⏳ Waiting for all indexes to become ACTIVE (this may take 5-10 minutes)..." -ForegroundColor Yellow
Write-Host "Run this command to check status:" -ForegroundColor Cyan
Write-Host "aws dynamodb describe-table --table-name beatmatchme-transactions --region $Region --query 'Table.GlobalSecondaryIndexes[*].[IndexName,IndexStatus]' --output table" -ForegroundColor White

Write-Host "`n✅ GSI creation script completed!" -ForegroundColor Green
Write-Host "📝 Note: Indexes need to build before they can be queried. Check status with describe-table." -ForegroundColor Yellow
