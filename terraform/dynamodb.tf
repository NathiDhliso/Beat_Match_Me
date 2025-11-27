/**
 * DynamoDB Tables Configuration
 */

locals {
  table_prefix = "${var.project_name}-${var.environment}"
}

# Users Table
resource "aws_dynamodb_table" "users" {
  name           = "${local.table_prefix}-users"
  billing_mode   = var.dynamodb_billing_mode
  hash_key       = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  attribute {
    name = "role"
    type = "S"
  }

  attribute {
    name = "status"
    type = "S"
  }

  global_secondary_index {
    name            = "email-index"
    hash_key        = "email"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "role-status-index"
    hash_key        = "role"
    range_key       = "status"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = var.environment == "production"
  }

  server_side_encryption {
    enabled = true
  }

  tags = {
    Name = "${local.table_prefix}-users"
  }
}

# Events Table
resource "aws_dynamodb_table" "events" {
  name           = "${local.table_prefix}-events"
  billing_mode   = var.dynamodb_billing_mode
  hash_key       = "eventId"

  attribute {
    name = "eventId"
    type = "S"
  }

  attribute {
    name = "performerId"
    type = "S"
  }

  attribute {
    name = "startTime"
    type = "N"
  }

  attribute {
    name = "status"
    type = "S"
  }

  global_secondary_index {
    name            = "performerId-startTime-index"
    hash_key        = "performerId"
    range_key       = "startTime"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "status-startTime-index"
    hash_key        = "status"
    range_key       = "startTime"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = var.environment == "production"
  }

  server_side_encryption {
    enabled = true
  }

  tags = {
    Name = "${local.table_prefix}-events"
  }
}

# Requests Table
resource "aws_dynamodb_table" "requests" {
  name           = "${local.table_prefix}-requests"
  billing_mode   = var.dynamodb_billing_mode
  hash_key       = "requestId"

  attribute {
    name = "requestId"
    type = "S"
  }

  attribute {
    name = "eventId"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "submittedAt"
    type = "N"
  }

  attribute {
    name = "status"
    type = "S"
  }

  global_secondary_index {
    name            = "eventId-submittedAt-index"
    hash_key        = "eventId"
    range_key       = "submittedAt"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "userId-submittedAt-index"
    hash_key        = "userId"
    range_key       = "submittedAt"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "eventId-status-index"
    hash_key        = "eventId"
    range_key       = "status"
    projection_type = "ALL"
  }

  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  point_in_time_recovery {
    enabled = var.environment == "production"
  }

  server_side_encryption {
    enabled = true
  }

  tags = {
    Name = "${local.table_prefix}-requests"
  }
}

# Queues Table
resource "aws_dynamodb_table" "queues" {
  name           = "${local.table_prefix}-queues"
  billing_mode   = var.dynamodb_billing_mode
  hash_key       = "eventId"

  attribute {
    name = "eventId"
    type = "S"
  }

  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  point_in_time_recovery {
    enabled = var.environment == "production"
  }

  server_side_encryption {
    enabled = true
  }

  tags = {
    Name = "${local.table_prefix}-queues"
  }
}

# Transactions Table
resource "aws_dynamodb_table" "transactions" {
  name           = "${local.table_prefix}-transactions"
  billing_mode   = var.dynamodb_billing_mode
  hash_key       = "transactionId"

  attribute {
    name = "transactionId"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "eventId"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "N"
  }

  attribute {
    name = "status"
    type = "S"
  }

  global_secondary_index {
    name            = "userId-createdAt-index"
    hash_key        = "userId"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "eventId-createdAt-index"
    hash_key        = "eventId"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "status-createdAt-index"
    hash_key        = "status"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = var.environment == "production"
  }

  server_side_encryption {
    enabled = true
  }

  tags = {
    Name = "${local.table_prefix}-transactions"
  }
}

# Achievements Table
resource "aws_dynamodb_table" "achievements" {
  name           = "${local.table_prefix}-achievements"
  billing_mode   = var.dynamodb_billing_mode
  hash_key       = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  point_in_time_recovery {
    enabled = var.environment == "production"
  }

  server_side_encryption {
    enabled = true
  }

  tags = {
    Name = "${local.table_prefix}-achievements"
  }
}

# Group Requests Table
resource "aws_dynamodb_table" "group_requests" {
  name           = "${local.table_prefix}-group-requests"
  billing_mode   = var.dynamodb_billing_mode
  hash_key       = "groupRequestId"

  attribute {
    name = "groupRequestId"
    type = "S"
  }

  attribute {
    name = "eventId"
    type = "S"
  }

  attribute {
    name = "status"
    type = "S"
  }

  global_secondary_index {
    name            = "eventId-status-index"
    hash_key        = "eventId"
    range_key       = "status"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = var.environment == "production"
  }

  server_side_encryption {
    enabled = true
  }

  tags = {
    Name = "${local.table_prefix}-group-requests"
  }
}

# Upvotes Table
resource "aws_dynamodb_table" "upvotes" {
  name           = "${local.table_prefix}-upvotes"
  billing_mode   = var.dynamodb_billing_mode
  hash_key       = "upvoteKey"

  attribute {
    name = "upvoteKey"
    type = "S"
  }

  attribute {
    name = "requestId"
    type = "S"
  }

  global_secondary_index {
    name            = "requestId-index"
    hash_key        = "requestId"
    projection_type = "ALL"
  }

  server_side_encryption {
    enabled = true
  }

  tags = {
    Name = "${local.table_prefix}-upvotes"
  }
}

# ============================================
# ADMIN CRM TABLES
# ============================================

# Disputes Table
resource "aws_dynamodb_table" "disputes" {
  name           = "${local.table_prefix}-disputes"
  billing_mode   = var.dynamodb_billing_mode
  hash_key       = "disputeId"

  attribute {
    name = "disputeId"
    type = "S"
  }

  attribute {
    name = "status"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "N"
  }

  attribute {
    name = "transactionId"
    type = "S"
  }

  global_secondary_index {
    name            = "status-createdAt-index"
    hash_key        = "status"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "transactionId-index"
    hash_key        = "transactionId"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = var.environment == "production"
  }

  server_side_encryption {
    enabled = true
  }

  tags = {
    Name = "${local.table_prefix}-disputes"
  }
}

# Payouts Table
resource "aws_dynamodb_table" "payouts" {
  name           = "${local.table_prefix}-payouts"
  billing_mode   = var.dynamodb_billing_mode
  hash_key       = "payoutId"

  attribute {
    name = "payoutId"
    type = "S"
  }

  attribute {
    name = "performerId"
    type = "S"
  }

  attribute {
    name = "status"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "N"
  }

  global_secondary_index {
    name            = "performerId-index"
    hash_key        = "performerId"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "status-createdAt-index"
    hash_key        = "status"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = var.environment == "production"
  }

  server_side_encryption {
    enabled = true
  }

  tags = {
    Name = "${local.table_prefix}-payouts"
  }
}
