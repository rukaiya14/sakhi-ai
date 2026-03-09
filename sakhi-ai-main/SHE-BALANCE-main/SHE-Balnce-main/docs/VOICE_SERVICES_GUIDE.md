# AWS Voice Services Integration Guide

## Overview
The SHE-BALANCE platform now includes AWS-powered voice commands using:
- **AWS Transcribe**: Speech-to-Text conversion
- **AWS Translate**: Multi-language translation
- **AWS Polly**: Text-to-Speech synthesis

## Quick Start

### 1. Install Dependencies
```bash
.\install-voice-services.bat
```

### 2. Start Servers
```bash
.\setup-voice-and-start.bat
```

Or start manually:
```bash
# Backend
cd SHE-BALANCE-main\SHE-Balnce-main\backend
node server.js

# Frontend (in new terminal)
cd SHE-BALANCE-main\SHE-Balnce-main
node frontend-server.js
```

### 3. Access Dashboard
Open: http://localhost:8080/dashboard.html

Login with:
- Email: `rukaiya@example.com`
- Password: `password123`

## Using Voice Commands

### Activate Voice Assistant
1. Click the **"Voice Command"** button in the dashboard
2. Click **"Start Listening"**
3. Speak your command clearly
4. Wait for the response

### Supported Commands

#### English Commands
- "Show me my earnings"
- "Find new jobs" / "Show opportunities"
- "Open food marketplace"
- "Show my progress"
- "Open learning mentor"
- "Open AI assistant" / "Help me"

#### Hindi Commands (हिंदी)
- "मुझे मेरी कमाई दिखाओ"
- "नई नौकरियां खोजें"
- "फूड मार्केटप्लेस खोलें"
- "मेरी प्रगति दिखाओ"

#### Bengali Commands (বাংলা)
- "আমার আয় দেখান"
- "নতুন চাকরি খুঁজুন"
- "খাদ্য বাজার খুলুন"
- "আমার অগ্রগতি দেখান"

#### Marathi Commands (मराठी)
- "माझी कमाई दाखवा"
- "नवीन नोकऱ्या शोधा"
- "अन्न बाजार उघडा"
- "माझी प्रगती दाखवा"

## How It Works

### 1. Speech-to-Text (AWS Transcribe)
```javascript
// Frontend captures audio
const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

// Send to backend
POST /api/voice/transcribe
Body: FormData with audio file and language
```

### 2. Translation (AWS Translate)
```javascript
// Translate user's language to English
POST /api/voice/translate
Body: {
  text: "मुझे मेरी कमाई दिखाओ",
  sourceLanguage: "hi",
  targetLanguage: "en"
}

// Response: "Show me my earnings"
```

### 3. Command Processing
The system matches commands and executes actions:
- Navigate to pages
- Show information
- Open features

### 4. Text-to-Speech (AWS Polly)
```javascript
// Translate response back to user's language
POST /api/voice/translate
Body: {
  text: "Showing your earnings",
  sourceLanguage: "en",
  targetLanguage: "hi"
}

// Synthesize speech
POST /api/voice/speak
Body: {
  text: "आपकी कमाई दिखा रहे हैं",
  language: "hi"
}

// Returns: MP3 audio stream
```

## Supported Languages

| Language | Code | Polly Voice |
|----------|------|-------------|
| English  | en   | Joanna      |
| Hindi    | hi   | Aditi       |
| Bengali  | bn   | Aditi       |
| Marathi  | mr   | Aditi       |
| Tamil    | ta   | Aditi       |
| Telugu   | te   | Aditi       |

## API Endpoints

### POST /api/voice/transcribe
Convert speech to text
- **Body**: FormData with `audio` file and `language`
- **Response**: `{ transcript, language }`

### POST /api/voice/translate
Translate text between languages
- **Body**: `{ text, sourceLanguage, targetLanguage }`
- **Response**: `{ translatedText }`

### POST /api/voice/speak
Convert text to speech
- **Body**: `{ text, language }`
- **Response**: MP3 audio stream

## Architecture

```
User speaks → Microphone → Audio Recording
                              ↓
                    AWS Transcribe (Speech-to-Text)
                              ↓
                    AWS Translate (to English)
                              ↓
                    Command Processing
                              ↓
                    AWS Translate (to User Language)
                              ↓
                    AWS Polly (Text-to-Speech)
                              ↓
                    Audio Playback → User hears response
```

## Files Modified

### Backend
- `backend/server.js` - Added voice service endpoints
- `backend/package.json` - Added AWS SDK dependencies

### Frontend
- `dashboard.html` - Updated to use AWS voice assistant
- `voice-assistant-aws.js` - AWS-powered voice implementation

## AWS Configuration

The system uses your AWS credentials from:
- Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
- AWS credentials file (`~/.aws/credentials`)
- IAM role (if running on EC2)

Required AWS permissions:
- `transcribe:StartTranscriptionJob`
- `transcribe:GetTranscriptionJob`
- `translate:TranslateText`
- `polly:SynthesizeSpeech`
- `s3:PutObject` (for Transcribe)

## Troubleshooting

### Voice not working?
1. Check microphone permissions in browser
2. Ensure backend server is running on port 5000
3. Check browser console for errors
4. Verify AWS credentials are configured

### Translation not working?
- Falls back to English if translation fails
- Check AWS Translate service availability in your region

### Speech synthesis not working?
- Falls back to browser's built-in speech synthesis
- Check AWS Polly service availability

### Audio quality issues?
- Speak clearly and close to microphone
- Reduce background noise
- Use a good quality microphone

## Testing

### Test Voice Commands
1. Open dashboard: http://localhost:8080/dashboard.html
2. Click "Voice Command" button
3. Try each command in different languages
4. Verify audio playback works

### Test API Endpoints
```bash
# Test transcription
curl -X POST http://localhost:5000/api/voice/transcribe \
  -F "audio=@test.webm" \
  -F "language=en-US"

# Test translation
curl -X POST http://localhost:5000/api/voice/translate \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello","sourceLanguage":"en","targetLanguage":"hi"}'

# Test speech synthesis
curl -X POST http://localhost:5000/api/voice/speak \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello","language":"en"}' \
  --output test.mp3
```

## Next Steps

1. **Improve Transcription**: Upload audio to S3 and use full AWS Transcribe
2. **Add More Commands**: Extend command recognition
3. **Custom Vocabulary**: Train Transcribe with domain-specific terms
4. **Voice Profiles**: Support multiple voice options
5. **Offline Mode**: Add fallback for offline usage

## Support

For issues or questions:
- Check AWS service status
- Review CloudWatch logs
- Test with simple commands first
- Verify IAM permissions

## Credits

Built with:
- AWS Transcribe
- AWS Translate
- AWS Polly
- Express.js
- Web Audio API
