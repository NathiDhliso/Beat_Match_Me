/**
 * Terraform Outputs
 */

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.main.id
}

output "cognito_user_pool_client_id" {
  description = "Cognito User Pool Client ID"
  value       = aws_cognito_user_pool_client.web.id
}

output "cognito_identity_pool_id" {
  description = "Cognito Identity Pool ID"
  value       = aws_cognito_identity_pool.main.id
}

output "s3_assets_bucket" {
  description = "S3 Assets Bucket Name"
  value       = aws_s3_bucket.assets.id
}

output "s3_web_bucket" {
  description = "S3 Web Bucket Name"
  value       = aws_s3_bucket.web.id
}

output "s3_web_url" {
  description = "S3 Website URL"
  value       = aws_s3_bucket_website_configuration.web.website_endpoint
}

output "dynamodb_tables" {
  description = "DynamoDB Table Names"
  value = {
    users          = aws_dynamodb_table.users.name
    events         = aws_dynamodb_table.events.name
    requests       = aws_dynamodb_table.requests.name
    queues         = aws_dynamodb_table.queues.name
    transactions   = aws_dynamodb_table.transactions.name
    achievements   = aws_dynamodb_table.achievements.name
    group_requests = aws_dynamodb_table.group_requests.name
    upvotes        = aws_dynamodb_table.upvotes.name
  }
}

output "lambda_functions" {
  description = "Lambda Function Names"
  value       = { for k, v in aws_lambda_function.functions : k => v.function_name }
}

output "sns_topic_arn" {
  description = "SNS Notifications Topic ARN"
  value       = aws_sns_topic.notifications.arn
}

output "environment" {
  description = "Environment Name"
  value       = var.environment
}
