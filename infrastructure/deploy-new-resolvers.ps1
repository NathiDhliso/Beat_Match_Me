# Deploy New Resolvers Script
# Deploys getUserActiveRequests and updateSetStatus resolvers

$ErrorActionPreference = "Continue"
$ApiId = "h57lyr2p5bbaxnqckf2r4u7wo4"  # From appsync-config.json
$Region = "us-east-1"

Write-Host "🚀 Deploying New Resolvers" -ForegroundColor Cyan
Write-Host "API ID: $ApiId" -ForegroundColor Yellow
Write-Host ""

# Navigate to infrastructure directory
Push-Location "$PSScriptRoot"

# Deploy getUserActiveRequests resolver
Write-Host "Deploying: Query.getUserActiveRequests" -ForegroundColor Yellow

$reqTemplate1 = Get-Content "resolvers/Query.getUserActiveRequests.req.vtl" -Raw
$resTemplate1 = Get-Content "resolvers/Query.getUserActiveRequests.res.vtl" -Raw

# Check if resolver exists
$existingResolver1 = aws appsync get-resolver `
    --api-id $ApiId `
    --type-name Query `
    --field-name getUserActiveRequests `
    --region $Region 2>$null

if ($existingResolver1) {
    Write-Host "  Updating existing resolver..." -ForegroundColor Cyan
    aws appsync update-resolver `
        --api-id $ApiId `
        --type-name Query `
        --field-name getUserActiveRequests `
        --data-source-name RequestsDataSource `
        --request-mapping-template $reqTemplate1 `
        --response-mapping-template $resTemplate1 `
        --region $Region | Out-Null
} else {
    Write-Host "  Creating new resolver..." -ForegroundColor Cyan
    aws appsync create-resolver `
        --api-id $ApiId `
        --type-name Query `
        --field-name getUserActiveRequests `
        --data-source-name RequestsDataSource `
        --request-mapping-template $reqTemplate1 `
        --response-mapping-template $resTemplate1 `
        --region $Region | Out-Null
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Deployed successfully" -ForegroundColor Green
} else {
    Write-Host "  ❌ Failed to deploy - Error: $LASTEXITCODE" -ForegroundColor Red
}

Write-Host ""

# Deploy updateSetStatus resolver
Write-Host "Deploying: Mutation.updateSetStatus" -ForegroundColor Yellow

$reqTemplate2 = Get-Content "resolvers/Mutation.updateSetStatus.req.vtl" -Raw
$resTemplate2 = Get-Content "resolvers/Mutation.updateSetStatus.res.vtl" -Raw

$existingResolver2 = aws appsync get-resolver `
    --api-id $ApiId `
    --type-name Mutation `
    --field-name updateSetStatus `
    --region $Region 2>$null

if ($existingResolver2) {
    Write-Host "  Updating existing resolver..." -ForegroundColor Cyan
    aws appsync update-resolver `
        --api-id $ApiId `
        --type-name Mutation `
        --field-name updateSetStatus `
        --data-source-name DJSetsDataSource `
        --request-mapping-template $reqTemplate2 `
        --response-mapping-template $resTemplate2 `
        --region $Region | Out-Null
} else {
    Write-Host "  Creating new resolver..." -ForegroundColor Cyan
    aws appsync create-resolver `
        --api-id $ApiId `
        --type-name Mutation `
        --field-name updateSetStatus `
        --data-source-name DJSetsDataSource `
        --request-mapping-template $reqTemplate2 `
        --response-mapping-template $resTemplate2 `
        --region $Region | Out-Null
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Deployed successfully" -ForegroundColor Green
} else {
    Write-Host "  ❌ Failed to deploy - Error: $LASTEXITCODE" -ForegroundColor Red
}

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

Pop-Location
