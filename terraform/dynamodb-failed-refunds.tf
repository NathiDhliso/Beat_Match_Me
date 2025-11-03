/**
 * Failed Refunds Table
 * Tracks refunds that need manual review
 */

resource "aws_dynamodb_table" "failed_refunds" {
  name           = "${local.table_prefix}-failed-refunds"
  billing_mode   = var.dynamodb_billing_mode
  hash_key       = "requestId"
  range_key      = "createdAt"

  attribute {
    name = "requestId"
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
    Name = "${local.table_prefix}-failed-refunds"
  }
}
