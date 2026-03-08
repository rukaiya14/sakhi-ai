# 🤖 AI Sakhi with Amazon Bedrock (Titan Text) - Setup Guide

## Overview
AI Sakhi now uses Amazon Bedrock with Amazon Titan Text Express for intelligent, context-aware conversations with artisans.

## ✅ What Was Implemented

### 1. Backend Integration
- **Lambda Function**: `lambda_ai_sakhi_bedrock.py` - AWS Lambda for Bedrock with Titan
- **Node.js Backend**: `ai-sakhi-bedrock.js` - Local backend with Bedrock SDK and Titan
- **API Route**: `/api/ai-sakhi/chat` - Chat endpoint in server.js

### 2. Frontend Chat Interface
- Beautiful chat UI in the AI Sakhi panel
- Real-time messaging with typing indicators
- Quick suggestion buttons
- Conversation history management
- Smooth animations and transitions

### 3. Features
- ✅ Conversational AI powered by Amazon Titan Text Express
- ✅ Context-aware responses
- ✅ Multi-turn conversations
- ✅ Fallback responses if Bedrock unavailable
- ✅ Quick action suggestions
- ✅ Culturally sensitive to Indian context
- ✅ Simple language for artisans

## 🚀 Setup Instructions

### Option 1: Local Testing (Fallback Mode)

The system works immediately with fallback responses. No AWS setup needed for basic testing!

1. **Servers are already running**:
   - Backend: Port 5000 ✅
   - Frontend: Port 8080 ✅

2. **Open Dashboard**:
   ```
   http://localhost:8080/dashboard.html
   ```

3. **Click "AI Sakhi Assistant"** in sidebar

4. **Click "Chat with AI Sakhi (Claude)"** button

5. **Start chatting!** The system will use fallback responses

### Option 2: Full Bedrock Integration

To use actual Claude AI via Amazon Bedrock:

#### Step 1: AWS Account Setup
1. Sign in to AWS Console
2. Go to Amazon Bedrock service
3. Request access to Amazon Titan Text Express model
4. Wait for approval (usually instant - Titan is generally available)

#### Step 2: Install AWS SDK
```bash
cd SHE-BALANCE-main/SHE-Balnce-main/backend
npm install @aws-sdk/client-bedrock-runtime
```

#### Step 3: Configure AWS Credentials

**Windows:**
```cmd
set AWS_ACCESS_KEY_ID=your_access_key
set AWS_SECRET_ACCESS_KEY=your_secret_key
set AWS_REGION=us-east-1
```

**Or create `.env` file in backend folder:**
```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

#### Step 4: Restart Backend
```bash
cd SHE-BALANCE-main/SHE-Balnce-main/backend
node server.js
```

#### Step 5: Test
Open dashboard and chat with AI Sakhi. You'll now get Titan-powered responses!

## 📊 How It Works

### Chat Flow
```
User types message
    ↓
Frontend sends to /api/ai-sakhi/chat
    ↓
Backend calls Amazon Bedrock
    ↓
Amazon Titan Text Express generates response
    ↓
Response sent back to frontend
    ↓
