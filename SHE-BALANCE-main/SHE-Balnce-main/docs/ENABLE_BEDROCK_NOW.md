# 🚀 Enable AWS Bedrock (Claude 3 Haiku) for AI Sakhi

## Current Status:
- ✅ AI Sakhi is working (using fallback responses)
- ⚠️ AWS Bedrock (Claude 3) is NOT enabled
- 🎯 Goal: Enable Claude 3 Haiku for better AI responses

---

## 🧪 Step 1: Test Current Bedrock Status

Run this command:
```bash
test-bedrock.bat
```

This will tell you exactly what's wrong.

---

## 🔧 Step 2: Fix Based on Error

### Error 1: "AccessDeniedException"
**Meaning:** Claude 3 Haiku is not enabled in your AWS account

**Fix:**
1. Go to: https://console.aws.amazon.com/bedrock/
2. Click **"Model access"** in left sidebar
3. Click **"Manage model access"** button (orange button)
4. Find **"Anthropic"** section
5. Check the box for **"Claude 3 Haiku"**
6. Click **"Save changes"** at bottom
7. Wait 1-2 minutes for activation
8. Run `test-bedrock.bat` again

---

### Error 2: "UnrecognizedClientException"
**Meaning:** AWS credentials not configured

**Fix:**
```bash
aws configure
```

Enter:
- AWS Access Key ID: [Your key]
- AWS Secret Access Key: [Your secret]
- Default region: us-east-1
- Default output format: json

Then run `test-bedrock.bat` again

---

### Error 3: "ValidationException"
**Meaning:** Model not available in your region

**Fix:**
Change region to us-east-1 or us-west-2:
```bash
# Set environment variable
set AWS_REGION=us-east-1

# Or configure AWS CLI
aws configure set region us-east-1
```

Then run `test-bedrock.bat` again

---

### Error 4: "ResourceNotFoundException"
**Meaning:** Claude 3 Haiku model ID is wrong

**This shouldn't happen, but if it does:**
The model ID is: `anthropic.claude-3-haiku-20240307-v1:0`

---

## ✅ Step 3: Verify It Works

After fixing the error, run:
```bash
test-bedrock.bat
```

You should see:
```
✅ SUCCESS! Bedrock is working!
📝 Response: Hello! [Claude's response]
✨ AI Sakhi can now use Claude 3 Haiku!
```

---

## 🎯 Step 4: Restart Backend Server

After Bedrock is working:

1. **Stop** the backend server (Ctrl+C in backend terminal)
2. **Restart** it:
   ```bash
   cd SHE-BALANCE-main\SHE-Balnce-main\backend
   node server.js
   ```
3. You should now see:
   ```
   ✅ Amazon Bedrock (Claude 3 Haiku) module loaded
   🤖 AI Sakhi: Amazon Bedrock (Claude 3 Haiku)
   ```

---

## 💬 Step 5: Test AI Sakhi

1. Go to dashboard: http://localhost:8080/dashboard.html
2. Click **"AI Sakhi Assistant"**
3. Send a message: "Hello AI Sakhi!"
4. Check browser console (F12)
5. You should see:
   ```
   ✅ Response from: claude-3-haiku
   ✅ Using Claude 3 Haiku via Bedrock!
   ```

---

## 🆚 Difference: Fallback vs Bedrock

### Fallback Mode (Current):
- ✅ Works immediately
- ✅ No AWS setup needed
- ⚠️ Simple rule-based responses
- ⚠️ No context understanding
- ⚠️ Limited conversation ability

### Bedrock Mode (Claude 3 Haiku):
- ✅ Intelligent AI responses
- ✅ Understands context
- ✅ Natural conversation
- ✅ Empathetic and helpful
- ✅ Handles complex queries
- ⚠️ Requires AWS setup
- ⚠️ Costs ~$0.00025 per message

---

## 💰 Cost Estimate

Claude 3 Haiku pricing:
- Input: $0.25 per 1M tokens
- Output: $1.25 per 1M tokens

Average message:
- ~200 tokens input + ~150 tokens output
- Cost: ~$0.00025 per message
- 1000 messages = ~$0.25
- 10,000 messages = ~$2.50

**Very affordable for testing!**

---

## 🔍 Troubleshooting

### Issue: "Module not found"
**Fix:** Install AWS SDK:
```bash
cd SHE-BALANCE-main\SHE-Balnce-main\backend
npm install @aws-sdk/client-bedrock-runtime
```

### Issue: "Region not supported"
**Fix:** Use us-east-1 or us-west-2:
```bash
set AWS_REGION=us-east-1
```

### Issue: "Credentials not found"
**Fix:** Configure AWS CLI:
```bash
aws configure
```

### Issue: Still using fallback after fixing
**Fix:** Restart backend server:
```bash
# Stop server (Ctrl+C)
# Start again
node server.js
```

---

## 📊 How to Check Which Mode is Active

### In Backend Terminal:
```
✅ Amazon Bedrock (Claude 3 Haiku) module loaded  ← Bedrock enabled
🤖 AI Sakhi: Amazon Bedrock (Claude 3 Haiku)      ← Bedrock active
```

OR

```
⚠️  Bedrock module not available, using fallback  ← Fallback mode
🤖 AI Sakhi: Fallback Mode                        ← Fallback active
```

### In Browser Console (F12):
After sending a message, look for:
```javascript
{
  "success": true,
  "response": "...",
  "model": "claude-3-haiku",  ← Bedrock working!
  "timestamp": "..."
}
```

OR

```javascript
{
  "success": true,
  "response": "...",
  "model": "fallback",  ← Using fallback
  "fallback": true,
  "timestamp": "..."
}
```

---

## 🎯 Quick Commands

### Test Bedrock:
```bash
test-bedrock.bat
```

### Check AWS Credentials:
```bash
aws sts get-caller-identity
```

### Check AWS Region:
```bash
aws configure get region
```

### List Available Models:
```bash
aws bedrock list-foundation-models --region us-east-1
```

---

## ✨ Benefits of Enabling Bedrock

1. **Better Responses:** Claude 3 understands context and nuance
2. **Natural Conversation:** Feels like talking to a real person
3. **Empathetic:** Understands emotions and challenges
4. **Contextual:** Remembers conversation history
5. **Multilingual:** Can respond in multiple languages
6. **Problem Solving:** Can help with complex issues

---

## 🚀 Next Steps

1. **Run:** `test-bedrock.bat`
2. **Fix:** Any errors shown
3. **Restart:** Backend server
4. **Test:** AI Sakhi on dashboard
5. **Enjoy:** Better AI responses!

---

## 💡 Important Notes

- **Fallback mode works fine** for basic testing
- **Bedrock is optional** but recommended for production
- **AWS Free Tier** includes some Bedrock usage
- **Claude 3 Haiku** is the fastest and cheapest Claude model
- **Setup takes 5-10 minutes** once you have AWS account

---

## 📞 Still Need Help?

If Bedrock still doesn't work:

1. Run `test-bedrock.bat` and screenshot the error
2. Check AWS Bedrock console: https://console.aws.amazon.com/bedrock/
3. Verify Claude 3 Haiku is enabled in "Model access"
4. Try a different region (us-west-2)
5. Check AWS credentials are valid

---

**Created:** March 5, 2026
**Status:** Guide to enable AWS Bedrock
**Goal:** Use Claude 3 Haiku instead of fallback responses
