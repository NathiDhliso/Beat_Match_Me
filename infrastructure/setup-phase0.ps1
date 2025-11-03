# BeatMatchMe Phase 0 Infrastructure Setup Script
# This script sets up all AWS resources for Phase 0

$ErrorActionPreference = "Stop"
$region = "us-east-1"

Write-Host "Starting BeatMatchMe Phase 0 Infrastructure Setup..." -ForegroundColor Green

# Task 0.2: AWS Infrastructure Foundation

# Create S3 bucket for asset storage
Write-Host "`nCreating S3 bucket for asset storage..." -ForegroundColor Yellow
$bucketName = "beatmatchme-assets-$(Get-Random -Minimum 1000 -Maximum 9999)"
aws s3api create-bucket --bucket $bucketName --region $region 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ S3 bucket created: $bucketName" -ForegroundColor Green
    
    # Enable versioning
    aws s3api put-bucket-versioning --bucket $bucketName --versioning-configuration Status=Enabled
    Write-Host "✓ Versioning enabled" -ForegroundColor Green
    
    # Configure CORS
    $corsConfig = @"
{
    "CORSRules": [
        {
            "AllowedOrigins": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
            "AllowedHeaders": ["*"],
            "ExposeHeaders": ["ETag"],
            "MaxAgeSeconds": 3000
        }
    ]
}
"@
    $corsConfig | Out-File -FilePath "cors-config.json" -Encoding utf8
    aws s3api put-bucket-cors --bucket $bucketName --cors-configuration file://cors-config.json
    Remove-Item "cors-config.json"
    Write-Host "✓ CORS configured" -ForegroundColor Green
    
    # Set up lifecycle policy
    $lifecycleConfig = @"
{
    "Rules": [
        {
            "ID": "DeleteOldVersions",
            "Status": "Enabled",
            "NoncurrentVersionExpiration": {
                "NoncurrentDays": 90
            }
        }
    ]
}
"@
    $lifecycleConfig | Out-File -FilePath "lifecycle-config.json" -Encoding utf8
    aws s3api put-bucket-lifecycle-configuration --bucket $bucketName --lifecycle-configuration file://lifecycle-config.json
    Remove-Item "lifecycle-config.json"
    Write-Host "✓ Lifecycle policies configured" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to create S3 bucket" -ForegroundColor Red
}

# Save bucket name for later use
$bucketName | Out-File -FilePath "infrastructure/bucket-name.txt" -Encoding utf8

Write-Host "`nPhase 0 S3 setup completed!" -ForegroundColor Green
Write-Host "Bucket Name: $bucketName" -ForegroundColor Cyan
