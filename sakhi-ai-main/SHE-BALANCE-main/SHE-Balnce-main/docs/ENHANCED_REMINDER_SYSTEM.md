# Enhanced Order Reminder System

## Overview

The Enhanced Order Reminder System automatically monitors bulk orders and ensures artisans stay engaged through a two-tier communication approach:

1. **WhatsApp Reminder** - Sent when no progress update for 3+ consecutive days
2. **Voice Call Follow-up** - Initiated if no response to WhatsApp within 24 hours

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    EventBridge Scheduler                     │
│              (Daily at 9 AM UTC - cron)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         Lambda: Order Reminder Orchestrator                  │
│  - Scans all active bulk orders                             │
│  - Identifies orders without progress (3+ days)             │
│  - Checks reminder status                                   │
└────────────┬────────────────────────────┬───────────────────┘
             │                            │
             ▼                            ▼
    ┌────────────────┐          ┌────────────────────┐
    │ First Reminder │          │ Follow-up Check    │
    │ (WhatsApp)     │          │ (After 24 hours)   │
    └────────┬───────┘          └─────────┬──────────┘
             │                            │
             ▼                            ▼
    ┌────────────────┐          ┌────────────────────┐
    │ AWS SNS        │          │ No Response?       │
    │ (SMS/WhatsApp) │          │ Initiate Voice Call│
    └────────────────┘          └─────────┬──────────┘
                                          │
                                          ▼
                                ┌────────────────────┐
                                │ Lambda: Voice Call │
                                │ - Amazon Polly     │
                                │ - Twilio/Connect   │
                                └────────────────────┘
```

## Components

### 1. Lambda Functions

#### a) Order Reminder Orchestrator
- **Function Name**: `shebalance-order-reminder-orchestrator`
- **Trigger**: EventBridge (daily at 9 AM UTC)
- **Purpose**: Main coordinator for the reminder workflow
- **Actions**:
  - Scans all active bulk orders
  - Identifies orders without progress updates (3+ days)
  - Sends initial WhatsApp reminders
  - Schedules 24-hour follow-up checks
  - Triggers voice calls for non-responsive artisans

#### b) Generate Voice Call
- **Function Name**: `shebalance-generate-voice-call`
- **Trigger**: Invoked by orchestrator
- **Purpose**: Creates and initiates personalized voice calls
- **Features**:
  - Multi-language support (Hindi, English, Tamil, Telugu)
  - Amazon Polly for natural voice synthesis
  - Personalized messaging with order details
  - Integration with Twilio/Amazon Connect

### 2. DynamoDB Tables

#### shebalance-reminders
Tracks all reminder communications and their status.

**Schema**:
```json
{
  "orderId": "string (Primary Key)",
  "reminderId": "string (UUID)",
  "artisanId": "string",
  "userId": "string",
  "phoneNumber": "string",
  "messageId": "string (SNS Message ID)",
  "reminderType": "whatsapp | voice_call",
  "status": "sent | no_response | responded | voice_call_initiated",
  "sentAt": "ISO 8601 timestamp",
  "responseReceived": "boolean",
  "responseAt": "ISO 8601 timestamp (optional)",
  "callInitiatedAt": "ISO 8601 timestamp (optional)",
  "createdAt": "ISO 8601 timestamp",
  "updatedAt": "ISO 8601 timestamp"
}
```

**Indexes**:
- Primary Key: `orderId`
- GSI: `ArtisanIndex` (artisanId + sentAt)

### 3. EventBridge Rules

#### shebalance-daily-order-reminder-check
- **Schedule**: `cron(0 9 * * ? *)` - Daily at 9 AM UTC
- **Target**: Order Reminder Orchestrator Lambda
- **Purpose**: Trigger daily reminder checks

## Workflow Details

### Phase 1: Initial WhatsApp Reminder (Day 3)

When an artisan hasn't updated order progress for 3 consecutive days:

1. **Detection**: Orchestrator identifies the order
2. **Message Creation**: Personalized WhatsApp message generated
3. **Delivery**: Sent via AWS SNS
4. **Tracking**: Reminder record created in DynamoDB
5. **Scheduling**: 24-hour follow-up check scheduled

**WhatsApp Message Template**:
```
🔔 SHE-BALANCE Order Reminder

Hello [Artisan Name]! 👋

We noticed you haven't updated the progress for your bulk order in [X] days.

