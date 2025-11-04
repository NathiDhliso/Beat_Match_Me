# Creating the Tracks DynamoDB Table

## Overview
The `getEventTracklist` query currently returns an empty array because the Tracks table doesn't exist yet. This document provides instructions for creating the table.

## Table Requirements

### Table Name
- Production: `beatmatchme-tracks`
- Development: `beatmatchme-tracks-dev`

### Primary Key
- **Partition Key:** `trackId` (String)

### Global Secondary Indexes (GSI)

#### 1. eventId-index
- **Partition Key:** `eventId` (String)
- **Sort Key:** `title` (String) - for alphabetical sorting
- **Projection:** ALL

#### 2. performerId-index (Optional)
- **Partition Key:** `performerId` (String)
- **Sort Key:** `createdAt` (Number)
- **Projection:** ALL

### Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| trackId | String | Yes | Primary key (e.g., "TRACK-1234567890-abc123") |
| eventId | String | Yes | FK to Event |
| performerId | String | Yes | FK to User (DJ) |
| title | String | Yes | Song title |
| artist | String | Yes | Artist name |
| genre | String | No | Music genre |
| albumArt | String | No | URL to album artwork |
| duration | Number | No | Duration in seconds |
| basePrice | Number | Yes | Base price for requesting (e.g., 20.00) |
| isEnabled | Boolean | Yes | Whether song is available for requests |
| createdAt | Number | Yes | Timestamp when added |
| updatedAt | Number | Yes | Timestamp when last updated |

## AWS CLI Commands

### Create Table (Development)

```bash
aws dynamodb create-table \
  --table-name beatmatchme-tracks-dev \
  --attribute-definitions \
    AttributeName=trackId,AttributeType=S \
    AttributeName=eventId,AttributeType=S \
    AttributeName=title,AttributeType=S \
  --key-schema \
    AttributeName=trackId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    "IndexName=eventId-index,\
     KeySchema=[{AttributeName=eventId,KeyType=HASH},{AttributeName=title,KeyType=RANGE}],\
     Projection={ProjectionType=ALL}" \
  --region us-east-1 \
  --tags \
    Key=Environment,Value=development \
    Key=Project,Value=BeatMatchMe
```

### Create Table (Production)

```bash
aws dynamodb create-table \
  --table-name beatmatchme-tracks \
  --attribute-definitions \
    AttributeName=trackId,AttributeType=S \
    AttributeName=eventId,AttributeType=S \
    AttributeName=title,AttributeType=S \
  --key-schema \
    AttributeName=trackId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --global-secondary-indexes \
    "IndexName=eventId-index,\
     KeySchema=[{AttributeName=eventId,KeyType=HASH},{AttributeName=title,KeyType=RANGE}],\
     Projection={ProjectionType=ALL}" \
  --region us-east-1 \
  --tags \
    Key=Environment,Value=production \
    Key=Project,Value=BeatMatchMe
```

## Create AppSync Data Source

After creating the table, create a data source in AppSync:

```bash
# Get the table ARN
TABLE_ARN=$(aws dynamodb describe-table \
  --table-name beatmatchme-tracks-dev \
  --region us-east-1 \
  --query 'Table.TableArn' \
  --output text)

# Create IAM role for AppSync (if not exists)
# ... role creation code ...

# Create data source
aws appsync create-data-source \
  --api-id h57lyr2p5bbaxnqckf2r4u7wo4 \
  --name TracksDataSource \
  --type AMAZON_DYNAMODB \
  --dynamodb-config "tableName=beatmatchme-tracks-dev,awsRegion=us-east-1" \
  --service-role-arn <YOUR_APPSYNC_ROLE_ARN> \
  --region us-east-1
```

## Update Resolvers

After creating the table and data source, update the resolvers:

### 1. Update Query.getEventTracklist.req.vtl

```vtl
## Query.getEventTracklist Request Mapping Template
## Fetches all songs available for a specific event

{
  "version": "2017-02-28",
  "operation": "Query",
  "index": "eventId-index",
  "query": {
    "expression": "eventId = :eventId",
    "expressionValues": {
      ":eventId": $util.dynamodb.toDynamoDBJson($ctx.args.eventId)
    }
  },
  "filter": {
    "expression": "isEnabled = :enabled",
    "expressionValues": {
      ":enabled": $util.dynamodb.toDynamoDBJson(true)
    }
  },
  "scanIndexForward": true
}
```

### 2. Update Query.getEventTracklist.res.vtl

```vtl
## Query.getEventTracklist Response Mapping Template
## Returns the list of tracks

$util.toJson($ctx.result.items)
```

### 3. Redeploy

```powershell
.\deploy-resolvers-only.ps1
```

## Sample Data

Here's sample data to test the table:

```json
{
  "trackId": "TRACK-1730736000-abc123",
  "eventId": "9dda6886-69f6-4c89-adf6-0686519ac8be",
  "performerId": "540824f8-0021-70ee-ead7-dccd9a91c4ce",
  "title": "Blinding Lights",
  "artist": "The Weeknd",
  "genre": "Pop",
  "albumArt": "https://example.com/album-art.jpg",
  "duration": 200,
  "basePrice": 20,
  "isEnabled": true,
  "createdAt": 1730736000000,
  "updatedAt": 1730736000000
}
```

### Insert Sample Data

```bash
aws dynamodb put-item \
  --table-name beatmatchme-tracks-dev \
  --item file://sample-track.json \
  --region us-east-1
```

## Terraform Alternative (Recommended)

Add to `terraform/dynamodb.tf`:

```hcl
resource "aws_dynamodb_table" "tracks" {
  name           = "beatmatchme-tracks-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "trackId"

  attribute {
    name = "trackId"
    type = "S"
  }

  attribute {
    name = "eventId"
    type = "S"
  }

  attribute {
    name = "title"
    type = "S"
  }

  global_secondary_index {
    name            = "eventId-index"
    hash_key        = "eventId"
    range_key       = "title"
    projection_type = "ALL"
  }

  tags = {
    Environment = var.environment
    Project     = "BeatMatchMe"
    Component   = "Tracks"
  }
}

output "tracks_table_name" {
  value = aws_dynamodb_table.tracks.name
}

output "tracks_table_arn" {
  value = aws_dynamodb_table.tracks.arn
}
```

Then apply:

```bash
cd terraform
terraform plan
terraform apply
```

## Verification

After setup:

1. **Test Query in AppSync Console:**
   ```graphql
   query TestTracklist {
     getEventTracklist(eventId: "9dda6886-69f6-4c89-adf6-0686519ac8be") {
       trackId
       title
       artist
       genre
       basePrice
     }
   }
   ```

2. **Check in Browser:**
   - Open DJ Portal
   - Check console - should see tracks loaded
   - No more "empty tracklist" warnings

3. **Verify Data:**
   ```bash
   aws dynamodb scan \
     --table-name beatmatchme-tracks-dev \
     --region us-east-1
   ```

## Next Steps

1. Create migration script to import existing tracklists
2. Add mutation for uploading tracklist
3. Implement track management UI in DJ Portal
4. Add search/filter functionality
5. Implement track enable/disable feature
