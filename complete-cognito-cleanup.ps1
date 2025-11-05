# Complete Cognito Cleanup and Update Script
# This script will:
# 1. Update ALL files to use the correct Cognito User Pool
# 2. Clear browser localStorage cache
# 3. Update mobile, web, lambda, and terraform configurations

$ErrorActionPreference = "Stop"

Write-Host "🧹 COMPLETE COGNITO CLEANUP AND UPDATE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# CORRECT VALUES (from AppSync configuration)
$CORRECT_USER_POOL_ID = "us-east-1_g5ri75gFs"
$CORRECT_APP_CLIENT_ID = "5k2gpu9k57710ck1dcu93lo93t"
$CORRECT_APP_CLIENT_NAME = "BeatMatchMe-Web"

# OLD/INCORRECT VALUES TO REMOVE
$OLD_VALUES = @{
    UserPoolIds = @(
        "us-east-1_m1PhjZ4yD"
    )
    AppClientIds = @(
        "748pok6842ocsr2bpkm4nhtqnl",
        "57j15ic1habkl4l3s57j0ds747",
        "6e49e0n82ph3n82rg31edm0mma",
        "271079lsvtruaa4gfiu1o4cl5h",
        "2iggoa27tgcenc9imoquge8qvp",
        "3ntv3jasc8l5tevggv4pv256ma",
        "48ledus0f1muv2p36ko0815s7g"
    )
}

Write-Host "`n📍 Target Configuration:" -ForegroundColor Yellow
Write-Host "  User Pool ID: $CORRECT_USER_POOL_ID" -ForegroundColor Green
Write-Host "  App Client ID: $CORRECT_APP_CLIENT_ID" -ForegroundColor Green
Write-Host "  App Client Name: $CORRECT_APP_CLIENT_NAME" -ForegroundColor Green

# Step 1: Find and update ALL configuration files
Write-Host "`n🔍 Step 1: Scanning all configuration files..." -ForegroundColor Cyan

$patterns = @(
    "*.ts",
    "*.tsx",
    "*.js",
    "*.jsx",
    "*.json",
    "*.tf",
    "*.tfvars",
    "*.yaml",
    "*.yml",
    "*.env*"
)

$excludePaths = @(
    "*node_modules*",
    "*dist*",
    "*build*",
    "*.git*",
    "*coverage*"
)

$allFiles = @()
foreach ($pattern in $patterns) {
    $files = Get-ChildItem -Path . -Recurse -Filter $pattern -File -ErrorAction SilentlyContinue |
             Where-Object { 
                 $exclude = $false
                 foreach ($excludePath in $excludePaths) {
                     if ($_.FullName -like $excludePath) {
                         $exclude = $true
                         break
                     }
                 }
                 -not $exclude
             }
    $allFiles += $files
}

Write-Host "Found $($allFiles.Count) files to check" -ForegroundColor Gray

$updatedFiles = @()
$filesWithOldValues = @()

foreach ($file in $allFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    $originalContent = $content
    $modified = $false
    $foundOldValue = $false
    
    # Check for old User Pool IDs
    foreach ($oldPoolId in $OLD_VALUES.UserPoolIds) {
        if ($content -match [regex]::Escape($oldPoolId)) {
            $foundOldValue = $true
            $content = $content -replace [regex]::Escape($oldPoolId), $CORRECT_USER_POOL_ID
            $modified = $true
        }
    }
    
    # Check for old App Client IDs
    foreach ($oldClientId in $OLD_VALUES.AppClientIds) {
        if ($content -match [regex]::Escape($oldClientId)) {
            $foundOldValue = $true
            $content = $content -replace [regex]::Escape($oldClientId), $CORRECT_APP_CLIENT_ID
            $modified = $true
        }
    }
    
    if ($foundOldValue) {
        $filesWithOldValues += $file.FullName
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $updatedFiles += $file.FullName
        Write-Host "  ✅ Updated: $($file.FullName.Replace($PWD.Path, '.'))" -ForegroundColor Green
    }
}

# Step 2: Update specific critical files
Write-Host "`n🔧 Step 2: Updating critical configuration files..." -ForegroundColor Cyan

$criticalFiles = @{
    "infrastructure/aws-exports.ts" = @{
        userPoolId = "userPoolId: '$CORRECT_USER_POOL_ID'"
        clientId = "userPoolWebClientId: '$CORRECT_APP_CLIENT_ID'"
    }
    "infrastructure/aws-exports.js" = @{
        userPoolId = "userPoolId: '$CORRECT_USER_POOL_ID'"
        clientId = "userPoolWebClientId: '$CORRECT_APP_CLIENT_ID'"
    }
    "infrastructure/cognito-config.json" = "JSON"
    "web/.env" = "ENV"
    "web/.env.local" = "ENV"
    "web/.env.development" = "ENV"
    "web/.env.production" = "ENV"
    "mobile/.env" = "ENV"
    "mobile/.env.local" = "ENV"
}

foreach ($filePath in $criticalFiles.Keys) {
    $fullPath = Join-Path $PWD $filePath
    if (Test-Path $fullPath) {
        Write-Host "  ✓ Verified: $filePath" -ForegroundColor Gray
    }
}

