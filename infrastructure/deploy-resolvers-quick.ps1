# Quick AppSync Deployment Script
# Deploys schema and resolvers to AWS AppSync

$ErrorActionPreference = "Continue"
$ApiId = "h57lyr2p5bbaxnqckf2r4u7wo4"
$Region = "us-east-1"

Write-Host "🚀 Starting AppSync Deployment" -ForegroundColor Cyan
Write-Host "API ID: $ApiId" -ForegroundColor Yellow
Write-Host ""

# Step 1: Create Users Data Source if not exists
Write-Host "📊 Step 1: Creating Users Data Source..." -ForegroundColor Cyan
try {
    $existingDataSource = aws appsync get-data-source `
        --api-id $ApiId `
        --name UsersDataSource `
        --region $Region 2>$null | ConvertFrom-Json
    
    if ($existingDataSource) {
        Write-Host "✅ UsersDataSource already exists" -ForegroundColor Green
    }
} catch {
    Write-Host "Creating new UsersDataSource..." -ForegroundColor Yellow
    
    $createDsResult = aws appsync create-data-source `
        --api-id $ApiId `
        --name UsersDataSource `
        --type AMAZON_DYNAMODB `
        --service-role-arn "arn:aws:iam::202717921808:role/AppSyncDynamoDBRole" `
        --dynamodb-config tableName=beatmatchme-users-dev,awsRegion=us-east-1 `
        --region $Region 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ UsersDataSource created successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Warning: Could not create UsersDataSource - may already exist" -ForegroundColor Yellow
    }
}

Write-Host ""

# Step 2: Deploy Resolvers
Write-Host "🔧 Step 2: Deploying Resolvers..." -ForegroundColor Cyan
Write-Host ""

# Deploy updateDJSetSettings resolver
Write-Host "Deploying: Mutation.updateDJSetSettings" -ForegroundColor Yellow

$reqTemplate = Get-Content "resolvers/Mutation.updateDJSetSettings.req.vtl" -Raw
$resTemplate = Get-Content "resolvers/Mutation.updateDJSetSettings.res.vtl" -Raw

# Check if resolver exists
$existingResolver = aws appsync get-resolver `
    --api-id $ApiId `
    --type-name Mutation `
    --field-name updateDJSetSettings `
    --region $Region 2>$null

if ($existingResolver) {
    Write-Host "  Updating existing resolver..." -ForegroundColor Cyan
    aws appsync update-resolver `
        --api-id $ApiId `
        --type-name Mutation `
        --field-name updateDJSetSettings `
        --data-source-name DJSetsDataSource `
        --request-mapping-template $reqTemplate `
        --response-mapping-template $resTemplate `
        --region $Region | Out-Null
} else {
    Write-Host "  Creating new resolver..." -ForegroundColor Cyan
    aws appsync create-resolver `
        --api-id $ApiId `
        --type-name Mutation `
        --field-name updateDJSetSettings `
        --data-source-name DJSetsDataSource `
        --request-mapping-template $reqTemplate `
        --response-mapping-template $resTemplate `
        --region $Region | Out-Null
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Deployed successfully" -ForegroundColor Green
} else {
    Write-Host "  ❌ Failed to deploy" -ForegroundColor Red
}

Write-Host ""

# Deploy updateDJProfile resolver
Write-Host "Deploying: Mutation.updateDJProfile" -ForegroundColor Yellow

$reqTemplate2 = Get-Content "resolvers/Mutation.updateDJProfile.req.vtl" -Raw
$resTemplate2 = Get-Content "resolvers/Mutation.updateDJProfile.res.vtl" -Raw

$existingResolver2 = aws appsync get-resolver `
    --api-id $ApiId `
    --type-name Mutation `
    --field-name updateDJProfile `
    --region $Region 2>$null

if ($existingResolver2) {
    Write-Host "  Updating existing resolver..." -ForegroundColor Cyan
    aws appsync update-resolver `
        --api-id $ApiId `
        --type-name Mutation `
        --field-name updateDJProfile `
        --data-source-name UsersDataSource `
        --request-mapping-template $reqTemplate2 `
        --response-mapping-template $resTemplate2 `
        --region $Region | Out-Null
} else {
    Write-Host "  Creating new resolver..." -ForegroundColor Cyan
    aws appsync create-resolver `
        --api-id $ApiId `
        --type-name Mutation `
        --field-name updateDJProfile `
        --data-source-name UsersDataSource `
        --request-mapping-template $reqTemplate2 `
        --response-mapping-template $resTemplate2 `
        --region $Region | Out-Null
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Deployed successfully" -ForegroundColor Green
} else {
    Write-Host "  ❌ Failed to deploy" -ForegroundColor Red
}

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Note: Schema must be updated manually via AWS Console" -ForegroundColor Yellow
Write-Host "Go to: https://console.aws.amazon.com/appsync/home?region=us-east-1#/$ApiId/v1/schema" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update schema in AWS Console" -ForegroundColor White
Write-Host "2. Test mutations in Queries tab" -ForegroundColor White
Write-Host "3. Verify frontend integration" -ForegroundColor White
