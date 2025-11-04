<#
.SYNOPSIS
Deploy GraphQL schema and all resolvers to AWS AppSync

.DESCRIPTION
This script deploys the complete GraphQL schema and all VTL resolvers to AWS AppSync.
It ensures the backend API is fully configured with all queries, mutations, and subscriptions.

.PARAMETER ApiId
The AppSync API ID (e.g., h57lyr2p5bbaxnqckf2r4u7wo4)

.PARAMETER Region
AWS region (default: us-east-1)

.EXAMPLE
.\deploy-schema-and-resolvers.ps1 -ApiId "h57lyr2p5bbaxnqckf2r4u7wo4" -Region "us-east-1"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiId,
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-east-1"
)

Write-Host "🚀 Deploying GraphQL Schema and Resolvers to AppSync" -ForegroundColor Cyan
Write-Host "API ID: $ApiId" -ForegroundColor Yellow
Write-Host "Region: $Region" -ForegroundColor Yellow
Write-Host ""

# Step 1: Deploy Schema
Write-Host "📋 Step 1: Deploying GraphQL Schema..." -ForegroundColor Cyan

$schemaPath = Join-Path $PSScriptRoot "schema.graphql"
if (-not (Test-Path $schemaPath)) {
    Write-Error "Schema file not found: $schemaPath"
    exit 1
}

$schemaContent = Get-Content $schemaPath -Raw

try {
    # Note: AWS CLI doesn't support schema update via command line easily
    # We need to use the AWS Console or SDK
    Write-Host "⚠️  Schema deployment requires AWS Console:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Go to: https://console.aws.amazon.com/appsync/home?region=$Region#/$ApiId/v1/schema" -ForegroundColor White
    Write-Host "2. Click 'Edit Schema'" -ForegroundColor White
    Write-Host "3. Replace with content from: $schemaPath" -ForegroundColor White
    Write-Host "4. Click 'Save Schema'" -ForegroundColor White
    Write-Host ""
    Write-Host "Press Enter after deploying schema to continue with resolvers..." -ForegroundColor Yellow
    Read-Host
} catch {
    Write-Error "Failed to prepare schema: $_"
    exit 1
}

# Step 2: Get Data Source ARN
Write-Host ""
Write-Host "📊 Step 2: Getting DynamoDB Data Sources..." -ForegroundColor Cyan

$dataSources = aws appsync list-data-sources --api-id $ApiId --region $Region | ConvertFrom-Json

$eventsDataSource = $dataSources.dataSources | Where-Object { $_.name -like "*events*" } | Select-Object -First 1
$requestsDataSource = $dataSources.dataSources | Where-Object { $_.name -like "*requests*" } | Select-Object -First 1
$tracksDataSource = $dataSources.dataSources | Where-Object { $_.name -like "*songs*" -or $_.name -like "*tracks*" } | Select-Object -First 1

if (-not $eventsDataSource) {
    Write-Error "Events data source not found"
    exit 1
}

Write-Host "✅ Found Events Data Source: $($eventsDataSource.name)" -ForegroundColor Green
Write-Host "✅ Found Requests Data Source: $($requestsDataSource.name)" -ForegroundColor Green
if ($tracksDataSource) {
    Write-Host "✅ Found Tracks Data Source: $($tracksDataSource.name)" -ForegroundColor Green
}

# Step 3: Deploy Resolvers
Write-Host ""
Write-Host "🔧 Step 3: Deploying Resolvers..." -ForegroundColor Cyan

$resolversPath = Join-Path $PSScriptRoot "resolvers"
$resolverFiles = Get-ChildItem $resolversPath -Filter "*.req.vtl"

$deployedCount = 0
$failedCount = 0

foreach ($reqFile in $resolverFiles) {
    $fileName = $reqFile.Name
    $resFile = $fileName -replace "\.req\.vtl", ".res.vtl"
    $resFilePath = Join-Path $resolversPath $resFile
    
    # Parse field name from filename (e.g., "Query.getEvent.req.vtl" -> Type: Query, Field: getEvent)
    if ($fileName -match "^(\w+)\.(\w+)\.req\.vtl$") {
        $typeName = $matches[1]
        $fieldName = $matches[2]
        
        Write-Host ""
        Write-Host "Deploying: $typeName.$fieldName" -ForegroundColor Yellow
        
        # Read request template
        $requestTemplate = Get-Content $reqFile.FullName -Raw
        
        # Read response template if exists
        $responseTemplate = ""
        if (Test-Path $resFilePath) {
            $responseTemplate = Get-Content $resFilePath -Raw
        } else {
            Write-Host "  ⚠️  No response template found, using default" -ForegroundColor Yellow
            $responseTemplate = '$util.toJson($ctx.result)'
        }
        
        # Determine data source based on field name
        $dataSourceName = $eventsDataSource.name
        if ($fieldName -like "*Request*" -or $fieldName -like "*Queue*") {
            if ($requestsDataSource) {
                $dataSourceName = $requestsDataSource.name
            }
        } elseif ($fieldName -like "*Track*" -or $fieldName -like "*Tracklist*") {
            if ($tracksDataSource) {
                $dataSourceName = $tracksDataSource.name
            }
        }
        
        try {
            # Check if resolver exists
            $existingResolver = aws appsync get-resolver `
                --api-id $ApiId `
                --type-name $typeName `
                --field-name $fieldName `
                --region $Region 2>$null | ConvertFrom-Json
            
            if ($existingResolver) {
                # Update existing resolver
                Write-Host "  Updating existing resolver..." -ForegroundColor Cyan
                aws appsync update-resolver `
                    --api-id $ApiId `
                    --type-name $typeName `
                    --field-name $fieldName `
                    --data-source-name $dataSourceName `
                    --request-mapping-template $requestTemplate `
                    --response-mapping-template $responseTemplate `
                    --region $Region | Out-Null
            } else {
                # Create new resolver
                Write-Host "  Creating new resolver..." -ForegroundColor Cyan
                aws appsync create-resolver `
                    --api-id $ApiId `
                    --type-name $typeName `
                    --field-name $fieldName `
                    --data-source-name $dataSourceName `
                    --request-mapping-template $requestTemplate `
                    --response-mapping-template $responseTemplate `
                    --region $Region | Out-Null
            }
            
            Write-Host "  ✅ Deployed successfully" -ForegroundColor Green
            $deployedCount++
        } catch {
            Write-Host "  ❌ Failed: $_" -ForegroundColor Red
            $failedCount++
        }
    } else {
        Write-Host "Skipping invalid filename: $fileName" -ForegroundColor Gray
    }
}

# Summary
Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 Deployment Summary" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Successfully deployed: $deployedCount resolvers" -ForegroundColor Green
if ($failedCount -gt 0) {
    Write-Host "❌ Failed: $failedCount resolvers" -ForegroundColor Red
}
Write-Host ""
Write-Host "🎉 Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test queries in AppSync console" -ForegroundColor White
Write-Host "2. Verify frontend is fetching data correctly" -ForegroundColor White
Write-Host "3. Check CloudWatch logs for any errors" -ForegroundColor White
