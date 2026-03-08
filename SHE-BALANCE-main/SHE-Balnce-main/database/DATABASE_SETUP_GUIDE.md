# SHE-BALANCE Database Setup Guide

## Overview
This guide explains how to set up the database backend for SHE-BALANCE, supporting both local development and AWS production deployment.

## 🏗️ Architecture

### Local Development
- **Storage**: Browser localStorage
- **Purpose**: Quick testing and development
- **No setup required**: Works immediately in browser

### Production (AWS)
- **Database**: Amazon DynamoDB
- **API**: AWS Lambda + API Gateway
- **Storage**: Amazon S3 (for images)
- **Authentication**: AWS Cognito (optional)

## 📁 Database Schema

### Core Tables

1. **Users** - All user accounts
   - Primary Key: `user_id`
   - Indexes: `email`, `role`
   - Fields: email, password_hash, full_name, phone, role, status

2. **Artisan Profiles** - Artisan-specific data
   - Primary Key: `artisan_id`
   - Foreign Key: `user_id`
   - Fields: skills, experience, location, verification_status, rating

3. **Products** - Marketplace products
   - Primary Key: `product_id`
   - Indexes: `artisan_id`, `category`
   - Fields: title, description, price, images, status

4. **Orders** - Purchase orders
   - Primary Key: `order_id`
   - Indexes: `buyer_id`, `artisan_id`, `status`
   - Fields: quantity, total_amount, status, payment_status

5. **SkillScan Results** - AI skill analysis
   - Primary Key: `scan_id`
   - Index: `artisan_id`
   - Fields: skill_category, overall_score, skill_level, breakdown_scores

6. **Messages** - User communications
   - Primary Key: `message_id`
   - Indexes: `sender_id`, `receiver_id`
   - Fields: subject, message_text, is_read

7. **Health Alerts** - Artisan wellness monitoring
   - Primary Key: `alert_id`
   - Index: `artisan_id`
   - Fields: alert_type, severity, description, status

## 🚀 Quick Start (Local Development)

### Step 1: Include Database Files in HTML

Add these scripts to your HTML pages:

```html
<!-- Database Configuration -->
<script src="database/db-config.js"></script>
<script src="database/api-client.js"></script>
```

### Step 2: Use the API

```javascript
// Example: Create a new user
const result = await api.createUser({
    email: 'artisan@example.com',
    password: 'secure123',
    fullName: 'Priya Sharma',
    phone: '+91 9876543210',
    role: 'artisan',
    skills: ['embroidery', 'tailoring']
});

// Example: Save SkillScan result
await api.saveSkillScanResult('ART123', {
    category: 'embroidery',
    overallScore: 75,
    skillLevel: 'Intermediate',
    breakdown: {
        'Technique Quality': 80,
        'Pattern Complexity': 70,
        'Finishing Quality': 75
    },
    strengths: ['Good stitch consistency', 'Creative patterns'],
    improvements: ['Work on finishing', 'Try complex designs']
});

// Example: Get artisan's skill scans
const scans = await api.getArtisanSkillScans('ART123');
```

## ☁️ AWS Production Setup

### Prerequisites
- AWS Account
- AWS CLI installed and configured
- Appropriate IAM permissions

### Step 1: Deploy DynamoDB Tables

Run the deployment script:

```bash
cd database
deploy-dynamodb.bat
```

This creates all required DynamoDB tables with proper indexes.

### Step 2: Create Lambda Functions

Create Lambda functions for each API endpoint:

**Example: Create User Lambda**

```python
import json
import boto3
from datetime import datetime
import hashlib

dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table('SheBalance-Users')

def lambda_handler(event, context):
    try:
        body = json.loads(event['body'])
        
        user_id = f"USR{int(datetime.now().timestamp())}"
        
        user = {
            'user_id': user_id,
            'email': body['email'],
            'password_hash': hashlib.sha256(body['password'].encode()).hexdigest(),
            'full_name': body['fullName'],
            'phone': body.get('phone', ''),
            'role': body['role'],
            'status': 'active',
            'created_at': datetime.now().isoformat()
        }
        
        users_table.put_item(Item=user)
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'success': True,
                'userId': user_id
            })
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'success': False, 'error': str(e)})
        }
```

### Step 3: Set Up API Gateway

1. Create REST API in API Gateway
2. Create resources for each endpoint:
   - `/users` - POST (create), GET (list)
   - `/users/{id}` - GET (read), PUT (update)
   - `/artisans` - GET (list)
   - `/products` - POST, GET
   - `/orders` - POST, GET
   - `/skillscans` - POST, GET
   - `/messages` - POST, GET

