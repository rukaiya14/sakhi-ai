# 🔍 AWS Backend Integration Analysis - SHE-BALANCE Platform

## Executive Summary

This document provides a comprehensive analysis of all frontend files and identifies specific AWS backend integration points. Each section maps frontend API calls to required AWS services and Lambda functions.

---

## 📊 Frontend Files Analysis

### 1. **api-client.js** - Core API Client
**Current State:** Uses `http://localhost:5000/api` endpoints  
**AWS Integration Required:** API Gateway + Lambda Functions

#### API Endpoints to Migrate:

| Frontend Method | Current Endpoint | AWS Service | Lambda Function | Priority |
|----------------|------------------|-------------|-----------------|----------|
| `register()` | POST `/auth/register` | API Gateway + Lambda | `auth-register` | HIGH |
| `login()` | POST `/auth/login` | API Gateway + Lambda | `auth-login` | HIGH |
| `getProfile()` | GET `/users/profile` | API Gateway + Lambda | `user-get-profile` | HIGH |
| `updateProfile()` | PUT `/users/profile` | API Gateway + Lambda | `user-update-profile` | HIGH |
| `getArtisans()` | GET `/artisans` | API Gateway + Lambda | `artisan-list` | HIGH |
| `getArtisanDetails()` | GET `/artisans/:id` | API Gateway + Lambda | `artisan-get-details` | HIGH |
| `submitSkillScan()` | POST `/skillscan/analyze` | API Gateway + Lambda + S3 + SageMaker | `skillscan-analyze` | MEDIUM |
| `getSkillScanHistory()` | GET `/skillscan/history` | API Gateway + Lambda | `skillscan-history` | MEDIUM |
| `createOrder()` | POST `/orders` | API Gateway + Lambda + DynamoDB | `order-create` | HIGH |
| `getOrders()` | GET `/orders` | API Gateway + Lambda + DynamoDB | `order-list` | HIGH |
| `updateOrderStatus()` | PUT `/orders/:id/status` | API Gateway + Lambda + DynamoDB | `order-update-status` | HIGH |
| `logLabourHours()` | POST `/labour/log` | API Gateway + Lambda + DynamoDB | `labour-log` | MEDIUM |
| `getLabourHistory()` | GET `/labour/history` | API Gateway + Lambda + DynamoDB | `labour-history` | MEDIUM |
| `getAllUsers()` | GET `/admin/users` | API Gateway + Lambda + DynamoDB | `admin-get-users` | MEDIUM |
| `getPlatformStatistics()` | GET `/admin/statistics` | API Gateway + Lambda + DynamoDB | `admin-statistics` | MEDIUM |

**AWS Services Needed:**
- ✅ API Gateway (REST API)
- ✅ Lambda Functions (Node.js 18.x)
- ✅ DynamoDB (Already configured)
- ✅ S3 (For file uploads)
- ✅ SageMaker (For SkillScan AI)
- ✅ Cognito (Optional - for enhanced auth)

---

### 2. **dashboard.js** - Artisan Dashboard
**Current State:** Fetches from `http://localhost:5000/api`  
**AWS Integration Required:** Multiple Lambda functions + DynamoDB + Step Functions

#### Key Integration Points:

| Feature | Current API Call | AWS Services Required | Implementation |
|---------|-----------------|----------------------|----------------|
| **User Profile Loading** | `fetch('/api/users/profile')` | API Gateway + Lambda + DynamoDB | Replace with API Gateway endpoint |
| **Bulk Orders Loading** | `fetch('/api/orders')` | API Gateway + Lambda + DynamoDB | Add GSI for artisan queries |
| **Order Progress Update** | `fetch('/api/orders/:id/progress')` | API Gateway + Lambda + DynamoDB + EventBridge | Trigger reminder workflow on update |
| **AI Sakhi Chat** | Not implemented in this file | API Gateway + Lambda + Bedrock | Add AI Sakhi integration |
| **Labour Hours Tracking** | Not visible in current code | API Gateway + Lambda + DynamoDB | Track invisible labour |

