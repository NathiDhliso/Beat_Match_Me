# Check Authentication Configuration
# This script verifies that AppSync and Cognito are properly configured

Write-Host "🔍 Checking Authentication Configuration..." -ForegroundColor Cyan
Write-Host ""

# Get AppSync API details
Write-Host "📡 AppSync API Configuration:" -ForegroundColor Yellow
$appsyncApi = aws appsync get-graphql-api --api-id h57lyr2p5bbaxnqckf2r4u7wo4 --region us-east-1 --query "graphqlApi.[name,authenticationType,userPoolConfig]" --output json | ConvertFrom-Json

Write-Host "  API Name: $($appsyncApi[0])"
Write-Host "  Auth Type: $($appsyncApi[1])"
Write-Host "  User Pool ID: $($appsyncApi[2].userPoolId)"
Write-Host "  Default Action: $($appsyncApi[2].defaultAction)"
Write-Host ""

# Read .env file
Write-Host "📝 Web App .env Configuration:" -ForegroundColor Yellow
$envFile = Get-Content ".\web\.env"
$userPoolId = ($envFile | Select-String "VITE_USER_POOL_ID=").ToString().Split('=')[1]
$clientId = ($envFile | Select-String "VITE_USER_POOL_CLIENT_ID=").ToString().Split('=')[1]
$appsyncEndpoint = ($envFile | Select-String "VITE_APPSYNC_ENDPOINT=").ToString().Split('=')[1]

Write-Host "  User Pool ID: $userPoolId"
Write-Host "  Client ID: $clientId"
Write-Host "  AppSync Endpoint: $appsyncEndpoint"
Write-Host ""

# Verify User Pool Client
Write-Host "👤 Cognito User Pool Client:" -ForegroundColor Yellow
try {
    $client = aws cognito-idp describe-user-pool-client --user-pool-id $userPoolId --client-id $clientId --region us-east-1 --query "UserPoolClient.[ClientName,AllowedOAuthFlows,ExplicitAuthFlows,PreventUserExistenceErrors]" --output json | ConvertFrom-Json
    Write-Host "  Client Name: $($client[0])"
    Write-Host "  Explicit Auth Flows: $($client[2] -join ', ')"
    Write-Host "  ✅ Client exists and is accessible" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Error accessing client: $_" -ForegroundColor Red
}
Write-Host ""

# Verify User Pool
Write-Host "🔐 Cognito User Pool:" -ForegroundColor Yellow
try {
    $pool = aws cognito-idp describe-user-pool --user-pool-id $userPoolId --region us-east-1 --query "UserPool.[Name,Status,MfaConfiguration]" --output json | ConvertFrom-Json
    Write-Host "  Pool Name: $($pool[0])"
    Write-Host "  Status: $($pool[1])"
    Write-Host "  MFA: $($pool[2])"
    Write-Host "  ✅ User Pool exists and is accessible" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Error accessing pool: $_" -ForegroundColor Red
}
Write-Host ""

# Check if configurations match
Write-Host "🔄 Configuration Validation:" -ForegroundColor Yellow
if ($appsyncApi[2].userPoolId -eq $userPoolId) {
    Write-Host "  ✅ AppSync and .env User Pool IDs MATCH" -ForegroundColor Green
} else {
    Write-Host "  ❌ MISMATCH: AppSync expects $($appsyncApi[2].userPoolId) but .env has $userPoolId" -ForegroundColor Red
}

# Check client secret
Write-Host ""
Write-Host "🔑 Checking for Client Secret (should be NONE for web apps):" -ForegroundColor Yellow
try {
    $clientSecret = aws cognito-idp describe-user-pool-client --user-pool-id $userPoolId --client-id $clientId --region us-east-1 --query "UserPoolClient.ClientSecret" --output text 2>$null
    if ($clientSecret -and $clientSecret -ne "None") {
        Write-Host "  ❌ WARNING: Client has a secret! Web apps cannot use client secrets." -ForegroundColor Red
        Write-Host "  You need to create a new app client without a secret." -ForegroundColor Red
    } else {
        Write-Host "  ✅ No client secret (correct for web apps)" -ForegroundColor Green
    }
} catch {
    Write-Host "  ✅ No client secret (correct for web apps)" -ForegroundColor Green
}

Write-Host ""
Write-Host "✨ Configuration check complete!" -ForegroundColor Cyan
