# AWS Voice Command - Quick Start Guide

## ✅ What You Need

1. **AWS Account** (with billing enabled)
2. **AWS CLI** installed
3. **Node.js** installed
4. **Your AWS credentials**

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install AWS CLI

**Windows:**
```bash
# Download installer from:
https://awscli.amazonaws.com/AWSCLIV2.msi

# Or use chocolatey:
choco install awscli
```

**Verify:**
```bash
aws --version
```

### Step 2: Configure AWS Credentials

```bash
aws configure
```

Enter:
- **AWS Access Key ID**: `AKIA...` (from AWS Console → IAM → Users → Security credentials)
- **AWS Secret Access Key**: `your_secret_key`
- **Default region**: `us-east-1`
- **Default output format**: `json`

### Step 3: Install Dependencies

```bash
# Run this script:
install-voice-aws.bat
```

Or manually:
```bash
cd SHE-BALANCE-main\SHE-Balnce-main\backend
npm install @aws-sdk/client-transcribe @aws-sdk/client-translate @aws-sdk/client-polly @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### Step 4: Create S3 Bucket

```bash
aws s3 mb s3://shebalance-voice-commands --region us-east-1
```

### Step 5: Test Everything

```bash
# Run this script:
test-aws-voice.bat
```

This will:
- ✅ Check AWS CLI
- ✅ Verify credentials
- ✅ Check/create S3 bucket
- ✅ Install packages
- ✅ Start server
- ✅ Open dashboard

## 🎤 How to Use

1. **Open Dashboard**: `http://localhost:5000/dashboard.html`
2. **Click Microphone Button** (top right corner)
3. **Speak Command** in any language:
   - English: "Dashboard", "AI Sakhi", "Skills"
   - Hindi: "डैशबोर्ड", "एआई सखी", "कौशल"
   - Bengali: "ড্যাশবোর্ড", "এআই সখি"
   - Tamil: "டாஷ்போர்டு", "ஏஐ சகி"

4. **System Will**:
   - 🎤 Record your voice
   - 🌍 Detect language automatically (AWS Transcribe)
   - 📝 Transcribe speech to text
   - 🔄 Translate to English (if needed)
   - 🎯 Detect navigation intent
   - 🔊 Speak confirmation in your language (AWS Polly)
   - ➡️ Navigate to the page

## 🔧 Troubleshooting

### Issue: "AWS credentials not configured"

**Solution:**
```bash
aws configure
# Enter your credentials
```

### Issue: "S3 bucket does not exist"

**Solution:**
```bash
aws s3 mb s3://shebalance-voice-commands --region us-east-1
```

### Issue: "Module not found: @aws-sdk"

**Solution:**
```bash
cd SHE-BALANCE-main\SHE-Balnce-main\backend
npm install
```

### Issue: "Transcription failed"

**Possible Causes:**
1. Audio too short (speak for 2-3 seconds)
2. No speech detected (speak clearly)
3. AWS service quota exceeded
4. IAM permissions missing

**Solution:**
- Speak clearly for 2-3 seconds
- Check AWS CloudWatch logs
- Verify IAM permissions (see below)

### Issue: "Voice button not responding"

**Solution:**
1. Check browser console (F12) for errors
2. Verify server is running
3. Check network tab for API calls
4. Try refreshing the page

## 🔐 IAM Permissions Required

