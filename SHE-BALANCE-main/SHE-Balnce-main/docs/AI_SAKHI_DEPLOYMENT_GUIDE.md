# 🤖 AI Sakhi Backend Deployment Guide

## ✅ What You Get

A complete AI assistant backend that handles:
- ✅ Chat conversations with Claude 3.5 Sonnet
- ✅ Bulk order progress updates
- ✅ Health issue reports (URGENT priority)
- ✅ Advance payment requests
- ✅ Payment requests for completed work
- ✅ Support ticket creation
- ✅ Admin notifications via SNS
- ✅ Request tracking in DynamoDB

---

## 🏗️ Architecture

```
Frontend (ai-sakhi.js)
    ↓
API Gateway
    ↓
Lambda (lambda_ai_sakhi.py)
    ↓
├─→ Amazon Bedrock (Claude) - AI responses
├─→ DynamoDB - Store requests
└─→ SNS - Notify admins
```

---

## 🚀 Deployment Steps

### Step 1: Create DynamoDB Table

```bash
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
```

### Step 2: Create SNS Topic for Admin Alerts

```bash
aws sns create-topic \
  --name SheBalance-Admin-Alerts \
  --region us-east-1
```

**Subscribe your email:**
```bash
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:065538523474:SheBalance-Admin-Alerts \
  --protocol email \
  --notification-endpoint your-email@example.com
```

### Step 3: Create Lambda Function

```bash
cd aws-backend
zip lambda_ai_sakhi.zip lambda_ai_sakhi.py

aws lambda create-function \
  --function-name SheBalance-AI-Sakhi \
  --runtime python3.10 \
  --role arn:aws:iam::065538523474:role/SageMakerRole \
  --handler lambda_ai_sakhi.lambda_handler \
  --zip-file fileb://lambda_ai_sakhi.zip \
  --timeout 300 \
  --memory-size 512 \
  --region us-east-1
```

### Step 4: Create API Gateway

```bash
# Create HTTP API
API_ID=$(aws apigatewayv2 create-api \
  --name "SheBalance-AI-Sakhi-API" \
  --protocol-type HTTP \
  --region us-east-1 \
  --query 'ApiId' \
  --output text)

# Create integration
INTEGRATION_ID=$(aws apigatewayv2 create-integration \
  --api-id $API_ID \
  --integration-type AWS_PROXY \
  --integration-uri arn:aws:lambda:us-east-1:065538523474:function:SheBalance-AI-Sakhi \
  --payload-format-version 2.0 \
  --region us-east-1 \
  --query 'IntegrationId' \
  --output text)

# Create route
aws apigatewayv2 create-route \
  --api-id $API_ID \
  --route-key 'POST /sakhi' \
  --target integrations/$INTEGRATION_ID \
  --region us-east-1

# Create stage
aws apigatewayv2 create-stage \
  --api-id $API_ID \
  --stage-name prod \
  --auto-deploy \
  --region us-east-1

# Add Lambda permission
aws lambda add-permission \
  --function-name SheBalance-AI-Sakhi \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:us-east-1:065538523474:$API_ID/*/*" \
  --region us-east-1

echo "API Endpoint: https://$API_ID.execute-api.us-east-1.amazonaws.com/prod/sakhi"
```

### Step 5: Update Frontend

Edit `ai-sakhi.js` and update the API URL:
```javascript
const AI_SAKHI_API = 'https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/sakhi';
```

### Step 6: Add to Your HTML

```html
<!-- Add to your dashboard HTML -->
<script src="ai-sakhi.js"></script>
```

---

## 🧪 Testing

### Test Chat:
```bash
curl -X POST https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/sakhi \
  -H 'Content-Type: application/json' \
  -d '{
    "action": "chat",
    "artisan_id": "test_001",
    "message": "Hello Sakhi, how can you help me?"
  }'
```

### Test Bulk Order Update:
```bash
curl -X POST https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/sakhi \
  -H 'Content-Type: application/json' \
  -d '{
    "action": "update_bulk_order",
    "artisan_id": "test_001",
    "data": {
      "order_id": "ORD123",
      "progress": 75,
      "notes": "Almost done!"
    }
  }'
```

### Test Health Issue:
```bash
curl -X POST https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/sakhi \
  -H 'Content-Type: application/json' \
  -d '{
    "action": "report_health_issue",
    "artisan_id": "test_001",
    "data": {
      "issue_type": "illness",
      "severity": "medium",
      "description": "Feeling unwell, need rest"
    }
  }'
```

---

## 💰 Cost Estimate

### Monthly Costs:
- **Lambda**: $0 (free tier covers ~1M requests)
- **DynamoDB**: $0 (free tier covers 25GB)
- **API Gateway**: $1 per million requests
- **Bedrock (Claude)**: $3-10 depending on usage
- **SNS**: $0 (free tier covers 1000 emails)
- **Total**: ~$5-15/month

---

## 📊 Features

### 1. Chat with AI Sakhi
- Natural conversation
- Context-aware responses
- Multilingual support (add later)
- Conversation history

### 2. Bulk Order Updates
- Track progress
- Automatic admin notifications
- Encouraging messages
- Progress milestones

### 3. Health Issue Reports
- URGENT priority
- Immediate admin notification
- Empathetic responses
- Emergency contact info

### 4. Payment Requests
- Advance payments
- Work completion payments
- Automatic tracking
- Status updates

### 5. Support Tickets
- General help requests
- Automatic routing
- Response time estimates
- Ticket tracking

---

## 🔧 Customization

### Add More Languages:
Update the Lambda function to detect language and respond accordingly.

### Add Voice Support:
Integrate Amazon Polly for text-to-speech.

### Add WhatsApp Integration:
Use Twilio + Lambda to handle WhatsApp messages.

### Add Admin Dashboard:
Create a separate dashboard to view all requests.

---

## 📞 Quick Commands

### Update Lambda:
```bash
cd aws-backend
zip lambda_ai_sakhi.zip lambda_ai_sakhi.py
aws lambda update-function-code \
  --function-name SheBalance-AI-Sakhi \
  --zip-file fileb://lambda_ai_sakhi.zip \
  --region us-east-1
```

### View Logs:
```bash
aws logs tail /aws/lambda/SheBalance-AI-Sakhi --follow
```

### Check DynamoDB:
```bash
aws dynamodb scan \
  --table-name SheBalance-Sakhi-Requests \
  --limit 10 \
  --region us-east-1
```

---

## ✅ Success Checklist

- [ ] DynamoDB table created
- [ ] SNS topic created
- [ ] Email subscribed to SNS
- [ ] Lambda function deployed
- [ ] API Gateway created
- [ ] Lambda permission added
- [ ] Frontend updated with API URL
- [ ] Tested chat functionality
- [ ] Tested quick actions
- [ ] Admin notifications working

---

## 🎉 You're Done!

Your AI Sakhi backend is ready to help artisans with:
- Conversational AI support
- Order management
- Health monitoring
- Payment processing
- Support ticketing

**Test it now and make your hackathon demo amazing!** 🚀

