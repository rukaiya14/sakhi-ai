# 📱 WhatsApp Automated Reminders - Complete Guide

## Overview

Automated WhatsApp reminder system that sends messages to artisans who haven't updated their bulk order progress for 3+ consecutive days.

```
┌─────────────────────────────────────────────────────────┐
│              WHATSAPP REMINDER SYSTEM                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  EventBridge (Daily 9 AM)                              │
│         ↓                                               │
│  Lambda Function                                        │
│         ↓                                               │
│  Check DynamoDB Orders                                  │
│         ↓                                               │
│  Find Orders Without Updates (3+ days)                  │
│         ↓                                               │
│  Send WhatsApp via AWS SNS                             │
│         ↓                                               │
│  Create Notification Record                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Features

### Automated Monitoring
- ✅ Checks all active bulk orders daily
- ✅ Identifies orders without progress updates for 3+ days
- ✅ Prevents spam (max 1 reminder per 24 hours)
- ✅ Tracks reminder history

### Smart Messaging
- ✅ Personalized messages with artisan name
- ✅ Includes order details and ID
- ✅ Shows days since last update
- ✅ Provides direct link to dashboard

### Multi-Channel Notifications
- ✅ WhatsApp via AWS SNS
- ✅ In-app notifications
- ✅ Email notifications (optional)

---

## 🏗️ Architecture

### Components

1. **Lambda Function**: `lambda_check_order_progress.py`
   - Runs daily via EventBridge
   - Queries DynamoDB for stale orders
   - Sends WhatsApp messages via SNS
   - Creates notification records

2. **EventBridge Rule**: `shebalance-daily-order-check`
   - Schedule: Daily at 9:00 AM UTC
   - Triggers Lambda function
   - Configurable schedule

3. **DynamoDB Tables**:
   - `shebalance-orders` - Order tracking
   - `shebalance-users` - User phone numbers
   - `shebalance-artisan-profiles` - Artisan details
   - `shebalance-notifications` - Notification history

4. **AWS SNS**:
   - Sends SMS/WhatsApp messages
   - Supports international numbers
   - Transactional messaging

---

## 📋 Prerequisites

### AWS Services Required
- ✅ AWS Lambda
- ✅ Amazon EventBridge
- ✅ Amazon DynamoDB
- ✅ Amazon SNS
- ✅ AWS IAM

### Permissions Needed
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:Scan",
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/shebalance-*"
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
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

---

## 🚀 Deployment

### Method 1: Automated Deployment (Windows)

```batch
cd aws-backend
deploy-whatsapp-reminders.bat
```

### Method 2: Automated Deployment (Linux/Mac)

```bash
cd aws-backend
chmod +x deploy-whatsapp-reminders.sh
./deploy-whatsapp-reminders.sh
```

### Method 3: Manual Deployment

#### Step 1: Create IAM Role

```bash
# Create trust policy
cat > trust-policy.json << EOF
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
  --role-name shebalance-lambda-reminder-role \
  --assume-role-policy-document file://trust-policy.json

# Attach policies
aws iam attach-role-policy \
  --role-name shebalance-lambda-reminder-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam attach-role-policy \
  --role-name shebalance-lambda-reminder-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

aws iam attach-role-policy \
  --role-name shebalance-lambda-reminder-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonSNSFullAccess
```

#### Step 2: Package Lambda Function

```bash
cd aws-backend
zip lambda_check_order_progress.zip lambda_check_order_progress.py
```

#### Step 3: Create Lambda Function

```bash
aws lambda create-function \
  --function-name shebalance-check-order-progress \
  --runtime python3.9 \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/shebalance-lambda-reminder-role \
  --handler lambda_check_order_progress.lambda_handler \
  --zip-file fileb://lambda_check_order_progress.zip \
  --timeout 300 \
  --memory-size 512 \
  --region us-east-1
```

#### Step 4: Create EventBridge Rule

```bash
# Create rule (runs daily at 9 AM UTC)
aws events put-rule \
  --name shebalance-daily-order-check \
  --schedule-expression "cron(0 9 * * ? *)" \
  --state ENABLED \
  --region us-east-1

# Add Lambda permission
aws lambda add-permission \
  --function-name shebalance-check-order-progress \
  --statement-id AllowEventBridgeInvoke \
  --action lambda:InvokeFunction \
  --principal events.amazonaws.com \
  --source-arn arn:aws:events:us-east-1:YOUR_ACCOUNT_ID:rule/shebalance-daily-order-check \
  --region us-east-1

