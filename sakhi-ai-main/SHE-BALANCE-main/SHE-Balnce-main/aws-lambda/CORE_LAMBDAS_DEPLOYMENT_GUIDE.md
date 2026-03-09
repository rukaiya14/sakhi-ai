# 🚀 Core Lambda Functions Deployment Guide

## Overview

This guide covers deployment of the **10 HIGH PRIORITY Lambda functions** that provide core functionality for the SHE-BALANCE platform.

---

## 📦 Lambda Functions Included

### Authentication (2 functions)
1. **auth-login** - User authentication and JWT token generation
2. **auth-register** - New user registration

### User Management (2 functions)
3. **user-get-profile** - Get user profile with additional data
4. **user-update-profile** - Update user profile information

### Order Management (4 functions)
5. **order-create** - Create new orders
6. **order-list** - List orders for users
7. **order-update-status** - Update order status
8. **order-update-progress** - Update order progress percentage

### Artisan Management (2 functions)
9. **artisan-list** - List and search artisans
10. **artisan-get-details** - Get detailed artisan profile

---

## 🎯 Prerequisites

### 1. AWS Account Setup
- AWS account with appropriate permissions
- AWS CLI installed and configured
- IAM user with Lambda, DynamoDB, SNS, and API Gateway permissions

### 2. DynamoDB Tables
Ensure these tables exist (should be created by CDK):
- `shebalance-users`
- `shebalance-orders`
- `shebalance-labour`
- `shebalance-reviews`

### 3. Required GSIs (Global Secondary Indexes)

**shebalance-users table:**
- `email-index` (Partition key: email)
- `phone-index` (Partition key: phone)
- `userType-index` (Partition key: userType)

**shebalance-orders table:**
- `artisanId-index` (Partition key: artisanId)
- `buyerId-index` (Partition key: buyerId)
- `corporateId-index` (Partition key: corporateId)

**shebalance-labour table:**
- `userId-index` (Partition key: userId)

**shebalance-reviews table:**
- `artisanId-index` (Partition key: artisanId)

### 4. Environment Variables
Create a `.env` file or note these values:
```bash
AWS_REGION=us-east-1
USERS_TABLE=shebalance-users
ORDERS_TABLE=shebalance-orders
LABOUR_TABLE=shebalance-labour
REVIEWS_TABLE=shebalance-reviews
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRY=7d
SNS_TOPIC_ARN=arn:aws:sns:us-east-1:YOUR_ACCOUNT_ID:shebalance-notifications
```

---

## 🔧 Installation Steps

### Step 1: Install Dependencies

Navigate to each Lambda function directory and install dependencies:

```bash
# Authentication functions
cd aws-lambda/auth-login && npm install && cd ../..
cd aws-lambda/auth-register && npm install && cd ../..

# User management functions
cd aws-lambda/user-get-profile && npm install && cd ../..
cd aws-lambda/user-update-profile && npm install && cd ../..

# Order management functions
cd aws-lambda/order-create && npm install && cd ../..
cd aws-lambda/order-list && npm install && cd ../..
cd aws-lambda/order-update-status && npm install && cd ../..
cd aws-lambda/order-update-progress && npm install && cd ../..

# Artisan management functions
cd aws-lambda/artisan-list && npm install && cd ../..
cd aws-lambda/artisan-get-details && npm install && cd ../..
```

**Windows users:** Use the automated script instead (see Step 2)

---

### Step 2: Use Automated Deployment Script

**For Windows:**
```cmd
cd aws-lambda
deploy-core-lambdas.bat
```

**For Linux/Mac:**
```bash
cd aws-lambda
chmod +x deploy-core-lambdas.sh
./deploy-core-lambdas.sh
```

---

## 📝 Manual Deployment (Alternative)

If you prefer manual deployment, follow these steps for each function:

### 1. Create IAM Role

Create an IAM role for Lambda with these policies:
- `AWSLambdaBasicExecutionRole`
- DynamoDB access policy
- SNS publish policy

