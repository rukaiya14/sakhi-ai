# AI Sakhi with Amazon Titan - Testing Guide

## Current Status

Your backend server is running with Amazon Titan Text Express loaded. Now we need to test if it's actually working.

## Step 1: Test Amazon Titan Connection

Run this command to test if Amazon Titan is accessible:

```bash
test-titan-now.bat
```

This will tell you if:
- ✅ Amazon Titan is working (you'll see a response)
- ❌ There's an access issue (you'll see the exact error)

## Step 2: Test AI Sakhi in Browser

1. Open your browser to: `http://localhost:8080/ai-sakhi-simple.html`
2. Send a message like "Hello AI Sakhi!"
3. Check your backend terminal for logs

## What to Look For

### In Backend Terminal:
```
💬 AI Sakhi message from user@email.com: Hello AI Sakhi!
🚀 Calling Amazon Titan Text Express...
📝 Message: Hello AI Sakhi!
📤 Sending request to Amazon Titan...
✅ Amazon Titan response received!
📝 Response: Namaste! I'm AI Sakhi...
✅ Response from amazon-titan-express
```

### If You See Errors:

**Error: AccessDeniedException**
- Amazon Titan is not enabled in your AWS account
- Go to AWS Bedrock console and enable "Amazon Titan Text Express G1"

**Error: UnrecognizedClientException**
- AWS credentials not configured
- Run: `aws configure` and enter your credentials

**Error: ValidationException**
- Model might not be available in your region
- Try changing region to `us-east-1` or `us-west-2`

## Step 3: Check Frontend Response

In the browser, you should see:
- ✅ Response received!
- Model: amazon-titan-express
- NO "Using fallback mode" message

## Troubleshooting

### If it says "Using fallback mode":

1. Check backend terminal for the actual error
2. The error will show you exactly what's wrong
3. Follow the fix instructions in the error message

### If backend shows no errors but frontend shows fallback:

This means the response format is wrong. Let me know and I'll fix the response parsing.

## Current Server Configuration

- Port: 5000
- AI Provider: Amazon Titan Text Express
- Region: us-east-1 (default)
- Model ID: amazon.titan-text-express-v1

## Next Steps

Once Titan is working, you'll see:
- Real AI responses (not template responses)
- Model name: "amazon-titan-express"
- Context-aware answers based on your orders and data
