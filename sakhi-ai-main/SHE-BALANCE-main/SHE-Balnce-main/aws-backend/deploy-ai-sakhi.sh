#!/bin/bash

# Deploy AI Sakhi Backend to AWS

echo "============================================================"
echo "Deploying AI Sakhi Backend"
echo "============================================================"

# Create DynamoDB table
echo "Creating DynamoDB table..."
aws dynamodb create-table \
  --table-name SheBalance-Sakhi-Requests \
  --attribute-definitions \
    AttributeName=request_id,AttributeType=S \
    AttributeName=artisan_id,AttributeType=S \
  --key-schema \
    AttributeName=request_id,KeyType=HASH \
  --global-secondary-indexes \
    "[{\"IndexName\":\"artisan-index\",\"KeySchema\":[{\"AttributeName\":\"artisan_id\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}}]" \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1

# Create SNS topic for admin alerts
echo "Creating SNS topic..."
aws sns create-topic \
  --name SheBalance-Admin-Alerts \
  --region us-east-1

# Create Lambda function
echo "Creating Lambda function..."
zip -j lambda_ai_sakhi.zip lambda_ai_sakhi.py

aws lambda create-function \
  --function-name SheBalance-AI-Sakhi \
  --runtime python3.10 \
  --role arn:aws:iam::065538523474:role/SageMakerRole \
  --handler lambda_ai_sakhi.lambda_handler \
  --zip-file fileb://lambda_ai_sakhi.zip \
  --timeout 300 \
  --memory-size 512 \
  --region us-east-1

# Create API Gateway
echo "Creating API Gateway..."
API_ID=$(aws apigatewayv2 create-api \
  --name "SheBalance-AI-Sakhi-API" \
  --protocol-type HTTP \
  --target arn:aws:lambda:us-east-1:065538523474:function:SheBalance-AI-Sakhi \
  --region us-east-1 \
  --query 'ApiId' \
  --output text)

echo "API Gateway created: $API_ID"
echo "API Endpoint: https://$API_ID.execute-api.us-east-1.amazonaws.com"

echo ""
echo "============================================================"
echo "Deployment Complete!"
echo "============================================================"
echo ""
echo "API Endpoint: https://$API_ID.execute-api.us-east-1.amazonaws.com"
echo ""
echo "Test with:"
echo "curl -X POST https://$API_ID.execute-api.us-east-1.amazonaws.com/sakhi \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"action\":\"chat\",\"artisan_id\":\"test_001\",\"message\":\"Hello Sakhi\"}'"
echo ""
