# Enhanced Order Reminder System - Implementation Complete ✅

## Summary

Successfully implemented an automated two-tier reminder system for bulk orders:

### Tier 1: WhatsApp Reminder (Day 3)
- Automatically sent when artisan hasn't updated order progress for 3+ consecutive days
- Personalized message with order details
- Clear action items (DONE, PROGRESS, HELP, CANCEL)
- 24-hour response window

### Tier 2: Voice Call Follow-up (Day 4)
- Triggered if no response to WhatsApp within 24 hours
- Multi-language support (Hindi, English, Tamil, Telugu)
- Natural voice using Amazon Polly
- Confirms if artisan can complete the order

## What Was Created

### 1. Lambda Functions

#### Order Reminder Orchestrator
- **File**: `SHE-BALANCE-main/SHE-Balnce-main/aws-backend/lambda_order_reminder_orchestrator.py`
- **Purpose**: Main coordinator for the entire reminder workflow
- **Features**:
  - Scans all active bulk orders daily
  - Identifies orders without progress (3+ days)
  - Sends WhatsApp reminders via SNS
  - Tracks reminder status in DynamoDB
  - Schedules 24-hour follow-up checks
  - Triggers voice calls for non-responsive artisans

#### Generate Voice Call (Enhanced)
- **File**: `SHE-BALANCE-main/SHE-Balnce-main/aws-backend/lambda_generate_voice_call.py`
- **Purpose**: Creates and initiates personalized voice calls
- **Enhancements**:
  - Added order-specific messaging
  - Personalized scripts with order details
  - Confirms order completion capability
  - Offers support options

### 2. DynamoDB Table

#### shebalance-reminders
- **Config**: `SHE-BALANCE-main/SHE-Balnce-main/aws-backend/reminders-table-config.json`
- **Purpose**: Track all reminder communications
- **Schema**:
  ```
  - orderId (Primary Key)
  - reminderId (UUID)
  - artisanId
  - userId
  - phoneNumber
  - messageId (SNS)
  - reminderType (whatsapp | voice_call)
  - status (sent | no_response | responded | voice_call_initiated)
  - sentAt
  - responseReceived
  - callInitiatedAt
  ```

### 3. Deployment Scripts

#### Enhanced Reminders Deployment
- **File**: `SHE-BALANCE-main/SHE-Balnce-main/aws-backend/deploy-enhanced-reminders.bat`
- **Purpose**: One-click deployment of entire system
- **Actions**:
  - Creates DynamoDB reminders table
  - Creates IAM roles with necessary permissions
  - Deploys both Lambda functions
  - Creates EventBridge rule (daily at 9 AM UTC)
  - Configures Lambda permissions
  - Runs test invocation

### 4. Documentation

#### Comprehensive Guide
- **File**: `SHE-BALANCE-main/SHE-Balnce-main/ENHANCED_REMINDER_SYSTEM.md`
- **Contents**:
  - System architecture diagram
  - Detailed workflow explanation
  - Deployment instructions
  - Configuration options
  - Testing procedures
  - Monitoring setup
  - Troubleshooting guide
  - Cost estimation
  - Future enhancements

#### Quick Start Guide
- **File**: `SHE-BALANCE-main/SHE-Balnce-main/REMINDER_SYSTEM_QUICKSTART.md`
- **Contents**:
  - 5-minute deployment guide
  - Quick testing instructions
  - Common configurations
  - Troubleshooting tips
  - Cost summary

## System Workflow

```
┌─────────────────────────────────────────────────────────┐
│  Day 0: Artisan receives bulk order                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Day 1-2: Normal work period                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Day 3: No progress update detected                     │
│  ✉️ WhatsApp Reminder Sent                              │
│  "Please update within 24 hours or we'll call you"     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────────┐
│ Artisan Replies │    │ No Response         │
│ ✅ Status Updated│    │ (24 hours passed)   │
└─────────────────┘    └──────────┬──────────┘
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │  Day 4: Voice Call  │
                       │  📞 Automated Call   │
                       │  "Can you complete?" │
                       └──────────┬──────────┘
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │ Artisan Confirms    │
                       │ or Requests Help    │
                       └─────────────────────┘
```

## Message Templates

### WhatsApp Message (English)

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

### Voice Call Script (Hindi)

```
नमस्ते [Artisan Name] जी।
मैं शी बैलेंस की एआई सखी हूँ।

हम आपसे आपके बल्क ऑर्डर के बारे में बात करना चाहते हैं।
ऑर्डर का नाम है: [Order Title]

हमने देखा कि आपने पिछले [X] दिनों से इस ऑर्डर की प्रोग्रेस 
अपडेट नहीं की है। हमने आपको व्हाट्सएप पर संदेश भेजा था, 
लेकिन हमें कोई जवाब नहीं मिला।

हम जानना चाहते हैं: क्या आप इस ऑर्डर को पूरा कर पाएंगी?

अगर आपको किसी भी प्रकार की समस्या है, चाहे वह समय की कमी हो, 
सामग्री की समस्या हो, या कोई व्यक्तिगत कारण हो, तो कृपया हमें बताएं।

हम आपकी मदद करना चाहते हैं।

अगर आप ऑर्डर पूरा नहीं कर पाएंगी, तो कोई बात नहीं। 
हम समझते हैं कि कभी-कभी परिस्थितियां बदल जाती हैं।

बस हमें जल्द से जल्द बताएं, ताकि हम बायर को सूचित कर सकें।

कृपया 24 घंटे के अंदर हमसे संपर्क करें।
धन्यवाद।
```

## Deployment Instructions

### Quick Deploy (5 Minutes)