```bash
aws iam create-role \
  --role-name shebalance-lambda-role \
  --assume-role-policy-document file://lambda-trust-policy.json

aws iam attach-role-policy \
  --role-name shebalance-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam put-role-policy \
  --role-name shebalance-lambda-role \
  --policy-name DynamoDBAccess \
  --policy-document file://dynamodb-policy.json
```

### 2. Package Lambda Function

```bash
cd auth-login
zip -r ../auth-login.zip .
cd ..
```

### 3. Create Lambda Function

```bash
aws lambda create-function \
  --function-name shebalance-auth-login \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/shebalance-lambda-role \
  --handler index.handler \
  --zip-file fileb://auth-login.zip \
  --timeout 30 \
  --memory-size 512 \
  --environment Variables="{
    USERS_TABLE=shebalance-users,
    JWT_SECRET=your-secret-key,
    JWT_EXPIRY=7d,
    AWS_REGION=us-east-1
  }"
```

### 4. Repeat for All Functions

Repeat steps 2-3 for each of the 10 Lambda functions with appropriate names and configurations.

---

## 🌐 API Gateway Setup

### Step 1: Create REST API

```bash
aws apigateway create-rest-api \
  --name "SHE-BALANCE API" \
  --description "API for SHE-BALANCE platform" \
  --endpoint-configuration types=REGIONAL
```

### Step 2: Create Resources and Methods

**Authentication endpoints:**
- POST `/api/auth/login` → `shebalance-auth-login`
- POST `/api/auth/register` → `shebalance-auth-register`

**User endpoints:**
- GET `/api/user/profile` → `shebalance-user-get-profile`
- PUT `/api/user/profile` → `shebalance-user-update-profile`

**Order endpoints:**
- POST `/api/orders` → `shebalance-order-create`
- GET `/api/orders` → `shebalance-order-list`
- PUT `/api/orders/{orderId}/status` → `shebalance-order-update-status`
- PUT `/api/orders/{orderId}/progress` → `shebalance-order-update-progress`

**Artisan endpoints:**
- GET `/api/artisans` → `shebalance-artisan-list`
- GET `/api/artisans/{artisanId}` → `shebalance-artisan-get-details`

### Step 3: Deploy API

```bash
aws apigateway create-deployment \
  --rest-api-id YOUR_API_ID \
  --stage-name prod
```

Your API will be available at:
```
https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod
```

---

## 🧪 Testing

### Test Authentication

```bash
# Register new user
curl -X POST https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Artisan",
    "email": "test@example.com",
    "password": "password123",
    "userType": "artisan",
    "skills": ["weaving", "embroidery"]
  }'

# Login
curl -X POST https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test User Profile

```bash
# Get profile (use token from login)
curl -X GET https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Update profile
curl -X PUT https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Mumbai",
    "bio": "Experienced weaver with 10 years of experience"
  }'
```

### Test Orders

```bash
# Create order
curl -X POST https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "artisanId": "ARTISAN_USER_ID",
    "title": "Custom Saree",
    "description": "Traditional silk saree with embroidery",
    "price": 5000,
    "deliveryDate": "2026-04-01"
  }'

# List orders
curl -X GET https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Artisans

```bash
# List artisans
curl -X GET https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/api/artisans

# Get artisan details
curl -X GET https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/api/artisans/ARTISAN_ID
```

---

## 🔐 Security Configuration

### 1. Enable API Gateway Authorizer

Create a Lambda authorizer to validate JWT tokens:

```javascript
// lambda-authorizer.js
const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
  const token = event.authorizationToken.replace('Bearer ', '');
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    return {
      principalId: decoded.userId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [{
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: event.methodArn
        }]
      },
      context: {
        userId: decoded.userId,
        userType: decoded.userType
      }
    };
  } catch (error) {
    throw new Error('Unauthorized');
  }
};
```

### 2. Enable CORS

