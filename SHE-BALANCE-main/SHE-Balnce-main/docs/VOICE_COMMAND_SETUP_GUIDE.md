# Voice Command System Setup Guide

## Overview
The Voice Command System uses AWS Transcribe (automatic language detection), AWS Translate, and AWS Polly to provide multi-language voice navigation and commands for the SheBalance artisan dashboard.

## Features
✅ **Automatic Language Detection** - Detects 9+ Indian languages automatically
✅ **Voice Navigation** - Navigate to any page using voice commands
✅ **Multi-Language Support** - Supports Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, and English
✅ **Real-time Transcription** - Converts speech to text instantly
✅ **Voice Feedback** - Speaks confirmation in the user's language
✅ **Intent Detection** - Understands navigation, order updates, payment requests

## Supported Languages

| Language | Code | Example Command |
|----------|------|-----------------|
| English | en | "Open dashboard" |
| Hindi | hi | "डैशबोर्ड खोलें" |
| Bengali | bn | "ড্যাশবোর্ড খুলুন" |
| Tamil | ta | "டாஷ்போர்டு திற" |
| Telugu | te | "డాష్‌బోర్డ్ తెరవండి" |
| Marathi | mr | "डॅशबोर्ड उघडा" |
| Gujarati | gu | "ડેશબોર્ડ ખોલો" |
| Kannada | kn | "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ" |
| Malayalam | ml | "ഡാഷ്ബോർഡ് തുറക്കുക" |

## Architecture

```
User Voice Input
    ↓
Frontend (voice-command-aws.js)
    ↓
Backend (voice-command-service.js)
    ↓
AWS Transcribe (Language Detection + Speech-to-Text)
    ↓
AWS Translate (Translation to English)
    ↓
Intent Detection (Navigation/Action)
    ↓
AWS Polly (Text-to-Speech Confirmation)
    ↓
Navigation/Action Execution
```

## Setup Instructions

### 1. AWS Prerequisites

#### Create S3 Bucket
```bash
aws s3 mb s3://shebalance-voice-commands --region us-east-1
```

#### Create IAM Role
Create an IAM role with these policies:
- AmazonTranscribeFullAccess
- TranslateFullAccess
- AmazonPollyFullAccess
- AmazonS3FullAccess

### 2. Install Dependencies

