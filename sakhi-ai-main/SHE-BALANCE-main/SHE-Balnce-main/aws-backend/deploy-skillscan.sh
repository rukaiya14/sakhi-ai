#!/bin/bash

# SheBalance SkillScan AI Deployment Script
# Deploys AWS infrastructure and Lambda functions for SkillScan feature

set -e

# Configuration
STACK_NAME="SheBalance-SkillScan"
ENVIRONMENT="${1:-production}"
REGION="${2:-us-east-1}"

echo "========================================="
echo "SheBalance SkillScan AI Deployment"
echo "========================================="
echo "Stack Name: $STACK_NAME"
echo "Environment: $ENVIRONMENT"
echo "Region: $REGION"
echo "========================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "ERROR: AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check AWS credentials
echo "Checking AWS credentials..."
aws sts get-caller-identity > /dev/null 2>&1 || {
    echo "ERROR: AWS credentials not configured. Run 'aws configure' first."
    exit 1
}

echo "✓ AWS credentials verified"

# Create deployment package for SkillScan Analysis Lambda
echo ""
echo "Creating Lambda deployment package for SkillScan Analysis..."
mkdir -p lambda-packages
cd lambda-packages

# Package SkillScan Analysis Lambda
mkdir -p skillscan-analysis
cp ../lambda_skillscan_analysis.py skillscan-analysis/
cd skillscan-analysis
zip -r ../skillscan-analysis.zip .
cd ..

# Package Get SkillScans Lambda
mkdir -p get-skillscans
cp ../lambda_get_artisan_skillscans.py get-skillscans/
cd get-skillscans
zip -r ../get-skillscans.zip .
cd ../..

echo "✓ Lambda packages created"

# Deploy CloudFormation stack
echo ""
echo "Deploying CloudFormation stack..."
aws cloudformation deploy \
    --template-file skillscan-infrastructure.yaml \
    --stack-name "$STACK_NAME-$ENVIRONMENT" \
    --parameter-overrides Environment=$ENVIRONMENT \
    --capabilities CAPABILITY_NAMED_IAM \
    --region $REGION

echo "✓ CloudFormation stack deployed"

# Get stack outputs
echo ""
echo "Retrieving stack outputs..."
ANALYSIS_FUNCTION=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME-$ENVIRONMENT" \
    --region $REGION \
    --query "Stacks[0].Outputs[?OutputKey=='AnalyzeEndpoint'].OutputValue" \
    --output text)

GET_FUNCTION=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME-$ENVIRONMENT" \
    --region $REGION \
    --query "Stacks[0].Outputs[?OutputKey=='GetSkillScansEndpoint'].OutputValue" \
    --output text)

API_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME-$ENVIRONMENT" \
    --region $REGION \
    --query "Stacks[0].Outputs[?OutputKey=='APIEndpoint'].OutputValue" \
    --output text)

# Update Lambda function code
echo ""
echo "Updating Lambda function code..."

ANALYSIS_LAMBDA_NAME="SheBalance-SkillScan-Analysis-$ENVIRONMENT"
aws lambda update-function-code \
    --function-name $ANALYSIS_LAMBDA_NAME \
    --zip-file fileb://lambda-packages/skillscan-analysis.zip \
    --region $REGION > /dev/null

echo "✓ SkillScan Analysis Lambda updated"

GET_LAMBDA_NAME="SheBalance-Get-SkillScans-$ENVIRONMENT"
aws lambda update-function-code \
    --function-name $GET_LAMBDA_NAME \
    --zip-file fileb://lambda-packages/get-skillscans.zip \
    --region $REGION > /dev/null

echo "✓ Get SkillScans Lambda updated"

# Clean up
echo ""
echo "Cleaning up temporary files..."
rm -rf lambda-packages

echo ""
echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo ""
echo "API Endpoints:"
echo "  Base URL: $API_ENDPOINT"
echo "  Analyze: $ANALYSIS_FUNCTION"
echo "  Get SkillScans: $GET_FUNCTION"
echo ""
echo "Next Steps:"
echo "1. Update your frontend config with the API endpoint"
echo "2. Test the SkillScan feature with sample images"
echo "3. Monitor CloudWatch logs for any issues"
echo ""
echo "CloudWatch Logs:"
echo "  Analysis: /aws/lambda/$ANALYSIS_LAMBDA_NAME"
echo "  Get SkillScans: /aws/lambda/$GET_LAMBDA_NAME"
echo ""
echo "========================================="