Message displayed in chat
```

### System Prompt
Titan is configured with a special prompt:
- Acts as "AI Sakhi" - compassionate assistant
- Understands Indian cultural context
- Uses simple language
- Provides practical solutions
- Offers emotional support

### Conversation History
- Last 5 messages kept for context
- Stored in frontend (conversationHistory array)
- Sent with each request for context-aware responses

## 🎯 Features in Action

### Quick Actions
1. **Update bulk order progress**
2. **Request payment**
3. **Report health issues**
4. **General support**

### Chat Capabilities
- Answer questions about orders
- Provide guidance on payments
- Offer emotional support
- Connect to support resources
- Give practical advice

### Example Conversations

**User**: "I'm having trouble completing my bulk order on time"
**AI Sakhi**: "I understand this must be stressful. Can you tell me what specific challenges you're facing? Is it related to materials, time, health, or something else? I'm here to help find a solution."

**User**: "I need advance payment for materials"
**AI Sakhi**: "I can help you with that! To request an advance payment, I'll need a few details:
1. How much do you need?
2. What materials do you need to purchase?
3. When do you need the funds?

Let me know these details and I'll connect you with our finance team right away."

## 💰 Cost Estimation

### Amazon Bedrock Pricing (Titan Text Express)
- **Input**: $0.0008 per 1K tokens
- **Output**: $0.0016 per 1K tokens

### Example Costs
- 100 conversations/day = ~$1-2/month
- 500 conversations/day = ~$5-10/month
- 1000 conversations/day = ~$10-20/month

Very affordable! Titan is significantly cheaper than Claude while still providing quality responses.

## 🔧 Troubleshooting

### Issue 1: "Failed to get response from AI"
**Solution**: Check AWS credentials are configured correctly

### Issue 2: Fallback responses only
**Solution**: This is normal if Bedrock isn't configured. System works with fallback mode.

### Issue 3: "Access Denied" error
**Solution**: 
1. Check Bedrock model access in AWS Console
2. Verify IAM permissions include `bedrock:InvokeModel`

### Issue 4: Slow responses
**Solution**: Normal - Claude takes 2-5 seconds to respond. Typing indicator shows progress.

## 📝 Testing Without AWS

The system includes intelligent fallback responses:
- Order-related queries → Order assistance
- Payment queries → Payment guidance
- Health issues → Support connection
- General help → Feature overview

Test these by chatting without AWS credentials!

## 🎨 Customization

### Change AI Personality
Edit system prompt in `ai-sakhi-bedrock.js`:
```javascript
const systemPrompt = `You are AI Sakhi...`;
```

### Add More Quick Suggestions
Edit in `dashboard.html`:
```html
<button onclick="sendQuickMessage('Your message')">
    Your Button Text
</button>
```

### Adjust Response Length
Change `maxTokenCount` in Bedrock call:
```javascript
maxTokenCount: 512  // Increase for longer responses (max 8192 for Titan)
```

## 🚀 Deployment to AWS Lambda

### Step 1: Create Lambda Function
```bash
cd aws-backend
zip -r ai-sakhi-bedrock.zip lambda_ai_sakhi_bedrock.py

aws lambda create-function \
    --function-name AISakhiBedrock \
    --runtime python3.9 \
    --role arn:aws:iam::ACCOUNT_ID:role/LambdaBedrockRole \
    --handler lambda_ai_sakhi_bedrock.lambda_handler \
    --zip-file fileb://ai-sakhi-bedrock.zip \
    --timeout 30 \
    --memory-size 512
```

### Step 2: Create API Gateway
1. Go to API Gateway in AWS Console
2. Create REST API
3. Create POST method for `/chat`
4. Integrate with Lambda function
5. Deploy API

### Step 3: Update Frontend
Change API endpoint in dashboard.html:
```javascript
const response = await fetch('https://your-api-gateway-url/chat', {
```

## ✅ Success Indicators

When working correctly:
- ✅ Chat interface opens smoothly
- ✅ Messages send and receive
- ✅ Typing indicator appears
- ✅ Responses are contextual and helpful
- ✅ No console errors

## 📚 Resources

- [Amazon Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Claude 3 Model Card](https://www.anthropic.com/claude)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)

## 🎉 Ready to Use!

The AI Sakhi with Bedrock is now integrated and ready to use!

**Quick Start**:
1. Open dashboard: `http://localhost:8080/dashboard.html`
2. Click "AI Sakhi Assistant"
3. Click "Chat with AI Sakhi (Claude)"
4. Start chatting!

The system works immediately with fallback responses. Configure AWS Bedrock for full Claude AI power!

---

**Status**: ✅ Implemented and Ready
**Last Updated**: March 4, 2026
**Feature**: AI Sakhi with Amazon Bedrock (Claude 3 Sonnet)
