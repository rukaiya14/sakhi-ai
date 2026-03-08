# 🎙️ Voice Service Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide helps you quickly deploy and test the voice call reminder system.

---

## 📋 What You'll Deploy

1. **Amazon Polly** - Text-to-speech (Hindi & English)
2. **Lambda Function** - Voice call orchestration
3. **S3 Bucket** - Audio file storage
4. **DynamoDB Integration** - Track call status

---

## ⚡ Quick Deploy (Without Amazon Connect)

This deploys the voice synthesis system. Actual phone calls require Amazon Connect setup (see full guide).

### Step 1: Deploy Lambda Function (2 minutes)

```bash
cd SHE-BALANCE-main\SHE-Balnce-main\aws-backend
deploy-voice-service.bat
```

This will:
- ✅ Create Lambda function
- ✅ Create S3 bucket for audio
- ✅ Set up permissions
- ✅ Configure environment variables

### Step 2: Test Voice Synthesis (1 minute)

```bash
python test-polly.py
```

This generates 2 MP3 files:
- `test_voice_Aditi.mp3` (Hindi)
- `test_voice_Kajal.mp3` (English)

**Listen to these files to hear the voice quality!**

### Step 3: Test Full Service (1 minute)

```bash
python test-voice-service.py
```

This will:
- ✅ Generate voice message for an order
- ✅ Synthesize speech with Polly
- ✅ Upload audio to S3
- ✅ Simulate voice call
- ✅ Update DynamoDB

---

## 📊 What You'll See

### Test Output:
```
Testing voice call for order: order-1234567890-1
------------------------------------------------------------

Response:
{
  "statusCode": 200,
  "body": {
    "message": "Voice call initiated successfully",
    "orderId": "order-1234567890-1",
    "phoneNumber": "+91-XXXXXXXXXX",
    "contactId": "simulated-order-1234567890-1",
    "audioUrl": "https://shebalance-voice-audio.s3.amazonaws.com/...",
    "language": "hi-IN"
  }
}

✅ Voice call test successful!

   Contact ID: simulated-order-1234567890-1
   Phone: +91-XXXXXXXXXX
   Language: hi-IN
   Audio URL: https://shebalance-voice-audio.s3.amazonaws.com/...

   Voice Script:
   ------------------------------------------------------------
   नमस्ते Rukaiya जी।
   मैं शी बैलेंस की एआई सखी हूँ।
   हम आपसे आपके बल्क ऑर्डर के बारे में बात करना चाहते हैं।
   ...
```

---

## 🎯 Integration with Reminder System

The voice service automatically integrates with your existing reminder system:

```
Day 0: Order created
    ↓
Day 3: No progress update
    ↓
WhatsApp Reminder Sent
    ↓
24 Hours Later: No response
    ↓
Voice Call Initiated ← NEW!
    ↓
Audio synthesized with Polly
    ↓
Call made (if Connect configured)
    ↓
Status updated in DynamoDB
```

---

## 🔧 Configuration

### Current Setup (Simulation Mode):
```
✅ Amazon Polly - Enabled
✅ S3 Storage - Enabled
✅ Lambda Function - Deployed
✅ DynamoDB Integration - Active
⚠️ Amazon Connect - Not configured (calls simulated)
```

### To Enable Real Calls:

1. **Set up Amazon Connect** (15 minutes)
   - Create Connect instance
   - Claim phone number
   - Create contact flow

2. **Update Lambda Environment Variables**:
   ```bash
   aws lambda update-function-configuration \
       --function-name shebalance-voice-call-service \
       --environment Variables={
           CONNECT_INSTANCE_ID=your-instance-id,
           CONNECT_CONTACT_FLOW_ID=your-flow-id,
           CONNECT_SOURCE_PHONE=+91-XXXXXXXXXX
       }
   ```

See `VOICE_SERVICES_IMPLEMENTATION.md` for detailed setup.

---

## 📱 Test in Frontend

### View Voice Call Status:

1. Login to dashboard: http://localhost:3000/login.html
2. Go to Bulk Orders section
3. Orders with voice calls will show:

```
┌─────────────────────────────────────────┐
│ 📞 Voice Call Initiated                 │
│ March 3, 2026 at 10:30 AM              │
└─────────────────────────────────────────┘
```

