# 🤖 AI Sakhi Lambda Functions - Deployment Guide

## Overview

This guide covers the deployment of 4 Lambda functions that power the AI Sakhi chat system with Amazon Bedrock (Claude 3 Haiku).

---

## 📦 Lambda Functions Created

### 1. **ai-sakhi-chat** (Main Chat Handler)
**Purpose:** Main chat endpoint with Bedrock integration  
**Runtime:** Node.js 18.x  
**Memory:** 1024 MB  
**Timeout:** 60 seconds  
**Trigger:** API Gateway POST `/api/ai-sakhi/chat`

**Features:**
- Processes chat messages
- Integrates with Amazon Bedrock (Claude 3 Haiku)
- Fetches user context from DynamoDB
- Saves conversation history
- Detects intent and triggers actions
- Fallback responses if Bedrock fails

**Dependencies:**
- `@aws-sdk/client-bedrock-runtime`
- `@aws-sdk/client-dynamodb`
- `@aws-sdk/lib-dynamodb`

---

### 2. **ai-sakhi-context** (Context Fetcher)
**Purpose:** Fetches comprehensive user context for AI conversations  
**Runtime:** Node.js 18.x  
**Memory:** 512 MB  
**Timeout:** 30 seconds  
**Trigger:** API Gateway GET `/api/ai-sakhi/context/:userId`

**Features:**
- Fetches user profile
- Gets active orders and progress
- Retrieves pending payments
- Fetches labour tracking data
- Gets SkillScan results
- Retrieves recent conversations
- Generates context summary

**Dependencies:**
- `@aws-sdk/client-dynamodb`
- `@aws-sdk/lib-dynamodb`

---

### 3. **ai-sakhi-intent** (Intent Detection)
**Purpose:** Analyzes messages to detect intent and classify requests  
**Runtime:** Node.js 18.x  
**Memory:** 256 MB  
**Timeout:** 15 seconds  
**Trigger:** API Gateway POST `/api/ai-sakhi/intent`

**Features:**
- Intent classification (payment, health, order, support, skills)
- Confidence scoring
- Entity extraction (amounts, dates, order IDs)
- Priority assessment
- Action recommendations

**Dependencies:** None (pure JavaScript)

---

### 4. **ai-sakhi-action** (Action Trigger)
**Purpose:** Triggers automated actions based on detected intents  
**Runtime:** Node.js 18.x  
**Memory:** 512 MB  
**Timeout:** 30 seconds  
**Trigger:** API Gateway POST `/api/ai-sakhi/action`

**Features:**
- Payment request creation
- Support ticket creation
- Health alert handling
- SNS notifications
- Step Functions workflow triggering
- Emergency response protocols

**Dependencies:**
- `@aws-sdk/client-dynamodb`
- `@aws-sdk/lib-dynamodb`
- `@aws-sdk/client-sns`
- `@aws-sdk/client-sfn`

---

## 🚀 Deployment Steps

### Step 1: Install Dependencies

Navigate to each Lambda directory and install dependencies:

```bash
# ai-sakhi-chat
cd aws-lambda/ai-sakhi-chat
npm install

# ai-sakhi-context
cd ../ai-sakhi-context
npm install

# ai-sakhi-intent
cd ../ai-sakhi-intent
npm install

# ai-sakhi-action
cd ../ai-sakhi-action
npm install
```

---

### Step 2: Create Deployment Packages

Create ZIP files for each Lambda:

```bash
# From aws-lambda directory

# ai-sakhi-chat
cd ai-sakhi-chat
zip -r ../ai-sakhi-chat.zip .
cd ..

# ai-sakhi-context
cd ai-sakhi-context
zip -r ../ai-sakhi-context.zip .
cd ..

# ai-sakhi-intent
cd ai-sakhi-intent
zip -r ../ai-sakhi-intent.zip .
cd ..

# ai-sakhi-action
cd ai-sakhi-action
zip -r ../ai-sakhi-action.zip .
cd ..
```

---

### Step 3: Deploy via AWS CLI

#### Create IAM Role for Lambda

```bash
# Create trust policy
cat > lambda-trust-policy.json << EOF
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
  --role-name SheBalance-AI-Sakhi-Lambda-Role \
  --assume-role-policy-document file://lambda-trust-policy.json

# Attach policies
aws iam attach-role-policy \
  --role-name SheBalance-AI-Sakhi-Lambda-Role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# Create custom policy for Bedrock, DynamoDB, SNS, SFN
cat > lambda-custom-policy.json << EOF
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
  --role-name SheBalance-AI-Sakhi-Lambda-Role \
  --policy-name SheBalance-AI-Sakhi-Custom-Policy \
  --policy-document file://lambda-custom-policy.json
```

#### Deploy Lambda Functions

