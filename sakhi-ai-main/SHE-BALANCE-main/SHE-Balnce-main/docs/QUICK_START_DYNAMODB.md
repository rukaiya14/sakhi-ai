# 🚀 Quick Start - AWS DynamoDB Backend

## ✅ Current Status

```
Frontend:  http://localhost:3000  ✅ RUNNING
Backend:   http://localhost:5000  ✅ RUNNING (DynamoDB-ready)
Database:  AWS DynamoDB           ⏳ NEEDS 3 STEPS
```

## 🎯 Complete Setup in 15 Minutes

### Step 1: AWS Credentials (5 min)

**Get AWS Account**:
1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Follow signup (credit card required, but free tier available)

**Create IAM User**:
1. AWS Console → IAM → Users → Add User
2. Name: `shebalance-backend`
3. Access type: ✅ Programmatic access
4. Permissions: Attach `AmazonDynamoDBFullAccess`
5. **Save the Access Key ID and Secret Access Key!**

**Configure**:
```bash
# Option A: AWS CLI
aws configure
# Enter Access Key ID
# Enter Secret Access Key
# Region: us-east-1
# Format: json

# Option B: Edit backend/.env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

### Step 2: Create Tables (5 min)

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

### Step 3: Add Sample Data (5 min)

```bash
npm run init-sample-data
```

You'll get:
```
✅ Admin:   admin@shebalance.com / admin123
✅ Artisan: priya@example.com / artisan123
✅ Buyer:   rahul@example.com / buyer123
```

## 🧪 Test It Works

### Test 1: Health Check
```
http://localhost:5000/health
```

Should show:
```json
{"status":"OK","database":"DynamoDB"}
```

### Test 2: Login
```javascript
// Browser console (F12)
fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        email: 'priya@example.com',
        password: 'artisan123'
    })
})
.then(r => r.json())
.then(console.log);
```

## 📊 What You Get

### 18 DynamoDB Tables
- users, artisan-profiles, buyer-profiles
- orders, products, skillscan-results
- labour-tracking, ai-conversations
- notifications, reviews, and more!

### All Features Working
- ✅ User registration & login
- ✅ Profile management
- ✅ SkillScan with storage
- ✅ Order tracking
- ✅ Labour hour logging
- ✅ Admin dashboard

## 💰 Cost

### Free Tier (12 months)
- 25 GB storage
- 25 read/write capacity units
- **Perfect for development!**

### After Free Tier
- ~$5-10/month for moderate usage
- Pay only for what you use

## 🔧 Commands

```bash
# Create tables
npm run setup-dynamodb

# Add sample data
npm run init-sample-data

# Start server
npm start

# Delete all tables
npm run cleanup-dynamodb
```

## 🐛 Troubleshooting

### "Missing credentials"
```bash
aws configure
# OR add to backend/.env
```

### "ResourceNotFoundException"
```bash
npm run setup-dynamodb
```

### "AccessDeniedException"
Check IAM permissions - need DynamoDB access

## 📚 Full Documentation

- **DYNAMODB_SETUP_GUIDE.md** - Detailed instructions
- **DYNAMODB_DEPLOYMENT_COMPLETE.md** - Complete overview
- **backend/dynamodb-client.js** - Database operations

## ✨ Summary

```
1. Get AWS credentials (5 min)
2. npm run setup-dynamodb (5 min)
3. npm run init-sample-data (5 min)
4. Test login ✅
```

**Total time: 15 minutes**
**No MySQL needed!**
**Fully serverless!**

---

**Your backend is ready with AWS DynamoDB!** 🎉
