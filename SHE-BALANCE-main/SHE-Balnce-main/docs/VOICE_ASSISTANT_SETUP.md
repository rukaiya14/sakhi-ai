# 🎙️ Voice Assistant Setup Guide

## ✅ What's Been Implemented

I've created a working voice assistant that uses:
- **Browser Web Speech API** (works immediately, no setup needed)
- **AWS Polly** (text-to-speech) - for better quality voices
- **AWS Transcribe** (speech-to-text) - for accurate transcription
- **AWS Translate** (translation) - for multi-language support

## 🚀 Quick Start (Browser-Based - Works Now!)

The voice assistant is already working with your browser's built-in speech recognition!

### How to Use:

1. **Open the dashboard**: `dashboard.html`
2. **Click the "Voice Command" button** in the header
3. **Click "Start Listening"** in the modal
4. **Speak your command**:
   - "Show my orders"
   - "Open skills"
   - "Change language to Hindi"
   - "What can you do?"
   - "Help"

### Supported Commands:

- **Navigation**: "Show orders", "Open skills", "Go to dashboard", "Show progress"
- **Language**: "Change language to Hindi/English/Tamil/Telugu/Bengali/Marathi/Gujarati"
- **Help**: "Help", "What can you do?"

## 🔧 Files Created:

1. **voice-assistant-simple.js** - Main voice assistant with browser speech API
2. **lambda_voice_services.py** - AWS backend (already exists)
3. **voice-services.js** - Frontend AWS integration (already exists)

## 📱 Browser Compatibility:

✅ **Works in:**
- Chrome (Desktop & Android)
- Edge
- Safari (iOS 14.5+)
- Opera

❌ **Doesn't work in:**
- Firefox (limited support)
- Older browsers

## 🌐 Multi-Language Support:

The voice assistant supports:
- English (en-US)
- Hindi (hi-IN)
- Bengali (bn-IN)
- Tamil (ta-IN)
- Telugu (te-IN)
- Marathi (mr-IN)
- Gujarati (gu-IN)

## 🎯 AWS Integration (Optional - For Better Quality)

If you want to use AWS Polly/Transcribe/Translate for better quality:

### Step 1: Deploy Lambda Function

```bash
cd SHE-BALANCE-main/SHE-Balnce-main/aws-backend
aws lambda create-function \
  --function-name shebalance-voice-services \
  --runtime python3.9 \
  --handler lambda_voice_services.lambda_handler \
  --zip-file fileb://lambda_voice_services.zip \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-execution-role
```

### Step 2: Create S3 Bucket

```bash
aws s3 mb s3://shebalance-voice-files
```

### Step 3: Create DynamoDB Table

```bash
aws dynamodb create-table \
  --table-name shebalance-audio-files \
  --attribute-definitions AttributeName=audioId,AttributeType=S \
  --key-schema AttributeName=audioId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

### Step 4: Update API Endpoint

In `voice-assistant-simple.js`, change:
```javascript
this.apiEndpoint = 'YOUR_API_GATEWAY_URL';
this.useAWS = true;
```

## 🧪 Testing

### Test Browser Speech:
1. Open dashboard
2. Click "Voice Command"
3. Say "Help"
4. Should hear response and see text

### Test AWS Integration:
1. Set `useAWS = true` in voice-assistant-simple.js
2. Configure API endpoint
3. Test text-to-speech
4. Test speech-to-text

## 🐛 Troubleshooting

### "Microphone access denied"
- Allow microphone permission in browser
- Check browser settings
- Try HTTPS (required for some browsers)

### "Speech recognition not supported"
- Use Chrome or Edge
- Update browser to latest version
- Check if running on HTTPS

### Voice not working
- Check speaker volume
- Check browser console for errors
- Try different browser

### AWS not working
- Check API endpoint URL
- Verify Lambda function is deployed
- Check IAM permissions
- Check CloudWatch logs

## 📊 AWS Costs (Approximate)

- **Polly**: $4 per 1 million characters
- **Transcribe**: $0.024 per minute
- **Translate**: $15 per 1 million characters
- **S3**: $0.023 per GB
- **DynamoDB**: Pay per request (very cheap)

**Estimated cost for 1000 users/month**: ~$10-20

## 🎨 Customization

### Add New Commands:

Edit `voice-assistant-simple.js`:

```javascript
// In processCommand function
else if (lowerCommand.includes('your command')) {
    this.speak('Your response');
    // Your action
}
```

### Change Voice:

```javascript
// In speakWithBrowser function
utterance.rate = 0.9; // Speed (0.1 to 10)
utterance.pitch = 1;  // Pitch (0 to 2)
utterance.volume = 1; // Volume (0 to 1)
```

### Add New Language:

```javascript
// In constructor
this.languages = {
    'your_lang': { code: 'xx-XX', name: 'Language Name', voice: 'xx-XX' }
};
```

## 📝 Next Steps

1. ✅ Test browser-based voice assistant (works now!)
2. ⏳ Deploy AWS Lambda for better quality (optional)
3. ⏳ Add more voice commands
4. ⏳ Integrate with AI Sakhi chatbot
5. ⏳ Add voice-based order placement

## 💡 Tips

- Speak clearly and at normal pace
- Use simple commands
- Wait for response before next command
- Check microphone is working
- Use headphones to avoid echo

---

**Need Help?** Check browser console for detailed logs and error messages.
