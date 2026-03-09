# 🚀 Fix SNS Issues - Quick Guide

## 🔍 What's Wrong?

Your SNS is not working because:
1. ❌ AWS credentials are empty in `.env` file
2. ❌ Possibly missing IAM permissions
3. ⚠️ SNS sends SMS, not WhatsApp (this is normal!)

## ✅ Quick Fix (5 Minutes)

### Step 1: Get AWS Credentials

1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Navigate to: **IAM** → **Users**
3. Select your user (or create new one)
4. Click **Security credentials** tab
5. Click **Create access key**
6. Choose: "Application running outside AWS"
7. **Copy both keys** (you won't see them again!)

### Step 2: Add Credentials to .env

Open: `SHE-BALANCE-main/SHE-Balnce-main/backend/.env`

Update these lines:
```env
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
```

### Step 3: Add IAM Permissions

1. AWS Console → **IAM** → **Users** → [Your User]
2. Click **Add permissions** → **Attach policies directly**
3. Click **Create policy** → **JSON** tab
4. Paste this:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "sns:Publish",
        "sns:SetSMSAttributes",
        "sns:GetSMSAttributes"
      ],
      "Resource": "*"
    }
  ]
}
```

5. Name it: `SNS-Publish-Policy`
6. Click **Create policy**
7. Go back and attach it to your user

### Step 4: Test SNS

Run the test script:
```bash
node test-sns-direct.js
```

**Before running**, edit `test-sns-direct.js` line 88:
```javascript
const phoneNumber = '+919876543210'; // Change to YOUR number!
```

### Step 5: Restart Backend

```bash
cd SHE-BALANCE-main/SHE-Balnce-main/backend
node server-dynamodb.js
```

### Step 6: Test from Frontend

Open: `http://localhost:3000/test-sns-whatsapp.html`

Enter:
- Phone: `+91[your_number]`
- Type: Custom Message
- Message: "Test from SHE-BALANCE"

Click **Send WhatsApp Message**

## 📱 Important: SMS vs WhatsApp

### What You'll Get:
- ✅ **SMS text message** (via AWS SNS)
- ❌ **NOT WhatsApp message**

### Why?
AWS SNS sends SMS by default, not WhatsApp!

### For Real WhatsApp:
You need:
1. **WhatsApp Business API** (from Meta)
2. **AWS End User Messaging** (formerly Pinpoint)
3. OR **Twilio API**

## 🧪 Test Commands

### Test 1: Direct SNS Test
```bash
node test-sns-direct.js
```
This tests AWS credentials and sends a test SMS.

### Test 2: Backend API Test
```bash
curl -X POST http://localhost:5000/api/sns/send-whatsapp \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"+919876543210\",\"messageType\":\"custom\",\"message\":\"Test\"}"
```

### Test 3: Check SNS Connection
```bash
curl http://localhost:5000/api/sns/test-connection
```

## 🔧 Common Errors & Solutions

### Error: "InvalidClientTokenId"
**Problem**: AWS Access Key ID is wrong
**Solution**: 
- Check for typos in `.env`
- Regenerate keys in AWS Console

### Error: "SignatureDoesNotMatch"
**Problem**: AWS Secret Access Key is wrong
**Solution**:
- Check for extra spaces in `.env`
- Regenerate keys in AWS Console

### Error: "AccessDenied"
**Problem**: Missing SNS permissions
**Solution**:
- Add SNS:Publish permission to IAM user
- Follow Step 3 above

### Error: "InvalidParameter"
**Problem**: Phone number format is wrong
**Solution**:
- Use E.164 format: `+919876543210`
- Include `+` and country code

### Error: "Credentials not configured"
**Problem**: `.env` file has empty credentials
**Solution**:
- Follow Step 1 and Step 2 above

## 📊 Expected Results

### Success Response:
```json
{
  "success": true,
  "message": "SMS sent successfully via AWS SNS",
  "messageId": "12345678-1234-1234-1234-123456789012",
  "phoneNumber": "+919876543210",
  "timestamp": "2024-03-03T10:30:00.000Z",
  "note": "This sends SMS, not WhatsApp"
}
```

### What You'll Receive:
```
🌸 Test from SHE-BALANCE!

If you receive this message, AWS SNS is working correctly.

This is an SMS, not WhatsApp. For WhatsApp, you need WhatsApp Business API.

-- SHE-BALANCE Team
```

## 💰 Cost

**AWS SNS SMS Pricing**:
- India: ~$0.00645 per SMS
- USA: ~$0.00645 per SMS
- 100 messages ≈ $0.65

**Free Tier**:
- First 100 SMS per month are free (in some regions)

## 🎯 Quick Checklist

- [ ] AWS credentials added to `.env`
- [ ] IAM permissions added (SNS:Publish)
- [ ] Test script runs successfully
- [ ] Backend server restarted
- [ ] Test SMS received on phone
- [ ] Frontend test page works

## 🆘 Still Not Working?

### Check AWS CLI:
```bash
aws sts get-caller-identity
```

If this works, your credentials are correct.

### Test SNS via AWS CLI:
```bash
aws sns publish --phone-number "+919876543210" --message "Test"
```

If this works but your code doesn't, the issue is in Node.js configuration.

### Check Logs:
Look for errors in:
- Backend console output
- Browser console (F12)
- AWS CloudWatch Logs

## 📞 Need Help?

1. Check `SNS_TROUBLESHOOTING_GUIDE.md` for detailed troubleshooting
2. Run `node test-sns-direct.js` for diagnostic information
3. Check AWS CloudWatch for SNS logs

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Test script shows "SMS sent successfully"
- ✅ You receive SMS on your phone
- ✅ Backend logs show message ID
- ✅ Frontend shows success message
- ✅ No errors in console

---

**Files Created**:
- `SNS_TROUBLESHOOTING_GUIDE.md` - Detailed troubleshooting
- `test-sns-direct.js` - Direct SNS test script
- `sns-endpoint-improved.js` - Improved backend code
- `fix-sns-now.bat` - Quick setup script
- `FIX_SNS_QUICK_GUIDE.md` - This file

**Next Step**: Run `node test-sns-direct.js` after adding credentials!
