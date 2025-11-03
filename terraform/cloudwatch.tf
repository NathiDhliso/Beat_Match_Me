/**
 * CloudWatch Alarms and Monitoring
 */

# SNS Topic for Alerts
resource "aws_sns_topic" "alerts" {
  name = "${var.project_name}-${var.environment}-alerts"
}

resource "aws_sns_topic_subscription" "alerts_email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# Lambda Error Alarms
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  for_each = toset([
    "processPayment",
    "processRefund",
    "createRequest",
    "upvoteRequest",
    "reorderQueue"
  ])

  alarm_name          = "${var.project_name}-${var.environment}-${each.key}-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "This metric monitors ${each.key} lambda errors"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    FunctionName = "${var.project_name}-${var.environment}-${each.key}"
  }
}

# Payment Processing Failures
resource "aws_cloudwatch_metric_alarm" "payment_failures" {
  alarm_name          = "${var.project_name}-${var.environment}-payment-failures"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "60"
  statistic           = "Sum"
  threshold           = "3"
  alarm_description   = "Critical: Multiple payment failures detected"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = "${var.project_name}-${var.environment}-processPayment"
  }
}

# DynamoDB Throttling
resource "aws_cloudwatch_metric_alarm" "dynamodb_throttles" {
  for_each = {
    requests     = aws_dynamodb_table.requests.name
    transactions = aws_dynamodb_table.transactions.name
  }

  alarm_name          = "${var.project_name}-${var.environment}-${each.key}-throttles"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "UserErrors"
  namespace           = "AWS/DynamoDB"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "DynamoDB throttling detected on ${each.key}"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    TableName = each.value
  }
}

# Lambda Duration Alarm (Performance)
resource "aws_cloudwatch_metric_alarm" "lambda_duration" {
  alarm_name          = "${var.project_name}-${var.environment}-payment-duration"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Duration"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Average"
  threshold           = "5000"
  alarm_description   = "Payment processing is slow"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    FunctionName = "${var.project_name}-${var.environment}-processPayment"
  }
}

# CloudWatch Log Groups with Retention
resource "aws_cloudwatch_log_group" "lambda_logs" {
  for_each = toset([
    "processPayment",
    "processRefund",
    "createRequest",
    "upvoteRequest",
    "reorderQueue",
    "createGroupRequest",
    "contributeToGroupRequest",
    "vetoRequest",
    "createEvent",
    "updateEventStatus",
    "checkAchievements",
    "calculateQueuePosition",
    "updateTier"
  ])

  name              = "/aws/lambda/${var.project_name}-${var.environment}-${each.key}"
  retention_in_days = var.environment == "production" ? 30 : 7
}

# Dashboard
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-${var.environment}-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/Lambda", "Invocations", { stat = "Sum" }],
            [".", "Errors", { stat = "Sum" }],
            [".", "Duration", { stat = "Average" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "Lambda Overview"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/DynamoDB", "ConsumedReadCapacityUnits", { stat = "Sum" }],
            [".", "ConsumedWriteCapacityUnits", { stat = "Sum" }]
          ]
          period = 300
          stat   = "Sum"
          region = var.aws_region
          title  = "DynamoDB Capacity"
        }
      }
    ]
  })
}
