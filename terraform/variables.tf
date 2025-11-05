/**
 * Terraform Variables
 */

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be dev, staging, or production."
  }
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "beatmatchme"
}

# DynamoDB Configuration
variable "dynamodb_billing_mode" {
  description = "DynamoDB billing mode"
  type        = string
  default     = "PAY_PER_REQUEST"
}

# Lambda Configuration
variable "lambda_runtime" {
  description = "Lambda runtime"
  type        = string
  default     = "nodejs18.x"
}

variable "lambda_timeout" {
  description = "Lambda timeout in seconds"
  type        = number
  default     = 30
}

variable "lambda_memory_size" {
  description = "Lambda memory size in MB"
  type        = number
  default     = 512
}

# Cognito Configuration
variable "cognito_password_minimum_length" {
  description = "Minimum password length"
  type        = number
  default     = 8
}

# S3 Configuration
variable "s3_bucket_prefix" {
  description = "S3 bucket prefix"
  type        = string
  default     = "beatmatchme"
}

# AppSync Configuration
variable "appsync_authentication_type" {
  description = "AppSync authentication type"
  type        = string
  default     = "AMAZON_COGNITO_USER_POOLS"
}

variable "alert_email" {
  description = "Email address for CloudWatch alerts"
  type        = string
  default     = "alerts@beatmatchme.com"
}

# Yoco Payment Configuration
variable "yoco_secret_key" {
  description = "Yoco secret key for payment processing"
  type        = string
  sensitive   = true
}

variable "yoco_public_key" {
  description = "Yoco public key for payment processing"
  type        = string
}

# Amplify Configuration
variable "github_repository" {
  description = "GitHub repository URL for Amplify"
  type        = string
  default     = "https://github.com/NathiDhliso/Beat_Match_Me"
}

variable "git_branch" {
  description = "Git branch to deploy"
  type        = string
  default     = "main"
}

variable "domain_name" {
  description = "Custom domain name (leave empty to use Amplify default domain)"
  type        = string
  default     = ""
}

variable "enable_basic_auth" {
  description = "Enable basic auth for non-production environments"
  type        = bool
  default     = false
}

variable "appsync_endpoint" {
  description = "AppSync GraphQL endpoint URL"
  type        = string
  default     = ""
}

# Tags
variable "additional_tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default     = {}
}