3. Enable CORS for all endpoints
4. Deploy API to production stage

### Step 4: Update Frontend Configuration

Update `database/db-config.js`:

```javascript
const DB_CONFIG = {
    environment: 'production', // Change from 'local' to 'production'
    aws: {
        region: 'us-east-1',
        apiEndpoint: 'https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod'
    }
};
```

## 📊 Database Operations

### Common Operations

#### User Management
```javascript
// Register new user
await api.createUser({...});

// Login
const result = await api.login('email@example.com', 'password');

// Get current user
const user = api.getCurrentUser();

// Logout
api.logout();
```

#### SkillScan Operations
```javascript
// Save scan result
await api.saveSkillScanResult(artisanId, scanData);

// Get artisan's scans
const scans = await api.getArtisanSkillScans(artisanId);

// Get latest scan
const latest = await api.getLatestSkillScan(artisanId, 'embroidery');
```

#### Product Management
```javascript
// Create product
await api.createProduct(artisanId, {
    title: 'Handmade Embroidered Saree',
    description: 'Beautiful traditional work',
    category: 'textiles',
    price: 2500,
    images: ['url1', 'url2']
});

// Get products
const products = await api.getProducts({ category: 'textiles' });
```

#### Order Management
```javascript
// Create order
await api.createOrder({
    buyerId: 'BUY123',
    artisanId: 'ART456',
    productId: 'PRD789',
    quantity: 1,
    unitPrice: 2500,
    totalAmount: 2500
});

// Get orders
const orders = await api.getOrders({ artisan_id: 'ART456' });

// Update order status
await api.updateOrderStatus('ORD123', 'completed');
```

## 🔒 Security Considerations

### Local Development
- Passwords are base64 encoded (NOT secure for production)
- Data stored in browser localStorage
- No authentication required

### Production
- Use proper password hashing (bcrypt, Argon2)
- Implement AWS Cognito for authentication
- Use HTTPS only
- Enable DynamoDB encryption at rest
- Implement rate limiting
- Add input validation
- Use IAM roles for Lambda functions

## 💰 Cost Estimation (AWS)

### DynamoDB
- **Free Tier**: 25 GB storage, 25 WCU, 25 RCU
- **Pay-per-request**: $1.25 per million write requests, $0.25 per million read requests
- **Estimated**: $5-20/month for small to medium traffic

### Lambda
- **Free Tier**: 1M requests/month, 400,000 GB-seconds
- **Estimated**: $0-5/month for typical usage

### API Gateway
- **Free Tier**: 1M API calls/month (first 12 months)
- **After**: $3.50 per million requests
- **Estimated**: $0-10/month

### S3 (for images)
- **Free Tier**: 5 GB storage, 20,000 GET requests
- **Estimated**: $1-5/month

**Total Estimated Cost**: $10-40/month

## 🧪 Testing

### Test Local Database
```javascript
// Test user creation
const testUser = await api.createUser({
    email: 'test@example.com',
    password: 'test123',
    fullName: 'Test User',
    role: 'artisan'
});
console.log('User created:', testUser);

// Test login
const loginResult = await api.login('test@example.com', 'test123');
console.log('Login result:', loginResult);
```

### Test AWS Deployment
```bash
# Test API endpoint
curl -X POST https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","fullName":"Test User","role":"artisan"}'
```

## 📝 Migration from Local to AWS

1. Export local data:
```javascript
function exportLocalData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('shebalance_')) {
            data[key] = JSON.parse(localStorage.getItem(key));
        }
    }
    console.log(JSON.stringify(data, null, 2));
}
```

2. Import to DynamoDB using AWS SDK or console

## 🆘 Troubleshooting

### Local Development Issues
- **Data not saving**: Check browser console for errors
- **Data lost**: localStorage clears on browser cache clear
- **Quota exceeded**: localStorage has 5-10MB limit

### AWS Issues
- **403 Forbidden**: Check IAM permissions
- **CORS errors**: Enable CORS in API Gateway
- **Timeout**: Increase Lambda timeout (default 3s)
- **Table not found**: Verify table names match configuration

## 📚 Next Steps

1. ✅ Set up local development database
2. ✅ Test all CRUD operations
3. ⬜ Deploy DynamoDB tables to AWS
4. ⬜ Create Lambda functions
5. ⬜ Set up API Gateway
6. ⬜ Update frontend configuration
7. ⬜ Test production deployment
8. ⬜ Implement authentication
9. ⬜ Add monitoring and logging
10. ⬜ Set up backup and recovery

## 🔗 Useful Links

- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [AWS CLI Reference](https://docs.aws.amazon.com/cli/)

---

**Need Help?** Check the console logs or contact the development team.