```bash
# Get role ARN
ROLE_ARN=$(aws iam get-role --role-name SheBalance-AI-Sakhi-Lambda-Role --query 'Role.Arn' --output text)

# Deploy ai-sakhi-chat
aws lambda create-function \
  --function-name shebalance-ai-sakhi-chat \
  --runtime nodejs18.x \
  --role $ROLE_ARN \
  --handler index.handler \
  --zip-file fileb://ai-sakhi-chat.zip \
  --timeout 60 \
  --memory-size 1024 \
  --environment Variables="{
    AWS_REGION=us-east-1,
    USERS_TABLE=shebalance-users,
    ARTISAN_PROFILES_TABLE=shebalance-artisan-profiles,
    ORDERS_TABLE=shebalance-orders,
    LABOUR_TABLE=shebalance-labour-tracking,
    AI_CONVERSATIONS_TABLE=shebalance-ai-conversations
  }"

# Deploy ai-sakhi-context
aws lambda create-function \
  --function-name shebalance-ai-sakhi-context \
  --runtime nodejs18.x \
  --role $ROLE_ARN \
  --handler index.handler \
  --zip-file fileb://ai-sakhi-context.zip \
  --timeout 30 \
  --memory-size 512 \
  --environment Variables="{
    AWS_REGION=us-east-1,
    USERS_TABLE=shebalance-users,
    ARTISAN_PROFILES_TABLE=shebalance-artisan-profiles,
    ORDERS_TABLE=shebalance-orders,
    LABOUR_TABLE=shebalance-labour-tracking,
    SKILLSCAN_TABLE=shebalance-skillscan-results,
    AI_CONVERSATIONS_TABLE=shebalance-ai-conversations
  }"

# Deploy ai-sakhi-intent
aws lambda create-function \
  --function-name shebalance-ai-sakhi-intent \
  --runtime nodejs18.x \
  --role $ROLE_ARN \
  --handler index.handler \
  --zip-file fileb://ai-sakhi-intent.zip \
  --timeout 15 \
  --memory-size 256

# Deploy ai-sakhi-action
aws lambda create-function \
  --function-name shebalance-ai-sakhi-action \
  --runtime nodejs18.x \
  --role $ROLE_ARN \
  --handler index.handler \
  --zip-file fileb://ai-sakhi-action.zip \
  --timeout 30 \
  --memory-size 512 \
  --environment Variables="{
    AWS_REGION=us-east-1,
    SUPPORT_REQUESTS_TABLE=shebalance-support-requests,
    PAYMENT_REQUESTS_TABLE=shebalance-payment-requests,
    NOTIFICATIONS_TABLE=shebalance-notifications,
    SUPPORT_TEAM_TOPIC_ARN=arn:aws:sns:us-east-1:YOUR_ACCOUNT:shebalance-support-team
  }"
```

---

### Step 4: Create API Gateway Integration

```bash
# Create REST API
API_ID=$(aws apigateway create-rest-api \
  --name "SheBalance-AI-Sakhi-API" \
  --description "AI Sakhi Chat API" \
  --query 'id' \
  --output text)

# Get root resource ID
ROOT_ID=$(aws apigateway get-resources \
  --rest-api-id $API_ID \
  --query 'items[0].id' \
  --output text)

# Create /ai-sakhi resource
AI_SAKHI_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $ROOT_ID \
  --path-part "ai-sakhi" \
  --query 'id' \
  --output text)

# Create /ai-sakhi/chat resource
CHAT_ID=$(aws apigateway create-resource \
  --rest-api-id $API_ID \
  --parent-id $AI_SAKHI_ID \
  --path-part "chat" \
  --query 'id' \
  --output text)

# Create POST method for /ai-sakhi/chat
aws apigateway put-method \
  --rest-api-id $API_ID \
  --resource-id $CHAT_ID \
  --http-method POST \
  --authorization-type "NONE"

# Get Lambda ARN
LAMBDA_ARN=$(aws lambda get-function \
  --function-name shebalance-ai-sakhi-chat \
  --query 'Configuration.FunctionArn' \
  --output text)

# Create Lambda integration
aws apigateway put-integration \
  --rest-api-id $API_ID \
  --resource-id $CHAT_ID \
  --http-method POST \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/$LAMBDA_ARN/invocations"

# Grant API Gateway permission to invoke Lambda
aws lambda add-permission \
  --function-name shebalance-ai-sakhi-chat \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:us-east-1:*:$API_ID/*/*"

# Deploy API
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name prod

echo "API Gateway URL: https://$API_ID.execute-api.us-east-1.amazonaws.com/prod/ai-sakhi/chat"
```

---

### Step 5: Enable Bedrock Model Access

1. Go to AWS Console → Amazon Bedrock
2. Navigate to "Model access"
3. Click "Manage model access"
4. Enable "Claude 3 Haiku" by Anthropic
5. Submit request (usually instant approval)

---

### Step 6: Test the Deployment

