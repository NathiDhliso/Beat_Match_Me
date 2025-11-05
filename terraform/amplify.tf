/**
 * AWS Amplify Hosting Configuration
 * Replaces S3 static website hosting with Amplify CI/CD
 */

# Amplify App
resource "aws_amplify_app" "web" {
  name       = "${var.project_name}-${var.environment}"
  repository = var.github_repository # e.g., "https://github.com/NathiDhliso/Beat_Match_Me"

  # Build settings
  build_spec = file("${path.module}/../web/amplify.yml")

  # Environment variables
  environment_variables = {
    VITE_AWS_REGION          = var.aws_region
    VITE_USER_POOL_ID        = aws_cognito_user_pool.main.id
    VITE_USER_POOL_CLIENT_ID = aws_cognito_user_pool_client.web.id
    VITE_IDENTITY_POOL_ID    = aws_cognito_identity_pool.main.id
    VITE_APPSYNC_ENDPOINT    = var.appsync_endpoint
    VITE_S3_BUCKET           = aws_s3_bucket.assets.id
    VITE_ENVIRONMENT         = var.environment
    VITE_COGNITO_DOMAIN      = "${aws_cognito_user_pool.main.domain}.auth.${var.aws_region}.amazoncognito.com"
    VITE_YOCO_PUBLIC_KEY     = var.yoco_public_key
    # Add these if you have them
    # VITE_SPOTIFY_CLIENT_ID     = var.spotify_client_id
    # VITE_OAUTH_REDIRECT_SIGNIN = var.oauth_redirect_signin
  }

  # Enable auto branch creation for pull requests
  enable_auto_branch_creation = var.environment == "production" ? false : true
  enable_branch_auto_build    = true
  enable_branch_auto_deletion = true

  # Auto branch creation patterns
  auto_branch_creation_patterns = var.environment == "production" ? [] : ["feature/*", "dev"]

  auto_branch_creation_config {
    enable_auto_build = true
    framework         = "React"
  }

  # Custom rules for SPA routing
  custom_rule {
    source = "/<*>"
    status = "404-200"
    target = "/index.html"
  }

  # Redirect www to non-www (if using custom domain)
  dynamic "custom_rule" {
    for_each = var.domain_name != "" ? [1] : []
    content {
      source = "https://www.${var.domain_name}"
      status = "302"
      target = "https://${var.domain_name}"
    }
  }

  # Basic auth for non-production environments
  dynamic "custom_rule" {
    for_each = var.environment != "production" && var.enable_basic_auth ? [1] : []
    content {
      source = "/<*>"
      status = "200"
      target = "/index.html"
    }
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-web"
  }
}

# Main branch
resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.web.id
  branch_name = var.git_branch # e.g., "main" or "master"

  framework = "React"
  stage     = var.environment == "production" ? "PRODUCTION" : upper(var.environment)

  enable_auto_build = true
  enable_pull_request_preview = var.environment == "production" ? false : true

  # Environment variables specific to this branch (optional)
  environment_variables = {
    _LIVE_PACKAGE_UPDATES = "[{\"pkg\":\"@aws-amplify/cli\",\"type\":\"npm\",\"version\":\"latest\"}]"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-${var.git_branch}"
    Environment = var.environment
  }
}

# Custom domain association (optional - only if you have a domain)
resource "aws_amplify_domain_association" "main" {
  count = var.domain_name != "" ? 1 : 0

  app_id      = aws_amplify_app.web.id
  domain_name = var.domain_name

  # Root domain
  sub_domain {
    branch_name = aws_amplify_branch.main.branch_name
    prefix      = ""
  }

  # WWW subdomain
  sub_domain {
    branch_name = aws_amplify_branch.main.branch_name
    prefix      = "www"
  }

  # Wait for DNS validation
  wait_for_verification = true
}

# Webhook for manual deployments (optional)
resource "aws_amplify_webhook" "main" {
  app_id      = aws_amplify_app.web.id
  branch_name = aws_amplify_branch.main.branch_name
  description = "Webhook for manual deployments"
}

# CloudFront distribution for Amplify (optional - Amplify already includes CDN)
# Only use this if you need custom CloudFront settings
# Otherwise, Amplify provides its own CDN automatically

# If you need Route 53 DNS (only if using custom domain)
data "aws_route53_zone" "main" {
  count = var.domain_name != "" ? 1 : 0
  name  = var.domain_name
}

# Route 53 records for domain verification (created automatically by Amplify)
# But if you want to manage them explicitly:
# resource "aws_route53_record" "amplify_verification" {
#   count   = var.domain_name != "" ? 1 : 0
#   zone_id = data.aws_route53_zone.main[0].zone_id
#   name    = aws_amplify_domain_association.main[0].certificate_verification_dns_record
#   type    = "CNAME"
#   ttl     = 300
#   records = [aws_amplify_domain_association.main[0].certificate_verification_dns_record]
# }

# Outputs for backend configuration
locals {
  amplify_default_domain = "${aws_amplify_branch.main.branch_name}.${aws_amplify_app.web.default_domain}"
  amplify_custom_domain  = var.domain_name != "" ? var.domain_name : ""
  amplify_url            = var.domain_name != "" ? "https://${var.domain_name}" : "https://${local.amplify_default_domain}"
}
