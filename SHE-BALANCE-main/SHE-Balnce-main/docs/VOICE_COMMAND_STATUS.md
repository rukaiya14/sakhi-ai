# Voice Command System - Status & Setup

## ✅ What's Installed

1. **AWS SDK Packages** - ✅ Installed
   - @aws-sdk/client-transcribe
   - @aws-sdk/client-translate
   - @aws-sdk/client-polly
   - @aws-sdk/client-s3
   - @aws-sdk/s3-request-presigner

2. **Voice Command Service** - ✅ Created
   - File: `backend/voice-command-service.js`
   - Integrated with server.js
   - Route: `/api/voice-command`

3. **Frontend Integration** - ✅ Ready
   - File: `voice-command-aws.js`
   - Integrated in dashboard.html
   - Microphone button ready

## 🔧 AWS Configuration Issue

Your AWS credentials need to be reconfigured. Here's how:

### Option 1: Reconfigure AWS CLI
```bash
aws configure
```

Enter:
- **AWS Access Key ID**: (from AWS Console → IAM → Security credentials)
- **AWS Secret Access Key**: (your secret key)
- **Default region**: `us-east-1`
- **Default output format**: `json`

### Option 2: Set Environment Variables
```bash
# PowerShell
$env:AWS_ACCESS_KEY_ID="your_access_key"
$env:AWS_SECRET_ACCESS_KEY="your_secret_key"
$env:AWS_REGION="us-east-1"

# CMD
set AWS_ACCESS_KEY_ID=your_access_key
set AWS_SECRET_ACCESS_KEY=your_secret_key
set AWS_REGION=us-east-1
```

### Option 3: Create .env File
Create `.env` file in `backend` folder:
```
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
VOICE_BUCKET=shebalance-voice-commands
```

Then install dotenv:
```bash
cd SHE-BALANCE-main\SHE-Balnce-main\backend
npm install dotenv
```

Add to server.js (top):
```javascript
require('dotenv').config();
```

## 🚀 Quick Start (After AWS Config)

### 1. Start Server
```bash
cd SHE-BALANCE-main\SHE-Balnce-main\backend
node server.js
```

### 2. Open Dashboard
```
http://localhost:5000/dashboard.html
```

### 3. Test Voice Command
1. Login to dashboard
2. Click microphone button (top right)
3. Speak: "Dashboard" or "डैशबोर्ड"

## 🎤 How It Works

```
User clicks mic → Records audio → Sends to backend
    ↓
Backend receives base64 audio
    ↓
Uploads to S3 (auto-creates bucket if needed)
    ↓
AWS Transcribe (auto-detects language)
    ↓
AWS Translate (translates to English)
    ↓
Intent detection (matches command)
    ↓
AWS Polly (speaks confirmation)
    ↓
Returns result to frontend
    ↓
Frontend navigates to page
```

## 📋 Supported Commands

| English | Hindi | Bengali | Tamil | Action |
|---------|-------|---------|-------|--------|
| dashboard | डैशबोर्ड | ড্যাশবোর্ড | டாஷ்போர்டு | Go to dashboard |
| ai sakhi | एआई सखी | এআই সখি | ஏஐ சகி | Open AI assistant |
| skills | कौशल | দক্ষতা | திறன்கள் | View skills |
| opportunities | अवसर | সুযোগ | வாய்ப்புகள் | Find jobs |
| food | खाद्य बाज़ार | খাদ্য বাজার | உணவு சந்தை | Food marketplace |
| community | समुदाय | সম্প্রদায় | சமூகம் | Community page |
| progress | प्रगति | অগ্রগতি | முன்னேற்றம் | View progress |

## 🔍 Troubleshooting

### Issue: AWS Signature Error
**Cause**: AWS credentials not configured properly

**Solution**:
```bash
# Check current config
aws configure list

# Reconfigure
aws configure

# Test
aws sts get-caller-identity
```

### Issue: S3 Bucket Error
**Cause**: Bucket doesn't exist or no permissions

**Solution**: The system will auto-create bucket on first use. Ensure IAM permissions include:
- `s3:CreateBucket`
- `s3:PutObject`
- `s3:GetObject`

### Issue: Transcription Failed
**Cause**: Audio format or AWS service issue

**Solution**:
- Speak for 2-3 seconds minimum
- Check AWS CloudWatch logs
- Verify Transcribe service is available in your region

### Issue: Voice Button Not Working
**Cause**: Frontend not connected to backend

**Solution**:
1. Check server is running: `http://localhost:5000`
2. Check browser console (F12) for errors
3. Verify network tab shows API calls
4. Check CORS is enabled in server.js

## 📊 Testing Checklist

- [ ] AWS credentials configured
- [ ] Server starts without errors
- [ ] Dashboard opens at localhost:5000
- [ ] Can login successfully
- [ ] Microphone button visible
- [ ] Click mic button - turns red
- [ ] Speak command - processes
- [ ] See transcription in console
- [ ] Navigation works

## 💡 Tips

1. **First Time**: May take 5-10 seconds as AWS services initialize
2. **Clear Speech**: Speak clearly for 2-3 seconds
3. **Quiet Environment**: Reduce background noise
4. **Simple Commands**: Use single words like "Dashboard", "Skills"
5. **Check Logs**: Watch server console for detailed logs

## 🎯 Next Steps

1. **Fix AWS Credentials**:
   ```bash
   aws configure
   ```

2. **Start Server**:
   ```bash
   cd SHE-BALANCE-main\SHE-Balnce-main\backend
   node server.js
   ```

3. **Test**:
   - Open: http://localhost:5000/dashboard.html
   - Click microphone
   - Speak command

4. **Monitor**:
   - Watch server console for logs
   - Check browser console (F12)
   - Look for AWS service calls

## 📞 Support

If issues persist:
1. Check AWS Console → IAM → Your user → Permissions
2. Verify AWS service quotas
3. Check CloudWatch logs
4. Test AWS services manually in console

---

**System is ready!** Just need to fix AWS credentials and test. 🎤
