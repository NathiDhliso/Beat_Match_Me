# BeatMatchMe AWS Infrastructure Deployment Script
# PowerShell script for Windows

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('dev', 'staging', 'production')]
    [string]$Environment = 'dev',
    
    [Parameter(Mandatory=$false)]
    [string]$Region = 'us-east-1',
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipCognito,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipDynamoDB,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipS3
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BeatMatchMe AWS Infrastructure Deployment" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Cyan
Write-Host "Region: $Region" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if AWS CLI is installed
try {
    $awsVersion = aws --version
    Write-Host "✓ AWS CLI detected: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ AWS CLI not found. Please install AWS CLI first." -ForegroundColor Red
    exit 1
}

# Check AWS credentials
try {
    $identity = aws sts get-caller-identity --output json | ConvertFrom-Json
    Write-Host "✓ AWS credentials configured" -ForegroundColor Green
    Write-Host "  Account: $($identity.Account)" -ForegroundColor Gray
    Write-Host "  User: $($identity.Arn)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ AWS credentials not configured. Run 'aws configure' first." -ForegroundColor Red
    exit 1
}

# Function to deploy CloudFormation stack
function Deploy-Stack {
    param(
        [string]$StackName,
        [string]$TemplateFile,
        [string]$Description
    )
    
    Write-Host "Deploying $Description..." -ForegroundColor Yellow
    
    $stackExists = aws cloudformation describe-stacks --stack-name $StackName --region $Region 2>$null
    
    if ($stackExists) {
        Write-Host "  Stack exists, updating..." -ForegroundColor Gray
        $operation = "update-stack"
    } else {
        Write-Host "  Creating new stack..." -ForegroundColor Gray
        $operation = "create-stack"
    }
    
    try {
        aws cloudformation $operation `
            --stack-name $StackName `
            --template-body "file://$TemplateFile" `
            --parameters ParameterKey=Environment,ParameterValue=$Environment `
            --capabilities CAPABILITY_NAMED_IAM `
            --region $Region
        
        Write-Host "  Waiting for stack operation to complete..." -ForegroundColor Gray
        aws cloudformation wait stack-$operation-complete --stack-name $StackName --region $Region
        
        Write-Host "✓ $Description deployed successfully" -ForegroundColor Green
        Write-Host ""
        return $true
    } catch {
        if ($_.Exception.Message -like "*No updates are to be performed*") {
            Write-Host "✓ $Description is already up to date" -ForegroundColor Green
            Write-Host ""
            return $true
        } else {
            Write-Host "✗ Failed to deploy $Description" -ForegroundColor Red
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host ""
            return $false
        }
    }
}

# Deploy Cognito User Pool
if (-not $SkipCognito) {
    $cognitoDeployed = Deploy-Stack `
        -StackName "beatmatchme-cognito-$Environment" `
        -TemplateFile "cloudformation/cognito-user-pool.yaml" `
        -Description "Cognito User Pool"
    
    if ($cognitoDeployed) {
        # Get Cognito outputs
        $cognitoOutputs = aws cloudformation describe-stacks `
            --stack-name "beatmatchme-cognito-$Environment" `
            --region $Region `
            --query 'Stacks[0].Outputs' `
            --output json | ConvertFrom-Json
        
        Write-Host "Cognito Configuration:" -ForegroundColor Cyan
        foreach ($output in $cognitoOutputs) {
            Write-Host "  $($output.OutputKey): $($output.OutputValue)" -ForegroundColor Gray
        }
        Write-Host ""
    }
}

# Deploy DynamoDB Tables
if (-not $SkipDynamoDB) {
    $dynamoDeployed = Deploy-Stack `
        -StackName "beatmatchme-dynamodb-$Environment" `
        -TemplateFile "cloudformation/dynamodb-tables.yaml" `
        -Description "DynamoDB Tables"
    
    if ($dynamoDeployed) {
        Write-Host "✓ All DynamoDB tables created" -ForegroundColor Green
        Write-Host ""
    }
}

# Create S3 Bucket for Assets
if (-not $SkipS3) {
    Write-Host "Creating S3 bucket for assets..." -ForegroundColor Yellow
    
    $bucketName = "beatmatchme-$Environment-assets"
    
    try {
        # Check if bucket exists
        $bucketExists = aws s3 ls "s3://$bucketName" 2>$null
        
        if (-not $bucketExists) {
            # Create bucket
            if ($Region -eq "us-east-1") {
                aws s3 mb "s3://$bucketName" --region $Region
            } else {
                aws s3 mb "s3://$bucketName" --region $Region --create-bucket-configuration LocationConstraint=$Region
            }
            
            # Enable versioning
            aws s3api put-bucket-versioning `
                --bucket $bucketName `
                --versioning-configuration Status=Enabled `
                --region $Region
            
            # Configure CORS
            $corsConfig = @"
{
    "CORSRules": [
        {
            "AllowedOrigins": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
            "AllowedHeaders": ["*"],
            "MaxAgeSeconds": 3000
        }
    ]
}
"@
            $corsConfig | Out-File -FilePath "cors.json" -Encoding UTF8
            aws s3api put-bucket-cors --bucket $bucketName --cors-configuration "file://cors.json" --region $Region
            Remove-Item "cors.json"
            
            # Enable encryption
            aws s3api put-bucket-encryption `
                --bucket $bucketName `
                --server-side-encryption-configuration '{
                    "Rules": [{
                        "ApplyServerSideEncryptionByDefault": {
                            "SSEAlgorithm": "AES256"
                        }
                    }]
                }' `
                --region $Region
            
            Write-Host "✓ S3 bucket created: $bucketName" -ForegroundColor Green
        } else {
            Write-Host "✓ S3 bucket already exists: $bucketName" -ForegroundColor Green
        }
        Write-Host ""
    } catch {
        Write-Host "✗ Failed to create S3 bucket" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deployment Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not $SkipCognito) {
    Write-Host "Cognito User Pool: beatmatchme-cognito-$Environment" -ForegroundColor Green
}
if (-not $SkipDynamoDB) {
    Write-Host "DynamoDB Tables: beatmatchme-dynamodb-$Environment" -ForegroundColor Green
}
if (-not $SkipS3) {
    Write-Host "S3 Bucket: beatmatchme-$Environment-assets" -ForegroundColor Green
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update web/.env with Cognito User Pool ID and App Client ID" -ForegroundColor Yellow
Write-Host "2. Configure Yoco payment provider credentials in AWS Secrets Manager" -ForegroundColor Yellow
Write-Host "3. Deploy AppSync GraphQL API (coming next)" -ForegroundColor Yellow
Write-Host "4. Deploy Lambda functions for backend logic" -ForegroundColor Yellow
Write-Host ""
Write-Host "To get configuration values, run:" -ForegroundColor Cyan
Write-Host "  aws cloudformation describe-stacks --stack-name beatmatchme-cognito-$Environment --region $Region --query 'Stacks[0].Outputs'" -ForegroundColor Gray
Write-Host ""
