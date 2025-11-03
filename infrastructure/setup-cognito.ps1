# Setup Amazon Cognito User Pools for BeatMatchMe
$ErrorActionPreference = "Stop"
$region = "us-east-1"

Write-Host "Setting up Amazon Cognito User Pools..." -ForegroundColor Green

# Create User Pool
Write-Host "`nCreating Cognito User Pool..." -ForegroundColor Yellow

$userPoolConfig = @"
{
    "PoolName": "beatmatchme-users",
    "Policies": {
        "PasswordPolicy": {
            "MinimumLength": 8,
            "RequireUppercase": true,
            "RequireLowercase": true,
            "RequireNumbers": true,
            "RequireSymbols": true
        }
    },
    "AutoVerifiedAttributes": ["email"],
    "UsernameAttributes": ["email"],
    "MfaConfiguration": "OFF",
    "EmailConfiguration": {
        "EmailSendingAccount": "COGNITO_DEFAULT"
    },
    "Schema": [
        {
            "Name": "email",
            "AttributeDataType": "String",
            "Required": true,
            "Mutable": true
        },
        {
            "Name": "name",
            "AttributeDataType": "String",
            "Required": true,
            "Mutable": true
        },
        {
            "Name": "role",
            "AttributeDataType": "String",
            "Mutable": true,
            "DeveloperOnlyAttribute": false
        }
    ],
    "UserAttributeUpdateSettings": {
        "AttributesRequireVerificationBeforeUpdate": ["email"]
    }
}
"@

$userPoolConfig | Out-File -FilePath "user-pool-config.json" -Encoding utf8

$userPoolResult = aws cognito-idp create-user-pool --cli-input-json file://user-pool-config.json --region $region 2>&1

if ($LASTEXITCODE -eq 0) {
    $userPoolId = ($userPoolResult | ConvertFrom-Json).UserPool.Id
    Write-Host "✓ User Pool created: $userPoolId" -ForegroundColor Green
    
    # Create User Groups
    Write-Host "`nCreating user groups..." -ForegroundColor Yellow
    
    # Performers group
    aws cognito-idp create-group `
        --group-name performers `
        --user-pool-id $userPoolId `
        --description "DJ and performer accounts" `
        --region $region 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 'performers' group created" -ForegroundColor Green
    }
    
    # Audience group
    aws cognito-idp create-group `
        --group-name audience `
        --user-pool-id $userPoolId `
        --description "Audience member accounts" `
        --region $region 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 'audience' group created" -ForegroundColor Green
    }
    
    # Create App Client
    Write-Host "`nCreating app client..." -ForegroundColor Yellow
    
    $appClientResult = aws cognito-idp create-user-pool-client `
        --user-pool-id $userPoolId `
        --client-name "beatmatchme-app" `
        --generate-secret `
        --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH ALLOW_USER_SRP_AUTH `
        --read-attributes "email" "name" "custom:role" `
        --write-attributes "email" "name" "custom:role" `
        --refresh-token-validity 30 `
        --access-token-validity 60 `
        --id-token-validity 60 `
        --token-validity-units AccessToken=minutes,IdToken=minutes,RefreshToken=days `
        --region $region 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $appClientId = ($appClientResult | ConvertFrom-Json).UserPoolClient.ClientId
        Write-Host "✓ App client created: $appClientId" -ForegroundColor Green
    }
    
    # Save configuration
    $config = @{
        UserPoolId = $userPoolId
        AppClientId = $appClientId
        Region = $region
    }
    
    $config | ConvertTo-Json | Out-File -FilePath "infrastructure/cognito-config.json" -Encoding utf8
    
    Write-Host "`nCognito configuration saved to infrastructure/cognito-config.json" -ForegroundColor Cyan
    Write-Host "User Pool ID: $userPoolId" -ForegroundColor Cyan
    Write-Host "App Client ID: $appClientId" -ForegroundColor Cyan
    
} else {
    Write-Host "✗ Failed to create User Pool" -ForegroundColor Red
    Write-Host $userPoolResult -ForegroundColor Red
}

Remove-Item "user-pool-config.json" -ErrorAction SilentlyContinue

Write-Host "`nCognito setup completed!" -ForegroundColor Green
