# Update CloudFront with Custom Domains and SSL Certificate

Write-Host "🔄 Updating CloudFront distribution with custom domains and SSL..." -ForegroundColor Cyan

$DISTRIBUTION_ID = "E2X5X2SKCOIO3E"
$CERTIFICATE_ARN = "arn:aws:acm:us-east-1:202717921808:certificate/80a7eb34-92bf-4952-88b7-34218ed1671a"

# Get current config
Write-Host "📥 Getting current CloudFront configuration..." -ForegroundColor Yellow
aws cloudfront get-distribution-config --id $DISTRIBUTION_ID --output json | Out-File -FilePath "cloudfront-current.json" -Encoding utf8

# Parse JSON
$config = Get-Content "cloudfront-current.json" -Raw | ConvertFrom-Json
$etag = $config.ETag
$distConfig = $config.DistributionConfig

# Update Aliases (custom domains)
Write-Host "✏️ Adding custom domains (aliases)..." -ForegroundColor Yellow
$distConfig.Aliases = @{
    Quantity = 2
    Items = @("app.beatmatchme.com", "www.beatmatchme.com")
}

# Update ViewerCertificate (SSL)
Write-Host "🔒 Adding SSL certificate..." -ForegroundColor Yellow
$distConfig.ViewerCertificate = @{
    ACMCertificateArn = $CERTIFICATE_ARN
    SSLSupportMethod = "sni-only"
    MinimumProtocolVersion = "TLSv1.2_2021"
    Certificate = $CERTIFICATE_ARN
    CertificateSource = "acm"
}

# Save updated config
$distConfig | ConvertTo-Json -Depth 20 | Out-File -FilePath "cloudfront-updated.json" -Encoding utf8

Write-Host "📤 Uploading updated configuration to CloudFront..." -ForegroundColor Yellow

# Update distribution
aws cloudfront update-distribution `
    --id $DISTRIBUTION_ID `
    --distribution-config file://cloudfront-updated.json `
    --if-match $etag

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ CloudFront distribution updated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⏰ Distribution is now deploying (takes 15-20 minutes)..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Your custom domains will be live at:" -ForegroundColor White
    Write-Host "   https://app.beatmatchme.com" -ForegroundColor Green
    Write-Host "   https://www.beatmatchme.com" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔍 Check deployment status:" -ForegroundColor White
    Write-Host "   aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.Status'" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to update CloudFront distribution" -ForegroundColor Red
    Write-Host "Check error message above" -ForegroundColor Yellow
}
