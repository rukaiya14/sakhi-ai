#!/bin/bash

# AI Sakhi Backend Deployment Script
# This script automates the deployment of all AWS resources

set -e

echo "🚀 Starting AI Sakhi Backend Deployment..."

# Configuration
AWS_REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
STACK_NAME="ai-sakhi-backend"

echo "📋 Configuration:"
echo "  Region: $AWS_REGION"
echo "  Account ID: $ACCOUNT_ID"
echo ""

# Step 1: Create DynamoDB Tables
echo "📊 Creating DynamoDB tables..."

aws dynamodb create-table \
    --table-name ArtisanActivity \
    --attribute-definitions AttributeName=artisanId,AttributeType=S \
    --key-schema AttributeName=artisanId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region $AWS_REGION \
    --no-cli-pager 2>/dev/null || echo "  ✓ ArtisanActivity table already exists"

aws dynamodb create-table \
    --table-name InterventionLog \
    --attribute-definitions \
        AttributeName=interventionId,AttributeType=S \
        AttributeName=timestamp,AttributeType=S \
    --key-schema \
        AttributeName=interventionId,KeyType=HASH \
        AttributeName=timestamp,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --region $AWS_REGION \
    --no-cli-pager 2>/dev/null || echo "  ✓ InterventionLog table already exists"

aws dynamodb create-table \
    --table-name WhatsAppReplies \
    --attribute-definitions \
        AttributeName=artisanId,AttributeType=S \
        AttributeName=messageId,AttributeType=S \
    --key-schema \
        AttributeName=artisanId,KeyType=HASH \
        AttributeName=messageId,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --region $AWS_REGION \
    --no-cli-pager 2>/dev/null || echo "  ✓ WhatsAppReplies table already exists"

aws dynamodb create-table \
    --table-name ResilienceMetrics \
    --attribute-definitions AttributeName=artisanId,AttributeType=S \
    --key-schema AttributeName=artisanId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region $AWS_REGION \
    --no-cli-pager 2>/dev/null || echo "  ✓ ResilienceMetrics table already exists"

echo "✅ DynamoDB tables created"
echo ""

# Step 2: Create S3 Bucket
echo "🪣 Creating S3 bucket for audio files..."
aws s3 mb s3://shebalance-voice-messages-$ACCOUNT_ID --region $AWS_REGION 2>/dev/null || echo "  ✓ S3 bucket already exists"
echo "✅ S3 bucket created"
echo ""

# Step 3: Package Lambda Functions
echo "📦 Packaging Lambda functions..."

# Create deployment packages
zip -q -r scan_activity.zip lambda_scan_artisan_activity.py
zip -q -r whatsapp.zip lambda_send_whatsapp_message.py
zip -q -r check_reply.zip lambda_check_whatsapp_reply.py
zip -q -r voice_call.zip lambda_generate_voice_call.py
zip -q -r resilience.zip lambda_update_resilience_metric.py

echo "✅ Lambda functions packaged"
echo ""

# Step 4: Deploy Lambda Functions
echo "⚡ Deploying Lambda functions..."

# Note: Replace LAMBDA_ROLE_ARN with your actual Lambda execution role ARN
LAMBDA_ROLE_ARN="arn:aws:iam::$ACCOUNT_ID:role/LambdaExecutionRole"

# Function 1: Scan Artisan Activity
aws lambda create-function \
    --function-name ScanArtisanActivity \
    --runtime python3.9 \
    --role $LAMBDA_ROLE_ARN \
    --handler lambda_scan_artisan_activity.lambda_handler \
    --zip-file fileb://scan_activity.zip \
    --timeout 60 \
    --memory-size 256 \
    --region $AWS_REGION \
    --no-cli-pager 2>/dev/null || \
aws lambda update-function-code \
    --function-name ScanArtisanActivity \
    --zip-file fileb://scan_activity.zip \
    --region $AWS_REGION \
    --no-cli-pager

echo "  ✓ ScanArtisanActivity deployed"

# Function 2: Send WhatsApp Message
aws lambda create-function \
    --function-name SendWhatsAppMessage \
    --runtime python3.9 \
    --role $LAMBDA_ROLE_ARN \
    --handler lambda_send_whatsapp_message.lambda_handler \
    --zip-file fileb://whatsapp.zip \
    --timeout 30 \
    --memory-size 256 \
    --region $AWS_REGION \
    --environment Variables="{WHATSAPP_API_URL=https://graph.facebook.com/v17.0}" \
    --no-cli-pager 2>/dev/null || \
aws lambda update-function-code \
    --function-name SendWhatsAppMessage \
    --zip-file fileb://whatsapp.zip \
    --region $AWS_REGION \
    --no-cli-pager

echo "  ✓ SendWhatsAppMessage deployed"