# Add Lambda as target
aws events put-targets \
  --rule shebalance-daily-order-check \
  --targets "Id=1,Arn=arn:aws:lambda:us-east-1:YOUR_ACCOUNT_ID:function:shebalance-check-order-progress" \
  --region us-east-1
```

---

## 📱 SNS Configuration for WhatsApp

### Option 1: SMS (Immediate)

AWS SNS can send SMS messages directly:

```python
sns.publish(
    PhoneNumber='+919876543210',
    Message='Your reminder message',
    MessageAttributes={
        'AWS.SNS.SMS.SMSType': {
            'DataType': 'String',
            'StringValue': 'Transactional'
        }
    }
)
```

**Pros**: Easy setup, works immediately  
**Cons**: SMS only, not true WhatsApp

### Option 2: WhatsApp Business API (Recommended)

For true WhatsApp messages, integrate with WhatsApp Business API:

1. **Sign up for WhatsApp Business API**
   - Go to https://business.whatsapp.com/
   - Apply for API access
   - Get approved (takes 1-2 weeks)

2. **Use Twilio WhatsApp Integration**
   ```python
   from twilio.rest import Client
   
   client = Client(account_sid, auth_token)
   message = client.messages.create(
       from_='whatsapp:+14155238886',
       body='Your reminder message',
       to='whatsapp:+919876543210'
   )
   ```

3. **Update Lambda Function**
   - Add Twilio credentials to environment variables
   - Replace SNS publish with Twilio API call

### Option 3: Third-Party WhatsApp Gateway

Use services like:
- **Twilio** (https://www.twilio.com/whatsapp)
- **MessageBird** (https://messagebird.com/whatsapp)
- **Vonage** (https://www.vonage.com/communications-apis/messages/)

---

## 🧪 Testing

### Test Lambda Function Manually

```bash
# Invoke Lambda function
aws lambda invoke \
  --function-name shebalance-check-order-progress \
  --region us-east-1 \
  output.json

# View output
cat output.json
```

### Test with Sample Data

```bash
# Create test order without progress update
aws dynamodb put-item \
  --table-name shebalance-orders \
  --item '{
    "orderId": {"S": "test-order-123"},
    "artisanId": {"S": "your-artisan-id"},
    "buyerId": {"S": "buyer-id"},
    "orderType": {"S": "bulk"},
    "status": {"S": "in_progress"},
    "title": {"S": "Test Bulk Order"},
    "quantity": {"N": "100"},
    "unitPrice": {"N": "500"},
    "totalAmount": {"N": "50000"},
    "createdAt": {"S": "2026-02-27T00:00:00Z"},
    "updatedAt": {"S": "2026-02-27T00:00:00Z"}
  }'

# Run Lambda function
aws lambda invoke \
  --function-name shebalance-check-order-progress \
  output.json
```

### View CloudWatch Logs

```bash
# Get log streams
aws logs describe-log-streams \
  --log-group-name /aws/lambda/shebalance-check-order-progress \
  --order-by LastEventTime \
  --descending \
  --max-items 1

# View logs
aws logs tail /aws/lambda/shebalance-check-order-progress --follow
```

---

## 📊 Monitoring

### CloudWatch Metrics

Monitor these metrics:
- **Invocations**: Number of times Lambda runs
- **Duration**: Execution time
- **Errors**: Failed executions
- **Throttles**: Rate limit hits

### CloudWatch Alarms

Create alarms for:
```bash
# Create alarm for Lambda errors
aws cloudwatch put-metric-alarm \
  --alarm-name shebalance-reminder-errors \
  --alarm-description "Alert on Lambda errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 1 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=shebalance-check-order-progress
```

### Custom Logging

Lambda function logs:
- Orders checked
- Reminders sent
- Errors encountered
- Phone numbers contacted

---

## 🔧 Configuration

### Change Schedule

Edit EventBridge rule:

```bash
# Run every 6 hours
aws events put-rule \
  --name shebalance-daily-order-check \
  --schedule-expression "cron(0 */6 * * ? *)"

# Run twice daily (9 AM and 6 PM UTC)
aws events put-rule \
  --name shebalance-daily-order-check \
  --schedule-expression "cron(0 9,18 * * ? *)"
```

### Change Reminder Threshold

Edit `lambda_check_order_progress.py`:

```python
# Change from 3 days to 2 days
if days_since_update < 2:  # Changed from 3
    return False
