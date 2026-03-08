# Enhanced Reminder System - Localhost Testing Guide

## Quick Start (2 Minutes)

### Option 1: Automated Test (Easiest)

```bash
# Just run this script!
test-reminder-localhost.bat
```

This will:
1. ✅ Check Node.js installation
2. ✅ Install dependencies if needed
3. ✅ Start backend server on port 5000
4. ✅ Open test interface in your browser

### Option 2: Manual Test

```bash
# Terminal 1: Start backend server
cd backend
node server-dynamodb.js

# Terminal 2: Open test interface
# Open test-reminder-system.html in your browser
```

## What You Can Test

### 1. Create Test Order
- Creates a bulk order with 4-day-old progress update
- Simulates an artisan who hasn't updated their work
- Order stored in DynamoDB `shebalance-orders` table

### 2. Scan Orders
- Scans all active bulk orders
- Identifies which orders need reminders (3+ days without update)
- Shows days since last update for each order

### 3. Send WhatsApp Reminder
- Generates personalized WhatsApp message
- Shows message preview
- Creates reminder record in DynamoDB
- Updates order with reminder timestamp

### 4. Voice Call Follow-up
- Simulates voice call after 24 hours
- Shows Hindi voice script (Amazon Polly format)
- Updates reminder status to "voice_call_initiated"

### 5. Check Status
- Views all reminder records
- Shows reminder type, status, timestamps
- Displays complete audit trail

## Test Interface Features

### Visual Dashboard
- Step-by-step workflow
- Color-coded status indicators
- Real-time message previews
- Error handling and feedback

### Message Previews
- **WhatsApp Message**: Full text with emojis and formatting
- **Voice Script**: Hindi script with natural pauses
- **Status Updates**: Real-time tracking

## Testing Workflow

### Complete Test Scenario

```
1. Create Test Order
   ↓
   Creates order with 4-day-old update
   
2. Scan Orders
   ↓
   Identifies order needs reminder
   
3. Send WhatsApp
   ↓
   Message sent, reminder record created
   
4. Voice Call (24h later)
   ↓
   Call initiated, status updated
   
5. Check Status
   ↓
   View complete audit trail
```

## API Endpoints (Localhost)

### Test Endpoints

All endpoints are available at `http://localhost:5000/api/test/`

#### 1. Create Test Order
```http
POST /api/test/create-order
Content-Type: application/json

{
  "orderId": "test-order-123",
  "artisanId": "artisan-rukaiya",
  "buyerId": "buyer-rahul",
  "title": "Test Embroidered Sarees (50 pieces)",
  "orderType": "bulk",
  "status": "in_progress",
  "quantity": 50,
  "price": 25000,
  "createdAt": "2026-02-27T00:00:00Z",
  "lastProgressUpdate": "2026-02-27T00:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test order created",
  "orderId": "test-order-123"
}
```

#### 2. Scan Orders
```http
GET /api/test/scan-orders
```

**Response:**
```json
{
  "success": true,
  "totalOrders": 5,
  "ordersNeedingReminders": 2,
  "orders": [
    {
      "orderId": "test-order-123",
      "title": "Test Embroidered Sarees",
      "status": "in_progress",
      "daysSinceUpdate": 4,
      "needsReminder": true
    }
  ]
}
```

#### 3. Send WhatsApp Reminder
```http
POST /api/test/send-whatsapp
Content-Type: application/json

{
  "orderId": "test-order-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "WhatsApp reminder sent (simulated)",
  "reminderId": "reminder-1234567890",
  "phoneNumber": "+919876543210",
  "messageId": "msg-1234567890",
  "sentAt": "2026-03-02T10:00:00Z",
  "message": "🔔 SHE-BALANCE Order Reminder..."
}
```

#### 4. Simulate Voice Call
```http
POST /api/test/voice-call
Content-Type: application/json

{
  "orderId": "test-order-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Voice call initiated (simulated)",
  "callId": "call-1234567890",
  "phoneNumber": "+919876543210",
  "language": "hi-IN",
  "initiatedAt": "2026-03-03T10:00:00Z",
  "script": "नमस्ते Rukaiya जी..."
}
```

#### 5. Check Reminder Status
```http
GET /api/test/reminder-status
```

**Response:**
```json
{
  "success": true,
  "totalReminders": 3,
  "reminders": [
    {
      "orderId": "test-order-123",
      "reminderId": "reminder-1234567890",
      "reminderType": "whatsapp",
      "status": "voice_call_initiated",
      "sentAt": "2026-03-02T10:00:00Z",
      "callInitiatedAt": "2026-03-03T10:00:00Z"
    }
  ]
}
```

#### 6. Clear Test Data
```http
DELETE /api/test/clear-data
```

