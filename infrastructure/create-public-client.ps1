# Create Public Cognito App Client (No Secret)
# This creates a new app client without a client secret for mobile/web apps

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Create Public Cognito App Client" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$userPoolId = "us-east-1_m1PhjZ4yD"
$region = "us-east-1"
$clientName = "beatmatchme-public-client"

Write-Host "User Pool ID: $userPoolId" -ForegroundColor Yellow
Write-Host "Region: $region" -ForegroundColor Yellow
Write-Host "Client Name: $clientName" -ForegroundColor Yellow
Write-Host ""

# Create App Client WITHOUT secret
Write-Host "Creating public app client (no secret)..." -ForegroundColor Yellow

$appClientResult = aws cognito-idp create-user-pool-client `
    --user-pool-id $userPoolId `
    --client-name $clientName `
    --no-generate-secret `
    --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH ALLOW_USER_SRP_AUTH `
    --read-attributes "email" "name" `
    --write-attributes "email" "name" `
    --refresh-token-validity 30 `
    --access-token-validity 60 `
    --id-token-validity 60 `
    --token-validity-units AccessToken=minutes,IdToken=minutes,RefreshToken=days `
    --region $region 2>&1

if ($LASTEXITCODE -eq 0) {
    $appClient = $appClientResult | ConvertFrom-Json
    $appClientId = $appClient.UserPoolClient.ClientId
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ SUCCESS!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "New App Client ID: $appClientId" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Update web/.env:" -ForegroundColor White
    Write-Host "   VITE_USER_POOL_CLIENT_ID=$appClientId" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Update mobile/.env:" -ForegroundColor White
    Write-Host "   EXPO_PUBLIC_USER_POOL_CLIENT_ID=$appClientId" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "3. Restart both apps" -ForegroundColor White
    Write-Host ""
    
    # Optionally update .env files automatically
    $updateFiles = Read-Host "Update .env files automatically? (y/n)"
    
    if ($updateFiles -eq "y" -or $updateFiles -eq "Y") {
        # Update web/.env
        if (Test-Path "web/.env") {
            Write-Host "Updating web/.env..." -ForegroundColor Yellow
            $webEnv = Get-Content "web/.env" -Raw
            $webEnv = $webEnv -replace 'VITE_USER_POOL_CLIENT_ID=.*', "VITE_USER_POOL_CLIENT_ID=$appClientId"
            Set-Content "web/.env" $webEnv
            Write-Host "✓ Updated web/.env" -ForegroundColor Green
        }
        
        # Update mobile/.env
        if (Test-Path "mobile/.env") {
            Write-Host "Updating mobile/.env..." -ForegroundColor Yellow
            $mobileEnv = Get-Content "mobile/.env" -Raw
            $mobileEnv = $mobileEnv -replace 'EXPO_PUBLIC_USER_POOL_CLIENT_ID=.*', "EXPO_PUBLIC_USER_POOL_CLIENT_ID=$appClientId"
            Set-Content "mobile/.env" $mobileEnv
            Write-Host "✓ Updated mobile/.env" -ForegroundColor Green
        }
        
        Write-Host ""
        Write-Host "✓ .env files updated!" -ForegroundColor Green
        Write-Host "Now restart your apps:" -ForegroundColor Yellow
        Write-Host "  Web: cd web && npm run dev" -ForegroundColor Cyan
        Write-Host "  Mobile: cd mobile && npm start -- --clear" -ForegroundColor Cyan
    }
    
} else {
    Write-Host ""
    Write-Host "✗ Failed to create app client" -ForegroundColor Red
    Write-Host "Error: $appClientResult" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try creating manually in AWS Console:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://console.aws.amazon.com/cognito/" -ForegroundColor White
    Write-Host "2. Select region: us-east-1" -ForegroundColor White
    Write-Host "3. Select user pool: beatmatchme-users" -ForegroundColor White
    Write-Host "4. Go to App integration > App clients" -ForegroundColor White
    Write-Host "5. Create new app client (Public, no secret)" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Done!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
