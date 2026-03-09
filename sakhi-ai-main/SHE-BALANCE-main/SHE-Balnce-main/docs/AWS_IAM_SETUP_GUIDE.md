# 🔐 AWS IAM Setup Guide for SHE-BALANCE

## Required Permissions

Your IAM user needs **DynamoDB access** to create tables and manage data.

## 📋 Step-by-Step IAM User Creation

### Step 1: Login to AWS Console

1. Go to https://console.aws.amazon.com/
2. Sign in with your AWS account

### Step 2: Create IAM User

1. **Navigate to IAM**
   - Search for "IAM" in the top search bar
   - Click "IAM" (Identity and Access Management)

2. **Create User**
   - Click "Users" in the left sidebar
   - Click "Add users" button
   - User name: `shebalance-backend`
   - Click "Next"

3. **Set Permissions**
   
   **Option A: Quick Setup (Recommended for Development)**
   - Select "Attach policies directly"
   - Search for: `AmazonDynamoDBFullAccess`
   - Check the box next to it
   - Click "Next"

   **Option B: Custom Policy (Better Security)**
   - Select "Attach policies directly"
   - Click "Create policy"
   - Click "JSON" tab
   - Copy and paste the content from `backend/iam-policy.json`
   - Click "Next: Tags"
   - Click "Next: Review"
   - Policy name: `SheBalanceDynamoDBPolicy`
   - Click "Create policy"
   - Go back to user creation, refresh policies
   - Search for `SheBalanceDynamoDBPolicy`
   - Check the box
   - Click "Next"

4. **Review and Create**
   - Review the settings
   - Click "Create user"

### Step 3: Create Access Keys

1. **Click on the newly created user** (`shebalance-backend`)

2. **Go to Security Credentials tab**

3. **Create Access Key**
   - Scroll down to "Access keys"
   - Click "Create access key"
   - Select use case: "Application running outside AWS"
   - Click "Next"
   - Description (optional): "SheBalance Backend"
   - Click "Create access key"

4. **IMPORTANT: Save Your Credentials**
   ```
   Access Key ID: AKIA...
   Secret Access Key: ...
   ```
   
   ⚠️ **Save these immediately! You won't be able to see the secret key again!**

   - Click "Download .csv file" (recommended)
   - Or copy both values to a secure location

5. **Click "Done"**

## 🔧 Configure Your Backend

### Option 1: Using AWS CLI (Recommended)

```bash
# Install AWS CLI if not already installed
# Windows: Download from https://aws.amazon.com/cli/
# Mac: brew install awscli
# Linux: sudo apt-get install awscli

# Configure AWS CLI
aws configure

# Enter your credentials:
AWS Access Key ID [None]: AKIA... (paste your access key)
AWS Secret Access Key [None]: ... (paste your secret key)
Default region name [None]: us-east-1
Default output format [None]: json
```

### Option 2: Using Environment File

Edit `backend/.env`:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...  (your access key)
AWS_SECRET_ACCESS_KEY=...  (your secret key)

# DynamoDB Configuration
DYNAMODB_TABLE_PREFIX=shebalance-

# Server Configuration
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
```

## ✅ Verify Setup

### Test 1: Check AWS Identity

```bash
aws sts get-caller-identity
```

Expected output:
```json
{
    "UserId": "AIDA...",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/shebalance-backend"
}
```

### Test 2: List DynamoDB Tables

```bash
aws dynamodb list-tables --region us-east-1
```

Expected output (if no tables yet):
```json
{
    "TableNames": []
}
```

## 🚀 Create DynamoDB Tables

Now that credentials are configured, create the tables:

```bash
cd backend
npm run setup-dynamodb
```

Expected output:
```
🔧 Setting up DynamoDB tables for SHE-BALANCE...

Creating table: shebalance-users...
✅ Table shebalance-users created successfully
✅ Table shebalance-users is now active

Creating table: shebalance-artisan-profiles...
✅ Table shebalance-artisan-profiles created successfully
✅ Table shebalance-artisan-profiles is now active

... (continues for all 18 tables)

🎉 DynamoDB setup completed successfully!

📋 Created tables:
   - shebalance-users
   - shebalance-artisan-profiles
   - shebalance-buyer-profiles
   - shebalance-corporate-profiles
   - shebalance-products
   - shebalance-orders
   - shebalance-bulk-orders
   - shebalance-skillscan-results
   - shebalance-learning-progress
   - shebalance-labour-tracking
   - shebalance-ai-conversations
   - shebalance-support-requests
   - shebalance-payment-requests
   - shebalance-transactions
   - shebalance-favorites
   - shebalance-reviews
   - shebalance-notifications
   - shebalance-health-alerts
```

## 📊 Initialize Sample Data

```bash
npm run init-sample-data
```

Expected output:
```
🔧 Initializing Sample Data in DynamoDB...

Creating admin user...
✅ Admin user created
   Email: admin@shebalance.com
   Password: admin123

Creating sample artisan...
✅ Sample artisan created
   Email: priya@example.com
   Password: artisan123

Creating sample buyer...
✅ Sample buyer created
   Email: rahul@example.com
   Password: buyer123

🎉 Sample data initialization completed!

You can now login with:
  Admin:   admin@shebalance.com / admin123
  Artisan: priya@example.com / artisan123
  Buyer:   rahul@example.com / buyer123
