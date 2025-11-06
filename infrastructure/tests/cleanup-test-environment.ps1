# BeatMatchMe - Cleanup Test Environment
# Removes all test AWS resources

param(
    [string]$Region = "us-east-1",
    [string]$StackName = "beatmatchme-test-stack"
)

$ErrorActionPreference = "Stop"

Write-Host "🗑️  Cleaning up BeatMatchMe test environment..." -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "This will DELETE all test data and resources. Continue? (y/n)"
if ($confirmation -ne 'y') {
    Write-Host "Cleanup cancelled" -ForegroundColor Gray
    exit
}

# Delete CloudFormation stack
Write-Host "🔥 Deleting CloudFormation stack..." -ForegroundColor Red

aws cloudformation delete-stack --stack-name $StackName --region $Region

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to initiate stack deletion" -ForegroundColor Red
    exit 1
}

Write-Host "⏳ Waiting for stack deletion (this takes 2-3 minutes)..." -ForegroundColor Cyan
aws cloudformation wait stack-delete-complete --stack-name $StackName --region $Region

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Test environment deleted successfully!" -ForegroundColor Green
    
    # Remove .env.test file
    if (Test-Path ".env.test") {
        Remove-Item ".env.test"
        Write-Host "✅ Removed .env.test file" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  Stack deletion may have failed. Check AWS Console for details." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "💡 To recreate the test environment, run:" -ForegroundColor Cyan
Write-Host "   .\setup-test-environment.ps1" -ForegroundColor Gray