```bash
# Test ai-sakhi-chat Lambda
aws lambda invoke \
  --function-name shebalance-ai-sakhi-chat \
  --payload '{"body":"{\"message\":\"Hello, I need help with my order\",\"userId\":\"test-user-123\"}"}' \
  response.json

cat response.json

# Test via API Gateway
curl -X POST \
  https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/ai-sakhi/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "Hello, I need help with my order",
    "conversationHistory": []
  }'
```

---

## 🔧 Environment Variables

### ai-sakhi-chat
- `AWS_REGION` - AWS region (default: us-east-1)
- `USERS_TABLE` - DynamoDB users table name
- `ARTISAN_PROFILES_TABLE` - DynamoDB artisan profiles table
- `ORDERS_TABLE` - DynamoDB orders table
- `LABOUR_TABLE` - DynamoDB labour tracking table
- `AI_CONVERSATIONS_TABLE` - DynamoDB conversations table

### ai-sakhi-context
- Same as ai-sakhi-chat plus:
- `SKILLSCAN_TABLE` - DynamoDB SkillScan results table

### ai-sakhi-action
- `SUPPORT_REQUESTS_TABLE` - DynamoDB support requests table
- `PAYMENT_REQUESTS_TABLE` - DynamoDB payment requests table
- `NOTIFICATIONS_TABLE` - DynamoDB notifications table
- `SUPPORT_TEAM_TOPIC_ARN` - SNS topic for support team alerts
- `WELLNESS_CHECK_STATE_MACHINE_ARN` - Step Functions state machine ARN

---

## 📊 Monitoring

### CloudWatch Logs

Each Lambda function logs to CloudWatch:
- `/aws/lambda/shebalance-ai-sakhi-chat`
- `/aws/lambda/shebalance-ai-sakhi-context`
- `/aws/lambda/shebalance-ai-sakhi-intent`
- `/aws/lambda/shebalance-ai-sakhi-action`

### CloudWatch Metrics

Monitor these metrics:
- Invocations
- Duration
- Errors
- Throttles
- Concurrent Executions

### Set Up Alarms

```bash
# Create alarm for errors
aws cloudwatch put-metric-alarm \
  --alarm-name shebalance-ai-sakhi-chat-errors \
  --alarm-description "Alert when AI Sakhi chat has errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=shebalance-ai-sakhi-chat
```

---

## 💰 Cost Estimation

### Lambda Costs (1000 users, 10 messages/user/month)
- **Requests:** 10,000 requests/month
- **Duration:** ~2 seconds average
- **Memory:** 1024 MB
- **Cost:** ~$0.40/month

### Bedrock Costs (Claude 3 Haiku)
- **Input tokens:** ~500 tokens/request × 10,000 = 5M tokens
- **Output tokens:** ~200 tokens/request × 10,000 = 2M tokens
- **Cost:** ~$1.25/month (input) + ~$2.50/month (output) = **$3.75/month**

### DynamoDB Costs
- **Reads:** 50,000/month
- **Writes:** 20,000/month
- **Cost:** ~$0.50/month

### Total: ~$5/month for 10,000 conversations

---

## 🔐 Security Best Practices

1. **Enable API Gateway Authorization**
   - Use Cognito User Pool Authorizer
   - Or implement custom Lambda authorizer

2. **Encrypt Environment Variables**
   - Use AWS KMS for sensitive data
   - Store secrets in AWS Secrets Manager

3. **Enable VPC for Lambda** (Optional)
   - For enhanced security
   - Access DynamoDB via VPC endpoint

4. **Implement Rate Limiting**
   - Use API Gateway throttling
   - Set per-user limits

5. **Enable CloudTrail**
   - Log all API calls
   - Monitor for suspicious activity

---

## 🐛 Troubleshooting

### Issue: Bedrock Access Denied
**Solution:** Enable Claude 3 Haiku model access in Bedrock console

### Issue: DynamoDB Table Not Found
**Solution:** Verify table names in environment variables match actual table names

### Issue: Lambda Timeout
**Solution:** Increase timeout or optimize code

### Issue: CORS Errors
**Solution:** Add CORS headers to Lambda responses (already included)

### Issue: High Costs
**Solution:** 
- Implement caching
- Reduce conversation history length
- Use shorter prompts

---

## 📝 Next Steps

1. **Update Frontend** - Point `ai-sakhi-chat.js` to new API Gateway URL
2. **Test End-to-End** - Test complete chat flow
3. **Monitor Performance** - Set up CloudWatch dashboards
4. **Optimize Costs** - Implement caching and rate limiting
5. **Add Features** - Implement remaining Lambda functions (context, intent, action)

---

## 📞 Support

For issues or questions:
- Check CloudWatch Logs
- Review this deployment guide
- Refer to AWS Lambda documentation
- Contact AWS Support if needed

---

**Deployment Date:** March 5, 2026  
**Version:** 1.0  
**Status:** Ready for Production
