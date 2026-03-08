# 🤖 AI Sakhi - Complete Working Guide

## Current Status: ✅ IMPLEMENTED (Backend + Frontend)

The AI Sakhi feature IS implemented. If it's not working, follow this guide to fix it.

---

## 🎯 What You Should See:

When working correctly:
1. Click "AI Sakhi Assistant" in sidebar
2. Panel slides in from right with chat interface
3. Type message and press Enter
4. Get AI response within 2-3 seconds
5. Conversation continues with context

---

## 🚀 Quick Start (3 Steps):

### Step 1: Start Servers
```bash
# Terminal 1 - Backend
cd SHE-BALANCE-main\SHE-Balnce-main\backend
node server.js

# Terminal 2 - Frontend  
cd SHE-BALANCE-main\SHE-Balnce-main
node frontend-server.js
```

### Step 2: Run Diagnostic
```bash
diagnose-ai-sakhi.bat
```

### Step 3: Test
Open: http://localhost:8080/test-ai-sakhi-simple.html

---

## 📁 Files That Make AI Sakhi Work:

### Backend Files:
```
backend/
├── server.js                    ← Main server with /api/ai-sakhi/chat endpoint
├── ai-sakhi-bedrock.js         ← Claude 3 Haiku integration
├── dynamodb-client.js          ← User context fetching
└── package.json                ← Dependencies
```

### Frontend Files:
```
├── dashboard.html              ← Contains AI Sakhi panel HTML
├── ai-sakhi-chat.js           ← Chat functionality
├── ai-features.css            ← Styling
└── ai-features-ui.js          ← UI interactions
```

---

## 🔍 How It Works:

### 1. User clicks "AI Sakhi Assistant"
```javascript
// In dashboard.html
onclick="openAISakhi()"
```

### 2. Panel opens
```javascript
// In ai-features-ui.js or inline script
document.getElementById('aiSakhiPanel').classList.add('active');
```

### 3. User types message and presses Enter
```javascript
// In ai-sakhi-chat.js
async function sendChatMessage() {
    const message = input.value.trim();
    // ... send to backend
}
```

### 4. Frontend sends to backend
```javascript
fetch('http://localhost:5000/api/ai-sakhi/chat', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({
        message: message,
        conversationHistory: []
    })
})
```

### 5. Backend processes
```javascript
// In server.js
app.post('/api/ai-sakhi/chat', authenticateToken, async (req, res) => {
    // 1. Get user context from DynamoDB
    // 2. Try Bedrock (Claude 3 Haiku)
    // 3. Fallback to simple responses if Bedrock fails
    // 4. Return response
})
```

### 6. Frontend displays response
```javascript
// In ai-sakhi-chat.js
addMessageToChat('assistant', data.response);
```

---

## 🐛 Troubleshooting by Symptom:

### Symptom 1: "AI Sakhi Assistant" button does nothing
**Cause:** JavaScript not loaded or error in console

**Fix:**
1. Open browser console (F12)
2. Look for errors
3. Hard refresh (Ctrl+Shift+R)
4. Check if `openAISakhi` function exists:
   ```javascript
   typeof openAISakhi
   ```
   Should return "function", not "undefined"

---

### Symptom 2: Panel opens but is empty
**Cause:** HTML not loaded or CSS issue

**Fix:**
1. Check if panel HTML exists:
   ```javascript
   document.getElementById('aiSakhiPanel')
   ```
2. Should show the element, not `null`
3. If `null`, dashboard.html is missing the panel HTML

---

### Symptom 3: Can't type in input field
**Cause:** Input element doesn't exist

**Fix:**
1. Check if input exists:
   ```javascript
   document.getElementById('chatInput')
   ```
2. If `null`, the HTML structure is wrong
3. Look for `<input id="chatInput">` in dashboard.html

---

### Symptom 4: Message sends but no response
**Cause:** Backend not running or API error

**Fix:**
1. Check backend terminal for errors
2. Check browser console for fetch errors
3. Test backend directly:
   ```bash
   curl http://localhost:5000/health
   ```
4. If no response, backend is not running

---

### Symptom 5: "Not authenticated" error
**Cause:** Token missing or expired

**Fix:**
1. Check if token exists:
   ```javascript
   localStorage.getItem('shebalance_token')
   ```
2. If `null`, login again
3. Go to: http://localhost:8080/login.html

---

### Symptom 6: "Failed to fetch" error
**Cause:** Backend server not running

**Fix:**
```bash
cd SHE-BALANCE-main\SHE-Balnce-main\backend
node server.js
```

