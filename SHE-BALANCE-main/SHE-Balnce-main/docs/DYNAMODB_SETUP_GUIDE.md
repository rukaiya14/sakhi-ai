# 🚀 AWS DynamoDB Setup Guide for SHE-BALANCE

## Overview

Your SHE-BALANCE backend is now configured to use **AWS DynamoDB** instead of MySQL. This provides a fully serverless, scalable database solution.

## ✅ What's Been Updated

- ✅ DynamoDB client created (`backend/dynamodb-client.js`)
- ✅ Server updated to use DynamoDB (`backend/server-dynamodb.js`)
- ✅ Table setup script ready (`backend/aws-dynamodb-setup.js`)
- ✅ Sample data initialization script (`backend/scripts/init-dynamodb-data.js`)
- ✅ Package.json updated with AWS SDK

## 📋 Prerequisites

1. **AWS Account** - Create one at https://aws.amazon.com/
2. **AWS CLI** - Install from https://aws.amazon.com/cli/
3. **Node.js** - Already installed ✅

## 🔧 Setup Steps

### Step 1: Configure AWS Credentials

#### Option A: Using AWS CLI (Recommended)

```bash
# Install AWS CLI if not already installed
# Then configure:
aws configure

# Enter your credentials:
AWS Access Key ID: YOUR_ACCESS_KEY
AWS Secret Access Key: YOUR_SECRET_KEY
Default region name: us-east-1
Default output format: json
```

#### Option B: Using Environment Variables

Edit `backend/.env`:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
DYNAMODB_TABLE_PREFIX=shebalance-
```

### Step 2: Create DynamoDB Tables

```bash
cd backend
npm run setup-dynamodb
```

This creates 18 DynamoDB tables:
- shebalance-users
- shebalance-artisan-profiles
- shebalance-buyer-profiles
- shebalance-corporate-profiles
- shebalance-products
- shebalance-orders
- shebalance-bulk-orders
- shebalance-skillscan-results
- shebalance-learning-progress
- shebalance-labour-tracking
- shebalance-ai-conversations
- shebalance-support-requests
- shebalance-payment-requests
- shebalance-transactions
- shebalance-favorites
- shebalance-reviews
- shebalance-notifications
- shebalance-health-alerts

### Step 3: Initialize Sample Data

```bash
npm run init-sample-data
```

This creates:
- Admin user: admin@shebalance.com / admin123
- Artisan user: priya@example.com / artisan123
- Buyer user: rahul@example.com / buyer123

### Step 4: Start the Server

```bash
npm start
```

You should see:
```
🚀 SHE-BALANCE Backend Server running on port 5000
📊 Database: AWS DynamoDB
🔗 API: http://localhost:5000
🌍 Region: us-east-1
```

## 🧪 Test the Setup

### Test 1: Health Check

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2026-03-02T...",
  "database": "DynamoDB"
}
```

### Test 2: Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"priya@example.com","password":"artisan123"}'
```

### Test 3: Get Profile (with token from login)

```bash
curl http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📊 DynamoDB Table Structure

### Users Table
```
Primary Key: userId (String)
GSI: EmailIndex (email)
GSI: RoleIndex (role)
```

### Artisan Profiles Table
```
Primary Key: artisanId (String)
GSI: UserIdIndex (userId)
```

### Orders Table
```
Primary Key: orderId (String)
GSI: BuyerIdIndex (buyerId)
GSI: ArtisanIdIndex (artisanId)
GSI: StatusIndex (status)
```

### SkillScan Results Table
```
Primary Key: scanId (String)
GSI: ArtisanIdIndex (artisanId)
```

## 💰 Cost Estimation

### Free Tier (First 12 Months)
- 25 GB of storage
- 25 read capacity units
- 25 write capacity units
- Enough for development and testing

### After Free Tier
- On-Demand Pricing: Pay per request
- Provisioned Capacity: ~$0.25/month per table (minimal usage)

**Estimated cost for SHE-BALANCE**: $5-10/month for moderate usage

## 🔒 Security Best Practices

### 1. IAM User Setup

Create a dedicated IAM user for your application:

```bash
# In AWS Console:
1. Go to IAM → Users → Add User
2. Name: shebalance-backend
3. Access type: Programmatic access
4. Attach policy: AmazonDynamoDBFullAccess
5. Save credentials
```

### 2. Restrict Permissions

