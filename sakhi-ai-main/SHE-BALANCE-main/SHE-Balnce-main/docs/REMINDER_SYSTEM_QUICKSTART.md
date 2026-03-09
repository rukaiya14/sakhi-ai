# Enhanced Reminder System - Quick Start Guide

## What It Does

Automatically monitors bulk orders and contacts artisans who haven't updated progress:

1. **Day 3**: WhatsApp reminder sent (no progress update for 3 days)
2. **Day 4**: Voice call made (if no response to WhatsApp within 24 hours)

## Quick Deploy (5 Minutes)

### Step 1: Deploy the System

```bash
cd SHE-BALANCE-main/SHE-Balnce-main/aws-backend
deploy-enhanced-reminders.bat
```

This creates:
- ✅ DynamoDB table for tracking reminders
- ✅ Lambda function for orchestration
- ✅ Lambda function for voice calls
- ✅ EventBridge rule (runs daily at 9 AM UTC)

### Step 2: Test It

```bash
# Test the orchestrator
aws lambda invoke ^
  --function-name shebalance-order-reminder-orchestrator ^
  --payload "{}" ^
  response.json

# View results
type response.json
```

### Step 3: Monitor

View logs in real-time:
```bash
aws logs tail /aws/lambda/shebalance-order-reminder-orchestrator --follow
```

## How It Works

### Workflow

```
Order without progress (3+ days)
    ↓
WhatsApp Reminder Sent
    ↓
Wait 24 hours
    ↓
Check for response
    ↓
No response? → Voice Call
    ↓
Artisan confirms or cancels order
```

### WhatsApp Message Example

```
🔔 SHE-BALANCE Order Reminder

Hello Rukaiya! 👋

We noticed you haven't updated the progress for your 
bulk order in 3 days.

📦 Order: Embroidered Sarees (50 pieces)
🆔 Order ID: abc12345
📅 Last Update: 3 days ago

⚠️ IMPORTANT: Please update within 24 hours or we'll 
call you to confirm.

✅ Reply with:
• "DONE" - Order completed
• "PROGRESS" - Still working
• "HELP" - Need assistance
• "CANCEL" - Cannot complete

Update: https://shebalance.com/dashboard
```

### Voice Call Example (Hindi)

```
नमस्ते Rukaiya जी।
मैं शी बैलेंस की एआई सखी हूँ।

हम आपसे आपके बल्क ऑर्डर के बारे में बात करना चाहते हैं।
ऑर्डर का नाम है: Embroidered Sarees

हमने देखा कि आपने पिछले 4 दिनों से इस ऑर्डर की प्रोग्रेस 
अपडेट नहीं की है। हमने आपको व्हाट्सएप पर संदेश भेजा था, 
लेकिन हमें कोई जवाब नहीं मिला।

क्या आप इस ऑर्डर को पूरा कर पाएंगी?
कृपया 24 घंटे के अंदर हमसे संपर्क करें।
```

## Configuration

### Change Schedule

Edit EventBridge rule to run at different time:

```bash
# Run at 6 PM UTC instead of 9 AM
aws events put-rule ^
  --name shebalance-daily-order-reminder-check ^
  --schedule-expression "cron(0 18 * * ? *)"
```

### Change Thresholds

Edit `lambda_order_reminder_orchestrator.py`:

```python
# Change from 3 days to 5 days
if days_since_update >= 5:  # Line ~80

# Change from 24 hours to 48 hours
if hours_since_reminder >= 48:  # Line ~95
```

Then redeploy:
```bash
deploy-enhanced-reminders.bat
```

## Monitoring Dashboard

### Check System Status

```bash
# View recent reminders
aws dynamodb scan ^
  --table-name shebalance-reminders ^
  --limit 10

# Check Lambda metrics
aws cloudwatch get-metric-statistics ^
  --namespace AWS/Lambda ^
  --metric-name Invocations ^
  --dimensions Name=FunctionName,Value=shebalance-order-reminder-orchestrator ^
  --start-time 2026-03-01T00:00:00Z ^
  --end-time 2026-03-02T00:00:00Z ^
  --period 3600 ^
  --statistics Sum
```

