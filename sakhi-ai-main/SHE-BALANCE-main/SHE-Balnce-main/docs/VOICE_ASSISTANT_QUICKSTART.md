# 🚀 Voice Assistant Quick Start Guide

## Get Started in 5 Minutes!

### Step 1: Setup AWS Services (2 minutes)

Run the automated setup script:

```bash
cd SHE-BALANCE-main/SHE-Balnce-main
setup-voice-services.bat
```

This will:
- ✅ Check AWS CLI installation
- ✅ Verify AWS credentials
- ✅ Create S3 bucket
- ✅ Create DynamoDB table
- ✅ Test AWS services

### Step 2: Start Backend Server (1 minute)

```bash
cd backend
npm install
node server.js
```

Server should start on `http://localhost:3000`

### Step 3: Test the Integration (2 minutes)

Open in browser:
```
test-voice-services.html
```

Run all 4 tests:
1. ✅ Text to Speech
2. ✅ Translation
3. ✅ Backend Connection
4. ✅ AWS Services

### Step 4: Use in Dashboard

Open `dashboard.html` or `corporate-dashboard.html`

Look for the **"Voice Assistant"** button at bottom-right corner.

Click and start using!

## 🎯 Quick Test

### Test Text-to-Speech

1. Click "Voice Assistant" button
2. Select "Hindi" from language dropdown
3. Type: "नमस्ते, मैं शीबैलेंस का उपयोग कर रही हूं"
4. Click "Speak"
5. Listen to the audio!

### Test Translation

1. Enter: "I love SheBalance"
2. From: English
3. To: Hindi
4. Click "Translate"
5. See: "मुझे शीबैलेंस पसंद है"

### Test Speech-to-Text

1. Click "Start Recording"
2. Say: "Hello, this is a test"
3. Click "Stop Recording"
4. Wait 5-10 seconds
5. See transcribed text!

## 🎨 Features Available

### 1. Text-to-Speech
- Type any text
- Select language
- Click "Speak"
- Audio plays automatically

### 2. Speech-to-Text
- Click "Start Recording"
- Speak clearly
- Click "Stop Recording"
- Text appears automatically

### 3. Translation
- Enter text
- Select source & target languages
- Click "Translate"
- Translation appears instantly

### 4. Quick Actions
- Click any quick action button
- Instant voice message in your language
- Pre-defined helpful messages

## 🗣️ Supported Languages

- 🇬🇧 English
- 🇮🇳 Hindi
- 🇮🇳 Bengali
- 🇮🇳 Telugu
- 🇮🇳 Tamil
- 🇮🇳 Marathi
- 🇮🇳 Gujarati
- 🇮🇳 Kannada
- 🇮🇳 Malayalam
- 🇮🇳 Punjabi
- 🇵🇰 Urdu

## 🐛 Troubleshooting

### Backend Not Starting?
```bash
# Install dependencies
cd backend
npm install

# Check if port 3000 is free
netstat -ano | findstr :3000

# Start server
node server.js
```

### AWS Services Not Working?
```bash
# Configure AWS credentials
aws configure

# Test AWS access
aws sts get-caller-identity
```

### Audio Not Playing?
- Check browser console for errors
- Verify S3 bucket exists
- Check AWS credentials
- Try different browser

### Microphone Not Working?
- Grant microphone permissions
- Use HTTPS (required for mic access)
- Try Chrome or Firefox
- Check browser settings

## 📝 Configuration

### Update Backend URL

If backend is not on `localhost:3000`, edit `multi-language-voice.js`:

```javascript
constructor() {
    this.apiBaseUrl = 'http://YOUR_BACKEND_URL/api/voice';
}
```

### Update AWS Region

Edit `.env` file:

```env
AWS_REGION=us-east-1
S3_BUCKET=your-bucket-name
AUDIO_TABLE=your-table-name
```

## 💡 Tips

1. **Best Audio Quality**: Speak clearly, minimize background noise
2. **Faster Transcription**: Keep recordings under 1 minute
3. **Better Translations**: Use complete sentences
4. **Save Preferences**: Language selection is saved automatically
5. **Mobile Friendly**: Works on mobile browsers too!

## 🎉 You're Ready!

The voice assistant is now fully functional. Artisans can:

- ✅ Listen to dashboard content in their language
- ✅ Use voice commands
- ✅ Transcribe voice notes
- ✅ Translate messages instantly
- ✅ Access help in 11+ languages

## 📚 More Information

- **Full Guide**: `MULTI_LANGUAGE_VOICE_GUIDE.md`
- **Technical Details**: `VOICE_ASSISTANT_SUMMARY.md`
- **API Documentation**: Check backend routes

## 🆘 Need Help?

1. Check `test-voice-services.html` for diagnostics
2. Review browser console for errors
3. Verify AWS service status
4. Check backend logs
5. Test with different browsers

---

**Enjoy your new multi-language voice assistant!** 🎤🌍