📦 Order: [Order Title]
🆔 Order ID: [Short ID]
📅 Last Update: [X] days ago

⚠️ IMPORTANT: Please update your order progress within 24 hours. 
If we don't hear from you, we will call you to confirm if you can 
complete this order.

✅ Reply with:
• "DONE" - Order completed
• "PROGRESS" - Still working on it
• "HELP" - Need assistance
• "CANCEL" - Cannot complete

Update now: https://shebalance.com/dashboard

Need help? Reply to this message or contact support at 1800-XXX-XXXX

- Team SHE-BALANCE 🌸
```

### Phase 2: Voice Call Follow-up (Day 4)

If no response within 24 hours:

1. **Response Check**: Orchestrator checks for WhatsApp reply
2. **Voice Call Trigger**: If no response, voice call Lambda invoked
3. **Script Generation**: Personalized script in artisan's language
4. **Speech Synthesis**: Amazon Polly creates natural voice audio
5. **Call Initiation**: Twilio/Amazon Connect places the call
6. **Status Update**: Reminder record updated in DynamoDB

**Voice Call Script (Hindi)**:
```
नमस्ते [Artisan Name] जी।
मैं शी बैलेंस की एआई सखी हूँ।

हम आपसे आपके बल्क ऑर्डर के बारे में बात करना चाहते हैं।
ऑर्डर का नाम है: [Order Title]

हमने देखा कि आपने पिछले [X] दिनों से इस ऑर्डर की प्रोग्रेस 
अपडेट नहीं की है। हमने आपको व्हाट्सएप पर संदेश भेजा था, 
लेकिन हमें कोई जवाब नहीं मिला।

हम जानना चाहते हैं: क्या आप इस ऑर्डर को पूरा कर पाएंगी?

अगर आपको किसी भी प्रकार की समस्या है, तो कृपया हमें बताएं।
हम आपकी मदद करना चाहते हैं।

कृपया 24 घंटे के अंदर हमसे संपर्क करें।
धन्यवाद।
```

## Deployment

### Prerequisites

1. AWS CLI configured with credentials
2. IAM permissions for:
   - Lambda (create/update functions)
   - DynamoDB (create tables)
   - SNS (publish messages)
   - EventBridge (create rules)
   - IAM (create roles)
3. Python 3.11 runtime

### Deployment Steps

1. **Navigate to backend directory**:
   ```bash
   cd SHE-BALANCE-main/SHE-Balnce-main/aws-backend
   ```

2. **Run deployment script**:
   ```bash
   deploy-enhanced-reminders.bat
   ```

3. **Verify deployment**:
   ```bash
   # Check Lambda functions
   aws lambda list-functions --query "Functions[?contains(FunctionName, 'shebalance')]"
   
   # Check DynamoDB table
   aws dynamodb describe-table --table-name shebalance-reminders
   
   # Check EventBridge rule
   aws events describe-rule --name shebalance-daily-order-reminder-check
   ```

### Configuration

#### SNS Setup for WhatsApp

1. **Enable SMS in SNS**:
   ```bash
   aws sns set-sms-attributes \
     --attributes DefaultSMSType=Transactional
   ```

2. **Request WhatsApp Business API access** (optional):
   - Apply for WhatsApp Business API
   - Configure webhook for replies
   - Update Lambda to use WhatsApp API instead of SMS

#### Voice Call Setup

**Option 1: Twilio**
1. Create Twilio account
2. Get phone number
3. Set environment variables:
   ```bash
   aws lambda update-function-configuration \
     --function-name shebalance-generate-voice-call \
     --environment Variables={
       TWILIO_ACCOUNT_SID=your_account_sid,
       TWILIO_AUTH_TOKEN=your_auth_token,
       TWILIO_PHONE_NUMBER=your_phone_number
     }
   ```

**Option 2: Amazon Connect**
1. Create Amazon Connect instance
2. Configure contact flow
3. Update Lambda to use Connect API

## Testing

### Test WhatsApp Reminder

```bash
# Invoke orchestrator manually
aws lambda invoke \
  --function-name shebalance-order-reminder-orchestrator \
  --payload '{}' \
  response.json

