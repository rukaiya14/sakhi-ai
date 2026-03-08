# 🚀 AI Sakhi - Quick Start Guide

## Current Status: ✅ WORKING

AI Sakhi is integrated and working with intelligent fallback responses. Can be upgraded to Amazon Bedrock (Titan) for full AI power.

---

## 🎯 Test It Now (30 seconds)

### Step 1: Open Dashboard
```
http://localhost:8080/dashboard.html
```

### Step 2: Click "AI Sakhi Assistant"
Look for the button in the left sidebar

### Step 3: Start Chatting
Try these messages:
- "I need help with payment"
- "I'm facing health issues"
- "How do I improve my skills?"
- "Update my order progress"

**That's it!** AI Sakhi will respond intelligently.

---

## 🔄 Switch to Bedrock Mode (5 minutes)

### Prerequisites
- AWS Account
- AWS CLI installed
- Node.js installed

### Quick Setup

#### 1. Install AWS SDK
```bash
cd SHE-BALANCE-main/SHE-Balnce-main/backend
npm install @aws-sdk/client-bedrock-runtime
```

#### 2. Configure AWS (Windows)
```cmd
set AWS_ACCESS_KEY_ID=your_access_key
set AWS_SECRET_ACCESS_KEY=your_secret_key
set AWS_REGION=us-east-1
```

#### 3. Enable Bedrock Access
1. Go to [AWS Bedrock Console](https://console.aws.amazon.com/bedrock/)
2. Click "Model access"
3. Enable "Amazon Titan Text Express"
4. Submit (instant approval)

#### 4. Start Enhanced Server
```bash
cd SHE-BALANCE-main/SHE-Balnce-main/backend
start-with-bedrock.bat
```

#### 5. Test
Open dashboard and chat. You'll see "amazon-titan-text-express" in console!

---

## 📁 Server Options

### Option 1: Simple Server (Current)
```bash
node server-simple.js
```
- ✅ Working now
- ✅ Intelligent fallback responses
- ✅ No AWS required
- ⚠️ No AI learning

### Option 2: Bedrock Server (Upgrade)
```bash
node server-with-bedrock.js
```
- ✅ Amazon Titan AI
- ✅ Context-aware responses
- ✅ Learns from conversation
- ⚠️ Requires AWS setup

### Option 3: Full Server
```bash
node server.js
```
- ✅ All features
- ✅ Database integration
- ✅ Bedrock support
- ⚠️ Requires database setup

---

## 💬 Example Conversations

### Fallback Mode (Current)
**User**: "I need advance payment"

**AI Sakhi**: "Namaste! I can help you with payment requests. Would you like to:
1. Request an advance payment for materials or emergency
2. Request payment for completed work

Please let me know the details, and I'll connect you with our finance team right away."

### Bedrock Mode (After Setup)
**User**: "I need advance payment"

**AI Sakhi**: "Namaste! I understand you need an advance payment. I'm here to help you with this request. To process this quickly, could you please tell me:

1. What materials do you need to purchase?
2. Approximately how much do you need?
3. Is this for an ongoing order or a new project?

Once I have these details, I'll immediately connect you with our finance team to expedite your request. Your work is important to us!"

---

## 🎨 Features

### Current (Fallback Mode)
- ✅ Instant responses
- ✅ Payment assistance
- ✅ Order support
- ✅ Health issue handling
- ✅ Skills development guidance
- ✅ Quick action buttons
- ✅ Conversation history

### With Bedrock
- ✅ All fallback features
- ✅ Context-aware AI
- ✅ Natural conversations
- ✅ Learns from history
- ✅ More detailed responses
- ✅ Better understanding

---

## 💰 Cost

### Fallback Mode
- **Cost**: $0 (Free)
- **Speed**: Instant
- **Quality**: Good

### Bedrock Mode
- **Cost**: ~$1-2/month for 100 conversations/day
- **Speed**: 2-5 seconds
- **Quality**: Excellent

---

## 🔍 Check Status

### Is Bedrock Active?
Look in server console:
- ✅ "Amazon Bedrock (Titan) module loaded" = Active
- ⚠️ "Fallback Mode" = Using fallback

### Check Response
Look in browser console (F12):
- `"model": "amazon-titan-text-express"` = Bedrock
- `"fallback": true` = Fallback mode

---

## 🛠️ Troubleshooting

### Chat not opening?
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Check both servers are running

### Bedrock not working?
1. Check AWS credentials
2. Verify Bedrock access in AWS Console
3. Check console for error messages

### Slow responses?
- Normal for AI (2-5 seconds)
- Typing indicator shows progress

---

## 📊 Quick Commands

### Start Backend
```bash
cd SHE-BALANCE-main/SHE-Balnce-main/backend
node server-simple.js
```

### Start Frontend
```bash
cd SHE-BALANCE-main/SHE-Balnce-main
node frontend-server.js
```

### Start Both
```bash
cd SHE-BALANCE-main/SHE-Balnce-main
start-server.bat
```

### Start with Bedrock
```bash
cd SHE-BALANCE-main/SHE-Balnce-main/backend
start-with-bedrock.bat
```

---

## 📚 Files

### Backend
- `server-simple.js` - Current working server
- `server-with-bedrock.js` - Enhanced with Bedrock
- `ai-sakhi-bedrock.js` - Bedrock integration module

### Frontend
- `dashboard.html` - Chat interface
- `dashboard.js` - Chat logic
- `dashboard.css` - Chat styles

### AWS
- `aws-backend/lambda_ai_sakhi_bedrock.py` - Lambda function

### Documentation
- `AI_SAKHI_DEPLOYED.md` - Full documentation
- `AI_SAKHI_BEDROCK_SETUP.md` - Setup guide
- `AI_SAKHI_QUICK_START.md` - This file

---

## ✅ Success Checklist

- [ ] Backend server running (port 5000)
- [ ] Frontend server running (port 8080)
- [ ] Dashboard opens successfully
- [ ] AI Sakhi panel opens
- [ ] Can send messages
- [ ] Receives responses
- [ ] Typing indicator works
- [ ] Quick actions work

---

## 🎉 You're Ready!

AI Sakhi is working and ready to use. Start chatting now or upgrade to Bedrock for full AI power!

**Quick Test**: `http://localhost:8080/dashboard.html` → Click "AI Sakhi Assistant" → Start chatting!

---

**Last Updated**: March 4, 2026
**Status**: ✅ WORKING
**Mode**: Fallback (upgradeable to Bedrock)
