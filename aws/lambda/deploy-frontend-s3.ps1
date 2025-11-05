# Deploy Frontend to S3
# Deploys the built frontend to S3 bucket for static hosting

$ErrorActionPreference = "Stop"
$BucketName = "beatmatchme-assets-2407"
$Region = "us-east-1"
$DistDir = "..\..\web\dist"

Write-Host "🚀 Deploying BeatMatchMe Frontend to S3" -ForegroundColor Cyan
Write-Host "Bucket: $BucketName" -ForegroundColor Yellow
Write-Host "Region: $Region" -ForegroundColor Yellow
Write-Host ""

# Step 1: Verify build directory exists
if (-not (Test-Path $DistDir)) {
    Write-Host "❌ Build directory not found: $DistDir" -ForegroundColor Red
    Write-Host "Run 'npm run build' in the web directory first" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Build directory found" -ForegroundColor Green
Write-Host ""

# Step 2: Check if bucket exists and is configured for static hosting
Write-Host "📋 Checking S3 bucket configuration..." -ForegroundColor Cyan

try {
    aws s3api head-bucket --bucket $BucketName --region $Region 2>$null
    Write-Host "✅ Bucket exists: $BucketName" -ForegroundColor Green
} catch {
    Write-Host "❌ Bucket not found or not accessible" -ForegroundColor Red
    exit 1
}

# Step 3: Enable static website hosting
Write-Host "`n📋 Configuring static website hosting..." -ForegroundColor Cyan

$websiteConfig = @"
{
    "IndexDocument": {
        "Suffix": "index.html"
    },
    "ErrorDocument": {
        "Key": "index.html"
    }
}
"@

$websiteConfig | Out-File -FilePath "website-config.json" -Encoding utf8

aws s3api put-bucket-website `
    --bucket $BucketName `
    --website-configuration file://website-config.json `
    --region $Region 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Static website hosting enabled" -ForegroundColor Green
} else {
    Write-Host "⚠️  Static hosting may already be configured" -ForegroundColor Yellow
}

Remove-Item "website-config.json" -Force

# Step 4: Set bucket policy for public read access
Write-Host "`n📋 Setting bucket policy for public access..." -ForegroundColor Cyan

$bucketPolicy = @"
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BucketName/*"
        }
    ]
}
"@

$bucketPolicy | Out-File -FilePath "bucket-policy.json" -Encoding utf8

aws s3api put-bucket-policy `
    --bucket $BucketName `
    --policy file://bucket-policy.json `
    --region $Region 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Bucket policy set" -ForegroundColor Green
} else {
    Write-Host "⚠️  Bucket policy may already be set" -ForegroundColor Yellow
}

Remove-Item "bucket-policy.json" -Force

# Step 5: Sync files to S3
Write-Host "`n📦 Uploading files to S3..." -ForegroundColor Cyan
Write-Host ""

aws s3 sync $DistDir s3://$BucketName/ `
    --delete `
    --region $Region `
    --cache-control "public,max-age=31536000,immutable" `
    --exclude "index.html" `
    --exclude "*.json"

# Upload index.html with no-cache
aws s3 cp "$DistDir\index.html" s3://$BucketName/index.html `
    --region $Region `
    --cache-control "public,max-age=0,must-revalidate" `
    --content-type "text/html"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Files uploaded successfully" -ForegroundColor Green
} else {
    Write-Host "`n❌ Upload failed" -ForegroundColor Red
    exit 1
}

# Step 6: Get website URL
Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Frontend Deployment Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Website URL:" -ForegroundColor Yellow
Write-Host "http://$BucketName.s3-website-$Region.amazonaws.com" -ForegroundColor White
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Test the website URL above" -ForegroundColor White
Write-Host "2. Set up CloudFront for HTTPS (optional)" -ForegroundColor White
Write-Host "3. Configure custom domain (optional)" -ForegroundColor White
Write-Host "4. Test all user flows" -ForegroundColor White
Write-Host ""