# Check response
cat response.json
```

### Test Voice Call

```bash
# Invoke voice call Lambda directly
aws lambda invoke \
  --function-name shebalance-generate-voice-call \
  --payload '{
    "artisanId": "test-artisan-123",
    "artisanName": "Test Artisan",
    "phoneNumber": "+919876543210",
    "orderId": "order-123",
    "orderTitle": "Test Bulk Order",
    "daysInactive": 4,
    "language": "hi-IN"
  }' \
  voice-response.json

# Check response
cat voice-response.json
```

### Monitor Logs

```bash
# View orchestrator logs
aws logs tail /aws/lambda/shebalance-order-reminder-orchestrator --follow

# View voice call logs
aws logs tail /aws/lambda/shebalance-generate-voice-call --follow
```

## Monitoring & Alerts

### CloudWatch Metrics

Key metrics to monitor:
- Lambda invocations
- Lambda errors
- SNS message delivery rate
- DynamoDB read/write capacity

### CloudWatch Alarms

Create alarms for:
```bash
# High error rate
aws cloudwatch put-metric-alarm \
  --alarm-name shebalance-reminder-errors \
  --alarm-description "Alert on high error rate" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold

# Failed message delivery
aws cloudwatch put-metric-alarm \
  --alarm-name shebalance-sns-failures \
  --alarm-description "Alert on SNS delivery failures" \
  --metric-name NumberOfNotificationsFailed \
  --namespace AWS/SNS \
  --statistic Sum \
  --period 300 \
  --threshold 3 \
  --comparison-operator GreaterThanThreshold
```

## Cost Estimation

### Monthly Costs (Estimated)

Assuming 200 active artisans, 50 orders needing reminders per month:

| Service | Usage | Cost |
|---------|-------|------|
| Lambda (Orchestrator) | 30 invocations/month | $0.00 (Free tier) |
| Lambda (Voice Call) | 10 invocations/month | $0.00 (Free tier) |
| DynamoDB | 1000 reads, 100 writes | $0.25 |
| SNS (SMS) | 50 messages | $3.50 (India) |
| Amazon Polly | 10 requests | $0.04 |
| Twilio Voice | 10 calls × 1 min | $1.40 |
| **Total** | | **~$5.19/month** |

## Troubleshooting

### Common Issues

#### 1. WhatsApp Messages Not Delivered

**Symptoms**: SNS returns success but messages not received

**Solutions**:
- Verify phone number format (E.164: +91XXXXXXXXXX)
- Check SNS spending limits
- Verify SMS is enabled in target region
- Check if number is opted out

```bash
# Check opt-out status
aws sns check-if-phone-number-is-opted-out --phone-number +919876543210
```

#### 2. Voice Calls Not Initiated

**Symptoms**: Lambda succeeds but no call received

**Solutions**:
- Verify Twilio credentials
- Check Twilio account balance
- Verify phone number is verified (Twilio trial)
- Check Lambda logs for errors

```bash
# View detailed logs
aws logs get-log-events \
  --log-group-name /aws/lambda/shebalance-generate-voice-call \
  --log-stream-name $(aws logs describe-log-streams \
    --log-group-name /aws/lambda/shebalance-generate-voice-call \
    --order-by LastEventTime \
    --descending \
    --max-items 1 \
    --query 'logStreams[0].logStreamName' \
    --output text)
```

#### 3. EventBridge Not Triggering

**Symptoms**: Daily check not running

**Solutions**:
- Verify rule is enabled
- Check Lambda permissions
- Verify cron expression

```bash
# Check rule status
aws events describe-rule --name shebalance-daily-order-reminder-check

# List targets
aws events list-targets-by-rule --rule shebalance-daily-order-reminder-check
```

## Future Enhancements

1. **Multi-channel Support**:
   - Telegram integration
   - Email fallback
   - In-app notifications

2. **Smart Scheduling**:
   - ML-based optimal contact times
   - Timezone-aware scheduling
   - Artisan preference learning

3. **Response Processing**:
   - NLP for WhatsApp reply analysis
   - Sentiment detection
   - Automatic status updates

4. **Escalation Workflow**:
   - Manager notification after voice call
   - Alternative artisan suggestion
   - Automatic order reassignment

5. **Analytics Dashboard**:
   - Reminder effectiveness metrics
   - Response rate tracking
   - Artisan engagement scores

## Support

For issues or questions:
- Email: support@shebalance.com
- WhatsApp: +91-XXXX-XXXXXX
- Documentation: https://docs.shebalance.com

## License

Copyright © 2026 SHE-BALANCE. All rights reserved.