---

## ✅ Verification Checklist:

Run these checks in browser console (F12):

```javascript
// 1. Check if AI Sakhi functions exist
console.log('openAISakhi:', typeof openAISakhi);
console.log('sendChatMessage:', typeof sendChatMessage);

// 2. Check if HTML elements exist
console.log('Panel:', !!document.getElementById('aiSakhiPanel'));
console.log('Overlay:', !!document.getElementById('aiSakhiOverlay'));
console.log('Input:', !!document.getElementById('chatInput'));
console.log('Messages:', !!document.getElementById('chatMessages'));

// 3. Check if token exists
console.log('Token:', !!localStorage.getItem('shebalance_token'));

// 4. Check if scripts loaded
console.log('Scripts:', Array.from(document.scripts).map(s => s.src).filter(s => s.includes('ai-sakhi')));
```

All should return `true` or show the elements.

---

## 🧪 Test Scenarios:

### Test 1: Simple Greeting
**Message:** "Hello AI Sakhi!"
**Expected:** Greeting response with your name

### Test 2: Order Query
**Message:** "Show me my orders"
**Expected:** List of your orders with progress

### Test 3: Payment Request
**Message:** "I need advance payment"
**Expected:** Payment request guidance

### Test 4: Health Issue
**Message:** "I'm not feeling well"
**Expected:** Support and assistance offer

### Test 5: General Help
**Message:** "I need help"
**Expected:** List of available assistance

---

## 📊 Expected Backend Logs:

When working correctly, backend should show:

```
💬 AI Sakhi message from rukaiya@example.com: Hello AI Sakhi!
📊 Fetched context: 3 orders, 1 pending payments
✅ Response from claude-3-haiku
```

Or if using fallback:

```
💬 AI Sakhi message from rukaiya@example.com: Hello AI Sakhi!
📊 Fetched context: 3 orders, 1 pending payments
⚠️  Bedrock error, using fallback: ...
```

---

## 🎨 UI Elements:

The AI Sakhi panel should have:

1. **Header** with title and close button (X)
2. **Welcome message** from AI Sakhi
3. **Quick action buttons** (6 buttons for common tasks)
4. **Chat messages area** (scrollable)
5. **Input field** at bottom
6. **Send button** next to input
7. **Clear conversation** button

---

## 💻 Manual Testing Commands:

### Test Backend Directly:
```javascript
// In browser console after login:
fetch('http://localhost:5000/api/ai-sakhi/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('shebalance_token')
  },
  body: JSON.stringify({
    message: 'Hello AI Sakhi!',
    conversationHistory: []
  })
})
.then(r => r.json())
.then(d => {
  console.log('✅ Success!');
  console.log('Response:', d.response);
  console.log('Model:', d.model);
  console.log('Fallback:', d.fallback);
})
.catch(e => {
  console.error('❌ Error:', e);
});
```

### Manually Open Panel:
```javascript
document.getElementById('aiSakhiPanel').classList.add('active');
document.getElementById('aiSakhiOverlay').classList.add('active');
```

### Manually Close Panel:
```javascript
document.getElementById('aiSakhiPanel').classList.remove('active');
document.getElementById('aiSakhiOverlay').classList.remove('active');
```

---

## 🔧 Common Fixes:

### Fix 1: Reload Scripts
```javascript
// Force reload all scripts
location.reload(true);
```

### Fix 2: Clear Cache
```
Ctrl+Shift+Delete → Clear cache → Reload
```

### Fix 3: Reset Token
```javascript
localStorage.removeItem('shebalance_token');
// Then login again
```

### Fix 4: Check CORS
Backend should have:
```javascript
app.use(cors());
```

---

## 📞 Support:

If AI Sakhi still doesn't work after following this guide:

1. Run `diagnose-ai-sakhi.bat`
2. Open `test-ai-sakhi-simple.html`
3. Test each step and note which fails
4. Check backend terminal for errors
5. Check browser console for errors
6. Read `FIX_AI_SAKHI_NOW.md` for detailed fixes

---

## ✨ Success Indicators:

You'll know it's working when:

- ✅ Panel slides in smoothly
- ✅ Can type in input field
- ✅ Message appears in chat on right side
- ✅ Typing indicator shows (3 dots)
- ✅ AI response appears on left side
- ✅ Can continue conversation
- ✅ No errors in console
- ✅ Backend shows message logs

---

**Last Updated:** March 5, 2026
**Status:** ✅ FULLY IMPLEMENTED
**Files:** Backend + Frontend + Tests all ready
