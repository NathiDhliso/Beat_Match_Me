# Cognito App Client - Public (No Secret) for Web App
# This creates a new app client without a client secret for browser-based authentication

resource "aws_cognito_user_pool_client" "web_client" {
  name         = "beatmatchme-web-public"
  user_pool_id = "us-east-1_g5ri75gFs"

  # Public client - no secret for web apps
  generate_secret = false

  # Authentication flows for web apps
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",           # Secure Remote Password
    "ALLOW_REFRESH_TOKEN_AUTH",      # Refresh tokens
    "ALLOW_USER_PASSWORD_AUTH"       # Username/password (for development)
  ]

  # Token validity
  refresh_token_validity = 30
  access_token_validity  = 60
  id_token_validity      = 60

  token_validity_units {
    refresh_token = "days"
    access_token  = "minutes"
    id_token      = "minutes"
  }

  # OAuth 2.0 settings
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows = [
    "code",
    "implicit"
  ]

  allowed_oauth_scopes = [
    "email",
    "openid",
    "profile"
  ]

  callback_urls = [
    "http://localhost:5173",
    "https://beatmatchme.com"
  ]

  logout_urls = [
    "http://localhost:5173",
    "https://beatmatchme.com"
  ]

  # Prevent user existence errors
  prevent_user_existence_errors = "ENABLED"

  # Read/write attributes
  read_attributes = [
    "email",
    "email_verified",
    "name",
    "phone_number",
    "phone_number_verified"
  ]

  write_attributes = [
    "email",
    "name",
    "phone_number"
  ]
}

# Output the new client ID
output "web_client_id" {
  description = "Cognito User Pool Web Client ID (Public - No Secret)"
  value       = aws_cognito_user_pool_client.web_client.id
  sensitive   = false
}

output "web_client_instructions" {
  description = "Instructions for using the new client ID"
  value = <<-EOT
    
    ✅ New Cognito App Client Created!
    
    Client ID: ${aws_cognito_user_pool_client.web_client.id}
    Client Name: ${aws_cognito_user_pool_client.web_client.name}
    Type: Public (No Secret)
    
    📝 Update your .env file:
    VITE_USER_POOL_CLIENT_ID=${aws_cognito_user_pool_client.web_client.id}
    
    Then restart your dev server:
    npm start
  EOT
}
