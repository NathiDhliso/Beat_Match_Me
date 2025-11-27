/**
 * Lambda Functions Configuration
 */

# IAM Role for Lambda
resource "aws_iam_role" "lambda_execution" {
  name = "${local.table_prefix}-lambda-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

# Lambda Basic Execution Policy
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# DynamoDB Access Policy
resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "${local.table_prefix}-lambda-dynamodb"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem"
      ]
      Resource = [
        aws_dynamodb_table.users.arn,
        aws_dynamodb_table.events.arn,
        aws_dynamodb_table.requests.arn,
        aws_dynamodb_table.queues.arn,
        aws_dynamodb_table.transactions.arn,
        aws_dynamodb_table.achievements.arn,
        aws_dynamodb_table.group_requests.arn,
        aws_dynamodb_table.upvotes.arn,
        aws_dynamodb_table.disputes.arn,
        aws_dynamodb_table.payouts.arn,
        "${aws_dynamodb_table.users.arn}/index/*",
        "${aws_dynamodb_table.events.arn}/index/*",
        "${aws_dynamodb_table.requests.arn}/index/*",
        "${aws_dynamodb_table.transactions.arn}/index/*",
        "${aws_dynamodb_table.group_requests.arn}/index/*",
        "${aws_dynamodb_table.upvotes.arn}/index/*",
        "${aws_dynamodb_table.disputes.arn}/index/*",
        "${aws_dynamodb_table.payouts.arn}/index/*"
      ]
    }]
  })
}

# S3 Access Policy
resource "aws_iam_role_policy" "lambda_s3" {
  name = "${local.table_prefix}-lambda-s3"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "s3:PutObject",
        "s3:GetObject",
        "s3:PutObjectAcl"
      ]
      Resource = "${aws_s3_bucket.assets.arn}/*"
    }]
  })
}

# Secrets Manager Access
resource "aws_iam_role_policy" "lambda_secrets" {
  name = "${local.table_prefix}-lambda-secrets"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "secretsmanager:GetSecretValue"
      ]
      Resource = "arn:aws:secretsmanager:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:secret:${var.project_name}/*"
    }]
  })
}

# Lambda Functions
locals {
  lambda_functions = [
    "processPayment",
    "processRefund",
    "calculateQueuePosition",
    "updateTier",
    "reorderQueue",
    "createRequest",
    "upvoteRequest",
    "createGroupRequest",
    "contributeToGroupRequest",
    "checkAchievements",
    "vetoRequest",
    "createEvent",
    "updateEventStatus",
    "adminOperations"
  ]
}

resource "aws_lambda_function" "functions" {
  for_each = toset(local.lambda_functions)

  filename      = "../aws/lambda/${each.key}.zip"
  function_name = "${local.table_prefix}-${each.key}"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "index.handler"
  runtime       = var.lambda_runtime
  timeout       = var.lambda_timeout
  memory_size   = var.lambda_memory_size

  environment {
    variables = {
      ENVIRONMENT           = var.environment
      S3_BUCKET_NAME       = aws_s3_bucket.assets.id
      USER_NOTIFICATIONS_TOPIC = aws_sns_topic.notifications.arn
      YOCO_SECRET_KEY      = var.yoco_secret_key
      YOCO_PUBLIC_KEY      = var.yoco_public_key
      YOCO_API_BASE_URL    = "https://payments.yoco.com/api/checkouts"
    }
  }

  tags = {
    Name = "${local.table_prefix}-${each.key}"
  }
}

# DynamoDB Stream Trigger for checkAchievements
resource "aws_lambda_event_source_mapping" "requests_stream" {
  event_source_arn  = aws_dynamodb_table.requests.stream_arn
  function_name     = aws_lambda_function.functions["checkAchievements"].arn
  starting_position = "LATEST"
  batch_size        = 10
}