```bash
cd SHE-BALANCE-main/SHE-Balnce-main/backend
npm install @aws-sdk/client-transcribe @aws-sdk/client-translate @aws-sdk/client-polly @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 3. Configure AWS Credentials

Set environment variables:
```bash
set AWS_REGION=us-east-1
set AWS_ACCESS_KEY_ID=your_access_key
set AWS_SECRET_ACCESS_KEY=your_secret_key
set VOICE_BUCKET=shebalance-voice-commands
```

Or use AWS CLI:
```bash
aws configure
```

### 4. Deploy Lambda (Optional)

If you want to use Lambda instead of local backend:

```bash
cd SHE-BALANCE-main/SHE-Balnce-main/aws-backend
deploy-voice-command.bat
```

Update the Lambda IAM role ARN in the script before running.

### 5. Update Frontend Configuration

Edit `voice-command-aws.js`:
```javascript
this.apiEndpoint = 'http://localhost:5000/api/voice-command';
// Or use Lambda API Gateway URL:
// this.apiEndpoint = 'https://your-api-gateway-url.amazonaws.com/prod/voice-command';
```

### 6. Start the Backend Server

```bash
cd SHE-BALANCE-main/SHE-Balnce-main/backend
node server.js
```

## Usage

### Basic Voice Commands

#### Navigation Commands (Any Language)
- "Open dashboard" / "डैशबोर्ड खोलें"
- "Show my skills" / "मेरे कौशल दिखाओ"
- "Go to opportunities" / "अवसर पर जाएं"
- "Open food marketplace" / "खाद्य बाज़ार खोलें"
- "Show community" / "समुदाय दिखाओ"
- "Open AI Sakhi" / "एआई सखी खोलें"
- "Show my progress" / "मेरी प्रगति दिखाओ"

#### Action Commands
- "Update my order" / "मेरा ऑर्डर अपडेट करें"
- "Request payment" / "भुगतान का अनुरोध करें"
- "Check my balance" / "मेरा बैलेंस चेक करें"

### How to Use

1. **Click the Voice Command Button** in the dashboard header
2. **Speak your command** in any supported language
3. **Wait for processing** (2-5 seconds)
4. **See transcription** and detected language
5. **Hear confirmation** in your language
6. **Automatic navigation** to the requested page

## Testing

### Test Voice Command Locally

1. Start the backend server:
```bash
cd SHE-BALANCE-main/SHE-Balnce-main/backend
node server.js
```

2. Open the dashboard:
```
http://localhost:5000/dashboard.html
```

3. Click the microphone button and speak a command

### Test Different Languages

Try these test phrases:
- English: "Open dashboard"
- Hindi: "डैशबोर्ड खोलें"
- Bengali: "ড্যাশবোর্ড খুলুন"
- Tamil: "டாஷ்போர்டு திற"

## Troubleshooting

### Issue: "Failed to access microphone"
**Solution:** Grant microphone permissions in your browser settings

### Issue: "Transcription timeout"
**Solution:** 
- Check AWS credentials
- Verify S3 bucket exists
- Check network connectivity
- Increase timeout in voice-command-service.js

### Issue: "Language not detected correctly"
**Solution:**
- Speak clearly and slowly
- Reduce background noise
- Use supported language codes
- Check AWS Transcribe language support

### Issue: "Navigation not working"
**Solution:**
- Check navigation command keywords in voice-command-aws.js
- Verify page URLs in pageUrls object
- Check browser console for errors

## API Reference

### POST /api/voice-command

#### Process Voice Command
```json
{
  "action": "process-voice-command",
  "audio": "base64_encoded_audio"
}
```

Response:
```json
{
  "success": true,
  "transcription": "डैशबोर्ड खोलें",
  "translation": "open dashboard",
  "detectedLanguage": "Hindi",
  "languageCode": "hi",
  "intent": {
    "type": "navigation",
    "action": "navigate",
    "target": "dashboard",
    "confidence": "high"
  },
  "commandId": "uuid"
}
```

#### Text-to-Speech
```json
{
  "action": "text-to-speech",
  "text": "Opening dashboard",
  "language": "Hindi"
}
```

Response:
```json
{
  "success": true,
  "audioUrl": "https://s3.amazonaws.com/..."
}
```

## Cost Estimation

### AWS Services Pricing (Approximate)

- **AWS Transcribe**: $0.024 per minute
- **AWS Translate**: $15 per million characters
- **AWS Polly**: $4 per million characters
- **S3 Storage**: $0.023 per GB

### Example Monthly Cost (1000 users, 10 commands/day)
- Transcribe: ~$72/month (10,000 minutes)
- Translate: ~$0.15/month (10,000 translations)
- Polly: ~$0.40/month (100,000 characters)
- S3: ~$1/month (storage + requests)

**Total: ~$74/month**

## Performance

- **Language Detection**: 2-3 seconds
- **Transcription**: 2-4 seconds
- **Translation**: <1 second
- **Text-to-Speech**: 1-2 seconds
- **Total Response Time**: 5-10 seconds

## Security

- ✅ JWT authentication required
- ✅ Audio files stored temporarily in S3
- ✅ Automatic cleanup of transcription jobs
- ✅ CORS enabled for frontend access
- ✅ Presigned URLs for audio playback (1 hour expiry)

## Future Enhancements

- [ ] Offline language detection using browser APIs
- [ ] Voice command history and analytics
- [ ] Custom wake word ("Hey Sakhi")
- [ ] Continuous listening mode
- [ ] Voice-based form filling
- [ ] Multi-turn conversations
- [ ] Emotion detection from voice
- [ ] Regional accent support

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review AWS CloudWatch logs
3. Check browser console for errors
4. Verify AWS service quotas

## Files Created

```
SHE-BALANCE-main/SHE-Balnce-main/
├── voice-command-aws.js          # Frontend voice command handler
├── voice-command.css             # Voice command UI styles
├── backend/
│   └── voice-command-service.js  # Backend service integration
└── aws-backend/
    ├── lambda_voice_command.py   # Lambda function
    └── deploy-voice-command.bat  # Deployment script
```

## Quick Start Commands

```bash
# 1. Install dependencies
cd SHE-BALANCE-main/SHE-Balnce-main/backend
npm install

# 2. Configure AWS
aws configure

# 3. Create S3 bucket
aws s3 mb s3://shebalance-voice-commands

# 4. Start server
node server.js

# 5. Open dashboard
start http://localhost:5000/dashboard.html
```

---

**Ready to use!** Click the microphone button and start speaking in any supported language. 🎤