---

## 💰 Cost Estimate

### Per Voice Call (Simulation Mode):
- **Amazon Polly**: $0.002 (₹0.17)
- **S3 Storage**: $0.0001 (₹0.01)
- **Lambda**: $0.0001 (₹0.01)

**Total**: ~$0.0022 (₹0.18) per call

### With Amazon Connect:
- **Amazon Connect**: $0.036 (₹3.00)
- **Total**: ~$0.038 (₹3.15) per call

---

## 🧪 Testing Checklist

- [ ] Lambda function deployed
- [ ] S3 bucket created
- [ ] Polly test successful (MP3 files generated)
- [ ] Voice service test successful
- [ ] Audio URL accessible
- [ ] DynamoDB updated with call status
- [ ] Frontend shows call status

---

## 📞 Voice Features

### Supported Languages:
- **Hindi** (hi-IN) - Voice: Aditi (Female, Neural)
- **English** (en-IN) - Voice: Kajal (Female, Neural)

### Voice Quality:
- **Engine**: Neural (high quality)
- **Format**: MP3
- **Bitrate**: 48 kbps
- **Sample Rate**: 24 kHz

### Message Content:
- Personalized with artisan name
- Order details included
- Days since last update
- Call to action
- Support contact info

---

## 🔍 Monitoring

### Check Lambda Logs:
```bash
aws logs tail /aws/lambda/shebalance-voice-call-service --follow
```

### Check S3 Audio Files:
```bash
aws s3 ls s3://shebalance-voice-audio/voice-messages/ --recursive
```

### Check DynamoDB Status:
```bash
aws dynamodb scan --table-name shebalance-reminders --limit 5
```

---

## 🚨 Troubleshooting

### Issue: Lambda deployment fails
**Solution**: Check IAM role has required permissions
```bash
aws iam get-role --role-name shebalance-lambda-role
```

### Issue: Polly synthesis fails
**Solution**: Verify AWS credentials and region
```bash
aws configure list
```

### Issue: S3 upload fails
**Solution**: Check bucket exists and permissions
```bash
aws s3 ls s3://shebalance-voice-audio
```

### Issue: Audio URL not accessible
**Solution**: Check S3 bucket policy allows presigned URLs

---

## 📚 Next Steps

### 1. Enable Real Calls (Optional)
Follow the complete guide: `VOICE_SERVICES_IMPLEMENTATION.md`

### 2. Customize Voice Messages
Edit `lambda_generate_voice_call_enhanced.py`:
- Modify `generate_voice_script()` function
- Add more languages
- Customize SSML tags

### 3. Add Call Response Handling
Implement IVR (Interactive Voice Response):
- Press 1 for completed
- Press 2 for help needed
- Press 3 for extension request

### 4. Set Up Monitoring
- CloudWatch dashboards
- SNS alerts for failures
- Call success rate tracking

---

## 📋 Files Created

```
aws-backend/
├── lambda_generate_voice_call_enhanced.py  ← Main Lambda function
├── test-polly.py                           ← Test voice synthesis
├── test-voice-service.py                   ← Test full service
├── deploy-voice-service.bat                ← Deployment script
└── test_voice_*.mp3                        ← Generated audio files
```

---

## ✅ Quick Commands

```bash
# Deploy
deploy-voice-service.bat

# Test Polly
python test-polly.py

# Test service
python test-voice-service.py

# Check logs
aws logs tail /aws/lambda/shebalance-voice-call-service --follow

# List audio files
aws s3 ls s3://shebalance-voice-audio/voice-messages/ --recursive

# Check reminders
aws dynamodb scan --table-name shebalance-reminders
```

---

## 🎉 You're Done!

Your voice service is now deployed and ready to:
- ✅ Generate personalized voice messages
- ✅ Synthesize speech in Hindi/English
- ✅ Store audio files in S3
- ✅ Track call status in DynamoDB
- ✅ Integrate with reminder system

**Status**: Deployed (Simulation Mode)  
**Cost**: ~₹0.18 per call  
**Languages**: Hindi, English  
**Quality**: Neural voice (high quality)

To enable real phone calls, follow the Amazon Connect setup in:
`VOICE_SERVICES_IMPLEMENTATION.md`