Your AWS user needs these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "transcribe:StartTranscriptionJob",
        "transcribe:GetTranscriptionJob",
        "transcribe:DeleteTranscriptionJob",
        "translate:TranslateText",
        "polly:SynthesizeSpeech",
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": "*"
    }
  ]
}
```

**To add permissions:**
1. Go to AWS Console → IAM
2. Select your user
3. Click "Add permissions"
4. Attach these policies:
   - `AmazonTranscribeFullAccess`
   - `TranslateFullAccess`
   - `AmazonPollyFullAccess`
   - `AmazonS3FullAccess`

## 📊 Supported Languages

| Language | Code | Example Command |
|----------|------|-----------------|
| English | en-IN | "Dashboard", "AI Sakhi" |
| Hindi | hi-IN | "डैशबोर्ड", "एआई सखी" |
| Bengali | bn-IN | "ড্যাশবোর্ড", "এআই সখি" |
| Tamil | ta-IN | "டாஷ்போர்டு", "ஏஐ சகி" |
| Telugu | te-IN | "డాష్‌బోర్డ్", "ఏఐ సఖి" |
| Marathi | mr-IN | "डॅशबोर्ड", "एआय सखी" |
| Gujarati | gu-IN | "ડેશબોર્ડ", "એઆઈ સખી" |
| Kannada | kn-IN | "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್" |
| Malayalam | ml-IN | "ഡാഷ്ബോർഡ്" |

## 🎯 Supported Commands

### Navigation:
- **Dashboard**: "dashboard", "home", "डैशबोर्ड", "होम"
- **AI Sakhi**: "ai sakhi", "assistant", "एआई सखी", "सहायक"
- **Skills**: "skills", "कौशल", "দক্ষতা"
- **Opportunities**: "opportunities", "jobs", "अवसर"
- **Food**: "food", "marketplace", "खाद्य बाज़ार"
- **Community**: "community", "समुदाय"
- **Progress**: "progress", "प्रगति"

## 💰 Cost Estimate

### AWS Free Tier (First 12 months):
- **Transcribe**: 60 minutes/month FREE
- **Translate**: 2 million characters/month FREE
- **Polly**: 5 million characters/month FREE
- **S3**: 5 GB storage FREE

### After Free Tier:
- **Transcribe**: $0.024/minute (~$0.40 per 1000 commands)
- **Translate**: $15/million characters (~$0.01 per 1000 commands)
- **Polly**: $4/million characters (~$0.01 per 1000 commands)
- **S3**: $0.023/GB (~$0.10/month)

**Total**: ~$0.50 per 1000 voice commands

## 📝 Logs and Debugging

### Backend Logs:
```bash
# Watch server logs
cd SHE-BALANCE-main\SHE-Balnce-main\backend
node server.js

# Look for:
# 🎤 Processing voice command...
# ✅ Audio uploaded to S3
# ✅ Transcription job started
# 📝 Transcription: [your speech]
# 🌍 Detected Language: [language]
# 🔄 Translation: [english text]
# 🎯 Detecting intent from: [text]
# ✅ Best navigation match: [page]
```

### Browser Console:
Press F12 and check for:
```javascript
// Success logs:
🎤 Recording started
📝 Heard: "डैशबोर्ड"
🌍 Language: Hindi
✅ Command matched: dashboard

// Error logs:
❌ Failed to access microphone
❌ Voice command error: [details]
```

### AWS CloudWatch:
1. Go to AWS Console → CloudWatch
2. Select "Logs"
3. Find `/aws/transcribe/` log group
4. Check for errors

## ⚡ Performance

- **Recording**: < 1 second
- **Upload to S3**: 1-2 seconds
- **Transcription**: 2-4 seconds
- **Translation**: < 1 second
- **Polly TTS**: 1-2 seconds
- **Total**: 5-10 seconds

## 🔒 Security

- ✅ JWT authentication required
- ✅ Audio files auto-deleted after processing
- ✅ Presigned URLs expire in 1 hour
- ✅ CORS enabled for frontend
- ✅ AWS credentials never exposed to frontend

## 📞 Support

If you encounter issues:

1. **Run diagnostic**: `test-aws-voice.bat`
2. **Check logs**: Server console + Browser console (F12)
3. **Verify AWS**: `aws sts get-caller-identity`
4. **Test manually**: Use AWS Console to test Transcribe/Polly
5. **Check quotas**: AWS Console → Service Quotas

## 🎉 Success Checklist

- [ ] AWS CLI installed
- [ ] AWS credentials configured
- [ ] S3 bucket created
- [ ] NPM packages installed
- [ ] Server running
- [ ] Dashboard opens
- [ ] Microphone button visible
- [ ] Voice recording works
- [ ] Language detected correctly
- [ ] Navigation works

---

**Ready!** Run `test-aws-voice.bat` to start testing. 🎤