### View Logs

```bash
# Orchestrator logs
aws logs tail /aws/lambda/shebalance-order-reminder-orchestrator --follow

# Voice call logs
aws logs tail /aws/lambda/shebalance-generate-voice-call --follow
```

## Testing with Sample Data

### Create Test Order

```javascript
// In backend/scripts/create-test-order.js
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const testOrder = {
  orderId: 'test-order-' + Date.now(),
  artisanId: 'artisan-rukaiya',
  buyerId: 'buyer-rahul',
  title: 'Test Embroidered Sarees',
  orderType: 'bulk',
  status: 'in_progress',
  quantity: 50,
  createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
  lastProgressUpdate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
};

dynamodb.put({
  TableName: 'shebalance-orders',
  Item: testOrder
}, (err, data) => {
  if (err) console.error(err);
  else console.log('Test order created:', testOrder.orderId);
});
```

Run:
```bash
node backend/scripts/create-test-order.js
```

### Trigger Reminder

```bash
# Manually trigger orchestrator
aws lambda invoke ^
  --function-name shebalance-order-reminder-orchestrator ^
  --payload "{}" ^
  response.json

# Check if reminder was sent
aws dynamodb get-item ^
  --table-name shebalance-reminders ^
  --key "{\"orderId\": {\"S\": \"test-order-XXXXX\"}}"
```

## Troubleshooting

### Issue: No WhatsApp messages received

**Check**:
1. Phone number format: Must be E.164 (+91XXXXXXXXXX)
2. SNS spending limit: May need to increase
3. Opt-out status: Number may be opted out

**Fix**:
```bash
# Check opt-out
aws sns check-if-phone-number-is-opted-out --phone-number +919876543210

# Opt back in
aws sns opt-in-phone-number --phone-number +919876543210
```

### Issue: Voice calls not working

**Check**:
1. Twilio credentials configured
2. Twilio account has balance
3. Phone number verified (if trial account)

**Fix**:
```bash
# Update Twilio credentials
aws lambda update-function-configuration ^
  --function-name shebalance-generate-voice-call ^
  --environment Variables={TWILIO_ACCOUNT_SID=your_sid,TWILIO_AUTH_TOKEN=your_token}
```

### Issue: EventBridge not triggering

**Check**:
```bash
# Verify rule is enabled
aws events describe-rule --name shebalance-daily-order-reminder-check

# Check Lambda permissions
aws lambda get-policy --function-name shebalance-order-reminder-orchestrator
```

**Fix**:
```bash
# Re-add permission
aws lambda add-permission ^
  --function-name shebalance-order-reminder-orchestrator ^
  --statement-id AllowEventBridgeInvoke ^
  --action lambda:InvokeFunction ^
  --principal events.amazonaws.com ^
  --source-arn arn:aws:events:us-east-1:065538523474:rule/shebalance-daily-order-reminder-check
```

## Cost Estimate

For 50 reminders/month:
- WhatsApp (SNS): ~$3.50
- Voice calls (10): ~$1.40
- Lambda: Free tier
- DynamoDB: ~$0.25
- **Total: ~$5.15/month**

## Next Steps

1. ✅ System deployed and running
2. 📱 Configure WhatsApp Business API (optional, for better delivery)
3. 📞 Set up Twilio account for voice calls
4. 📊 Create CloudWatch dashboard for monitoring
5. 🔔 Set up SNS alerts for failures

## Support

Need help?
- Check logs: `aws logs tail /aws/lambda/shebalance-order-reminder-orchestrator --follow`
- View documentation: `ENHANCED_REMINDER_SYSTEM.md`
- Contact: support@shebalance.com

---

**System Status**: ✅ Deployed and Active
**Last Updated**: March 2, 2026