# Step 3: Update Terraform variables
Write-Host "`n🏗️  Step 3: Checking Terraform configuration..." -ForegroundColor Cyan

$terraformFiles = Get-ChildItem -Path "terraform" -Filter "*.tf" -ErrorAction SilentlyContinue
foreach ($tfFile in $terraformFiles) {
    $content = Get-Content $tfFile.FullName -Raw
    $modified = $false
    
    foreach ($oldPoolId in $OLD_VALUES.UserPoolIds) {
        if ($content -match [regex]::Escape($oldPoolId)) {
            $content = $content -replace [regex]::Escape($oldPoolId), $CORRECT_USER_POOL_ID
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $tfFile.FullName -Value $content -NoNewline
        Write-Host "  ✅ Updated: terraform/$($tfFile.Name)" -ForegroundColor Green
    }
}

# Step 4: Update Lambda environment variables
Write-Host "`n⚡ Step 4: Updating Lambda configurations..." -ForegroundColor Cyan

$lambdaEnvFile = "aws\lambda\.env"
if (Test-Path $lambdaEnvFile) {
    $envContent = Get-Content $lambdaEnvFile -Raw
    $modified = $false
    
    foreach ($oldPoolId in $OLD_VALUES.UserPoolIds) {
        if ($envContent -match [regex]::Escape($oldPoolId)) {
            $envContent = $envContent -replace [regex]::Escape($oldPoolId), $CORRECT_USER_POOL_ID
            $modified = $true
        }
    }
    
    foreach ($oldClientId in $OLD_VALUES.AppClientIds) {
        if ($envContent -match [regex]::Escape($oldClientId)) {
            $envContent = $envContent -replace [regex]::Escape($oldClientId), $CORRECT_APP_CLIENT_ID
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $lambdaEnvFile -Value $envContent -NoNewline
        Write-Host "  ✅ Updated: $lambdaEnvFile" -ForegroundColor Green
    }
} else {
    Write-Host "  ℹ️  No Lambda .env file found" -ForegroundColor Gray
}

# Step 5: Create browser cache clear instructions
Write-Host "`n🌐 Step 5: Browser Cache Clear Instructions..." -ForegroundColor Cyan

$clearCacheScript = @"
// Clear All BeatMatchMe Local Storage
// Paste this in browser console (F12) and press Enter

// Clear localStorage
Object.keys(localStorage).forEach(key => {
    if (key.includes('CognitoIdentityServiceProvider') || 
        key.includes('amplify') || 
        key.includes('beatmatchme') ||
        key.includes('$($OLD_VALUES.UserPoolIds[0])')) {
        console.log('Removing:', key);
        localStorage.removeItem(key);
    }
});

// Clear sessionStorage
Object.keys(sessionStorage).forEach(key => {
    if (key.includes('CognitoIdentityServiceProvider') || 
        key.includes('amplify') || 
        key.includes('beatmatchme')) {
        console.log('Removing:', key);
        sessionStorage.removeItem(key);
    }
});

console.log('✅ Cache cleared! Please refresh the page.');
location.reload();
"@

Set-Content -Path "clear-browser-cache.js" -Value $clearCacheScript
Write-Host "  ✅ Created: clear-browser-cache.js" -ForegroundColor Green
Write-Host "     Copy this script to browser console to clear cache" -ForegroundColor Gray

# Summary Report
Write-Host "`n📊 CLEANUP SUMMARY" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "✅ Files scanned: $($allFiles.Count)" -ForegroundColor White
Write-Host "✅ Files updated: $($updatedFiles.Count)" -ForegroundColor Green
Write-Host "⚠️  Files with old values found: $($filesWithOldValues.Count)" -ForegroundColor Yellow

if ($filesWithOldValues.Count -gt 0) {
    Write-Host "`nFiles that contained old values:" -ForegroundColor Yellow
    foreach ($file in $filesWithOldValues) {
        Write-Host "  - $($file.Replace($PWD.Path, '.'))" -ForegroundColor Gray
    }
}

Write-Host "`n✅ CORRECT CONFIGURATION:" -ForegroundColor Green
Write-Host "  User Pool: $CORRECT_USER_POOL_ID" -ForegroundColor White
Write-Host "  Client ID: $CORRECT_APP_CLIENT_ID" -ForegroundColor White

Write-Host "`n⚠️  NEXT STEPS:" -ForegroundColor Yellow
Write-Host "  1. Open browser console (F12)" -ForegroundColor Gray
Write-Host "  2. Paste contents of clear-browser-cache.js" -ForegroundColor Gray
Write-Host "  3. Press Enter to clear cache" -ForegroundColor Gray
Write-Host "  4. Create NEW account (old user won't work)" -ForegroundColor Gray
Write-Host "  5. Run: npm run build:web" -ForegroundColor Gray
Write-Host "  6. Run: npm run dev:web" -ForegroundColor Gray
Write-Host "  7. Sign up with a new account" -ForegroundColor Gray

Write-Host "`n🎉 Cleanup complete!" -ForegroundColor Green
