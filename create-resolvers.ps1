# Create AppSync Resolvers for BeatMatchMe
# Automates resolver creation for all mutations and queries

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiId,
    [string]$Region = "us-east-1",
    [string]$Environment = "dev"
)

Write-Host "🔧 Creating AppSync Resolvers" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "API ID: $ApiId" -ForegroundColor White
Write-Host "Region: $Region" -ForegroundColor White
Write-Host ""

# Get IAM role ARN
$roleName = "AppSyncDynamoDBRole-$Environment"
try {
    $roleArn = (aws iam get-role --role-name $roleName --query 'Role.Arn' --output text)
    Write-Host "✅ Found IAM Role: $roleArn" -ForegroundColor Green
} catch {
    Write-Host "❌ IAM Role not found. Run deploy-backend.ps1 first" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Table names
$eventsTable = "beatmatchme-events-$Environment"
$songsTable = "beatmatchme-songs-$Environment"
$requestsTable = "beatmatchme-requests-$Environment"

# Function to create data source
function Create-DataSource {
    param($Name, $TableName)
    
    Write-Host "   Creating data source: $Name..." -ForegroundColor Yellow
    
    try {
        aws appsync create-data-source `
            --api-id $ApiId `
            --name $Name `
            --type AMAZON_DYNAMODB `
            --dynamodb-config "tableName=$TableName,awsRegion=$Region" `
            --service-role-arn $roleArn `
            --region $Region | Out-Null
        
        Write-Host "   ✅ Created data source: $Name" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Data source may already exist" -ForegroundColor Yellow
    }
}

# Function to create resolver
function Create-Resolver {
    param(
        $TypeName,
        $FieldName,
        $DataSourceName,
        $RequestTemplate,
        $ResponseTemplate
    )
    
    Write-Host "   Creating resolver: $TypeName.$FieldName..." -ForegroundColor Yellow
    
    # Save templates to temp files
    $RequestTemplate | Out-File -FilePath "temp-request.vtl" -Encoding UTF8 -NoNewline
    $ResponseTemplate | Out-File -FilePath "temp-response.vtl" -Encoding UTF8 -NoNewline
    
    try {
        aws appsync create-resolver `
            --api-id $ApiId `
            --type-name $TypeName `
            --field-name $FieldName `
            --data-source-name $DataSourceName `
            --request-mapping-template file://temp-request.vtl `
            --response-mapping-template file://temp-response.vtl `
            --region $Region | Out-Null
        
        Write-Host "   ✅ Created resolver: $TypeName.$FieldName" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Resolver may already exist" -ForegroundColor Yellow
    }
    
    # Cleanup
    Remove-Item "temp-request.vtl", "temp-response.vtl" -ErrorAction SilentlyContinue
}

# Step 1: Create Data Sources
Write-Host "📦 Step 1: Creating Data Sources..." -ForegroundColor Cyan
Create-DataSource "EventsDataSource" $eventsTable
Create-DataSource "SongsDataSource" $songsTable
Create-DataSource "RequestsDataSource" $requestsTable
Write-Host ""

# Step 2: Create Mutation Resolvers
Write-Host "🔨 Step 2: Creating Mutation Resolvers..." -ForegroundColor Cyan

# createEvent resolver
$createEventRequest = @"
#set(`$performerId = `$ctx.identity.sub)
#set(`$eventId = `$util.autoId())
#set(`$timestamp = `$util.time.nowEpochMilliSeconds())

## Check if user has PERFORMER role
#if(`$ctx.identity.claims.get("custom:role") != "PERFORMER")
  `$util.unauthorized()
#end

{
  "version": "2017-02-28",
  "operation": "PutItem",
  "key": {
    "eventId": `$util.dynamodb.toDynamoDBJson(`$eventId)
  },
  "attributeValues": {
    "performerId": `$util.dynamodb.toDynamoDBJson(`$performerId),
    "venueName": `$util.dynamodb.toDynamoDBJson(`$ctx.args.input.venueName),
    "startTime": `$util.dynamodb.toDynamoDBJson(`$ctx.args.input.startTime),
    "endTime": `$util.dynamodb.toDynamoDBJson(`$ctx.args.input.endTime),
    "status": `$util.dynamodb.toDynamoDBJson(`$ctx.args.input.status),
    "qrCode": `$util.dynamodb.toDynamoDBJson("beatmatchme://event/`${eventId}"),
    "createdAt": `$util.dynamodb.toDynamoDBJson(`$timestamp),
    "updatedAt": `$util.dynamodb.toDynamoDBJson(`$timestamp)
  }
}
"@

$standardResponse = '$util.toJson($ctx.result)'

Create-Resolver "Mutation" "createEvent" "EventsDataSource" $createEventRequest $standardResponse

# updateEventStatus resolver
$updateEventStatusRequest = @"
{
  "version": "2017-02-28",
  "operation": "UpdateItem",
  "key": {
    "eventId": `$util.dynamodb.toDynamoDBJson(`$ctx.args.eventId)
  },
  "update": {
    "expression": "SET #status = :status, updatedAt = :timestamp",
    "expressionNames": {
      "#status": "status"
    },
    "expressionValues": {
      ":status": `$util.dynamodb.toDynamoDBJson(`$ctx.args.status),
      ":timestamp": `$util.dynamodb.toDynamoDBJson(`$util.time.nowEpochMilliSeconds())
    }
  }
}
"@

