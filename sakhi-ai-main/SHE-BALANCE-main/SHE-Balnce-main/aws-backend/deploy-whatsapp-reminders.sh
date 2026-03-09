#!/bin/bash

# Deploy WhatsApp Reminder System for SHE-BALANCE
# This script sets up automated WhatsApp reminders via AWS SNS

set -e

echo "=========================================="
echo "  SHE-BALANCE WhatsApp Reminder Setup"
echo "=========================================="
echo ""

# Configuration
REGION="us-east-1"
FUNCTION_NAME="shebalance-check-order-progress"
ROLE_NAME="shebalance-lambda-reminder-role"
RULE_NAME="shebalance-daily-order-check"

# Get AWS Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "AWS Account ID: $ACCOUNT_ID"
echo ""

# Step 1: Create IAM Role for Lambda
echo "[1/6] Creating IAM role for Lambda..."

TRUST_POLICY='{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}'

# Create role
aws iam create-role \
  --role-name $ROLE_NAME \
  --assume-role-policy-document "$TRUST_POLICY" \
  --description "Role for SHE-BALANCE order reminder Lambda" \
  2>/dev/null || echo "Role already exists"

# Attach policies
echo "Attaching policies to role..."

aws iam attach-role-policy \
  --role-name $ROLE_NAME \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam attach-role-policy \
  --role-name $ROLE_NAME \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

aws iam attach-role-policy \
  --role-name $ROLE_NAME \
  --policy-arn arn:aws:iam::aws:policy/AmazonSNSFullAccess

echo "✅ IAM role created"
echo ""

# Wait for role to be available
echo "Waiting for IAM role to propagate..."
sleep 10

# Step 2: Package Lambda function
echo "[2/6] Packaging Lambda function..."

cd "$(dirname "$0")"
zip -q lambda_check_order_progress.zip lambda_check_order_progress.py

echo "✅ Lambda function packaged"
echo ""

# Step 3: Create Lambda function
echo "[3/6] Creating Lambda function..."

ROLE_ARN="arn:aws:iam::$ACCOUNT_ID:role/$ROLE_NAME"

aws lambda create-function \
  --function-name $FUNCTION_NAME \
  --runtime python3.9 \
  --role $ROLE_ARN \
  --handler lambda_check_order_progress.lambda_handler \
  --zip-file fileb://lambda_check_order_progress.zip \
  --timeout 300 \
  --memory-size 512 \
  --region $REGION \
  --description "Checks order progress and sends WhatsApp reminders" \
  2>/dev/null || {
    echo "Function exists, updating..."
    aws lambda update-function-code \
      --function-name $FUNCTION_NAME \
      --zip-file fileb://lambda_check_order_progress.zip \
      --region $REGION
  }

echo "✅ Lambda function created/updated"
echo ""

# Step 4: Create EventBridge rule
echo "[4/6] Creating EventBridge rule..."

# Create rule (runs daily at 9 AM UTC)
aws events put-rule \
  --name $RULE_NAME \
  --schedule-expression "cron(0 9 * * ? *)" \
  --state ENABLED \
  --description "Triggers daily order progress check" \
  --region $REGION

echo "✅ EventBridge rule created"
echo ""

# Step 5: Add Lambda permission for EventBridge
echo "[5/6] Adding Lambda permission for EventBridge..."

aws lambda add-permission \
  --function-name $FUNCTION_NAME \
  --statement-id AllowEventBridgeInvoke \
  --action lambda:InvokeFunction \
  --principal events.amazonaws.com \
  --source-arn "arn:aws:events:$REGION:$ACCOUNT_ID:rule/$RULE_NAME" \
  --region $REGION \
  2>/dev/null || echo "Permission already exists"

echo "✅ Lambda permission added"
echo ""

# Step 6: Add Lambda as target to EventBridge rule
echo "[6/6] Connecting EventBridge rule to Lambda..."

LAMBDA_ARN="arn:aws:lambda:$REGION:$ACCOUNT_ID:function:$FUNCTION_NAME"

aws events put-targets \
  --rule $RULE_NAME \
  --targets "Id=1,Arn=$LAMBDA_ARN" \
  --region $REGION

echo "✅ EventBridge target configured"
echo ""

# Cleanup
rm -f lambda_check_order_progress.zip

echo "=========================================="
echo "  ✅ WhatsApp Reminder System Deployed!"
echo "=========================================="
echo ""
echo "Configuration:"
echo "  Lambda Function: $FUNCTION_NAME"
echo "  EventBridge Rule: $RULE_NAME"
echo "  Schedule: Daily at 9:00 AM UTC"
echo "  Region: $REGION"
echo ""
echo "Next Steps:"
echo "  1. Configure SNS for WhatsApp (see SNS_WHATSAPP_SETUP.md)"
echo "  2. Test the Lambda function manually"
echo "  3. Monitor CloudWatch logs"
echo ""
echo "Test command:"
echo "  aws lambda invoke --function-name $FUNCTION_NAME output.json"
echo ""
