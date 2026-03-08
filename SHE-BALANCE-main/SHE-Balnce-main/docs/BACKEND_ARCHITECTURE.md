# 🏗️ SHE-BALANCE Backend Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                            │
│  (Running on http://localhost:3000)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Landing  │  │Dashboard │  │  Admin   │  │  Buyer   │       │
│  │   Page   │  │ (Artisan)│  │Dashboard │  │Dashboard │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │             │              │              │              │
│       └─────────────┴──────────────┴──────────────┘              │
│                          │                                       │
│                   ┌──────▼──────┐                               │
│                   │ API Client  │                               │
│                   │(api-client.js)                              │
│                   └──────┬──────┘                               │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           │ HTTP/REST API
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                      BACKEND LAYER                               │
│  (Running on http://localhost:5000)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Express.js API Server                      │    │
│  │                  (server.js)                            │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │                                                          │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │    │
│  │  │   Auth   │  │  Users   │  │ Artisans │            │    │
│  │  │  Routes  │  │  Routes  │  │  Routes  │            │    │
│  │  └──────────┘  └──────────┘  └──────────┘            │    │
│  │                                                          │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │    │
│  │  │SkillScan │  │  Orders  │  │  Labour  │            │    │
│  │  │  Routes  │  │  Routes  │  │  Routes  │            │    │
│  │  └──────────┘  └──────────┘  └──────────┘            │    │
│  │                                                          │    │
│  │  ┌──────────┐  ┌──────────┐                           │    │
│  │  │  Admin   │  │   File   │                           │    │
│  │  │  Routes  │  │  Upload  │                           │    │
│  │  └──────────┘  └──────────┘                           │    │
│  │                                                          │    │
│  └────────────────────┬─────────────────────────────────┘    │
│                       │                                        │
│              ┌────────▼────────┐                              │
│              │  JWT Auth       │                              │
│              │  Middleware     │                              │
│              └────────┬────────┘                              │
└───────────────────────┼───────────────────────────────────────┘
                        │
                        │ SQL Queries
                        │
┌───────────────────────▼───────────────────────────────────────┐
│                    DATABASE LAYER                              │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              MySQL Database                           │    │
│  │              (shebalance)                             │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │                                                        │    │
│  │  Core Tables:                                         │    │
│  │  ├─ users                                             │    │
│  │  ├─ artisan_profiles                                  │    │
│  │  ├─ buyer_profiles                                    │    │
│  │  ├─ corporate_profiles                                │    │
│  │  ├─ products                                          │    │
│  │  ├─ orders                                            │    │
│  │  ├─ bulk_orders                                       │    │
│  │  ├─ skillscan_results                                 │    │
│  │  ├─ learning_progress                                 │    │
│  │  ├─ labour_tracking                                   │    │
│  │  ├─ ai_conversations                                  │    │
│  │  ├─ support_requests                                  │    │
│  │  ├─ payment_requests                                  │    │
│  │  ├─ transactions                                      │    │
│  │  ├─ favorites                                         │    │
│  │  ├─ reviews                                           │    │
│  │  ├─ notifications                                     │    │
│  │  └─ health_alerts                                     │    │
│  │                                                        │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### 1. User Login Flow

```
User enters credentials
        │
        ▼
Frontend (index.html)
        │
        ▼
api.login(email, password)
        │
        ▼
POST /api/auth/login
        │
        ▼
Backend validates credentials
        │
        ▼
Query users table
        │
        ▼
Generate JWT token
        │
        ▼
Return token + user data
        │
        ▼
Frontend stores token
        │
        ▼
Redirect to dashboard
```

### 2. SkillScan Analysis Flow

```
User uploads images
        │
        ▼
Frontend (skills.html)
        │
        ▼
api.submitSkillScan(category, files)
        │
        ▼
POST /api/skillscan/analyze
        │
        ▼
Backend receives files
        │
        ▼
Save images to uploads/
        │
        ▼
[Future: Call AWS SageMaker]
        │
        ▼
Generate analysis results
        │
        ▼
Save to skillscan_results table
        │
        ▼
Return analysis to frontend
        │
        ▼
Display results to user
```

### 3. Order Creation Flow

```
Buyer selects artisan/product
        │
        ▼
Frontend (buyer-dashboard.html)
        │
        ▼
api.createOrder(orderData)
        │
        ▼
POST /api/orders
        │
        ▼
Backend validates data
        │
        ▼
Insert into orders table
        │
        ▼
Create notification for artisan
        │
        ▼
Return order confirmation
        │
        ▼
Update UI with new order
```

## API Endpoints Map

### Authentication Endpoints
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
```

### User Endpoints
```
GET    /api/users/profile    - Get current user profile
PUT    /api/users/profile    - Update user profile
```

### Artisan Endpoints
```
GET    /api/artisans          - List all artisans (with filters)
GET    /api/artisans/:id      - Get specific artisan details
```

### SkillScan Endpoints
```
POST   /api/skillscan/analyze - Submit images for analysis
GET    /api/skillscan/history - Get user's scan history
```

### Order Endpoints
```
POST   /api/orders            - Create new order
GET    /api/orders            - Get user's orders
PUT    /api/orders/:id/status - Update order status
```

### Labour Tracking Endpoints
```
POST   /api/labour/log        - Log labour hours
GET    /api/labour/history    - Get labour history
```

### Admin Endpoints
```
GET    /api/admin/users       - Get all users (admin only)
GET    /api/admin/statistics  - Get platform stats (admin only)
```

## Database Relationships

```
users (1) ──────────── (1) artisan_profiles
  │                            │
  │                            │
  │                            ├─── (many) products
  │                            │
  │                            ├─── (many) skillscan_results
  │                            │
  │                            ├─── (many) labour_tracking
  │                            │
  │                            └─── (many) orders (as artisan)
  │
  ├────────────── (1) buyer_profiles
  │                     │
  │                     ├─── (many) orders (as buyer)
  │                     │
  │                     ├─── (many) favorites
  │                     │
  │                     └─── (many) reviews
  │
  ├────────────── (1) corporate_profiles
  │                     │
  │                     └─── (many) bulk_orders
  │
  └────────────── (many) ai_conversations
                  │
                  └─── (many) notifications
```

## Security Architecture

```
┌─────────────────────────────────────────┐
│         Security Layers                  │
├─────────────────────────────────────────┤
│                                          │
│  1. HTTPS/TLS                           │
│     └─ Encrypted communication          │
│                                          │
│  2. JWT Authentication                  │
│     ├─ Token-based auth                 │
│     ├─ 7-day expiration                 │
│     └─ Signed with secret key           │
│                                          │
│  3. Password Hashing                    │
│     └─ bcrypt with salt rounds          │
│                                          │
│  4. Input Validation                    │
│     ├─ SQL injection prevention         │
│     ├─ XSS protection                   │
│     └─ File type validation             │
│                                          │
│  5. Role-Based Access Control           │
│     ├─ Admin routes protected           │
│     ├─ User-specific data access        │
│     └─ Resource ownership validation    │
│                                          │
│  6. Rate Limiting (Future)              │
│     └─ Prevent abuse/DDoS               │
│                                          │
└─────────────────────────────────────────┘
```

## File Storage Architecture

### Current (Local Development)
```
uploads/
  ├── skillscan/
  │   ├── user1-image1.jpg
  │   └── user1-image2.jpg
  ├── profiles/
  │   └── user1-avatar.jpg
  └── products/
      └── product1-image.jpg
```

### Future (AWS Production)
```
S3 Bucket: shebalance-uploads
  ├── skillscan/
  ├── profiles/
  └── products/

CloudFront CDN
  └── Fast global delivery
```

## AWS Integration Points (Future)

```
┌─────────────────────────────────────────────────────────┐
│              Current Backend (Local)                     │
│                                                          │
│  ┌──────────────┐      ┌──────────────┐               │
│  │   MySQL      │      │  Local Files │               │
│  │   Database   │      │   (uploads/) │               │
│  └──────────────┘      └──────────────┘               │
└─────────────────────────────────────────────────────────┘

                        ↓ Migration ↓

┌─────────────────────────────────────────────────────────┐
│              AWS Production Backend                      │
│                                                          │
│  ┌──────────────┐      ┌──────────────┐               │
│  │  RDS MySQL   │      │   S3 Bucket  │               │
│  │      or      │      │  + CloudFront│               │
│  │  DynamoDB    │      └──────────────┘               │
│  └──────────────┘                                       │
│                                                          │
│  ┌──────────────┐      ┌──────────────┐               │
│  │  SageMaker   │      │   Lambda     │               │
│  │  (SkillScan) │      │  (AI Sakhi)  │               │
│  └──────────────┘      └──────────────┘               │
│                                                          │
│  ┌──────────────┐      ┌──────────────┐               │
│  │     SNS      │      │     SES      │               │
│  │(Notifications)│      │   (Email)    │               │
│  └──────────────┘      └──────────────┘               │
└─────────────────────────────────────────────────────────┘
```

## Performance Considerations

### Database Indexing
- Indexed on: email, user_id, artisan_id, buyer_id, order_id
- Composite indexes for common queries
- Full-text search on product descriptions (future)

### Caching Strategy (Future)
```
Redis Cache
  ├── User sessions
  ├── Frequently accessed artisan profiles
  ├── Product listings
  └── Platform statistics
```

### Load Balancing (Production)
```
                    Load Balancer
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   Server 1         Server 2         Server 3
        │                │                │
        └────────────────┴────────────────┘
                         │
                   Database Pool
```

## Monitoring & Logging

### Current Logging
- Console logs for development
- Error tracking in terminal

### Production Monitoring (Future)
```
CloudWatch
  ├── API response times
  ├── Error rates
  ├── Database query performance
  └── Server resource usage

Application Logs
  ├── User actions
  ├── API requests
  ├── Errors and exceptions
  └── Security events
```

## Backup Strategy

### Development
- Manual MySQL dumps
- Git version control for code

### Production (Recommended)
```
Automated Backups
  ├── Daily database snapshots
  ├── S3 file backups
  ├── 30-day retention
  └── Cross-region replication
```

## Scalability Path

### Phase 1: Current (Single Server)
- Handles ~100 concurrent users
- Local MySQL database
- Single Node.js instance

### Phase 2: Vertical Scaling
- Upgrade server resources
- Optimize database queries
- Add Redis caching
- Handles ~1,000 concurrent users

### Phase 3: Horizontal Scaling
- Multiple API servers
- Load balancer
- Database read replicas
- CDN for static assets
- Handles ~10,000+ concurrent users

### Phase 4: Microservices (Future)
```
API Gateway
  ├── User Service
  ├── Order Service
  ├── SkillScan Service
  ├── Payment Service
  └── Notification Service
```

---

**This architecture provides a solid foundation that can scale from development to production!** 🚀
