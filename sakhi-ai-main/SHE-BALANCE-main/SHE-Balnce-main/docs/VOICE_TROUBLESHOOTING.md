# Voice Command Troubleshooting Guide

## Issue: Voice Not Detecting Languages

### Quick Fixes

#### 1. Select Your Language First
Before using voice commands:
1. Click the **Language button** in dashboard header
2. Select your preferred language (e.g., Hindi, Tamil, etc.)
3. Then click **Voice Command** button
4. Speak in the selected language

#### 2. Check Browser Console
Open browser console (F12) and look for:
```
🌐 Recognition language set to: hi-IN
🎤 Starting recognition with language: hi-IN
```

If you see `en-US` but you're speaking Hindi, the language wasn't selected properly.

#### 3. Clear Cache and Reload
```
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

#### 4. Check Microphone Permissions
- Click the lock icon in address bar
- Ensure microphone is "Allowed"
- Refresh the page

### Step-by-Step Testing

#### Test 1: English (Always Works)
1. Open dashboard
2. Click "Voice Command"
3. Click "Start Listening"
4. Say: **"Find new jobs"**
5. Should open opportunities page

#### Test 2: Hindi
1. Click Language button → Select **हिंदी**
2. Wait 2 seconds
3. Click "Voice Command"
4. Click "Start Listening"
5. Say: **"मुझे काम चाहिए"**
6. Should open opportunities page

#### Test 3: Tamil
1. Click Language button → Select **தமிழ்**
2. Wait 2 seconds
3. Click "Voice Command"
4. Click "Start Listening"
5. Say: **"எனக்கு வேலை வேண்டும்"**
6. Should open opportunities page

### Common Issues

#### Issue: "No speech detected"
**Solution:**
- Speak louder
- Move closer to microphone
- Check microphone is working (test in other apps)
- Reduce background noise

#### Issue: "Language not supported"
**Solution:**
- Your browser may not support that language
- Try Chrome (best support)
- Fallback to English

#### Issue: Wrong language detected
**Solution:**
1. Select correct language in language selector FIRST
2. Wait 2 seconds for it to sync
3. Then use voice command
4. Check console shows correct language code

#### Issue: Command not recognized
**Solution:**
- Use simpler phrases
- Try exact keywords:
  - Jobs: "job", "work", "काम", "வேலை"
  - Earnings: "earnings", "money", "कमाई", "பணம்"
  - Food: "food", "marketplace", "खाना", "உணவு"

### Browser Support by Language

| Language | Chrome | Edge | Firefox | Safari |
|----------|--------|------|---------|--------|
| English | ✅ | ✅ | ✅ | ⚠️ |
| Hindi | ✅ | ✅ | ⚠️ | ❌ |
| Bengali | ✅ | ✅ | ⚠️ | ❌ |
| Tamil | ✅ | ✅ | ⚠️ | ❌ |
| Telugu | ✅ | ✅ | ⚠️ | ❌ |
| Kannada | ✅ | ✅ | ⚠️ | ❌ |
| Malayalam | ✅ | ✅ | ⚠️ | ❌ |
| Gujarati | ✅ | ✅ | ⚠️ | ❌ |
| Marathi | ✅ | ✅ | ⚠️ | ❌ |
| Punjabi | ✅ | ✅ | ⚠️ | ❌ |
| Odia | ✅ | ⚠️ | ❌ | ❌ |
| Assamese | ✅ | ⚠️ | ❌ | ❌ |

✅ = Full support
⚠️ = Limited support
❌ = Not supported

### Debug Mode

Open browser console (F12) and watch for these messages:

**Good:**
```
🎙️ Voice Assistant initialized - 12 Languages
📍 Current language: hi
🌐 Language mapping: hi → hi-IN
🎤 Starting recognition with language: hi-IN
✅ Heard: मुझे काम चाहिए
🤖 Processing: मुझे काम चाहिए
⚡ Executing action immediately...
```

**Bad:**
```
❌ Speech recognition not supported
❌ Error: no-speech
❌ Error: not-allowed
```

### Manual Language Override

If automatic detection isn't working, you can manually set it:

1. Open browser console (F12)
2. Type:
```javascript
localStorage.setItem('selectedLanguage', 'hi-IN');  // For Hindi
localStorage.setItem('selectedLanguage', 'ta-IN');  // For Tamil
localStorage.setItem('selectedLanguage', 'te-IN');  // For Telugu
```
3. Refresh page
4. Try voice command again

### Still Not Working?

#### Option 1: Use English
English has the best support across all browsers. Try:
- "Find new jobs"
- "Show my earnings"
- "Food marketplace"

#### Option 2: Use Test Page
```
http://localhost:8080/test-voice-fixed.html
```
This page has better debugging and shows exactly what's being recognized.

#### Option 3: Check System Language
Some browsers use your system language settings:
1. Windows: Settings → Time & Language → Language
2. Mac: System Preferences → Language & Region
3. Add your preferred Indian language
4. Restart browser

### Best Practices

1. **Select language BEFORE using voice**
2. **Wait 2 seconds after selecting language**
3. **Speak clearly and naturally**
4. **Use Chrome for best results**
5. **Check console for errors**
6. **Test with English first**

### Contact Support

If still having issues, provide:
1. Browser name and version
2. Language you're trying to use
3. Console error messages
4. What you said vs what was detected

## Quick Test Commands

### English
- "Find new jobs" ✅
- "Show my earnings" ✅
- "Food marketplace" ✅

### Hindi
- "मुझे काम चाहिए" ✅
- "मेरी कमाई दिखाओ" ✅
- "खाना बाजार" ✅

### Tamil
- "எனக்கு வேலை வேண்டும்" ✅
- "என் வருமானம்" ✅
- "உணவு சந்தை" ✅

Try these exact phrases first!