```

## 🧪 Test Your Setup

### Test 1: Backend Health Check

```bash
curl http://localhost:5000/health
```

Expected:
```json
{
  "status": "OK",
  "timestamp": "2026-03-02T...",
  "database": "DynamoDB"
}
```

### Test 2: Login API

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"priya@example.com","password":"artisan123"}'
```

Expected:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "...",
    "email": "priya@example.com",
    "fullName": "Priya Sharma",
    "role": "artisan",
    "status": "active"
  }
}
```

### Test 3: View Tables in AWS Console

1. Go to https://console.aws.amazon.com/dynamodb/
2. Select region: **us-east-1** (top right)
3. Click "Tables" in left sidebar
4. You should see all 18 `shebalance-*` tables

### Test 4: View Table Data

1. Click on `shebalance-users` table
2. Click "Explore table items"
3. You should see 3 users (admin, artisan, buyer)

## 🔒 Security Best Practices

### 1. Never Commit Credentials

Add to `.gitignore`:
```
.env
*.csv
aws-credentials.txt
```

### 2. Rotate Access Keys Regularly

Every 90 days:
1. AWS Console → IAM → Users → shebalance-backend
2. Security credentials tab
3. Create new access key
4. Update your `.env` file
5. Delete old access key

### 3. Enable MFA on AWS Account

1. AWS Console → IAM → Dashboard
2. Click "Add MFA" for root account
3. Follow setup instructions

### 4. Use Least Privilege

For production, use the custom policy (`iam-policy.json`) instead of `AmazonDynamoDBFullAccess`

### 5. Monitor Usage

1. AWS Console → CloudWatch
2. Set up alarms for:
   - High read/write capacity
   - Throttled requests
   - Unusual access patterns

## 💰 Cost Management

### Free Tier Limits (First 12 Months)
- ✅ 25 GB storage
- ✅ 25 read capacity units
- ✅ 25 write capacity units
- ✅ 2.5 million stream read requests

### Monitor Costs
1. AWS Console → Billing Dashboard
2. Set up billing alerts:
   - Threshold: $5, $10, $20
   - Email notifications

### Optimize Costs
- Use on-demand billing for development
- Switch to provisioned capacity for production
- Delete unused tables
- Enable auto-scaling

## 🐛 Troubleshooting

### Issue: "Unable to locate credentials"

**Solution 1**: Run `aws configure`
```bash
aws configure
# Enter your access key and secret key
```

**Solution 2**: Check `.env` file
```bash
# Make sure these are set:
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
```

### Issue: "User: arn:aws:iam::xxx:user/shebalance-backend is not authorized"

**Solution**: Add DynamoDB permissions
1. AWS Console → IAM → Users → shebalance-backend
2. Permissions tab → Add permissions
3. Attach `AmazonDynamoDBFullAccess` policy

### Issue: "ResourceNotFoundException: Requested resource not found"

**Solution**: Create tables first
```bash
cd backend
npm run setup-dynamodb
```

### Issue: "ValidationException: One or more parameter values were invalid"

**Solution**: Check table names and region
- Tables must start with `shebalance-`
- Region must be `us-east-1`

### Issue: "Cannot find module 'aws-sdk'"

**Solution**: Install dependencies
```bash
cd backend
npm install
```

## 📋 Quick Reference

### Commands
```bash
# Configure AWS
aws configure

# Create tables
npm run setup-dynamodb

# Initialize data
npm run init-sample-data

# Start server
npm start

# Delete all tables
npm run cleanup-dynamodb

# Check AWS identity
aws sts get-caller-identity

# List tables
aws dynamodb list-tables
```

### Sample Users
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shebalance.com | admin123 |
| Artisan | priya@example.com | artisan123 |
| Buyer | rahul@example.com | buyer123 |

### Important Files
- `backend/.env` - Configuration
- `backend/iam-policy.json` - IAM policy
- `backend/aws-dynamodb-setup.js` - Table creation
- `backend/scripts/init-dynamodb-data.js` - Sample data

## ✅ Setup Checklist

- [ ] AWS account created
- [ ] IAM user created (`shebalance-backend`)
- [ ] DynamoDB permissions attached
- [ ] Access keys generated
- [ ] Access keys saved securely
- [ ] AWS CLI configured OR .env file updated
- [ ] Credentials verified (`aws sts get-caller-identity`)
- [ ] DynamoDB tables created (`npm run setup-dynamodb`)
- [ ] Sample data initialized (`npm run init-sample-data`)
- [ ] Backend server running (`npm start`)
- [ ] Health check successful
- [ ] Login test successful
- [ ] Tables visible in AWS Console

## 🎯 Next Steps

Once setup is complete:

1. **Test the API**
   - Try all sample user logins
   - Test profile retrieval
   - Test order creation

2. **Connect Frontend**
   - Update frontend pages to use API
   - Test end-to-end workflows

3. **Monitor Usage**
   - Check DynamoDB metrics in AWS Console
   - Set up billing alerts

4. **Plan for Production**
   - Consider AWS Lambda deployment
   - Set up CI/CD pipeline
   - Configure custom domain

---

**Need Help?**
- AWS Documentation: https://docs.aws.amazon.com/dynamodb/
- AWS Support: https://console.aws.amazon.com/support/
- SHE-BALANCE Docs: See DYNAMODB_SETUP_GUIDE.md
