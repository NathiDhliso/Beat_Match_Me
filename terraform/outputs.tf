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

# AWS Amplify Hosting Outputs
output "amplify_app_id" {
  description = "Amplify App ID"
  value       = aws_amplify_app.web.id
}

output "amplify_app_arn" {
  description = "Amplify App ARN"
  value       = aws_amplify_app.web.arn
}

output "amplify_default_domain" {
  description = "Amplify Default Domain"
  value       = aws_amplify_app.web.default_domain
}

output "amplify_branch_url" {
  description = "Amplify Branch URL"
  value       = "https://${aws_amplify_branch.main.branch_name}.${aws_amplify_app.web.default_domain}"
}

output "amplify_custom_domain" {
  description = "Custom Domain (if configured)"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : "Not configured"
}

output "amplify_webhook_url" {
  description = "Webhook URL for manual deployments"
  value       = aws_amplify_webhook.main.url
  sensitive   = true
}

output "web_url" {
  description = "Web Application URL"
  value       = local.amplify_url
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
