# 📱 WhatsApp Sandbox - Step by Step Help

## 🔴 Current Issue

You're getting this error:
```
⚠️ Your number is not connected to a Sandbox. 
You need to connect it first by sending join <sandbox name>
```

This means you need to find your correct sandbox code.

## ✅ Solution: Find Your Sandbox Code

### Step 1: Open Twilio Console

Click this link: **https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn**

### Step 2: Look for This Section

You'll see a page that looks like this:

```
╔═══════════════════════════════════════════════╗
║  Send a WhatsApp Message                      ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  📱 Your Sandbox                              ║
║                                               ║
║  To connect your phone to this sandbox:      ║
║                                               ║
║  1. Save this number in your contacts:       ║
║     +1 415 523 8886                          ║
║                                               ║
║  2. Send this message to that number:        ║
║                                               ║
║     join happy-tiger                         ║
║     ^^^^^^^^^^^^                             ║
║     THIS IS YOUR CODE!                       ║
║                                               ║
╚═══════════════════════════════════════════════╝
```

### Step 3: Copy Your Code

Your code will be **TWO WORDS** like:
- `happy-tiger`
- `mile-rhyme`
- `clever-moon`
- `brave-lion`

**NOT** a long string like `FF9GBQ5SGQ8JQ9DHQ4B9RLCS`

### Step 4: Send Via WhatsApp

1. Open WhatsApp
2. Start chat with: **+1 415 523 8886**
3. Send: `join <your-code>`

Example:
```
join happy-tiger
```

### Step 5: Success!

You'll receive:
```
✅ Awesome, you are all set!

Your Sandbox: join happy-tiger
Reply stop to leave this Sandbox
```

## 🎯 Quick Checklist

- [ ] Opened Twilio Console
- [ ] Found WhatsApp sandbox page
- [ ] Located sandbox code (two words)
- [ ] Opened WhatsApp
- [ ] Sent to +1 415 523 8886
- [ ] Message: `join <code>`
- [ ] Received confirmation

## 🔍 Where to Find It

### Option 1: Direct Link
https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn

### Option 2: Via Menu
1. https://console.twilio.com/
2. Click **Messaging** (left sidebar)
3. Click **Try it out**
4. Click **Send a WhatsApp message**

### Option 3: Search
In Twilio Console, search for: "WhatsApp Sandbox"

## 📸 What It Looks Like

The page will have:
- Title: "Send a WhatsApp Message"
- Section: "Your Sandbox"
- Instructions: "To connect your phone..."
- **Your code**: `join <two-words>`

## ⚠️ Common Mistakes

### ❌ Wrong:
- Sending: `FF9GBQ5SGQ8JQ9DHQ4B9RLCS`
- Sending: `ACxxxxxxxxxxxxxxxx` (Account SID)
- Sending: `US9f063c07d271b7ac2ceee1e91be52c68`
- Sending: Your name

### ✅ Correct:
- Sending: `join happy-tiger`
- Sending: `join mile-rhyme`
- Sending: `join clever-moon`

## 💡 Tips

1. **The code is always TWO WORDS**
2. **Always starts with "join "**
3. **Found in Twilio Console, not email**
4. **Changes if you create new sandbox**
5. **Case doesn't matter** (join HAPPY-TIGER works too)

## 🆘 Still Can't Find It?

### Try This:

1. Go to: https://console.twilio.com/
2. Look for **"Messaging"** in left menu
3. Click **"Try it out"**
4. Click **"Send a WhatsApp message"**
5. The page that opens will show your code

### Or:

1. Log in to Twilio
2. In the search bar at top, type: "WhatsApp"
3. Click "WhatsApp Sandbox"
4. Your code will be displayed

## 📞 Your Phone Number

I can see your number: **+917666544797**

Once you find your correct sandbox code and send it, this number will be connected!

## 🎯 Next Steps

1. **Find your sandbox code** (two words)
2. **Send via WhatsApp**: `join <your-code>`
3. **Wait for confirmation**
4. **Then run**: `node test-whatsapp.js +917666544797`

---

**The key**: Your sandbox code is TWO WORDS (like `happy-tiger`), not a long string!

Find it in Twilio Console at:
https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
