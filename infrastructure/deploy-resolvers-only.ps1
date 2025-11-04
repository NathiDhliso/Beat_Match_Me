<#
.SYNOPSIS
Deploy only resolvers to AWS AppSync

.DESCRIPTION
This script deploys VTL resolvers to AWS AppSync without touching the schema.
Use this after deploying the schema with deploy-schema-quick.ps1

.PARAMETER ApiId
The AppSync API ID (optional - reads from appsync-config.json if not provided)

.PARAMETER Region
AWS region (default: us-east-1)

.EXAMPLE
.\deploy-resolvers-only.ps1
.\deploy-resolvers-only.ps1 -ApiId "h57lyr2p5bbaxnqckf2r4u7wo4"
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
        Write-Host "Usage: .\deploy-resolvers-only.ps1 -ApiId <your-api-id>" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "🚀 Deploying Resolvers to AppSync" -ForegroundColor Cyan
Write-Host "API ID: $ApiId" -ForegroundColor Yellow
Write-Host "Region: $Region" -ForegroundColor Yellow
Write-Host ""

# Get Data Sources
Write-Host "📊 Getting Data Sources..." -ForegroundColor Cyan

try {
    $dataSources = aws appsync list-data-sources --api-id $ApiId --region $Region | ConvertFrom-Json
    
    $eventsDataSource = $dataSources.dataSources | Where-Object { $_.name -like "*Events*" -or $_.name -eq "DynamoDBEvents" } | Select-Object -First 1
    $requestsDataSource = $dataSources.dataSources | Where-Object { $_.name -like "*Requests*" -or $_.name -eq "DynamoDBRequests" } | Select-Object -First 1
    $djSetsDataSource = $dataSources.dataSources | Where-Object { $_.name -like "*DJSets*" -or $_.name -eq "DJSetsDataSource" } | Select-Object -First 1
    $tracksDataSource = $dataSources.dataSources | Where-Object { $_.name -like "*Tracks*" -or $_.name -like "*Songs*" } | Select-Object -First 1
    
    if ($eventsDataSource) {
        Write-Host "✅ Found Events Data Source: $($eventsDataSource.name)" -ForegroundColor Green
    } else {
        Write-Warning "Events data source not found"
    }
    
    if ($requestsDataSource) {
        Write-Host "✅ Found Requests Data Source: $($requestsDataSource.name)" -ForegroundColor Green
    }
    
    if ($djSetsDataSource) {
        Write-Host "✅ Found DJ Sets Data Source: $($djSetsDataSource.name)" -ForegroundColor Green
    }
    
    if ($tracksDataSource) {
        Write-Host "✅ Found Tracks Data Source: $($tracksDataSource.name)" -ForegroundColor Green
    }
} catch {
    Write-Error "Failed to get data sources: $_"
    exit 1
}

# Deploy Resolvers
Write-Host ""
Write-Host "🔧 Deploying Resolvers..." -ForegroundColor Cyan

$resolversPath = Join-Path $PSScriptRoot "resolvers"
if (-not (Test-Path $resolversPath)) {
    Write-Error "Resolvers directory not found: $resolversPath"
    exit 1
}

$resolverFiles = Get-ChildItem $resolversPath -Filter "*.req.vtl"

$deployedCount = 0
$failedCount = 0
$skippedCount = 0

foreach ($reqFile in $resolverFiles) {
    $fileName = $reqFile.Name
    $resFile = $fileName -replace "\.req\.vtl", ".res.vtl"
    $resFilePath = Join-Path $resolversPath $resFile
    
    # Parse field name from filename (e.g., "Query.getEvent.req.vtl" -> Type: Query, Field: getEvent)
    if ($fileName -match "^(\w+)\.(\w+)\.req\.vtl$") {
        $typeName = $matches[1]
        $fieldName = $matches[2]
        
        Write-Host ""
        Write-Host "Processing: $typeName.$fieldName" -ForegroundColor Yellow
        
        # Read request template
        $requestTemplate = Get-Content $reqFile.FullName -Raw
        
        # Read response template if exists
        $responseTemplate = '$util.toJson($ctx.result)'
        if (Test-Path $resFilePath) {
            $responseTemplate = Get-Content $resFilePath -Raw
        }
        
        # Determine data source based on field name
        $dataSourceName = $null
        
        if ($fieldName -match "Event" -and $fieldName -notmatch "DJSet|Set") {
            $dataSourceName = if ($eventsDataSource) { $eventsDataSource.name } else { $null }
        } elseif ($fieldName -match "Request|Queue") {
            $dataSourceName = if ($requestsDataSource) { $requestsDataSource.name } else { $null }
        } elseif ($fieldName -match "DJSet|PerformerSets|EventDJSets") {
            $dataSourceName = if ($djSetsDataSource) { $djSetsDataSource.name } else { $null }
        } elseif ($fieldName -match "Track|Tracklist|Song") {
            $dataSourceName = if ($tracksDataSource) { $tracksDataSource.name } else { $null }
        }
        
        # Fallback to events data source if none matched
        if (-not $dataSourceName -and $eventsDataSource) {
            $dataSourceName = $eventsDataSource.name
        }
        
        if (-not $dataSourceName) {
            Write-Host "  ⚠️  No data source found, skipping..." -ForegroundColor Yellow
            $skippedCount++
            continue
        }
        
        try {
            # Check if resolver exists
            $existingResolver = $null
            try {
                $existingResolver = aws appsync get-resolver `
                    --api-id $ApiId `
                    --type-name $typeName `
                    --field-name $fieldName `
                    --region $Region 2>$null | ConvertFrom-Json
            } catch {
                # Resolver doesn't exist, will create new one
            }
            
            if ($existingResolver) {
                # Update existing resolver
                Write-Host "  Updating existing resolver with data source: $dataSourceName" -ForegroundColor Cyan
                
                $updateResult = aws appsync update-resolver `
                    --api-id $ApiId `
                    --type-name $typeName `
                    --field-name $fieldName `
                    --data-source-name $dataSourceName `
                    --request-mapping-template $requestTemplate `
                    --response-mapping-template $responseTemplate `
                    --region $Region 2>&1
                
                if ($LASTEXITCODE -ne 0) {
                    throw "Update failed: $updateResult"
                }
            } else {
                # Create new resolver
                Write-Host "  Creating new resolver with data source: $dataSourceName" -ForegroundColor Cyan
                
                $createResult = aws appsync create-resolver `
                    --api-id $ApiId `
                    --type-name $typeName `
                    --field-name $fieldName `
                    --data-source-name $dataSourceName `
                    --request-mapping-template $requestTemplate `
                    --response-mapping-template $responseTemplate `
                    --region $Region 2>&1
                
                if ($LASTEXITCODE -ne 0) {
                    throw "Create failed: $createResult"
                }
            }
            
            Write-Host "  ✅ Deployed successfully" -ForegroundColor Green
            $deployedCount++
            
        } catch {
            Write-Host "  ❌ Failed: $_" -ForegroundColor Red
            $failedCount++
        }
    } else {
        Write-Host "Skipping invalid filename: $fileName" -ForegroundColor Gray
        $skippedCount++
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

if ($skippedCount -gt 0) {
    Write-Host "⚠️  Skipped: $skippedCount resolvers" -ForegroundColor Yellow
}

Write-Host ""

if ($failedCount -eq 0) {
    Write-Host "🎉 All resolvers deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some resolvers failed to deploy. Check errors above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test queries in AppSync console" -ForegroundColor White
Write-Host "2. Refresh your web app" -ForegroundColor White
Write-Host "3. Check CloudWatch logs if you encounter errors" -ForegroundColor White
Write-Host ""
