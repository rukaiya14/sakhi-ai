# 🚀 Start DynamoDB - Simple 3-Step Guide

## What You Need

✅ AWS Account (create at https://aws.amazon.com/)
✅ 15 minutes of time
✅ Backend already running on port 5000

## 📋 Step 1: Create IAM User (5 minutes)

### Go to AWS Console
1. Open https://console.aws.amazon.com/iam/
2. Click **"Users"** (left sidebar)
3. Click **"Add users"** button

### Create User
```
User name: shebalance-backend
Click "Next"
```

### Add Permissions
```
Select: "Attach policies directly"
Search: AmazonDynamoDBFullAccess
✅ Check the box
Click "Next"
Click "Create user"
```

### Get Access Keys
```
1. Click on "shebalance-backend" user
2. Click "Security credentials" tab
3. Scroll to "Access keys"
4. Click "Create access key"
5. Select: "Application running outside AWS"
6. Click "Next"
7. Click "Create access key"
8. 📝 SAVE THESE NOW:
   - Access Key ID: AKIA...
   - Secret Access Key: ...
9. Click "Download .csv file" (IMPORTANT!)
10. Click "Done"
```

## 🔧 Step 2: Configure Backend (2 minutes)

### Option A: AWS CLI (Recommended)
```bash
aws configure
```
Enter:
- Access Key ID: (paste from above)
- Secret Access Key: (paste from above)
- Region: `us-east-1`
- Format: `json`

### Option B: Edit .env File
```bash
# Open: backend/.env
# Add these lines:

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA... (your key)
AWS_SECRET_ACCESS_KEY=... (your secret)
```

## 🎯 Step 3: Create Tables & Data (8 minutes)

### Create DynamoDB Tables
```bash
cd backend
npm run setup-dynamodb
```

Wait for:
```
✅ Table shebalance-users created
✅ Table shebalance-artisan-profiles created
... (18 tables total)
🎉 DynamoDB setup completed!
```

### Add Sample Users
```bash
npm run init-sample-data
```

You'll get:
```
✅ Admin:   admin@shebalance.com / admin123
✅ Artisan: priya@example.com / artisan123
✅ Buyer:   rahul@example.com / buyer123
```

## ✅ Test It Works!

### Test 1: Health Check
Open browser: http://localhost:5000/health

Should show:
```json
{"status":"OK","database":"DynamoDB"}
```

### Test 2: Login
Open browser console (F12) and run:
```javascript
fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        email: 'priya@example.com',
        password: 'artisan123'
    })
})
.then(r => r.json())
.then(data => {
    console.log('✅ Login successful!', data);
    localStorage.setItem('shebalance_token', data.token);
});
```

### Test 3: View in AWS Console
1. Go to https://console.aws.amazon.com/dynamodb/
2. Select region: **us-east-1** (top right)
3. Click "Tables"
4. You should see 18 `shebalance-*` tables!

## 🎉 Done!

Your backend is now connected to AWS DynamoDB!

### What You Have:
- ✅ 18 DynamoDB tables
- ✅ 3 sample users (admin, artisan, buyer)
- ✅ Fully functional API
- ✅ No MySQL needed!

### Sample Login Credentials:
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shebalance.com | admin123 |
| Artisan | priya@example.com | artisan123 |
| Buyer | rahul@example.com | buyer123 |

## 💰 Cost

**Free Tier (12 months):**
- 25 GB storage
- 25 read/write capacity units
- Perfect for development!

**After Free Tier:**
- ~$5-10/month for moderate usage

## 🐛 Problems?

### "Unable to locate credentials"
```bash
aws configure
# Enter your access key and secret
```

### "ResourceNotFoundException"
```bash
npm run setup-dynamodb
```

### "AccessDeniedException"
Check IAM user has `AmazonDynamoDBFullAccess` policy

## 📚 Full Documentation

- **AWS_IAM_SETUP_GUIDE.md** - Detailed IAM setup
- **DYNAMODB_SETUP_GUIDE.md** - Complete DynamoDB guide
- **DYNAMODB_DEPLOYMENT_COMPLETE.md** - Full overview

## 🎯 Next Steps

1. ✅ Test all sample user logins
2. ✅ Connect frontend pages to API
3. ✅ Test SkillScan, Orders, etc.
4. ✅ Monitor usage in AWS Console

---

**Your backend is live with AWS DynamoDB!** 🚀

**Total setup time: 15 minutes**
**No MySQL needed!**
**Fully serverless!**
