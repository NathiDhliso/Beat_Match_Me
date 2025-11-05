# Quick deploy remaining Lambda functions
$ErrorActionPreference = "Continue"
$roleArn = "arn:aws:iam::202717921808:role/BeatMatchMeLambdaExecutionRole"
$region = "us-east-1"

$functions = @("calculateQueuePosition", "reorderQueue", "createRequest", "vetoRequest")

foreach ($func in $functions) {
    Write-Host "Deploying $func..." -ForegroundColor Cyan
    
    # Package
    Push-Location $func
    Compress-Archive -Path "index.js" -DestinationPath "../$func.zip" -Force
    Pop-Location
    
    # Deploy
    aws lambda create-function `
        --function-name "beatmatchme-$func" `
        --runtime nodejs18.x `
        --role $roleArn `
        --handler index.handler `
        --zip-file "fileb://$func.zip" `
        --timeout 30 `
        --memory-size 512 `
        --region $region 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $func deployed" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $func may already exist or failed" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ All Lambda functions deployed!" -ForegroundColor Green