For production, use a custom policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:*:table/shebalance-*"
    }
  ]
}
```

### 3. Enable Encryption

All DynamoDB tables are encrypted at rest by default.

## 🚀 Deployment Options

### Option 1: Local Development (Current)

```
Your Computer → DynamoDB (AWS Cloud)
```

- Backend runs locally
- Database in AWS
- Good for development

### Option 2: AWS Lambda (Serverless)

```
API Gateway → Lambda Functions → DynamoDB
```

- Fully serverless
- Auto-scaling
- Pay per request

### Option 3: AWS EC2

```
EC2 Instance → DynamoDB
```

- Traditional server
- More control
- Fixed costs

## 📝 Common Commands

### Create Tables
```bash
npm run setup-dynamodb
```

### Delete All Tables
```bash
npm run cleanup-dynamodb
```

### Initialize Sample Data
```bash
npm run init-sample-data
```

### Start Server
```bash
npm start
```

### Start with Auto-Reload
```bash
npm run dev
```

## 🔍 Monitoring

### View Tables in AWS Console

1. Go to https://console.aws.amazon.com/dynamodb/
2. Select your region (us-east-1)
3. Click "Tables"
4. You'll see all shebalance-* tables

### Check Table Data

```bash
# Using AWS CLI
aws dynamodb scan --table-name shebalance-users --limit 10
```

### View Metrics

In AWS Console:
1. Select a table
2. Click "Metrics" tab
3. View read/write capacity, throttles, etc.

## 🐛 Troubleshooting

### Error: "Missing credentials in config"

**Solution**: Configure AWS credentials
```bash
aws configure
```

### Error: "ResourceNotFoundException"

**Solution**: Create tables first
```bash
npm run setup-dynamodb
```

### Error: "ConditionalCheckFailedException"

**Solution**: Item already exists (usually safe to ignore for sample data)

### Error: "ProvisionedThroughputExceededException"

**Solution**: Increase table capacity or use on-demand billing

### Error: "AccessDeniedException"

**Solution**: Check IAM permissions
```bash
aws iam get-user
aws sts get-caller-identity
```

## 📊 Comparing MySQL vs DynamoDB

| Feature | MySQL | DynamoDB |
|---------|-------|----------|
| Setup | Install locally | AWS account only |
| Scaling | Manual | Automatic |
| Cost | Free (local) | ~$5-10/month |
| Maintenance | You manage | AWS manages |
| Backup | Manual | Automatic |
| Performance | Good | Excellent |
| Serverless | No | Yes |

## 🎯 Next Steps

### Immediate
1. ✅ Configure AWS credentials
2. ✅ Run `npm run setup-dynamodb`
3. ✅ Run `npm run init-sample-data`
4. ✅ Start server with `npm start`
5. ✅ Test login with sample users

### Short-term
1. Update frontend to use backend API
2. Test all features (SkillScan, Orders, etc.)
3. Monitor DynamoDB usage in AWS Console

### Long-term
1. Deploy backend to AWS Lambda
2. Set up API Gateway
3. Configure custom domain
4. Enable CloudWatch monitoring
5. Set up automated backups

## 💡 Pro Tips

### 1. Use DynamoDB Local for Development

```bash
# Install DynamoDB Local
docker run -p 8000:8000 amazon/dynamodb-local

# Update .env
DYNAMODB_ENDPOINT=http://localhost:8000
```

### 2. Enable Point-in-Time Recovery

In AWS Console:
1. Select table
2. Backups tab
3. Enable point-in-time recovery

### 3. Set Up Alarms

Create CloudWatch alarms for:
- High read/write capacity
- Throttled requests
- System errors

### 4. Use Batch Operations

For bulk data operations, use batch APIs:
```javascript
// Instead of multiple putItem calls
dynamodb.batchWriteItem({...})
```

## 📞 Support

### AWS Resources
- DynamoDB Documentation: https://docs.aws.amazon.com/dynamodb/
- AWS Support: https://console.aws.amazon.com/support/
- AWS Forums: https://forums.aws.amazon.com/

### SHE-BALANCE Resources
- Backend README: `backend/README.md`
- Architecture Docs: `BACKEND_ARCHITECTURE.md`
- API Documentation: Check backend/server-dynamodb.js

## ✨ Summary

```
┌─────────────────────────────────────────────────────────┐
│           DYNAMODB SETUP CHECKLIST                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ☐ AWS account created                                  │
│  ☐ AWS CLI installed and configured                     │
│  ☐ AWS credentials in .env file                         │
│  ☐ DynamoDB tables created (npm run setup-dynamodb)     │
│  ☐ Sample data initialized (npm run init-sample-data)   │
│  ☐ Backend server started (npm start)                   │
│  ☐ Health check successful                              │
│  ☐ Login test successful                                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Your backend is now running with AWS DynamoDB!** 🎉

No MySQL installation needed. Everything is in the cloud and ready to scale!
