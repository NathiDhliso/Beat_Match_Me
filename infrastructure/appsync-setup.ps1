# AppSync API Setup Script
# Creates AppSync API and attaches resolvers

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('dev','staging','production')]
    [string]$Environment
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Setting up AppSync API for $Environment" -ForegroundColor Cyan

# Variables
$projectName = "beatmatchme"
$apiName = "$projectName-$Environment-api"
$schemaFile = "schema.graphql"
$resolversDir = "resolvers"

# Create AppSync API
Write-Host "`n📦 Creating AppSync API..." -ForegroundColor Yellow

$apiId = aws appsync create-graphql-api `
  --name $apiName `
  --authentication-type AMAZON_COGNITO_USER_POOLS `
  --user-pool-config "{ `"userPoolId`": `"REPLACE_WITH_USER_POOL_ID`", `"awsRegion`": `"us-east-1`", `"defaultAction`": `"ALLOW`" }" `
  --query 'graphqlApi.apiId' `
  --output text

Write-Host "✅ API Created: $apiId" -ForegroundColor Green

# Upload Schema
Write-Host "`n📝 Uploading GraphQL schema..." -ForegroundColor Yellow

aws appsync start-schema-creation `
  --api-id $apiId `
  --definition file://$schemaFile

Write-Host "✅ Schema uploaded" -ForegroundColor Green

# Create Data Source for each Lambda
Write-Host "`n🔌 Creating Lambda data sources..." -ForegroundColor Yellow

$lambdas = @(
    "createRequest",
    "upvoteRequest",
    "reorderQueue",
    "vetoRequest",
    "createEvent",
    "updateEventStatus",
    "createGroupRequest",
    "contributeToGroupRequest"
)

foreach ($lambda in $lambdas) {
    Write-Host "  Creating data source for $lambda..." -ForegroundColor Gray
    
    aws appsync create-data-source `
      --api-id $apiId `
      --name "${lambda}DataSource" `
      --type AWS_LAMBDA `
      --lambda-config "{ `"lambdaFunctionArn`": `"arn:aws:lambda:us-east-1:ACCOUNT_ID:function:$projectName-$Environment-$lambda`" }" `
      --service-role-arn "arn:aws:iam::ACCOUNT_ID:role/AppSyncServiceRole"
}

Write-Host "✅ Data sources created" -ForegroundColor Green

# Attach Resolvers
Write-Host "`n🔗 Attaching resolvers..." -ForegroundColor Yellow

$resolvers = @{
    "Mutation.createRequest" = "createRequestDataSource"
    "Mutation.upvoteRequest" = "upvoteRequestDataSource"
    "Mutation.reorderQueue" = "reorderQueueDataSource"
    "Mutation.vetoRequest" = "vetoRequestDataSource"
    "Mutation.createEvent" = "createEventDataSource"
    "Mutation.updateEventStatus" = "updateEventStatusDataSource"
    "Mutation.createGroupRequest" = "createGroupRequestDataSource"
    "Mutation.contributeToGroupRequest" = "contributeToGroupRequestDataSource"
}

foreach ($resolver in $resolvers.GetEnumerator()) {
    $parts = $resolver.Key -split '\.'
    $typeName = $parts[0]
    $fieldName = $parts[1]
    
    Write-Host "  Creating resolver for $($resolver.Key)..." -ForegroundColor Gray
    
    aws appsync create-resolver `
      --api-id $apiId `
      --type-name $typeName `
      --field-name $fieldName `
      --data-source-name $resolver.Value `
      --request-mapping-template file://$resolversDir/$($resolver.Key).req.vtl `
      --response-mapping-template file://$resolversDir/$($resolver.Key).res.vtl
}

Write-Host "✅ Resolvers attached" -ForegroundColor Green

# Get API URL
$apiUrl = aws appsync get-graphql-api `
  --api-id $apiId `
  --query 'graphqlApi.uris.GRAPHQL' `
  --output text

Write-Host "`n✅ AppSync API Setup Complete!" -ForegroundColor Green
Write-Host "`n📋 API Details:" -ForegroundColor Cyan
Write-Host "  API ID: $apiId"
Write-Host "  GraphQL URL: $apiUrl"
Write-Host "`n⚙️  Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update VITE_APPSYNC_ENDPOINT in web/.env with: $apiUrl"
Write-Host "2. Update EXPO_PUBLIC_APPSYNC_ENDPOINT in mobile/.env with: $apiUrl"
Write-Host "3. Test GraphQL queries"
