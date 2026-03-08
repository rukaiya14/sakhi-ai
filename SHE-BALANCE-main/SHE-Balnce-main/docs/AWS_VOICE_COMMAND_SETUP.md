# AWS Voice Command Setup Guide

## Overview
This system uses AWS Transcribe for automatic language detection, AWS Translate for translation, and AWS Polly for voice feedback. It provides accurate multi-language voice navigation.

## Prerequisites

1. **AWS Account** with billing enabled
2. **AWS CLI** installed and configured
3. **Node.js** installed (v14 or higher)
4. **IAM User** with appropriate permissions

## Step 1: Install AWS CLI

### Windows:
```bash
# Download from: https://aws.amazon.com/cli/
# Or use chocolatey:
choco install awscli
```

### Verify Installation:
```bash
aws --version
```

## Step 2: Configure AWS Credentials

### Option A: Using AWS CLI
```bash
aws configure
```

Enter:
- AWS Access Key ID
- AWS Secret Access Key
- Default region: `us-east-1`
- Default output format: `json`

### Option B: Manual Configuration
Create `.env` file in `backend` folder:
```
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
VOICE_BUCKET=shebalance-voice-commands
```

## Step 3: Set Up IAM Permissions

Your IAM user needs these policies:

### Required Policies:
1. **AmazonTranscribeFullAccess**
2. **TranslateFullAccess**
3. **AmazonPollyFullAccess**
4. **AmazonS3FullAccess**

### Or Create Custom Policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "transcribe:*",
        "translate:*",
        "polly:*",
        "s3:*"
      ],
      "Resource": "*"
    }
  ]
}
```

## Step 4: Install Dependencies

```bash
cd SHE-BALANCE-main/SHE-Balnce-main/backend
npm install @aws-sdk/client-transcribe @aws-sdk/client-translate @aws-sdk/client-polly @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## Step 5: Create S3 Bucket

```bash
aws s3 mb s3://shebalance-voice-commands --region us-east-1
```

Or use the setup script:
```bash
setup-voice-command-aws.bat
```

## Step 6: Start the Server

```bash
cd SHE-BALANCE-main/SHE-Balnce-main/backend
node server.js
```

You should see:
```
✅ Server running on port 5000
🤖 AI Sakhi: Claude 3 Haiku (AWS Bedrock)
```

## Step 7: Test Voice Commands

1. Open: `http://localhost:5000/dashboard.html`
2. Click the microphone button (top right)
3. Speak a command in any language:
   - "Dashboard" (English)
   - "डैशबोर्ड" (Hindi)
   - "ড্যাশবোর্ড" (Bengali)
   - "டாஷ்போர்டு" (Tamil)

## How It Works

### Flow:
```
User speaks → Browser records audio → Sends to backend
    ↓
Backend uploads to S3
    ↓
AWS Transcribe (Auto language detection)
    ↓
AWS Translate (Translate to English)
    ↓
Intent Detection (Match command)
    ↓
AWS Polly (Speak confirmation)
    ↓
Navigate to page
```

### Language Detection:
- AWS Transcribe automatically identifies the language
- Supports: Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, English
- Fallback: Script-based detection (Devanagari, Bengali script, etc.)

### Intent Detection:
- Score-based keyword matching
- Checks both original text and English translation
- Supports partial matches
- Confidence scoring (high/medium/low)

## Supported Commands

### Navigation Commands (All Languages):

| Page | English | Hindi | Bengali | Tamil |
|------|---------|-------|---------|-------|
| Dashboard | dashboard, home | डैशबोर्ड, होम | ড্যাশবোর্ড, হোম | டாஷ்போர்டு, ஹோம் |
| AI Sakhi | ai sakhi, assistant | एआई सखी, सहायक | এআই সখি, সহায়ক | ஏஐ சகி, உதவியாளர் |
| Skills | skills, my skills | कौशल, मेरे कौशल | দক্ষতা | திறன்கள் |
| Opportunities | opportunities, jobs | अवसर, नौकरी | সুযোগ, চাকরি | வாய்ப்புகள், வேலை |
| Food | food, marketplace | खाद्य, बाज़ार | খাদ্য, বাজার | உணவு, சந்தை |
| Community | community, group | समुदाय, समूह | সম্প্রদায়, গ্রুপ | சமூகம், குழு |
| Progress | progress, growth | प्रगति, विकास | অগ্রগতি, উন্নয়ন | முன்னேற்றம், வளர்ச்சி |

## Troubleshooting

### Issue: "AWS credentials not configured"

**Solution:**
```bash
aws configure
# Or set environment variables
set AWS_ACCESS_KEY_ID=your_key
set AWS_SECRET_ACCESS_KEY=your_secret
```

### Issue: "S3 bucket does not exist"

**Solution:**
```bash
aws s3 mb s3://shebalance-voice-commands --region us-east-1
```

### Issue: "Transcription failed"

