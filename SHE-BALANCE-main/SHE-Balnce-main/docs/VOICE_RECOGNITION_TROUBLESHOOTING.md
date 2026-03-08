# 🎤 Voice Recognition Troubleshooting Guide

## "Failed to Recognize" Error - Solutions

### Quick Fixes:

1. **Check Microphone Permission**
   - Click the 🔒 lock icon in browser address bar
   - Allow microphone access
   - Refresh the page

2. **Use Supported Browser**
   - ✅ Chrome (Best support)
   - ✅ Edge (Best support)
   - ✅ Safari (iOS 14.5+)
   - ❌ Firefox (Limited support)

3. **Check Microphone**
   - Test microphone in system settings
   - Make sure it's not muted
   - Try unplugging and replugging
   - Check if other apps can use it

4. **Reduce Background Noise**
   - Find a quiet environment
   - Close other audio apps
   - Move away from fans/AC

5. **Speak Clearly**
   - Speak at normal pace (not too fast/slow)
   - Speak directly into microphone
   - Use clear pronunciation
   - Avoid mumbling

### Common Errors and Solutions:

#### "no-speech" Error
**Problem**: Microphone didn't detect any speech
**Solutions**:
- Speak louder
- Move closer to microphone
- Check microphone is working
- Reduce background noise

#### "audio-capture" Error
**Problem**: No microphone found
**Solutions**:
- Plug in microphone
- Check USB connection
- Select correct microphone in system settings
- Restart browser

#### "not-allowed" Error
**Problem**: Microphone permission denied
**Solutions**:
- Click lock icon in address bar
- Go to Site Settings → Microphone → Allow
- Clear browser cache and try again
- Check system microphone permissions

#### "network" Error
**Problem**: Internet connection issue
**Solutions**:
- Check internet connection
- Try refreshing page
- Check firewall settings
- Try different network

### Testing Your Setup:

1. **Test Microphone**:
   ```
   Windows: Settings → System → Sound → Test microphone
   Mac: System Preferences → Sound → Input
   ```

2. **Test in Browser**:
   - Go to: https://www.onlinemictest.com/
   - Check if microphone works
   - Adjust sensitivity if needed

3. **Test Voice Commands**:
   - Start with simple commands: "Help"
   - Try category commands: "Show embroidery"
   - Test navigation: "Open orders"

### Best Practices:

✅ **DO:**
- Use headset microphone for best results
- Speak in quiet environment
- Use Chrome or Edge browser
- Allow microphone permission
- Speak clearly and naturally
- Wait for "Listening..." before speaking

❌ **DON'T:**
- Don't speak too fast or too slow
- Don't use in noisy environment
- Don't use Firefox (limited support)
- Don't deny microphone permission
- Don't speak while music is playing

### Voice Command Examples:

**Category Browsing:**
- "Show me embroidery"
- "Find pottery artisans"
- "Browse jewelry designers"
- "Looking for food catering"
- "I want to see weaving"

**Navigation:**
- "Open my orders"
- "Show my progress"
- "Go to skills"
- "Take me to dashboard"

**Language:**
- "Change language to Hindi"
- "Switch to English"
- "Language Bengali"

**Help:**
- "Help"
- "What can you do?"

### Still Not Working?

1. **Try Manual Test**:
   ```javascript
   // Open browser console (F12)
   // Paste this code:
   const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
   recognition.lang = 'en-US';
   recognition.onresult = (e) => console.log('Heard:', e.results[0][0].transcript);
   recognition.onerror = (e) => console.error('Error:', e.error);
   recognition.start();
   // Then speak
   ```

2. **Check Browser Console**:
   - Press F12
   - Go to Console tab
   - Look for error messages
   - Share errors for help

3. **Alternative: Use Keyboard**:
   - Type commands instead
   - Use navigation buttons
   - Browse categories manually

### System Requirements:

- **Browser**: Chrome 25+, Edge 79+, Safari 14.5+
- **OS**: Windows 10+, macOS 10.15+, iOS 14.5+
- **Internet**: Required for speech recognition
- **Microphone**: Any working microphone
- **Permissions**: Microphone access allowed

### For AWS Polly/Transcribe (Advanced):

If you want to use AWS services instead of browser:

1. Deploy Lambda function
2. Set up API Gateway
3. Configure credentials
4. Update endpoint in code
5. Set `useAWS = true`

See `VOICE_ASSISTANT_SETUP.md` for AWS setup.

---

**Need More Help?**
- Check browser console for errors
- Test microphone in system settings
- Try different browser
- Restart computer
- Contact support with error details
