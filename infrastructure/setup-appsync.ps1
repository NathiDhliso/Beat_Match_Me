# Setup AWS AppSync GraphQL API for BeatMatchMe
$ErrorActionPreference = "Stop"
$region = "us-east-1"

Write-Host "Setting up AWS AppSync GraphQL API..." -ForegroundColor Green

# Read Cognito config
if (Test-Path "infrastructure/cognito-config.json") {
    $cognitoConfig = Get-Content "infrastructure/cognito-config.json" | ConvertFrom-Json
    $userPoolId = $cognitoConfig.UserPoolId
} else {
    Write-Host "✗ Cognito config not found. Run setup-cognito.ps1 first." -ForegroundColor Red
    exit 1
}

# Create AppSync API
Write-Host "`nCreating AppSync API..." -ForegroundColor Yellow

$apiResult = aws appsync create-graphql-api `
    --name "beatmatchme-api" `
    --authentication-type AMAZON_COGNITO_USER_POOLS `
    --user-pool-config "userPoolId=$userPoolId,awsRegion=$region,defaultAction=ALLOW" `
    --additional-authentication-providers "[{`"authenticationType`":`"API_KEY`"}]" `
    --log-config "cloudWatchLogsRoleArn=arn:aws:iam::202717921808:role/AppSyncServiceRole,fieldLogLevel=ERROR" `
    --region $region 2>&1

if ($LASTEXITCODE -eq 0) {
    $apiId = ($apiResult | ConvertFrom-Json).graphqlApi.id
    $apiUrl = ($apiResult | ConvertFrom-Json).graphqlApi.uris.GRAPHQL
    Write-Host "✓ AppSync API created: $apiId" -ForegroundColor Green
    Write-Host "  API URL: $apiUrl" -ForegroundColor Cyan
    
    # Create API Key
    Write-Host "`nCreating API Key..." -ForegroundColor Yellow
    $expirationTime = [DateTimeOffset]::UtcNow.AddDays(365).ToUnixTimeSeconds()
    
    $apiKeyResult = aws appsync create-api-key `
        --api-id $apiId `
        --description "BeatMatchMe API Key" `
        --expires $expirationTime `
        --region $region 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $apiKey = ($apiKeyResult | ConvertFrom-Json).apiKey.id
        Write-Host "✓ API Key created: $apiKey" -ForegroundColor Green
    }
    
    # Save configuration
    $config = @{
        ApiId = $apiId
        ApiUrl = $apiUrl
        ApiKey = $apiKey
        Region = $region
    }
    
    $config | ConvertTo-Json | Out-File -FilePath "infrastructure/appsync-config.json" -Encoding utf8
    
    Write-Host "`nAppSync configuration saved to infrastructure/appsync-config.json" -ForegroundColor Cyan
    Write-Host "API ID: $apiId" -ForegroundColor Cyan
    Write-Host "GraphQL Endpoint: $apiUrl" -ForegroundColor Cyan
    
} else {
    Write-Host "✗ Failed to create AppSync API" -ForegroundColor Red
    Write-Host $apiResult -ForegroundColor Red
}

Write-Host "`nAppSync setup completed!" -ForegroundColor Green
Write-Host "Note: GraphQL schema and resolvers need to be configured separately" -ForegroundColor Yellow
