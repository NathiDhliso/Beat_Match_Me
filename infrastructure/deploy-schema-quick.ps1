<#
.SYNOPSIS
Quick deploy of GraphQL schema to AWS AppSync

.DESCRIPTION
This script deploys only the GraphQL schema to AWS AppSync using AWS CLI.
Faster than the full deployment script.

.PARAMETER ApiId
The AppSync API ID (optional - reads from appsync-config.json if not provided)

.PARAMETER Region
AWS region (default: us-east-1)

.EXAMPLE
.\deploy-schema-quick.ps1
.\deploy-schema-quick.ps1 -ApiId "h57lyr2p5bbaxnqckf2r4u7wo4"
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$ApiId,
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-east-1"
)

# Load API ID from config if not provided
if (-not $ApiId) {
    $configPath = Join-Path $PSScriptRoot "appsync-config.json"
    if (Test-Path $configPath) {
        $config = Get-Content $configPath | ConvertFrom-Json
        $ApiId = $config.ApiId
        $Region = $config.Region
        Write-Host "📋 Loaded configuration from appsync-config.json" -ForegroundColor Cyan
    } else {
        Write-Error "API ID not provided and appsync-config.json not found"
        Write-Host ""
        Write-Host "Usage: .\deploy-schema-quick.ps1 -ApiId <your-api-id>" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "🚀 Deploying GraphQL Schema to AppSync" -ForegroundColor Cyan
Write-Host "API ID: $ApiId" -ForegroundColor Yellow
Write-Host "Region: $Region" -ForegroundColor Yellow
Write-Host ""

# Check if schema file exists
$schemaPath = Join-Path $PSScriptRoot "schema.graphql"
if (-not (Test-Path $schemaPath)) {
    Write-Error "Schema file not found: $schemaPath"
    exit 1
}

Write-Host "📄 Reading schema from: schema.graphql" -ForegroundColor Cyan

# Read schema content
$schemaContent = Get-Content $schemaPath -Raw

try {
    Write-Host "⬆️  Uploading schema to AppSync..." -ForegroundColor Cyan
    
    # Deploy schema using AWS CLI with proper file path syntax
    # Convert to Unix-style path for AWS CLI
    $unixSchemaPath = $schemaPath -replace '\\', '/'
    
    $result = aws appsync start-schema-creation `
        --api-id $ApiId `
        --definition "file://$unixSchemaPath" `
        --region $Region 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to deploy schema: $result"
        exit 1
    }
    
    Write-Host "⏳ Waiting for schema deployment to complete..." -ForegroundColor Cyan
    
    # Poll schema status
    $maxAttempts = 30
    $attempt = 0
    $deployed = $false
    
    while ($attempt -lt $maxAttempts -and -not $deployed) {
        Start-Sleep -Seconds 2
        $attempt++
        
        $statusResult = aws appsync get-schema-creation-status `
            --api-id $ApiId `
            --region $Region | ConvertFrom-Json
        
        $status = $statusResult.status
        
        Write-Host "  Status: $status (attempt $attempt/$maxAttempts)" -ForegroundColor Yellow
        
        if ($status -eq "SUCCESS") {
            $deployed = $true
            Write-Host ""
            Write-Host "✅ Schema deployed successfully!" -ForegroundColor Green
        } elseif ($status -eq "FAILED") {
            Write-Error "Schema deployment failed: $($statusResult.details)"
            exit 1
        } elseif ($status -eq "PROCESSING" -or $status -eq "PENDING") {
            # Continue waiting
        } else {
            Write-Warning "Unknown status: $status"
        }
    }
    
    if (-not $deployed) {
        Write-Error "Schema deployment timed out after $maxAttempts attempts"
        exit 1
    }
    
} catch {
    Write-Error "Error during deployment: $_"
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🎉 Schema Deployment Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Deploy resolvers: .\deploy-resolvers-only.ps1" -ForegroundColor White
Write-Host "2. Test in AppSync console: https://console.aws.amazon.com/appsync/home?region=$Region#/$ApiId/v1/queries" -ForegroundColor White
Write-Host "3. Refresh your web app to use the new schema" -ForegroundColor White
Write-Host ""
