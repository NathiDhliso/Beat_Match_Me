/**
 * Cognito User Pool Configuration
 */

resource "aws_cognito_user_pool" "main" {
  name = "${local.table_prefix}-user-pool"

  # Password policy
  password_policy {
    minimum_length                   = var.cognito_password_minimum_length
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    require_uppercase                = true
    temporary_password_validity_days = 7
  }

  # Auto-verified attributes
  auto_verified_attributes = ["email"]

  # User attributes
  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
    mutable             = false
  }

  schema {
    name                = "name"
    attribute_data_type = "String"
    required            = true
    mutable             = true
  }

  schema {
    name                = "role"
    attribute_data_type = "String"
    required            = false
    mutable             = true
  }

  # MFA configuration
  mfa_configuration = "OPTIONAL"

  software_token_mfa_configuration {
    enabled = true
  }

  # Account recovery
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # Email configuration
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  # User pool add-ons
  user_pool_add_ons {
    advanced_security_mode = var.environment == "production" ? "ENFORCED" : "AUDIT"
  }

  tags = {
    Name = "${local.table_prefix}-user-pool"
  }
}

# User Pool Client
resource "aws_cognito_user_pool_client" "web" {
  name         = "${local.table_prefix}-web-client"
  user_pool_id = aws_cognito_user_pool.main.id

  generate_secret = false

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_PASSWORD_AUTH"
  ]

  prevent_user_existence_errors = "ENABLED"

  refresh_token_validity = 30
  access_token_validity  = 1
  id_token_validity      = 1

  token_validity_units {
    refresh_token = "days"
    access_token  = "hours"
    id_token      = "hours"
  }
}

# User Pool Groups
resource "aws_cognito_user_pool_group" "performers" {
  name         = "performers"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "DJ/Performer users"
  precedence   = 1
}

resource "aws_cognito_user_pool_group" "audience" {
  name         = "audience"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Audience users"
  precedence   = 2
}

resource "aws_cognito_user_pool_group" "admins" {
  name         = "Admins"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Platform administrators with access to Admin CRM"
  precedence   = 0
}

# Identity Pool
resource "aws_cognito_identity_pool" "main" {
  identity_pool_name               = "${local.table_prefix}-identity-pool"
  allow_unauthenticated_identities = false

  cognito_identity_providers {
    client_id               = aws_cognito_user_pool_client.web.id
    provider_name           = aws_cognito_user_pool.main.endpoint
    server_side_token_check = true
  }
}