**New AWS Services Needed:**
- ✅ EventBridge (For reminder triggers)
- ✅ Step Functions (For reminder orchestration)
- ✅ SNS (For WhatsApp/SMS notifications)
- ✅ Polly (For voice call generation)

---

### 3. **buyer-dashboard.js** - Buyer Dashboard
**Current State:** Static artisan data, no backend calls  
**AWS Integration Required:** Lambda + DynamoDB + S3

#### Integration Points:

| Feature | Current Implementation | AWS Migration | Lambda Function |
|---------|----------------------|---------------|-----------------|
| **Load Artisans** | Static array in JS | DynamoDB Scan/Query | `artisan-list` |
| **Filter by Category** | Client-side filtering | DynamoDB GSI query | `artisan-filter` |
| **Search Artisans** | Client-side search | DynamoDB + ElasticSearch | `artisan-search` |
| **Contact Artisan** | Redirect to message center | Lambda + SES/SNS | `message-send` |
| **View Portfolio** | Static images | S3 + CloudFront | `portfolio-get` |
| **Toggle Favorite** | LocalStorage only | DynamoDB | `favorite-toggle` |
| **Create Order** | Not implemented | Lambda + DynamoDB | `order-create` |

**AWS Services Needed:**
- ✅ S3 + CloudFront (For portfolio images)
- ✅ ElasticSearch (Optional - for advanced search)
- ✅ SES (For email notifications)

---

### 4. **admin-dashboard.js** - Admin Dashboard
**Current State:** Static data, no real backend integration  
**AWS Integration Required:** Comprehensive Lambda suite + DynamoDB + CloudWatch

#### Integration Points:

| Feature | Current Implementation | AWS Migration | Lambda Function |
|---------|----------------------|---------------|-----------------|
| **Platform Statistics** | Static numbers | DynamoDB aggregation | `admin-statistics` |
| **User Management** | Static array | DynamoDB Scan | `admin-users-list` |
| **Order Management** | Static array | DynamoDB Query | `admin-orders-list` |
| **Labour Tracking** | Static array | DynamoDB Query | `admin-labour-view` |
| **AI Health Monitoring** | Not implemented | Lambda + DynamoDB + Step Functions | `admin-health-monitor` |
| **Charts/Analytics** | Chart.js with static data | Lambda + DynamoDB + QuickSight | `admin-analytics` |
| **Emergency Payout** | Alert only | Lambda + DynamoDB + Payment Gateway | `admin-emergency-payout` |
| **Community Alerts** | Alert only | Lambda + SNS + WhatsApp API | `admin-community-alert` |

**AWS Services Needed:**
- ✅ CloudWatch (For monitoring)
- ✅ QuickSight (Optional - for advanced analytics)
- ✅ Payment Gateway Integration (Razorpay/Stripe)

---

### 5. **ai-sakhi-chat.js** - AI Assistant
**Current State:** Likely calls `/api/ai-sakhi/chat`  
**AWS Integration Required:** Bedrock + Lambda + DynamoDB

#### Integration Points:

| Feature | AWS Service | Implementation Details |
|---------|-------------|----------------------|
| **Chat Interface** | API Gateway + Lambda | Real-time chat endpoint |
| **AI Processing** | Amazon Bedrock (Claude 3 Haiku) | Context-aware responses |
| **Conversation History** | DynamoDB | Store chat history with TTL |
| **User Context** | DynamoDB | Fetch user orders, profile, labour data |
| **Intent Detection** | Bedrock + Lambda | Classify user intent (payment, health, support) |
| **Action Triggers** | Step Functions | Trigger workflows based on intent |

**AWS Services Needed:**
- ✅ Amazon Bedrock (Claude 3 Haiku)
- ✅ Lambda (Node.js for orchestration)
- ✅ DynamoDB (Conversation storage)
- ✅ Step Functions (For complex workflows)

---

### 6. **voice-services.js** - Voice Assistant
**Current State:** Calls `/voice-services` endpoint  
**AWS Integration Required:** Polly + Transcribe + Lambda

#### Integration Points:

| Feature | Current Endpoint | AWS Services | Lambda Function |
|---------|-----------------|--------------|-----------------|
| **Text-to-Speech** | POST `/voice-services` | Polly + S3 | `voice-text-to-speech` |
| **Speech-to-Text** | POST `/voice-services` | Transcribe | `voice-speech-to-text` |
| **Translation** | POST `/voice-services` | Translate | `voice-translate` |
| **Audio Upload** | POST `/upload-audio` | S3 + Lambda | `voice-upload-audio` |
| **Multi-language Support** | Backend processing | Polly (multiple voices) | `voice-synthesize` |

**AWS Services Needed:**
- ✅ Amazon Polly (Text-to-Speech)
- ✅ Amazon Transcribe (Speech-to-Text)
- ✅ Amazon Translate (Language translation)
- ✅ S3 (Audio file storage)

---

### 7. **whatsapp-service.js** - WhatsApp Integration
**Current State:** Backend service file  
**AWS Integration Required:** Lambda + SNS + WhatsApp Business API

#### Integration Points:

| Feature | Current Implementation | AWS Migration |
|---------|----------------------|---------------|
| **Send WhatsApp Message** | Node.js service | Lambda + SNS + WhatsApp API |
| **Order Reminders** | Manual trigger | EventBridge + Step Functions |
| **Health Check Messages** | Not implemented | Lambda + Step Functions |
| **Payment Notifications** | Not implemented | Lambda + SNS |
| **Delivery Status** | Not implemented | Lambda + DynamoDB |

**AWS Services Needed:**
- ✅ SNS (For SMS fallback)
- ✅ WhatsApp Business API (Third-party integration)
- ✅ EventBridge (Scheduled reminders)
- ✅ Step Functions (Reminder orchestration)

---

## 🏗️ Required AWS Lambda Functions

### Authentication & User Management
1. **auth-login** - User authentication with JWT
2. **auth-register** - New user registration
3. **user-get-profile** - Fetch user profile
4. **user-update-profile** - Update user profile
5. **user-upload-avatar** - Upload profile image to S3

### Artisan Management
6. **artisan-list** - List all verified artisans
7. **artisan-get-details** - Get specific artisan details
8. **artisan-filter** - Filter artisans by category/skill
9. **artisan-search** - Search artisans (with ElasticSearch)
10. **artisan-update-profile** - Update artisan profile

### Order Management
11. **order-create** - Create new order
12. **order-list** - List orders (buyer/artisan specific)
13. **order-get-details** - Get order details
14. **order-update-status** - Update order status
15. **order-update-progress** - Update order progress
16. **order-cancel** - Cancel order

### SkillScan
17. **skillscan-analyze** - Analyze uploaded images with SageMaker
18. **skillscan-history** - Get scan history
19. **skillscan-upload-images** - Upload images to S3

### Labour Tracking
20. **labour-log** - Log labour hours
21. **labour-history** - Get labour history
22. **labour-calculate-balance** - Calculate work-life balance

### AI Sakhi
23. **ai-sakhi-chat** - Process chat messages with Bedrock
24. **ai-sakhi-context** - Fetch user context for AI
25. **ai-sakhi-intent** - Detect user intent
26. **ai-sakhi-action** - Trigger actions based on intent

### Voice Services
27. **voice-text-to-speech** - Convert text to speech (Polly)
28. **voice-speech-to-text** - Convert speech to text (Transcribe)
29. **voice-translate** - Translate text (Translate)
30. **voice-upload-audio** - Upload audio to S3

### Reminder System
31. **reminder-orchestrator** - Main orchestrator (Step Functions)
32. **reminder-scan-orders** - Scan for orders needing reminders
33. **reminder-send-whatsapp** - Send WhatsApp reminder
34. **reminder-check-reply** - Check if artisan replied
35. **reminder-generate-voice** - Generate voice call
36. **reminder-alert-community** - Alert community support

### Admin Functions
37. **admin-statistics** - Get platform statistics
38. **admin-users-list** - List all users
39. **admin-orders-list** - List all orders
40. **admin-labour-view** - View labour tracking data
41. **admin-health-monitor** - Monitor artisan health
42. **admin-emergency-payout** - Process emergency payout
43. **admin-community-alert** - Send community alerts