```

### Customize Message

Edit `create_reminder_message()` function:

```python
message = f"""
🔔 Custom Message

Hello {user['fullName']}!

Your custom reminder text here...

- Team SHE-BALANCE
""".strip()
```

---

## 💰 Cost Estimation

### AWS Lambda
- **Free Tier**: 1M requests/month, 400,000 GB-seconds
- **After Free Tier**: $0.20 per 1M requests
- **Estimated**: $0/month (within free tier)

### AWS SNS (SMS)
- **India**: ~$0.00645 per SMS
- **100 reminders/day**: ~$0.65/day = $19.50/month
- **500 reminders/day**: ~$3.25/day = $97.50/month

### DynamoDB
- **Free Tier**: 25 GB storage, 25 RCU, 25 WCU
- **Estimated**: $0/month (within free tier)

### EventBridge
- **Free**: All state change events
- **Estimated**: $0/month

**Total Monthly Cost**: $20-100 (mainly SNS SMS charges)

---

## 🔒 Security Best Practices

### 1. Secure Phone Numbers
- Store phone numbers encrypted in DynamoDB
- Use AWS KMS for encryption
- Implement data retention policies

### 2. Rate Limiting
- Limit reminders per artisan (max 1/day)
- Implement exponential backoff
- Monitor for abuse

### 3. Privacy Compliance
- Get user consent for SMS/WhatsApp
- Provide opt-out mechanism
- Follow GDPR/local regulations

### 4. Access Control
- Use least-privilege IAM roles
- Enable CloudTrail logging
- Rotate credentials regularly

---

## 🐛 Troubleshooting

### Issue: Lambda Function Not Triggering

**Check EventBridge Rule**:
```bash
aws events describe-rule --name shebalance-daily-order-check
```

**Check Lambda Permission**:
```bash
aws lambda get-policy --function-name shebalance-check-order-progress
```

### Issue: SMS Not Sending

**Check SNS Permissions**:
```bash
aws sns get-sms-attributes
```

**Verify Phone Number Format**:
- Must be in E.164 format: +[country code][number]
- Example: +919876543210

**Check SNS Spending Limit**:
```bash
aws sns set-sms-attributes \
  --attributes MonthlySpendLimit=100
```

### Issue: No Orders Found

**Verify Order Data**:
```bash
aws dynamodb scan \
  --table-name shebalance-orders \
  --filter-expression "orderType = :type AND #status IN (:pending, :progress)" \
  --expression-attribute-names '{"#status":"status"}' \
  --expression-attribute-values '{":type":{"S":"bulk"},":pending":{"S":"pending"},":progress":{"S":"in_progress"}}'
```

### Issue: CloudWatch Logs Not Appearing

**Check Log Group**:
```bash
aws logs describe-log-groups \
  --log-group-name-prefix /aws/lambda/shebalance
```

**Create Log Group Manually**:
```bash
aws logs create-log-group \
  --log-group-name /aws/lambda/shebalance-check-order-progress
```

---

## 📝 API Endpoints

### Update Order Progress

```javascript
// Frontend code
const updateProgress = async (orderId, progressData) => {
  const response = await fetch(`http://localhost:5000/api/orders/${orderId}/progress`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      progressPercentage: 50,
      progressNote: 'Completed 50 items',
      imagesCompleted: 50
    })
  });
  
  return response.json();
};
```

### Get Progress History

```javascript
const getProgress = async (orderId) => {
  const response = await fetch(`http://localhost:5000/api/orders/${orderId}/progress`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

---

## 🎯 Next Steps

### Immediate
1. ✅ Deploy Lambda function
2. ✅ Configure EventBridge rule
3. ✅ Test with sample data
4. ✅ Monitor CloudWatch logs

### Short-term
1. Set up WhatsApp Business API
2. Implement Twilio integration
3. Add email notifications
4. Create admin dashboard for monitoring

### Long-term
1. Add ML-based prediction for delays
2. Implement smart reminder timing
3. Add multi-language support
4. Create analytics dashboard

---

## 📞 Support

### Documentation
- AWS Lambda: https://docs.aws.amazon.com/lambda/
- AWS SNS: https://docs.aws.amazon.com/sns/
- EventBridge: https://docs.aws.amazon.com/eventbridge/

### Quick Commands

```bash
# View Lambda logs
aws logs tail /aws/lambda/shebalance-check-order-progress --follow

# Test Lambda
aws lambda invoke --function-name shebalance-check-order-progress output.json

# Check EventBridge rule
aws events describe-rule --name shebalance-daily-order-check

# View SNS usage
aws sns get-sms-attributes
```

---

## ✅ Summary

Your WhatsApp reminder system:

✅ Automatically monitors bulk orders  
✅ Sends reminders after 3 days of inactivity  
✅ Prevents spam with 24-hour cooldown  
✅ Tracks all notifications  
✅ Runs daily at 9 AM UTC  
✅ Fully serverless and scalable  

**Deploy now**: Run `deploy-whatsapp-reminders.bat`

