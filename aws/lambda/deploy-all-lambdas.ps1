# Deploy BeatMatchMe Lambda Functions
# This script packages and deploys Lambda functions to AWS

$ErrorActionPreference = "Stop"
$Region = "us-east-1"
$AccountId = "202717921808"
$RoleName = "BeatMatchMeLambdaExecutionRole"
$RoleArn = "arn:aws:iam::${AccountId}:role/${RoleName}"

Write-Host "🚀 BeatMatchMe Lambda Deployment Script" -ForegroundColor Cyan
Write-Host "Region: $Region" -ForegroundColor Yellow
Write-Host ""

# Step 1: Create/Update IAM Role
Write-Host "📋 Step 1: Setting up IAM Role..." -ForegroundColor Cyan

try {
    $existingRole = aws iam get-role --role-name $RoleName --region $Region 2>$null
    if ($existingRole) {
        Write-Host "✅ IAM Role already exists: $RoleName" -ForegroundColor Green
    }
} catch {
    Write-Host "Creating IAM Role: $RoleName" -ForegroundColor Yellow
    
    aws iam create-role `
        --role-name $RoleName `
        --assume-role-policy-document file://lambda-trust-policy.json `
        --region $Region
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Created IAM Role" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create IAM Role" -ForegroundColor Red
        exit 1
    }
    
    # Wait for role to propagate
    Write-Host "⏳ Waiting for IAM role to propagate..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}

# Step 2: Attach execution policy
Write-Host "`n📋 Step 2: Attaching execution policies..." -ForegroundColor Cyan

# Put inline policy
aws iam put-role-policy `
    --role-name $RoleName `
    --policy-name BeatMatchMeLambdaExecutionPolicy `
    --policy-document file://lambda-execution-policy.json `
    --region $Region

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Attached execution policy" -ForegroundColor Green
} else {
    Write-Host "⚠️  Policy may already exist" -ForegroundColor Yellow
}

# Step 3: Package and Deploy Lambda Functions
Write-Host "`n📦 Step 3: Packaging and Deploying Lambda Functions..." -ForegroundColor Cyan
Write-Host ""

$lambdaFunctions = @(
    "processRefund",
    "processPayment",
    "calculateQueuePosition",
    "reorderQueue",
    "createRequest",
    "vetoRequest"
)

foreach ($functionName in $lambdaFunctions) {
    $functionPath = "./$functionName"
    
    if (-not (Test-Path $functionPath)) {
        Write-Host "⚠️  Skipping $functionName - directory not found" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "📦 Processing: $functionName" -ForegroundColor Cyan
    
    # Create deployment package
    $zipFile = "${functionName}.zip"
    if (Test-Path $zipFile) {
        Remove-Item $zipFile -Force
    }
    
    # Zip the function (from current directory pointing to subdirectory)
    Push-Location $functionPath
    Compress-Archive -Path "*.js" -DestinationPath "../$zipFile" -Force
    Pop-Location
    
    Write-Host "  ✓ Packaged $functionName" -ForegroundColor Gray
    
    # Check if function exists
    $functionExists = $false
    try {
        aws lambda get-function --function-name "beatmatchme-$functionName" --region $Region 2>$null | Out-Null
        $functionExists = ($LASTEXITCODE -eq 0)
    } catch {
        $functionExists = $false
    }
    
    if ($functionExists) {
        Write-Host "  ↻ Updating existing function..." -ForegroundColor Yellow
        
        aws lambda update-function-code `
            --function-name "beatmatchme-$functionName" `
            --zip-file "fileb://$zipFile" `
            --region $Region | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Updated: beatmatchme-$functionName" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Failed to update: beatmatchme-$functionName" -ForegroundColor Red
        }
    } else {
        Write-Host "  + Creating new function..." -ForegroundColor Yellow
        
        aws lambda create-function `
            --function-name "beatmatchme-$functionName" `
            --runtime nodejs18.x `
            --role $RoleArn `
            --handler index.handler `
            --zip-file "fileb://$zipFile" `
            --timeout 30 `
            --memory-size 512 `
            --region $Region | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Created: beatmatchme-$functionName" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Failed to create: beatmatchme-$functionName" -ForegroundColor Red
        }
    }
    
    # Set environment variables for processRefund
    if ($functionName -eq "processRefund") {
        Write-Host "  ⚙️  Setting environment variables..." -ForegroundColor Gray
        
        aws lambda update-function-configuration `
            --function-name "beatmatchme-$functionName" `
            --environment "Variables={USER_NOTIFICATIONS_TOPIC=arn:aws:sns:us-east-1:202717921808:beatmatchme-notifications}" `
            --region $Region | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Environment variables set" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
}

# Step 4: Create SNS Topic if not exists
Write-Host "📢 Step 4: Setting up SNS Topic..." -ForegroundColor Cyan

try {
    aws sns create-topic `
        --name beatmatchme-notifications `
        --region $Region | Out-Null
    
    Write-Host "✅ SNS Topic ready: beatmatchme-notifications" -ForegroundColor Green
} catch {
    Write-Host "✅ SNS Topic already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Lambda Deployment Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Add Yoco API key to Secrets Manager" -ForegroundColor White
Write-Host "2. Test Lambda functions with sample events" -ForegroundColor White
Write-Host "3. Check CloudWatch Logs for any errors" -ForegroundColor White
Write-Host "4. Deploy frontend to S3/Amplify" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Note: processRefund will fail until Yoco API key is in Secrets Manager" -ForegroundColor Yellow
Write-Host ""
