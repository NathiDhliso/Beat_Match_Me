#!/bin/bash

# BeatMatchMe - Test Environment Setup
# Creates isolated AWS resources for integration testing

set -e

echo "🚀 Setting up BeatMatchMe test environment..."

# Configuration
TEST_ENV="test"
REGION="us-east-1"
STACK_NAME="beatmatchme-test-stack"

# Color output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📋 This will create:${NC}"
echo "  - DynamoDB tables (test-events, test-requests, test-transactions)"
echo "  - IAM role for test Lambda execution"
echo "  - Lambda functions (test-processPayment, test-createRequest)"
echo "  - CloudWatch log groups"
echo ""
echo -e "${YELLOW}💰 Estimated cost: \$0.50-2/month${NC}"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled"
    exit 1
fi

# Create CloudFormation stack
echo -e "${GREEN}✅ Creating CloudFormation stack...${NC}"
aws cloudformation create-stack \
  --stack-name $STACK_NAME \
  --template-body file://test-infrastructure.yaml \
  --capabilities CAPABILITY_IAM \
  --parameters \
    ParameterKey=Environment,ParameterValue=$TEST_ENV \
  --region $REGION

echo -e "${GREEN}⏳ Waiting for stack creation (this takes 2-3 minutes)...${NC}"
aws cloudformation wait stack-create-complete \
  --stack-name $STACK_NAME \
  --region $REGION

echo -e "${GREEN}✅ Stack created successfully!${NC}"

# Get outputs
echo -e "${GREEN}📝 Retrieving resource details...${NC}"
aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $REGION \
  --query 'Stacks[0].Outputs' \
  --output table

# Create .env.test file
echo -e "${GREEN}📄 Creating .env.test file...${NC}"
cat > .env.test << EOF
# BeatMatchMe Test Environment Configuration
# Auto-generated on $(date)

AWS_REGION=$REGION
TEST_EVENTS_TABLE=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs[?OutputKey==`EventsTableName`].OutputValue' --output text --region $REGION)
TEST_REQUESTS_TABLE=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs[?OutputKey==`RequestsTableName`].OutputValue' --output text --region $REGION)
TEST_TRANSACTIONS_TABLE=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs[?OutputKey==`TransactionsTableName`].OutputValue' --output text --region $REGION)
TEST_LAMBDA_ROLE=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs[?OutputKey==`LambdaRoleArn`].OutputValue' --output text --region $REGION)

# Yoco Test Credentials (use sandbox)
YOCO_SECRET_KEY=sk_test_YOUR_SANDBOX_KEY_HERE
YOCO_PUBLIC_KEY=pk_test_YOUR_SANDBOX_KEY_HERE
EOF

echo -e "${GREEN}✅ Test environment setup complete!${NC}"
echo ""
echo -e "${YELLOW}📌 Next steps:${NC}"
echo "  1. Update .env.test with your Yoco sandbox keys"
echo "  2. Run: npm run test:integration"
echo "  3. View results in CloudWatch Logs"
echo ""
echo -e "${YELLOW}🗑️  To cleanup:${NC}"
echo "  Run: ./cleanup-test-environment.sh"
