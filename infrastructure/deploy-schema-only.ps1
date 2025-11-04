<#
.SYNOPSIS
Deploy GraphQL schema to AWS AppSync using AWS CLI

.DESCRIPTION
Reads the schema.graphql file, base64 encodes it, and deploys to AppSync

.PARAMETER ApiId
The AppSync API ID

.PARAMETER Region
AWS region (default: us-east-1)
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiId,
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-east-1"
)

Write-Host "🚀 Deploying GraphQL Schema to AppSync" -ForegroundColor Cyan
Write-Host "API ID: $ApiId" -ForegroundColor Yellow
Write-Host "Region: $Region" -ForegroundColor Yellow
Write-Host ""

$schemaPath = Join-Path $PSScriptRoot "schema.graphql"
if (-not (Test-Path $schemaPath)) {
    Write-Error "Schema file not found: $schemaPath"
    exit 1
}

Write-Host "📋 Reading schema from: $schemaPath" -ForegroundColor Cyan

# Read schema content
$schemaContent = Get-Content $schemaPath -Raw

# Encode to base64
$schemaBytes = [System.Text.Encoding]::UTF8.GetBytes($schemaContent)
$schemaBase64 = [System.Convert]::ToBase64String($schemaBytes)

Write-Host "📦 Schema size: $($schemaContent.Length) characters" -ForegroundColor Cyan
Write-Host "🔄 Starting schema creation..." -ForegroundColor Cyan

try {
    # Start schema creation
    $result = aws appsync start-schema-creation `
        --api-id $ApiId `
        --region $Region `
        --definition $schemaBase64 `
        | ConvertFrom-Json
    
    Write-Host "✅ Schema creation initiated" -ForegroundColor Green
    Write-Host "Status: $($result.status)" -ForegroundColor Yellow
    
    # Wait for schema creation to complete
    Write-Host ""
    Write-Host "⏳ Waiting for schema creation to complete..." -ForegroundColor Cyan
    
    $maxAttempts = 30
    $attempt = 0
    $status = "PROCESSING"
    
    while ($status -eq "PROCESSING" -and $attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 2
        $attempt++
        
        $statusResult = aws appsync get-schema-creation-status `
            --api-id $ApiId `
            --region $Region `
            | ConvertFrom-Json
        
        $status = $statusResult.status
        Write-Host "  Attempt $attempt/$maxAttempts - Status: $status" -ForegroundColor Gray
    }
    
    if ($status -eq "SUCCESS") {
        Write-Host ""
        Write-Host "🎉 Schema deployed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Deploy resolvers: .\deploy-schema-and-resolvers.ps1 -ApiId '$ApiId'" -ForegroundColor White
        Write-Host "2. Test queries in AppSync console" -ForegroundColor White
    } elseif ($status -eq "FAILED") {
        Write-Host ""
        Write-Host "❌ Schema deployment failed!" -ForegroundColor Red
        if ($statusResult.details) {
            Write-Host "Error: $($statusResult.details)" -ForegroundColor Red
        }
        exit 1
    } else {
        Write-Host ""
        Write-Host "⚠️  Schema deployment timed out (status: $status)" -ForegroundColor Yellow
        Write-Host "Check AppSync console for status" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host ""
    Write-Host "❌ Error deploying schema: $_" -ForegroundColor Red
    exit 1
}