```bash
# Navigate to backend directory
cd SHE-BALANCE-main/SHE-Balnce-main/aws-backend

# Run deployment script
deploy-enhanced-reminders.bat

# Wait for completion (creates tables, functions, rules)
# Script will test the system automatically
```

### Verify Deployment

```bash
# Check Lambda functions
aws lambda list-functions --query "Functions[?contains(FunctionName, 'shebalance')]"

# Check DynamoDB table
aws dynamodb describe-table --table-name shebalance-reminders

# Check EventBridge rule
aws events describe-rule --name shebalance-daily-order-reminder-check
```

## Configuration

### AWS Services Used

1. **Lambda**: Serverless compute for orchestration and voice calls
2. **DynamoDB**: NoSQL database for tracking reminders
3. **SNS**: SMS/WhatsApp message delivery
4. **EventBridge**: Scheduled daily checks (cron)
5. **Amazon Polly**: Text-to-speech for voice calls
6. **IAM**: Role-based access control

### Environment Variables

Set these for voice call functionality:

```bash
# For Twilio integration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_phone_number

# For S3 audio storage
AUDIO_BUCKET=shebalance-voice-messages

# For monitoring
MONITORING_TOPIC_ARN=arn:aws:sns:us-east-1:065538523474:shebalance-monitoring
```

## Testing

### Manual Test

```bash
# Test orchestrator
aws lambda invoke ^
  --function-name shebalance-order-reminder-orchestrator ^
  --payload "{}" ^
  response.json

# View results
type response.json
```

### Test Voice Call

```bash
# Test voice call directly
aws lambda invoke ^
  --function-name shebalance-generate-voice-call ^
  --payload "{\"artisanId\":\"test\",\"artisanName\":\"Test User\",\"phoneNumber\":\"+919876543210\",\"orderId\":\"test-order\",\"orderTitle\":\"Test Order\",\"daysInactive\":4,\"language\":\"hi-IN\"}" ^
  voice-response.json
```

## Monitoring

### View Logs

```bash
# Orchestrator logs
aws logs tail /aws/lambda/shebalance-order-reminder-orchestrator --follow

# Voice call logs
aws logs tail /aws/lambda/shebalance-generate-voice-call --follow
```

### Check Reminder Status

```bash
# View recent reminders
aws dynamodb scan --table-name shebalance-reminders --limit 10
```

## Cost Estimate

For 200 active artisans, 50 orders needing reminders per month:

| Service | Usage | Monthly Cost |
|---------|-------|--------------|
| Lambda Invocations | 40 invocations | $0.00 (Free tier) |
| DynamoDB | 1000 reads, 100 writes | $0.25 |
| SNS (WhatsApp/SMS) | 50 messages | $3.50 |
| Amazon Polly | 10 voice syntheses | $0.04 |
| Twilio Voice Calls | 10 calls × 1 min | $1.40 |
| **Total** | | **~$5.19/month** |

## Key Features

✅ **Automated Detection**: Scans orders daily for missing updates
✅ **Two-Tier Communication**: WhatsApp first, voice call if needed
✅ **Multi-Language Support**: Hindi, English, Tamil, Telugu
✅ **Personalized Messages**: Includes order details and artisan name
✅ **Status Tracking**: Complete audit trail in DynamoDB
✅ **Scalable**: Handles hundreds of artisans efficiently
✅ **Cost-Effective**: ~$5/month for 50 reminders
✅ **Natural Voice**: Amazon Polly neural voices
✅ **Flexible Scheduling**: Configurable thresholds and timing

## Integration with Existing System

The reminder system integrates seamlessly with:

1. **Orders Table** (`shebalance-orders`):
   - Reads order status and progress updates
   - Updates `lastReminderSent` timestamp

2. **Users Table** (`shebalance-users`):
   - Retrieves artisan contact information
   - Gets language preferences

3. **Artisan Profiles** (`shebalance-artisan-profiles`):
   - Links orders to artisan details

4. **Notifications Table** (`shebalance-notifications`):
   - Creates in-app notifications
   - Maintains notification history

## Next Steps

1. **Configure WhatsApp Business API** (optional):
   - Better delivery rates
   - Rich media support
   - Two-way messaging

2. **Set Up Twilio Account**:
   - Get phone number for voice calls
   - Configure webhook for call status

3. **Create Monitoring Dashboard**:
   - CloudWatch dashboard
   - Real-time metrics
   - Alert configuration

4. **Test with Real Data**:
   - Create test orders
   - Verify message delivery
   - Test voice call quality

## Files Created/Modified

### New Files
1. `aws-backend/lambda_order_reminder_orchestrator.py` - Main orchestrator
2. `aws-backend/reminders-table-config.json` - DynamoDB schema
3. `aws-backend/deploy-enhanced-reminders.bat` - Deployment script
4. `ENHANCED_REMINDER_SYSTEM.md` - Comprehensive documentation
5. `REMINDER_SYSTEM_QUICKSTART.md` - Quick start guide
6. `ENHANCED_REMINDER_COMPLETE.md` - This summary

### Modified Files
1. `aws-backend/lambda_generate_voice_call.py` - Enhanced with order-specific messaging

## Support

For questions or issues:
- 📧 Email: support@shebalance.com
- 📱 WhatsApp: +91-XXXX-XXXXXX
- 📚 Documentation: See `ENHANCED_REMINDER_SYSTEM.md`
- 🚀 Quick Start: See `REMINDER_SYSTEM_QUICKSTART.md`

---

**Status**: ✅ Implementation Complete
**Date**: March 2, 2026
**Version**: 1.0
**Ready for Deployment**: Yes