**Possible Causes:**
1. Audio format not supported
2. Audio too short (< 1 second)
3. No speech detected
4. AWS service quota exceeded

**Solution:**
- Check audio is being recorded properly
- Speak clearly for 2-3 seconds
- Check AWS CloudWatch logs
- Verify AWS service quotas

### Issue: "Language not detected correctly"

**Solution:**
- Speak more clearly
- Use longer phrases (3-5 words)
- Check supported languages list
- System will fallback to script detection

### Issue: "Navigation not working"

**Solution:**
- Check browser console for errors (F12)
- Verify command keywords in voice-command-aws.js
- Check intent detection logs in backend
- Try exact commands from the table above

### Issue: "No voice feedback"

**Solution:**
- Check AWS Polly permissions
- Verify audio playback in browser
- Check S3 bucket permissions
- Look for errors in browser console

## Testing Different Languages

### Test Script:
```javascript
// Open browser console (F12) and run:
const testCommands = [
    { lang: 'en', text: 'dashboard' },
    { lang: 'hi', text: 'डैशबोर्ड' },
    { lang: 'bn', text: 'ড্যাশবোর্ড' },
    { lang: 'ta', text: 'டாஷ்போர்டு' }
];

// Test each command
testCommands.forEach(cmd => {
    console.log(`Testing ${cmd.lang}: ${cmd.text}`);
    // Click mic button and speak
});
```

## Monitoring and Logs

### Backend Logs:
```bash
# Watch server logs
cd SHE-BALANCE-main/SHE-Balnce-main/backend
node server.js

# Look for:
# 🎤 Processing voice command...
# ✅ Audio uploaded to S3
# ✅ Transcription job started
# 📝 Transcription: [text]
# 🌍 Detected Language: [language]
# 🔄 Translation: [text]
# 🎯 Detecting intent from: [text]
# ✅ Best navigation match: [page]
```

### AWS CloudWatch:
1. Go to AWS Console → CloudWatch
2. Select Logs
3. Find `/aws/transcribe/` log group
4. Check for transcription errors

### Browser Console:
```javascript
// Enable verbose logging
localStorage.setItem('voice_debug', 'true');

// Check logs
console.log(window.voiceCommandSystem);
```

## Cost Estimation

### AWS Pricing (Approximate):

| Service | Cost | Usage (1000 users, 10 commands/day) |
|---------|------|--------------------------------------|
| Transcribe | $0.024/min | ~$72/month |
| Translate | $15/million chars | ~$0.15/month |
| Polly | $4/million chars | ~$0.40/month |
| S3 | $0.023/GB | ~$1/month |
| **Total** | | **~$74/month** |

### Free Tier (First 12 months):
- Transcribe: 60 minutes/month free
- Translate: 2 million characters/month free
- Polly: 5 million characters/month free
- S3: 5 GB storage free

## Performance Optimization

### Tips:
1. **Audio Quality**: Use 16kHz sample rate
2. **Audio Length**: 2-5 seconds optimal
3. **Clear Speech**: Reduce background noise
4. **Caching**: Cache Polly responses for common phrases
5. **Batch Processing**: Process multiple commands together

### Expected Performance:
- Audio upload: < 1 second
- Transcription: 2-4 seconds
- Translation: < 1 second
- Polly synthesis: 1-2 seconds
- **Total**: 5-8 seconds

## Security Best Practices

1. **Never commit AWS credentials** to git
2. **Use IAM roles** instead of access keys when possible
3. **Enable S3 bucket encryption**
4. **Set S3 lifecycle policies** to delete old audio files
5. **Use presigned URLs** with short expiry (1 hour)
6. **Implement rate limiting** to prevent abuse

## Advanced Configuration

### Custom Language Models:
```javascript
// In voice-command-service.js
const transcribeParams = {
    TranscriptionJobName: jobName,
    Media: { MediaFileUri: audioUri },
    MediaFormat: 'webm',
    IdentifyLanguage: true,
    LanguageOptions: ['en-IN', 'hi-IN', 'bn-IN'],
    // Add custom vocabulary
    Settings: {
        VocabularyName: 'shebalance-vocabulary'
    }
};
```

### Custom Polly Voices:
```javascript
// In voice-command-service.js
const POLLY_VOICES = {
    'en': { VoiceId: 'Kajal', Engine: 'neural' },
    'hi': { VoiceId: 'Aditi', Engine: 'standard' },
    // Add more voices
};
```

## Next Steps

1. ✅ Complete AWS setup
2. ✅ Test with different languages
3. ✅ Monitor costs and usage
4. ✅ Collect user feedback
5. ✅ Optimize based on usage patterns

## Support

For issues:
1. Check troubleshooting section
2. Review AWS CloudWatch logs
3. Check browser console errors
4. Verify AWS service status
5. Test with simple commands first

---

**System is ready!** Start the server and click the microphone button to test. 🎤
