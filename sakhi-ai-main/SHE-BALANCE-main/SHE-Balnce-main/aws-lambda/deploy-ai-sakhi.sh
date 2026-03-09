#!/bin/bash

# AI Sakhi Lambda Functions - Quick Deployment Script
# This script automates the deployment of all 4 AI Sakhi Lambda functions

set -e  # Exit on error

echo "🤖 AI Sakhi Lambda Deployment Script"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI found${NC}"

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Run 'aws configure' first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS credentials configured${NC}"
echo ""

# Get AWS account ID and region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_REGION:-us-east-1}

echo "📋 Deployment Configuration:"
echo "   AWS Account: $AWS_ACCOUNT_ID"
echo "   AWS Region: $AWS_REGION"
echo ""

# Ask for confirmation
read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "🔧 Step 1: Installing Dependencies"
echo "===================================="

# Install dependencies for each Lambda
for lambda in ai-sakhi-chat ai-sakhi-context ai-sakhi-intent ai-sakhi-action; do
    echo "Installing dependencies for $lambda..."
    cd $lambda
    npm install --production
    cd ..
    echo -e "${GREEN}✅ $lambda dependencies installed${NC}"
done

echo ""
echo "📦 Step 2: Creating Deployment Packages"
echo "========================================"

# Create ZIP files
for lambda in ai-sakhi-chat ai-sakhi-context ai-sakhi-intent ai-sakhi-action; do
    echo "Creating ZIP for $lambda..."
    cd $lambda
    zip -r ../$lambda.zip . -x "*.git*" "*.DS_Store"
    cd ..
    echo -e "${GREEN}✅ $lambda.zip created${NC}"
done

echo ""
echo "🔐 Step 3: Creating IAM Role"
echo "============================="

ROLE_NAME="SheBalance-AI-Sakhi-Lambda-Role"

# Check if role exists
if aws iam get-role --role-name $ROLE_NAME &> /dev/null; then
    echo -e "${YELLOW}⚠️  Role $ROLE_NAME already exists, skipping creation${NC}"
else
    # Create trust policy
    cat > /tmp/lambda-trust-policy.json << EOF
{
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
}
EOF

    # Create role
    aws iam create-role \
      --role-name $ROLE_NAME \
      --assume-role-policy-document file:///tmp/lambda-trust-policy.json \
      --description "Execution role for AI Sakhi Lambda functions"

    echo -e "${GREEN}✅ IAM role created${NC}"

    # Attach basic execution policy
    aws iam attach-role-policy \
      --role-name $ROLE_NAME \
      --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

    # Create custom policy
    cat > /tmp/lambda-custom-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-haiku-*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/shebalance-*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "sns:Publish"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "states:StartExecution"
      ],
      "Resource": "*"
    }
  ]
}
EOF

    aws iam put-role-policy \
      --role-name $ROLE_NAME \
      --policy-name SheBalance-AI-Sakhi-Custom-Policy \
      --policy-document file:///tmp/lambda-custom-policy.json

    echo -e "${GREEN}✅ IAM policies attached${NC}"
    
    # Wait for role to be available
    echo "Waiting for IAM role to propagate..."
    sleep 10
fi

ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text)
echo "Role ARN: $ROLE_ARN"

echo ""
echo "🚀 Step 4: Deploying Lambda Functions"
echo "======================================"

# Deploy ai-sakhi-chat
echo "Deploying ai-sakhi-chat..."
if aws lambda get-function --function-name shebalance-ai-sakhi-chat &> /dev/null; then
    echo "Updating existing function..."
    aws lambda update-function-code \
      --function-name shebalance-ai-sakhi-chat \
      --zip-file fileb://ai-sakhi-chat.zip
else
    aws lambda create-function \
      --function-name shebalance-ai-sakhi-chat \
      --runtime nodejs18.x \
      --role $ROLE_ARN \
      --handler index.handler \
      --zip-file fileb://ai-sakhi-chat.zip \
      --timeout 60 \
      --memory-size 1024 \
      --environment Variables="{AWS_REGION=$AWS_REGION,USERS_TABLE=shebalance-users,ARTISAN_PROFILES_TABLE=shebalance-artisan-profiles,ORDERS_TABLE=shebalance-orders,LABOUR_TABLE=shebalance-labour-tracking,AI_CONVERSATIONS_TABLE=shebalance-ai-conversations}"
