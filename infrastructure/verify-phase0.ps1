# Verification script for Phase 0 infrastructure
$ErrorActionPreference = "Continue"
$region = "us-east-1"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "BeatMatchMe Phase 0 Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$allGood = $true

# Check DynamoDB Tables
Write-Host "`n1. Checking DynamoDB Tables..." -ForegroundColor Yellow
$expectedTables = @(
    "beatmatchme-users",
    "beatmatchme-events",
    "beatmatchme-requests",
    "beatmatchme-queues",
    "beatmatchme-transactions",
    "beatmatchme-achievements",
    "beatmatchme-group-requests"
)

$tables = (aws dynamodb list-tables --region $region --query "TableNames" --output json | ConvertFrom-Json)

foreach ($table in $expectedTables) {
    if ($tables -contains $table) {
        Write-Host "  ✓ $table" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $table (MISSING)" -ForegroundColor Red
        $allGood = $false
    }
}

# Check Cognito User Pool
Write-Host "`n2. Checking Cognito User Pool..." -ForegroundColor Yellow
$userPoolId = "us-east-1_m1PhjZ4yD"
$poolCheck = aws cognito-idp describe-user-pool --user-pool-id $userPoolId --region $region 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ User Pool: $userPoolId" -ForegroundColor Green
    
    # Check groups
    $groups = (aws cognito-idp list-groups --user-pool-id $userPoolId --region $region --query "Groups[].GroupName" --output json | ConvertFrom-Json)
    
    if ($groups -contains "performers") {
        Write-Host "  ✓ Group: performers" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Group: performers (MISSING)" -ForegroundColor Red
        $allGood = $false
    }
    
    if ($groups -contains "audience") {
        Write-Host "  ✓ Group: audience" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Group: audience (MISSING)" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "  ✗ User Pool not found" -ForegroundColor Red
    $allGood = $false
}

# Check S3 Bucket
Write-Host "`n3. Checking S3 Bucket..." -ForegroundColor Yellow
$bucketName = "beatmatchme-assets-2407"
$bucketCheck = aws s3 ls s3://$bucketName 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Bucket: $bucketName" -ForegroundColor Green
    
    # Check versioning
    $versioning = aws s3api get-bucket-versioning --bucket $bucketName --query "Status" --output text 2>&1
    if ($versioning -eq "Enabled") {
        Write-Host "  ✓ Versioning enabled" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Versioning not enabled" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "  ✗ Bucket not found" -ForegroundColor Red
    $allGood = $false
}

# Check AppSync API
Write-Host "`n4. Checking AppSync API..." -ForegroundColor Yellow
$apis = (aws appsync list-graphql-apis --region $region --query "graphqlApis[?name=='beatmatchme-api']" --output json | ConvertFrom-Json)

if ($apis.Count -gt 0) {
    $apiId = $apis[0].apiId
    $apiUrl = $apis[0].uris.GRAPHQL
    Write-Host "  ✓ API ID: $apiId" -ForegroundColor Green
    Write-Host "  ✓ Endpoint: $apiUrl" -ForegroundColor Green
} else {
    Write-Host "  ✗ AppSync API not found" -ForegroundColor Red
    $allGood = $false
}

# Check Configuration Files
Write-Host "`n5. Checking Configuration Files..." -ForegroundColor Yellow
$configFiles = @(
    "infrastructure/cognito-config.json",
    "infrastructure/appsync-config.json",
    "infrastructure/bucket-name.txt",
    "infrastructure/schema.graphql",
    "infrastructure/aws-exports.js",
    "infrastructure/aws-exports.ts"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (MISSING)" -ForegroundColor Red
        $allGood = $false
    }
}

# Final Summary
Write-Host "`n========================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "✓ ALL CHECKS PASSED" -ForegroundColor Green
    Write-Host "Phase 0 infrastructure is complete and ready!" -ForegroundColor Green
} else {
    Write-Host "✗ SOME CHECKS FAILED" -ForegroundColor Red
    Write-Host "Please review the errors above and re-run setup scripts." -ForegroundColor Yellow
}
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
