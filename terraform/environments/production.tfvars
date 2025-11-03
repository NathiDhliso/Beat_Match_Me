# Production Environment Configuration

environment = "production"
aws_region  = "us-east-1"

# DynamoDB
dynamodb_billing_mode = "PAY_PER_REQUEST"

# Lambda
lambda_timeout     = 60
lambda_memory_size = 2048

# Cognito
cognito_password_minimum_length = 12

# Tags
additional_tags = {
  CostCenter = "Production"
  Owner      = "OpsTeam"
  Compliance = "Required"
}