### Payment Functions
44. **payment-create-request** - Create payment request
45. **payment-process** - Process payment
46. **payment-webhook** - Handle payment gateway webhooks
47. **payment-advance** - Process advance payment

### Notification Functions
48. **notification-create** - Create notification
49. **notification-list** - List user notifications
50. **notification-mark-read** - Mark notification as read

---

## 🔄 API Gateway Structure

```
/api
├── /auth
│   ├── POST /register
│   ├── POST /login
│   └── POST /logout
├── /users
│   ├── GET /profile
│   ├── PUT /profile
│   └── POST /upload-avatar
├── /artisans
│   ├── GET /
│   ├── GET /:id
│   ├── GET /search
│   └── PUT /:id
├── /orders
│   ├── GET /
│   ├── POST /
│   ├── GET /:id
│   ├── PUT /:id/status
│   ├── PUT /:id/progress
│   └── DELETE /:id
├── /skillscan
│   ├── POST /analyze
│   ├── GET /history
│   └── POST /upload
├── /labour
│   ├── POST /log
│   ├── GET /history
│   └── GET /balance
├── /ai-sakhi
│   ├── POST /chat
│   ├── GET /suggestions
│   └── GET /context
├── /voice
│   ├── POST /text-to-speech
│   ├── POST /speech-to-text
│   ├── POST /translate
│   └── POST /upload-audio
├── /reminders
│   ├── POST /trigger
│   ├── GET /status
│   └── GET /history
├── /admin
│   ├── GET /statistics
│   ├── GET /users
│   ├── GET /orders
│   ├── GET /labour
│   ├── POST /emergency-payout
│   └── POST /community-alert
├── /payments
│   ├── POST /request
│   ├── POST /process
│   ├── POST /advance
│   └── POST /webhook
└── /notifications
    ├── GET /
    ├── POST /
    └── PUT /:id/read
```

---

## 📦 DynamoDB Tables Required

All tables already defined in your CDK stack:
- ✅ `shebalance-users`
- ✅ `shebalance-artisan-profiles`
- ✅ `shebalance-buyer-profiles`
- ✅ `shebalance-corporate-profiles`
- ✅ `shebalance-orders`
- ✅ `shebalance-skillscan-results`
- ✅ `shebalance-labour-tracking`
- ✅ `shebalance-ai-conversations`
- ✅ `shebalance-notifications`
- ✅ `shebalance-reminders`

---

## 🔐 Authentication Flow

### Current (Express + JWT):
```
Frontend → Express Server → MySQL → JWT Token → LocalStorage
```

### AWS Migration Options:

#### Option 1: API Gateway + Lambda + JWT (Minimal Change)
```
Frontend → API Gateway → Lambda (auth-login) → DynamoDB → JWT Token → LocalStorage
```
**Pros:** Minimal frontend changes, existing JWT logic works  
**Cons:** Manual token management

#### Option 2: API Gateway + Cognito (Recommended)
```
Frontend → Cognito (Hosted UI) → ID Token → API Gateway (Cognito Authorizer) → Lambda
```
**Pros:** Built-in security, MFA, password reset, social login  
**Cons:** More frontend changes required

**Recommendation:** Start with Option 1, migrate to Option 2 later

---

## 🚀 Migration Strategy

### Phase 1: Core Authentication & User Management (Week 1)
- Deploy Lambda functions: auth-login, auth-register, user-get-profile, user-update-profile
- Set up API Gateway with CORS
- Update api-client.js to use API Gateway URL
- Test authentication flow

### Phase 2: Order Management (Week 2)
- Deploy Lambda functions: order-create, order-list, order-update-status, order-update-progress
- Update dashboard.js and buyer-dashboard.js
- Test order creation and updates

### Phase 3: AI Sakhi & Voice Services (Week 3)
- Deploy Lambda functions: ai-sakhi-chat, voice-text-to-speech, voice-speech-to-text
- Integrate Amazon Bedrock and Polly
- Update ai-sakhi-chat.js and voice-services.js

### Phase 4: Reminder System (Week 4)
- Deploy Step Functions workflow
- Deploy Lambda functions: reminder-orchestrator, reminder-send-whatsapp, reminder-generate-voice
- Set up EventBridge rules
- Test reminder flow

