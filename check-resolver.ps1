# Check listActiveEvents resolver details

$apiId = "h57lyr2p5bbaxnqckf2r4u7wo4"
$region = "us-east-1"

Write-Host "🔍 Checking listActiveEvents resolver..." -ForegroundColor Cyan

$resolver = aws appsync get-resolver `
    --api-id $apiId `
    --type-name "Query" `
    --field-name "listActiveEvents" `
    --region $region | ConvertFrom-Json

Write-Host "`n📋 Resolver Details:" -ForegroundColor Green
Write-Host "Data Source: $($resolver.resolver.dataSourceName)" -ForegroundColor White
Write-Host "Kind: $($resolver.resolver.kind)" -ForegroundColor White

Write-Host "`n📝 Request Mapping Template:" -ForegroundColor Yellow
Write-Host $resolver.resolver.requestMappingTemplate -ForegroundColor Gray

Write-Host "`n📝 Response Mapping Template:" -ForegroundColor Yellow
Write-Host $resolver.resolver.responseMappingTemplate -ForegroundColor Gray

# Check the data source
Write-Host "`n📦 Checking Data Source..." -ForegroundColor Cyan
$dataSource = aws appsync get-data-source `
    --api-id $apiId `
    --name $resolver.resolver.dataSourceName `
    --region $region | ConvertFrom-Json

Write-Host "Type: $($dataSource.dataSource.type)" -ForegroundColor White
if ($dataSource.dataSource.dynamodbConfig) {
    Write-Host "Table: $($dataSource.dataSource.dynamodbConfig.tableName)" -ForegroundColor White
}