**Response:**
```json
{
  "success": true,
  "message": "Test data cleared",
  "ordersDeleted": 5,
  "remindersDeleted": 5
}
```

## Testing with Command Line

### Using Node.js Script

```bash
cd backend
node test-reminder-local.js
```

This runs a complete automated test:
1. Creates test order
2. Scans for orders needing reminders
3. Sends WhatsApp reminder
4. Simulates voice call
5. Checks reminder status
6. Displays summary

### Using PowerShell

```powershell
# Create test order
$body = @{
    orderId = "test-order-$(Get-Date -Format 'yyyyMMddHHmmss')"
    artisanId = "artisan-rukaiya"
    buyerId = "buyer-rahul"
    title = "Test Order"
    orderType = "bulk"
    status = "in_progress"
    quantity = 50
    price = 25000
    createdAt = (Get-Date).AddDays(-4).ToString("o")
    lastProgressUpdate = (Get-Date).AddDays(-4).ToString("o")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/test/create-order" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# Scan orders
Invoke-RestMethod -Uri "http://localhost:5000/api/test/scan-orders"

# Send WhatsApp
$whatsappBody = @{ orderId = "test-order-123" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/test/send-whatsapp" `
    -Method POST `
    -ContentType "application/json" `
    -Body $whatsappBody
```

## Verifying in DynamoDB

### Check Orders Table

```bash
aws dynamodb scan --table-name shebalance-orders --limit 10
```

### Check Reminders Table

```bash
aws dynamodb scan --table-name shebalance-reminders --limit 10
```

### Query Specific Order

```bash
aws dynamodb get-item ^
    --table-name shebalance-orders ^
    --key "{\"orderId\": {\"S\": \"test-order-123\"}}"
```

## Expected Results

### After Creating Test Order

```
✅ Order created in DynamoDB
✅ Order ID: test-order-XXXXX
✅ Last update: 4 days ago
✅ Status: in_progress
```

### After Scanning Orders

```
✅ Found X active bulk orders
✅ Y orders need reminders
✅ Days since update calculated correctly
```

### After Sending WhatsApp

```
✅ Reminder record created
✅ Message preview displayed
✅ Order updated with reminder timestamp
✅ Reminder status: sent
```

### After Voice Call

```
✅ Voice script generated
✅ Reminder status updated: voice_call_initiated
✅ Call timestamp recorded
```

## Troubleshooting

### Backend Server Not Starting

**Issue**: Port 5000 already in use

**Solution**:
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <process_id> /F

# Or change port in server-dynamodb.js
const PORT = process.env.PORT || 5001;
```

### AWS Credentials Error

**Issue**: Unable to connect to DynamoDB

**Solution**:
```bash
# Set environment variables
set AWS_ACCESS_KEY_ID=your_access_key
set AWS_SECRET_ACCESS_KEY=your_secret_key
set AWS_REGION=us-east-1

# Or create .env file in backend folder
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

### Table Not Found Error

**Issue**: DynamoDB tables don't exist

**Solution**:
```bash
# Create tables first
cd backend/scripts
node init-dynamodb-data.js

# Or deploy to AWS
cd aws-backend
deploy-enhanced-reminders.bat
```

### CORS Error in Browser

**Issue**: Cross-origin request blocked

**Solution**:
- Backend already has CORS enabled
- Make sure backend is running on port 5000
- Check browser console for specific error
- Try opening test page from `http://localhost:3000` if using live server

## Performance Testing

### Load Test with Multiple Orders

```javascript
// Create 10 test orders
for (let i = 0; i < 10; i++) {
    await fetch('http://localhost:5000/api/test/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            orderId: `test-order-${Date.now()}-${i}`,
            artisanId: 'artisan-rukaiya',
            buyerId: 'buyer-rahul',
            title: `Test Order ${i}`,
            orderType: 'bulk',
            status: 'in_progress',
            quantity: 50,
            price: 25000,
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            lastProgressUpdate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        })
    });
}
```

## Next Steps After Local Testing

1. ✅ Verify all test scenarios work locally
2. 📤 Deploy to AWS using `deploy-enhanced-reminders.bat`
3. 📱 Configure SNS for actual WhatsApp delivery
4. 📞 Set up Twilio for real voice calls
5. 📊 Create CloudWatch dashboard for monitoring
6. 🔔 Set up alerts for failures

## Support

If you encounter issues:

1. Check backend server logs
2. Verify AWS credentials
3. Ensure DynamoDB tables exist
4. Check browser console for errors
5. Review API responses

For more help:
- See `ENHANCED_REMINDER_SYSTEM.md` for complete documentation
- See `REMINDER_SYSTEM_QUICKSTART.md` for deployment guide

---

**Ready to Test?** Run `test-reminder-localhost.bat` and start testing! 🚀