### Phase 5: Admin Dashboard & Analytics (Week 5)
- Deploy Lambda functions: admin-statistics, admin-users-list, admin-orders-list
- Update admin-dashboard.js
- Set up CloudWatch dashboards

---

## 📝 Frontend Changes Required

### 1. Update API Base URL
**File:** `api-client.js`
```javascript
// OLD
constructor(baseURL = 'http://localhost:5000/api') {

// NEW
constructor(baseURL = process.env.API_GATEWAY_URL || 'https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/api') {
```

### 2. Add Error Handling for AWS Errors
```javascript
async request(endpoint, options = {}) {
    try {
        const response = await fetch(url, { ...options, headers });
        const data = await response.json();
        
        if (!response.ok) {
            // Handle AWS-specific errors
            if (data.errorType === 'AccessDeniedException') {
                // Handle auth error
            }
            throw new Error(data.error || data.message || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}
```

### 3. Add Retry Logic for Transient Errors
```javascript
async requestWithRetry(endpoint, options = {}, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await this.request(endpoint, options);
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
        }
    }
}
```

### 4. Add File Upload Progress
```javascript
async submitSkillScan(category, imageFiles, onProgress) {
    const formData = new FormData();
    formData.append('category', category);
    
    for (let i = 0; i < imageFiles.length; i++) {
        formData.append('images', imageFiles[i]);
    }

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable && onProgress) {
                onProgress(Math.round((e.loaded / e.total) * 100));
            }
        });
        
        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                reject(new Error('Upload failed'));
            }
        });
        
        xhr.open('POST', `${this.baseURL}/skillscan/analyze`);
        xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
        xhr.send(formData);
    });
}
```

---

## 🔧 Environment Configuration

### Create `.env` file for frontend:
```env
# API Gateway
VITE_API_GATEWAY_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/api

# AWS Region
VITE_AWS_REGION=us-east-1

# S3 Bucket for uploads
VITE_S3_BUCKET=shebalance-uploads

# CloudFront Distribution
VITE_CLOUDFRONT_URL=https://your-distribution.cloudfront.net

# Feature Flags
VITE_ENABLE_AI_SAKHI=true
VITE_ENABLE_VOICE_ASSISTANT=true
VITE_ENABLE_WHATSAPP_REMINDERS=true
```

---

## ✅ Testing Checklist

### Authentication
- [ ] User registration works
- [ ] User login works
- [ ] Token refresh works
- [ ] Logout clears session
- [ ] Protected routes redirect to login

### Orders
- [ ] Create order works
- [ ] List orders works
- [ ] Update order status works
- [ ] Update order progress works
- [ ] Order notifications sent

### AI Sakhi
- [ ] Chat messages processed
- [ ] Context fetched correctly
- [ ] Intent detection works
- [ ] Actions triggered correctly

### Voice Services
- [ ] Text-to-speech works
- [ ] Speech-to-text works
- [ ] Translation works
- [ ] Audio upload works

### Reminders
- [ ] Reminders triggered on schedule
- [ ] WhatsApp messages sent
- [ ] Voice calls generated
- [ ] Community alerts sent

### Admin
- [ ] Statistics load correctly
- [ ] User management works
- [ ] Order management works
- [ ] Labour tracking visible
- [ ] Emergency payouts work

---

## 🎯 Next Steps

1. **Review this analysis** and confirm the integration points
2. **Prioritize Lambda functions** to build first
3. **Set up AWS infrastructure** (API Gateway, DynamoDB, S3)
4. **Create Lambda functions** one by one
5. **Update frontend files** to use AWS endpoints
6. **Test each integration** thoroughly
7. **Deploy to production** incrementally

---

## 📞 Support

For questions or clarifications, refer to:
- `BACKEND_ARCHITECTURE.md` - Overall architecture
- `aws-backend/ARCHITECTURE.md` - AWS-specific architecture
- `DATABASE_SETUP_GUIDE.md` - Database schema

---

**Generated:** March 5, 2026  
**Version:** 1.0  
**Status:** Ready for Implementation