# Function 3: Check WhatsApp Reply
aws lambda create-function \
    --function-name CheckWhatsAppReply \
    --runtime python3.9 \
    --role $LAMBDA_ROLE_ARN \
    --handler lambda_check_whatsapp_reply.lambda_handler \
    --zip-file fileb://check_reply.zip \
    --timeout 30 \
    --memory-size 128 \
    --region $AWS_REGION \
    --no-cli-pager 2>/dev/null || \
aws lambda update-function-code \
    --function-name CheckWhatsAppReply \
    --zip-file fileb://check_reply.zip \
    --region $AWS_REGION \
    --no-cli-pager

echo "  ✓ CheckWhatsAppReply deployed"

# Function 4: Generate Voice Call
aws lambda create-function \
    --function-name GenerateVoiceCall \
    --runtime python3.9 \
    --role $LAMBDA_ROLE_ARN \
    --handler lambda_generate_voice_call.lambda_handler \
    --zip-file fileb://voice_call.zip \
    --timeout 60 \
    --memory-size 512 \
    --region $AWS_REGION \
    --environment Variables="{AUDIO_BUCKET=shebalance-voice-messages-$ACCOUNT_ID}" \
    --no-cli-pager 2>/dev/null || \
aws lambda update-function-code \
    --function-name GenerateVoiceCall \
    --zip-file fileb://voice_call.zip \
    --region $AWS_REGION \
    --no-cli-pager

echo "  ✓ GenerateVoiceCall deployed"

# Function 5: Update Resilience Metric
aws lambda create-function \
    --function-name UpdateResilienceMetric \
    --runtime python3.9 \
    --role $LAMBDA_ROLE_ARN \
    --handler lambda_update_resilience_metric.lambda_handler \
    --zip-file fileb://resilience.zip \
    --timeout 30 \
    --memory-size 256 \
    --region $AWS_REGION \
    --no-cli-pager 2>/dev/null || \
aws lambda update-function-code \
    --function-name UpdateResilienceMetric \
    --zip-file fileb://resilience.zip \
    --region $AWS_REGION \
    --no-cli-pager

echo "  ✓ UpdateResilienceMetric deployed"

echo "✅ All Lambda functions deployed"
echo ""

# Step 5: Create Step Function
echo "🔄 Creating Step Function..."

# Note: Replace STEPFUNCTIONS_ROLE_ARN with your actual Step Functions execution role ARN
STEPFUNCTIONS_ROLE_ARN="arn:aws:iam::$ACCOUNT_ID:role/StepFunctionsExecutionRole"

# Update the Step Function definition with actual ARNs
sed "s/REGION/$AWS_REGION/g; s/ACCOUNT_ID/$ACCOUNT_ID/g" step-function-definition.json > step-function-updated.json

aws stepfunctions create-state-machine \
    --name AISakhiWorkflow \
    --definition file://step-function-updated.json \
    --role-arn $STEPFUNCTIONS_ROLE_ARN \
    --region $AWS_REGION \
    --no-cli-pager 2>/dev/null || \
aws stepfunctions update-state-machine \
    --state-machine-arn arn:aws:states:$AWS_REGION:$ACCOUNT_ID:stateMachine:AISakhiWorkflow \
    --definition file://step-function-updated.json \
    --region $AWS_REGION \
    --no-cli-pager

echo "✅ Step Function created"
echo ""

# Step 6: Schedule Execution
echo "⏰ Setting up scheduled execution..."

aws events put-rule \
    --name AISakhiSchedule \
    --schedule-expression "rate(6 hours)" \
    --region $AWS_REGION \
    --no-cli-pager

aws events put-targets \
    --rule AISakhiSchedule \
    --targets "Id"="1","Arn"="arn:aws:states:$AWS_REGION:$ACCOUNT_ID:stateMachine:AISakhiWorkflow","RoleArn"="$STEPFUNCTIONS_ROLE_ARN" \
    --region $AWS_REGION \
    --no-cli-pager

echo "✅ Scheduled execution configured"
echo ""

# Cleanup
echo "🧹 Cleaning up deployment files..."
rm -f *.zip step-function-updated.json
echo "✅ Cleanup complete"
echo ""

echo "🎉 Deployment Complete!"
echo ""
echo "📝 Next Steps:"
echo "  1. Configure WhatsApp Business API credentials in Lambda environment variables"
echo "  2. Set up Twilio account for voice calls (optional)"
echo "  3. Test the workflow with sample data"
echo "  4. Monitor CloudWatch logs for execution status"
echo ""
echo "🔗 Resources Created:"
echo "  - DynamoDB Tables: ArtisanActivity, InterventionLog, WhatsAppReplies, ResilienceMetrics"
echo "  - S3 Bucket: shebalance-voice-messages-$ACCOUNT_ID"
echo "  - Lambda Functions: 5 functions"
echo "  - Step Function: AISakhiWorkflow"
echo "  - EventBridge Rule: AISakhiSchedule (runs every 6 hours)"
echo ""
echo "💰 Estimated Monthly Cost: $15-20 (excluding WhatsApp API)"