Create-Resolver "Mutation" "updateEventStatus" "EventsDataSource" $updateEventStatusRequest $standardResponse

# updateEventSettings resolver
$updateEventSettingsRequest = @"
{
  "version": "2017-02-28",
  "operation": "UpdateItem",
  "key": {
    "eventId": `$util.dynamodb.toDynamoDBJson(`$ctx.args.eventId)
  },
  "update": {
    "expression": "SET settings = :settings, updatedAt = :timestamp",
    "expressionValues": {
      ":settings": `$util.dynamodb.toDynamoDBJson(`$ctx.args.settings),
      ":timestamp": `$util.dynamodb.toDynamoDBJson(`$util.time.nowEpochMilliSeconds())
    }
  }
}
"@

Create-Resolver "Mutation" "updateEventSettings" "EventsDataSource" $updateEventSettingsRequest $standardResponse

# uploadTracklist resolver
$uploadTracklistRequest = @"
#set(`$performerId = `$ctx.args.performerId)
#set(`$songs = `$ctx.args.songs)
#set(`$timestamp = `$util.time.nowEpochMilliSeconds())

## Batch write songs
{
  "version": "2017-02-28",
  "operation": "BatchPutItem",
  "tables": {
    "$songsTable": [
      #foreach(`$song in `$songs)
      {
        "songId": `$util.dynamodb.toDynamoDBJson(`$util.autoId()),
        "performerId": `$util.dynamodb.toDynamoDBJson(`$performerId),
        "title": `$util.dynamodb.toDynamoDBJson(`$song.title),
        "artist": `$util.dynamodb.toDynamoDBJson(`$song.artist),
        "genre": `$util.dynamodb.toDynamoDBJson(`$song.genre),
        "basePrice": `$util.dynamodb.toDynamoDBJson(`$song.basePrice),
        "isEnabled": `$util.dynamodb.toDynamoDBJson(true),
        "createdAt": `$util.dynamodb.toDynamoDBJson(`$timestamp),
        "updatedAt": `$util.dynamodb.toDynamoDBJson(`$timestamp)
      }#if(`$foreach.hasNext),#end
      #end
    ]
  }
}
"@

$uploadTracklistResponse = @"
{
  "success": true,
  "songsAdded": `$ctx.args.songs.size(),
  "message": "Successfully added `$ctx.args.songs.size() songs"
}
"@

Create-Resolver "Mutation" "uploadTracklist" "SongsDataSource" $uploadTracklistRequest $uploadTracklistResponse

Write-Host ""

# Step 3: Create Query Resolvers
Write-Host "🔍 Step 3: Creating Query Resolvers..." -ForegroundColor Cyan

# getEvent resolver
$getEventRequest = @"
{
  "version": "2017-02-28",
  "operation": "GetItem",
  "key": {
    "eventId": `$util.dynamodb.toDynamoDBJson(`$ctx.args.eventId)
  }
}
"@

Create-Resolver "Query" "getEvent" "EventsDataSource" $getEventRequest $standardResponse

# listActiveEvents resolver
$listActiveEventsRequest = @"
{
  "version": "2017-02-28",
  "operation": "Scan",
  "filter": {
    "expression": "#status = :status",
    "expressionNames": {
      "#status": "status"
    },
    "expressionValues": {
      ":status": `$util.dynamodb.toDynamoDBJson("ACTIVE")
    }
  }
}
"@

$listResponse = '$util.toJson($ctx.result.items)'

Create-Resolver "Query" "listActiveEvents" "EventsDataSource" $listActiveEventsRequest $listResponse

# listSongsByPerformer resolver
$listSongsByPerformerRequest = @"
{
  "version": "2017-02-28",
  "operation": "Query",
  "index": "PerformerIndex",
  "query": {
    "expression": "performerId = :performerId",
    "expressionValues": {
      ":performerId": `$util.dynamodb.toDynamoDBJson(`$ctx.args.performerId)
    }
  }
}
"@

Create-Resolver "Query" "listSongsByPerformer" "SongsDataSource" $listSongsByPerformerRequest $listResponse

Write-Host ""

# Summary
Write-Host "=" -ForegroundColor Cyan -NoNewline
Write-Host "=============================" -ForegroundColor Cyan
Write-Host "✅ Resolvers Created!" -ForegroundColor Green
Write-Host "=" -ForegroundColor Cyan -NoNewline
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Test mutations in AppSync console" -ForegroundColor White
Write-Host "   2. Run the frontend application" -ForegroundColor White
Write-Host "   3. Monitor CloudWatch logs" -ForegroundColor White
Write-Host ""
