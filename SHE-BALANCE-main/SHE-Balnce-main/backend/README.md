# SHE-BALANCE Backend API

Complete backend solution for the SHE-BALANCE platform with database integration.

## 🚀 Quick Start

### Option 1: Local Development (MySQL)

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Setup Environment Variables**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Install MySQL**
- Download and install MySQL from https://dev.mysql.com/downloads/
- Or use XAMPP/WAMP which includes MySQL

4. **Initialize Database**
```bash
npm run init-db
```

This will:
- Create the `shebalance` database
- Create all required tables
- Insert sample users (admin, artisan, buyer)

5. **Start Server**
```bash
npm start
# Or for development with auto-reload:
npm run dev
```

Server will run on http://localhost:5000

### Option 2: AWS DynamoDB (Production)

1. **Configure AWS Credentials**
```bash
# Add to .env file:
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

2. **Create DynamoDB Tables**
```bash
node aws-dynamodb-setup.js create
```

3. **Deploy to AWS Lambda** (optional)
Use AWS SAM or Serverless Framework to deploy the API as Lambda functions.

## 📊 Database Schema

### Core Tables

1. **users** - All platform users
2. **artisan_profiles** - Artisan-specific data
3. **buyer_profiles** - Buyer-specific data
4. **corporate_profiles** - Corporate client data
5. **products** - Artisan products/services
6. **orders** - Order management
7. **bulk_orders** - Corporate bulk orders
8. **skillscan_results** - AI skill analysis results
9. **learning_progress** - Learning tracking
10. **labour_tracking** - Invisible labour hours
11. **ai_conversations** - AI Sakhi chat history
12. **support_requests** - Support tickets
13. **payment_requests** - Payment/advance requests
14. **transactions** - Financial transactions
15. **favorites** - Buyer favorites
16. **reviews** - Ratings and reviews
17. **notifications** - User notifications
18. **health_alerts** - AI health monitoring

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

### Artisans
- `GET /api/artisans` - List all artisans
- `GET /api/artisans/:id` - Get artisan details

### SkillScan
- `POST /api/skillscan/analyze` - Submit skill analysis
- `GET /api/skillscan/history` - Get scan history

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `PUT /api/orders/:id/status` - Update order status

### Labour Tracking
- `POST /api/labour/log` - Log labour hours
- `GET /api/labour/history` - Get labour history

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/statistics` - Platform statistics

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

**Login Flow:**
1. User logs in with email/password
2. Server returns JWT token
3. Client stores token in localStorage
4. Client includes token in Authorization header for protected routes

**Example:**
```javascript
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 💻 Frontend Integration

### Using the API Client

Include `api-client.js` in your HTML:

```html
<script src="backend/api-client.js"></script>
```

### Example Usage

```javascript
// Login
const result = await api.login('priya@example.com', 'artisan123');
console.log('Logged in:', result.user);

// Get profile
const profile = await api.getProfile();
console.log('Profile:', profile);

// Submit SkillScan
const fileInput = document.getElementById('fileInput');
const files = fileInput.files;
const analysis = await api.submitSkillScan('embroidery', files);
console.log('Analysis:', analysis);

// Create order
const order = await api.createOrder({
    artisanId: 'artisan-id-here',
    title: 'Custom Embroidered Saree',
    quantity: 1,
    unitPrice: 5000
});
```

## 🧪 Sample Users

After running `npm run init-db`, you'll have these test accounts:

**Admin:**
- Email: admin@shebalance.com
- Password: admin123

**Artisan:**
- Email: priya@example.com
- Password: artisan123

**Buyer:**
- Email: rahul@example.com
- Password: buyer123

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| DB_HOST | Database host | localhost |
| DB_USER | Database user | root |
| DB_PASSWORD | Database password | (empty) |
| DB_NAME | Database name | shebalance |
| JWT_SECRET | JWT signing secret | (change in production) |
| AWS_REGION | AWS region | us-east-1 |

## 📁 Project Structure

```
backend/
├── server.js              # Main Express server
├── api-client.js          # Frontend API client
├── database-schema.sql    # MySQL schema
├── aws-dynamodb-setup.js  # DynamoDB setup
├── package.json           # Dependencies
├── .env.example           # Environment template
├── scripts/
│   └── init-database.js   # DB initialization
└── README.md             # This file
```

## 🚀 Deployment

### Local/VPS Deployment

1. Install Node.js and MySQL on server
2. Clone repository
3. Run `npm install`
4. Configure `.env` file
5. Run `npm run init-db`
6. Use PM2 to keep server running:
```bash
npm install -g pm2
pm2 start server.js --name shebalance-api
pm2 save
pm2 startup
```

### AWS Deployment

1. **Database**: Use RDS (MySQL) or DynamoDB
2. **API**: Deploy to Lambda + API Gateway or EC2
3. **Files**: Use S3 for image uploads
4. **CDN**: Use CloudFront for static assets

## 🔒 Security Best Practices

1. **Change JWT_SECRET** in production
2. **Use HTTPS** for all API calls
3. **Validate all inputs** on server side
4. **Rate limit** API endpoints
5. **Sanitize** user-uploaded files
6. **Use environment variables** for secrets
7. **Enable CORS** only for trusted domains

## 📝 API Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message here"
}
```

## 🐛 Troubleshooting

### Database Connection Failed
- Check MySQL is running
- Verify credentials in `.env`
- Ensure database exists

### Port Already in Use
- Change PORT in `.env`
- Or kill process using port 5000

### JWT Token Invalid
- Token may have expired (7 days)
- User needs to login again

## 📞 Support

For issues or questions:
1. Check this README
2. Review error logs
3. Contact development team

## 📄 License

MIT License - SHE-BALANCE Platform
