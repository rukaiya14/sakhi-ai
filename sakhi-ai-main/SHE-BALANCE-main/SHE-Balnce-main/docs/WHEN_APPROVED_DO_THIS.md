# When Claude Access is Approved - Do This!

## You'll Know It's Approved When:

1. You get an email from AWS saying "Model access granted"
2. OR check AWS Console: https://console.aws.amazon.com/bedrock/
   - Go to "Model access"
   - Claude 3 Haiku shows "Access granted" in green

## Then Follow These Steps:

### Step 1: Test Claude Access (2 minutes)

Open terminal and run:
```bash
cd SHE-BALANCE-main\SHE-Balnce-main\backend
node test-bedrock-now.js
```

**You should see:**
```
✅ SUCCESS! Bedrock is working!
📝 Response: Hello! How can I help you today?
```

If you see this, Claude is ready! Move to Step 2.

### Step 2: Start Both Servers (1 minute)

Run this:
```bash
.\start-both-servers.bat
```

This opens TWO terminal windows:
- Backend Server (port 5000)
- Frontend Server (port 8080)

Keep both windows open!

### Step 3: Test AI Sakhi (1 minute)

Open your browser to:
```
http://localhost:8080/ai-sakhi-simple.html
```

Send a message:
```
"Hello AI Sakhi!"
```

**You should see:**
- Real AI response (not a template)
- Model: claude-3-haiku
- NO "Using fallback mode" message

### Step 4: Test with Your Data

Try these messages to see AI Sakhi use your DynamoDB data:

```
"What are my current orders?"
"Show me my order progress"
"I need help with my bulk order"
"What payments am I waiting for?"
```

AI S