fi
echo -e "${GREEN}✅ ai-sakhi-chat deployed${NC}"

# Deploy ai-sakhi-context
echo "Deploying ai-sakhi-context..."
if aws lambda get-function --function-name shebalance-ai-sakhi-context &> /dev/null; then
    echo "Updating existing function..."
    aws lambda update-function-code \
      --function-name shebalance-ai-sakhi-context \
      --zip-file fileb://ai-sakhi-context.zip
else
    aws lambda create-function \
      --function-name shebalance-ai-sakhi-context \
      --runtime nodejs18.x \
      --role $ROLE_ARN \
      --handler index.handler \
      --zip-file fileb://ai-sakhi-context.zip \
      --timeout 30 \
      --memory-size 512 \
      --environment Variables="{AWS_REGION=$AWS_REGION,USERS_TABLE=shebalance-users,ARTISAN_PROFILES_TABLE=shebalance-artisan-profiles,ORDERS_TABLE=shebalance-orders,LABOUR_TABLE=shebalance-labour-tracking,SKILLSCAN_TABLE=shebalance-skillscan-results,AI_CONVERSATIONS_TABLE=shebalance-ai-conversations}"
fi
echo -e "${GREEN}✅ ai-sakhi-context deployed${NC}"

# Deploy ai-sakhi-intent
echo "Deploying ai-sakhi-intent..."
if aws lambda get-function --function-name shebalance-ai-sakhi-intent &> /dev/null; then
    echo "Updating existing function..."
    aws lambda update-function-code \
      --function-name shebalance-ai-sakhi-intent \
      --zip-file fileb://ai-sakhi-intent.zip
else
    aws lambda create-function \
      --function-name shebalance-ai-sakhi-intent \
      --runtime nodejs18.x \
      --role $ROLE_ARN \
      --handler index.handler \
      --zip-file fileb://ai-sakhi-intent.zip \
      --timeout 15 \
      --memory-size 256
fi
echo -e "${GREEN}✅ ai-sakhi-intent deployed${NC}"

# Deploy ai-sakhi-action
echo "Deploying ai-sakhi-action..."
if aws lambda get-function --function-name shebalance-ai-sakhi-action &> /dev/null; then
    echo "Updating existing function..."
    aws lambda update-function-code \
      --function-name shebalance-ai-sakhi-action \
      --zip-file fileb://ai-sakhi-action.zip
else
    aws lambda create-function \
      --function-name shebalance-ai-sakhi-action \
      --runtime nodejs18.x \
      --role $ROLE_ARN \
      --handler index.handler \
      --zip-file fileb://ai-sakhi-action.zip \
      --timeout 30 \
      --memory-size 512 \
      --environment Variables="{AWS_REGION=$AWS_REGION,SUPPORT_REQUESTS_TABLE=shebalance-support-requests,PAYMENT_REQUESTS_TABLE=shebalance-payment-requests,NOTIFICATIONS_TABLE=shebalance-notifications}"
fi
echo -e "${GREEN}✅ ai-sakhi-action deployed${NC}"

echo ""
echo "🎉 Deployment Complete!"
echo "======================="
echo ""
echo "Next Steps:"
echo "1. Enable Claude 3 Haiku in Amazon Bedrock console"
echo "2. Create API Gateway integration (see deployment guide)"
echo "3. Update frontend with API Gateway URL"
echo "4. Test the deployment"
echo ""
echo "Lambda Functions:"
echo "  - shebalance-ai-sakhi-chat"
echo "  - shebalance-ai-sakhi-context"
echo "  - shebalance-ai-sakhi-intent"
echo "  - shebalance-ai-sakhi-action"
echo ""
echo -e "${GREEN}✅ All Lambda functions deployed successfully!${NC}"