CORS headers are already included in all Lambda responses. Ensure API Gateway also has CORS enabled.

### 3. Rate Limiting

Configure API Gateway usage plans:

```bash
aws apigateway create-usage-plan \
  --name "Basic Plan" \
  --throttle burstLimit=100,rateLimit=50 \
  --quota limit=10000,period=DAY
```

---

## 📊 Monitoring

### CloudWatch Logs

All Lambda functions log to CloudWatch. View logs:

```bash
aws logs tail /aws/lambda/shebalance-auth-login --follow
```

### CloudWatch Metrics

Monitor these metrics:
- Invocations
- Duration
- Errors
- Throttles

### Create Alarms

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name shebalance-lambda-errors \
  --alarm-description "Alert on Lambda errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold
```

---

## 💰 Cost Estimation

### Monthly Costs (10,000 requests/function)

| Function | Requests | Duration | Memory | Cost |
|----------|----------|----------|--------|------|
| auth-login | 10,000 | 500ms | 512MB | $0.10 |
| auth-register | 2,000 | 600ms | 512MB | $0.03 |
| user-get-profile | 20,000 | 800ms | 512MB | $0.33 |
| user-update-profile | 5,000 | 400ms | 512MB | $0.04 |
| order-create | 5,000 | 700ms | 512MB | $0.07 |
| order-list | 15,000 | 600ms | 512MB | $0.18 |
| order-update-status | 3,000 | 500ms | 512MB | $0.03 |
| order-update-progress | 3,000 | 400ms | 256MB | $0.02 |
| artisan-list | 10,000 | 800ms | 512MB | $0.16 |
| artisan-get-details | 8,000 | 700ms | 512MB | $0.11 |
| **TOTAL** | | | | **$1.07/month** |

**Additional costs:**
- API Gateway: ~$0.35/month (100K requests)
- DynamoDB: ~$5-10/month (on-demand)
- CloudWatch Logs: ~$0.50/month

**Total estimated cost: ~$7-12/month**

---

## 🐛 Troubleshooting

### Issue: "Table not found"
**Solution:** Verify DynamoDB table names in environment variables

### Issue: "Access Denied"
**Solution:** Check IAM role has DynamoDB and SNS permissions

### Issue: "Invalid token"
**Solution:** Verify JWT_SECRET matches between functions

### Issue: "CORS error"
**Solution:** Enable CORS in API Gateway and verify headers in Lambda responses

### Issue: "Timeout"
**Solution:** Increase Lambda timeout or optimize queries

---

## ✅ Deployment Checklist

- [ ] All 10 Lambda functions created
- [ ] Dependencies installed for each function
- [ ] Environment variables configured
- [ ] IAM roles and policies set up
- [ ] DynamoDB tables exist with GSIs
- [ ] API Gateway configured
- [ ] API Gateway deployed to stage
- [ ] CORS enabled
- [ ] Lambda authorizer configured (optional)
- [ ] CloudWatch alarms set up
- [ ] Test all endpoints
- [ ] Update frontend API URLs
- [ ] Monitor logs for errors

---

## 🚀 Next Steps

After deploying these core functions:

1. **Update Frontend**
   - Change API base URL to API Gateway endpoint
   - Test all features end-to-end

2. **Deploy Medium Priority Functions**
   - AI Sakhi (already done!)
   - Voice Services
   - Reminder System
   - Labour Tracking
   - SkillScan

3. **Set Up Monitoring**
   - CloudWatch dashboards
   - Error alerts
   - Performance metrics

4. **Optimize**
   - Add caching
   - Optimize DynamoDB queries
   - Implement connection pooling

---

## 📞 Support

For issues or questions:
- Check CloudWatch logs
- Review IAM permissions
- Verify environment variables
- Test with Postman/curl

---

**Created:** March 5, 2026  
**Version:** 1.0  
**Status:** Ready for Deployment  
**Functions:** 10 Core Lambda Functions  
**Estimated Setup Time:** 2-3 hours  

