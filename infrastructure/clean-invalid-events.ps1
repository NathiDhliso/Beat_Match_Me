# Clean Invalid Events from DynamoDB
# This script removes events with missing required fields

Write-Host "🧹 Cleaning invalid events from DynamoDB..." -ForegroundColor Cyan

$tableName = "beatmatchme-events"
$region = "us-east-1"

Write-Host "`n📊 Scanning for events with NULL required fields..." -ForegroundColor Yellow

# Scan for all events
$scanResult = aws dynamodb scan `
    --table-name $tableName `
    --region $region `
    --output json | ConvertFrom-Json

$events = $scanResult.Items
Write-Host "Found $($events.Count) total events" -ForegroundColor Gray

# Filter events with missing required fields
$invalidEvents = $events | Where-Object {
    $_.createdBy -eq $null -or 
    $_.createdBy.S -eq $null -or
    $_.venueName -eq $null -or
    $_.venueName.S -eq $null -or
    $_.startTime -eq $null -or
    $_.endTime -eq $null
}

if ($invalidEvents.Count -eq 0) {
    Write-Host "✅ No invalid events found! Database is clean." -ForegroundColor Green
    exit 0
}

Write-Host "❌ Found $($invalidEvents.Count) invalid events" -ForegroundColor Red
Write-Host "`nInvalid Events:" -ForegroundColor Yellow

$invalidEvents | ForEach-Object {
    $eventId = $_.eventId.S
    $venueName = if ($_.venueName.S) { $_.venueName.S } else { "NULL" }
    $createdBy = if ($_.createdBy.S) { $_.createdBy.S } else { "NULL" }
    
    Write-Host "  - Event ID: $eventId" -ForegroundColor Gray
    Write-Host "    Venue: $venueName" -ForegroundColor Gray
    Write-Host "    CreatedBy: $createdBy" -ForegroundColor Gray
}

Write-Host "`n⚠️  Do you want to DELETE these invalid events? (Y/N): " -ForegroundColor Yellow -NoNewline
$confirm = Read-Host

if ($confirm -ne 'Y' -and $confirm -ne 'y') {
    Write-Host "❌ Cancelled. No events were deleted." -ForegroundColor Red
    exit 0
}

Write-Host "`n🗑️  Deleting invalid events..." -ForegroundColor Cyan

$deleted = 0
foreach ($item in $invalidEvents) {
    $eventId = $item.eventId.S
    
    try {
        aws dynamodb delete-item `
            --table-name $tableName `
            --key "{\"eventId\": {\"S\": \"$eventId\"}}" `
            --region $region `
            --output json | Out-Null
        
        Write-Host "  ✅ Deleted event: $eventId" -ForegroundColor Green
        $deleted++
    } catch {
        Write-Host "  ❌ Failed to delete event: $eventId" -ForegroundColor Red
        Write-Host "     Error: $_" -ForegroundColor Red
    }
}

Write-Host "`n✅ Deleted $deleted invalid events" -ForegroundColor Green
Write-Host "🎉 Database cleaned successfully!" -ForegroundColor Cyan
