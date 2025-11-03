# Development Environment Configuration

environment = "dev"
aws_region  = "us-east-1"

# DynamoDB
dynamodb_billing_mode = "PAY_PER_REQUEST"

# Lambda
lambda_timeout     = 30
lambda_memory_size = 512

# Cognito
cognito_password_minimum_length = 8

# Tags
additional_tags = {
  CostCenter = "Development"
  Owner      = "DevTeam"
}
