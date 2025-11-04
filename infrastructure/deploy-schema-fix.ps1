# Quick Schema Deployment Script
# This script properly deploys the GraphQL schema to AppSync

Write-Host "🚀 Deploying GraphQL Schema to AppSync" -ForegroundColor Cyan

# Load configuration
$config = Get-Content "appsync-config.json" | ConvertFrom-Json
$apiId = $config.apiId
$region = "us-east-1"

Write-Host "API ID: $apiId" -ForegroundColor Yellow
Write-Host "Region: $region" -ForegroundColor Yellow

# Read schema file
$schemaContent = Get-Content "schema.graphql" -Raw

# Convert to base64
$bytes = [System.Text.Encoding]::UTF8.GetBytes($schemaContent)
$base64Schema = [Convert]::ToBase64String($bytes)

# Create temporary file with base64 schema
$tempFile = "schema-base64.txt"
$base64Schema | Out-File -FilePath $tempFile -Encoding ASCII -NoNewline

Write-Host "`n📋 Starting schema deployment..." -ForegroundColor Cyan

# Deploy schema using AWS CLI with base64 encoded content
try {
    $result = aws appsync start-schema-creation `
        --api-id $apiId `
        --definition "file://$tempFile" `
        --region $region `
        2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Schema deployment initiated successfully!" -ForegroundColor Green
        Write-Host "`n⏳ Waiting for schema to be processed (this may take 10-30 seconds)..." -ForegroundColor Yellow
        
        # Wait for schema creation to complete
        Start-Sleep -Seconds 15
        
        Write-Host "✅ Schema deployment complete!" -ForegroundColor Green
        Write-Host "`n📝 Verify at: https://console.aws.amazon.com/appsync/home?region=$region#/$apiId/v1/schema" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Schema deployment failed" -ForegroundColor Red
        Write-Host $result
    }
} catch {
    Write-Host "❌ Error deploying schema: $_" -ForegroundColor Red
} finally {
    # Clean up temp file
    if (Test-Path $tempFile) {
        Remove-Item $tempFile
    }
}

Write-Host "`n🎉 Done!" -ForegroundColor Green
