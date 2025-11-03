# Deploy Lambda Functions Script
# Packages and deploys all Lambda functions to AWS

$ErrorActionPreference = "Stop"

Write-Host "🚀 Deploying BeatMatchMe Lambda Functions..." -ForegroundColor Cyan

# Lambda functions to deploy
$functions = @(
    "processPayment",
    "processRefund",
    "calculateQueuePosition",
    "updateTier",
    "reorderQueue",
    "createRequest",
    "upvoteRequest",
    "createGroupRequest",
    "contributeToGroupRequest"
)

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
Set-Location "../aws/lambda"
npm install

foreach ($function in $functions) {
    Write-Host "`n📦 Packaging $function..." -ForegroundColor Yellow
    
    $functionPath = "./$function"
    
    if (Test-Path $functionPath) {
        # Create deployment package
        Set-Location $functionPath
        
        # Copy node_modules if needed
        if (-not (Test-Path "./node_modules")) {
            Copy-Item -Path "../node_modules" -Destination "./" -Recurse
        }
        
        # Create ZIP
        $zipFile = "../$function.zip"
        if (Test-Path $zipFile) {
            Remove-Item $zipFile
        }
        
        Compress-Archive -Path "./*" -DestinationPath $zipFile
        
        Write-Host "✅ Packaged $function" -ForegroundColor Green
        
        # Deploy to AWS Lambda
        Write-Host "🚀 Deploying $function to AWS..." -ForegroundColor Yellow
        
        aws lambda update-function-code `
            --function-name "beatmatchme-$function" `
            --zip-file "fileb://$zipFile" `
            --region us-east-1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Deployed $function" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to deploy $function" -ForegroundColor Red
        }
        
        Set-Location ..
    } else {
        Write-Host "⚠️  Function $function not found" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ All Lambda functions deployed!" -ForegroundColor Green
Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Configure AppSync resolvers"
Write-Host "2. Set up DynamoDB streams"
Write-Host "3. Configure environment variables"
Write-Host "4. Test functions with sample events"
