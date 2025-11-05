# Fix Cognito Configuration - Update all files to use correct User Pool
# The correct User Pool that AppSync is configured with: us-east-1_g5ri75gFs

$ErrorActionPreference = "Stop"

# Define the correct values
$CORRECT_USER_POOL_ID = "us-east-1_g5ri75gFs"
$CORRECT_APP_CLIENT_ID = "5k2gpu9k57710ck1dcu93lo93t"  # Using "BeatMatchMe-Web" client

# Old incorrect values to replace
$OLD_USER_POOL_IDS = @(
    "us-east-1_m1PhjZ4yD"
)

$OLD_APP_CLIENT_IDS = @(
    "748pok6842ocsr2bpkm4nhtqnl",
    "57j15ic1habkl4l3s57j0ds747",
    "6e49e0n82ph3n82rg31edm0mma",
    "271079lsvtruaa4gfiu1o4cl5h",
    "2iggoa27tgcenc9imoquge8qvp",
    "3ntv3jasc8l5tevggv4pv256ma",
    "48ledus0f1muv2p36ko0815s7g"
)

Write-Host "🔍 Scanning for files with Cognito configuration..." -ForegroundColor Cyan

# Find all relevant files
$files = @(
    "infrastructure\aws-exports.ts",
    "infrastructure\aws-exports.js",
    "infrastructure\cognito-config.json",
    "web\src\services\api.ts",
    "mobile\src\services\api.ts",
    "aws\lambda\*.js",
    "terraform\cognito.tf",
    "terraform\variables.tf"
)

$updatedFiles = @()

foreach ($pattern in $files) {
    $matchedFiles = Get-ChildItem -Path . -Recurse -Filter ($pattern.Split('\')[-1]) -ErrorAction SilentlyContinue | 
                    Where-Object { $_.FullName -like "*$($pattern.Replace('\', '*'))*" }
    
    foreach ($file in $matchedFiles) {
        Write-Host "📄 Checking: $($file.FullName)" -ForegroundColor Yellow
        
        $content = Get-Content $file.FullName -Raw
        $originalContent = $content
        $modified = $false
        
        # Replace old User Pool IDs
        foreach ($oldPoolId in $OLD_USER_POOL_IDS) {
            if ($content -match $oldPoolId) {
                Write-Host "  ✏️  Replacing User Pool ID: $oldPoolId → $CORRECT_USER_POOL_ID" -ForegroundColor Green
                $content = $content -replace [regex]::Escape($oldPoolId), $CORRECT_USER_POOL_ID
                $modified = $true
            }
        }
        
        # Replace old App Client IDs
        foreach ($oldClientId in $OLD_APP_CLIENT_IDS) {
            if ($content -match $oldClientId) {
                Write-Host "  ✏️  Replacing App Client ID: $oldClientId → $CORRECT_APP_CLIENT_ID" -ForegroundColor Green
                $content = $content -replace [regex]::Escape($oldClientId), $CORRECT_APP_CLIENT_ID
                $modified = $true
            }
        }
        
        if ($modified) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            $updatedFiles += $file.FullName
            Write-Host "  ✅ Updated successfully!" -ForegroundColor Green
        } else {
            Write-Host "  ℹ️  No changes needed" -ForegroundColor Gray
        }
    }
}

Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Correct User Pool ID: $CORRECT_USER_POOL_ID" -ForegroundColor Green
Write-Host "Correct App Client ID: $CORRECT_APP_CLIENT_ID" -ForegroundColor Green
Write-Host "Files updated: $($updatedFiles.Count)" -ForegroundColor Yellow

if ($updatedFiles.Count -gt 0) {
    Write-Host "`nUpdated files:" -ForegroundColor Yellow
    foreach ($file in $updatedFiles) {
        Write-Host "  - $file" -ForegroundColor Gray
    }
}

Write-Host "`n✅ Configuration fix complete!" -ForegroundColor Green
Write-Host "⚠️  Next steps:" -ForegroundColor Yellow
Write-Host "  1. Run: npm run build:web" -ForegroundColor Gray
Write-Host "  2. Test login with the correct User Pool" -ForegroundColor Gray
Write-Host "  3. Verify AppSync queries work" -ForegroundColor Gray
