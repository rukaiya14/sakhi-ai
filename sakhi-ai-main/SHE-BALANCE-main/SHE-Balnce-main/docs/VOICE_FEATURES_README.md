# 🎤 Multi-Language Voice Assistant

## Overview

A comprehensive voice assistant integrated into the SheBalance artisan dashboard, powered by AWS AI services (Polly, Transcribe, Translate).

## 🌟 Features

### 🔊 Text-to-Speech
Convert any text to natural-sounding speech in 11+ languages using AWS Polly.

### 🎙️ Speech-to-Text
Record audio and automatically transcribe it to text using AWS Transcribe.

### 🌍 Translation
Translate text between any supported languages using AWS Translate.

### ⚡ Quick Actions
Pre-defined voice messages for common tasks (greetings, help, orders, earnings).

## 🗣️ Supported Languages

| Language | Code | Voice |
|----------|------|-------|
| English | en | Joanna (Neural) |
| Hindi | hi | Aditi |
| Bengali | bn | Aditi |
| Telugu | te | Aditi |
| Tamil | ta | Aditi |
| Marathi | mr | Aditi |
| Gujarati | gu | Aditi |
| Kannada | kn | Aditi |
| Malayalam | ml | Aditi |
| Punjabi | pa | Aditi |
| Urdu | ur | Aditi |

## 📁 File Structure

```
SHE-BALANCE-main/SHE-Balnce-main/
├── multi-language-voice.js          # Main voice widget
├── test-voice-services.html         # Testing interface
├── setup-voice-services.bat         # AWS setup script
├── MULTI_LANGUAGE_VOICE_GUIDE.md    # Complete guide
├── VOICE_ASSISTANT_SUMMARY.md       # Implementation summary
├── VOICE_ASSISTANT_QUICKSTART.md    # Quick start guide
│
├── backend/
│   └── voice-services-routes.js     # Express API routes
│
└── aws-backend/
    └── lambda_voice_services.py     # Lambda function
```

## 🚀 Quick Start

### 1. Setup AWS Services
```bash
setup-voice-services.bat
```

### 2. Start Backend
```bash
cd backend
npm install
node server.js
```

### 3. Test Integration
Open `test-voice-services.html` in browser

### 4. Use in Dashboard
Open `dashboard.html` and click "Voice Assistant" button

## 🎯 Usage Examples

### Example 1: Text-to-Speech
```javascript
// User types: "Hello, welcome to SheBalance"
// Selects: Hindi
// Output: Audio saying "नमस्ते, शीबैलेंस में आपका स्वागत है"
```

### Example 2: Speech-to-Text
```javascript
// User records: "I need help with my order"
// Language: English
// Output: "I need help with my order"
```

### Example 3: Translation
```javascript
// Input: "I love working here"
// From: English
// To: Hindi
// Output: "मुझे यहां काम करना पसंद है"
```

## 🔧 Configuration

### Backend URL
Edit `multi-language-voice.js`:
```javascript
this.apiBaseUrl = 'http://localhost:3000/api/voice';
```

### AWS Credentials
Edit `.env`:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET=shebalance-voice-files
AUDIO_TABLE=shebalance-audio-files
```

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/voice/text-to-speech` | POST | Generate speech |
| `/api/voice/speech-to-text` | POST | Transcribe audio |
| `/api/voice/transcription-status/:jobName` | GET | Check status |
| `/api/voice/translate` | POST | Translate text |
| `/api/voice/upload-audio` | POST | Upload audio |
| `/api/voice/languages` | GET | Get languages |

## 🎨 UI Components

### Voice Widget Button
- Fixed position at bottom-right
- Gradient background
- Hover animation
- Click to toggle panel

### Voice Panel
- Expandable interface
- Language selector
- Text-to-speech section
- Speech-to-text section
- Translation section
- Quick actions grid

### Notifications
- Success/error messages
- Slide-in animation
- Auto-dismiss
- Color-coded

## 💰 Cost Estimate

For 1000 active users/month:
- AWS Polly: ~$4
- AWS Transcribe: ~$24
- AWS Translate: ~$15
- S3 + DynamoDB: ~$2
- **Total: ~$45/month**

## 🧪 Testing

### Run All Tests
1. Open `test-voice-services.html`
2. Click each test button
3. Verify all tests pass

### Manual Testing
1. Open dashboard
2. Click "Voice Assistant"
3. Test each feature
4. Try different languages

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Audio not playing | Check S3 permissions |
| Recording not working | Grant mic permissions |
| Transcription stuck | Wait 30 seconds |
| Translation errors | Check language codes |
| Backend connection failed | Start server on port 3000 |

## 📈 Performance

- Text-to-Speech: ~1-2 seconds
- Speech-to-Text: ~5-10 seconds
- Translation: ~1 second
- Audio Upload: ~2-3 seconds

## 🔒 Security

- ✅ Input validation
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ HTTPS required
- ✅ JWT authentication (recommended)

## 📚 Documentation

- **Complete Guide**: `MULTI_LANGUAGE_VOICE_GUIDE.md`
- **Quick Start**: `VOICE_ASSISTANT_QUICKSTART.md`
- **Summary**: `VOICE_ASSISTANT_SUMMARY.md`

## 🎓 Best Practices

1. **Audio Quality**: Speak clearly, minimize noise
2. **Recording Length**: Keep under 2 minutes
3. **Translation**: Use complete sentences
4. **Language Selection**: Save user preferences
5. **Error Handling**: Show clear error messages

## 🌟 Benefits

### For Artisans
- ✅ Use platform in native language
- ✅ Voice-first interface
- ✅ No literacy barriers
- ✅ Easy navigation
- ✅ Quick help access

### For Platform
- ✅ Increased accessibility
- ✅ Better user engagement
- ✅ Wider reach
- ✅ Cultural sensitivity
- ✅ Competitive advantage

## 🚀 Future Enhancements

- [ ] Offline mode
- [ ] Voice commands for navigation
- [ ] Custom voice training
- [ ] Real-time translation
- [ ] Voice analytics
- [ ] More regional dialects
- [ ] Voice profiles
- [ ] Enhanced accessibility

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review browser console
3. Test with `test-voice-services.html`
4. Verify AWS service status
5. Check backend logs

## 🎉 Success!

The multi-language voice assistant is fully integrated and ready to empower artisans across India with voice-enabled, multilingual access to the SheBalance platform!

---

**Made with ❤️ for SheBalance Artisans**
