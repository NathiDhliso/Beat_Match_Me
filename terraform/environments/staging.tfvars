# Staging Environment Configuration

environment = "staging"
aws_region  = "us-east-1"

# DynamoDB
dynamodb_billing_mode = "PAY_PER_REQUEST"

# Lambda
lambda_timeout     = 30
lambda_memory_size = 1024

# Cognito
cognito_password_minimum_length = 8

# Tags
additional_tags = {
  CostCenter = "Staging"
  Owner      = "QATeam"
}
