# 🚀 SHE-BALANCE Quick Start Guide

## Current Status: Backend Deployed! ✅

Your application is running with:
- ✅ Frontend: http://localhost:3000
- ✅ Backend API: http://localhost:5000
- ✅ API Client: Ready to use

## 🎯 What You Need to Do Now

### Step 1: Install MySQL (5 minutes)

**Option A: XAMPP (Easiest)**
1. Download XAMPP: https://www.apachefriends.org/download.html
2. Install it
3. Open XAMPP Control Panel
4. Click "Start" next to MySQL

**Option B: MySQL Standalone**
1. Download MySQL: https://dev.mysql.com/downloads/installer/
2. Install with default settings
3. Remember the root password you set

### Step 2: Initialize Database (1 minute)

Open a new terminal and run:

```bash
cd C:\Users\Usmani\Downloads\SheBalance-prototype--main\SHE-BALANCE-main\SHE-Balnce-main\backend
npm run init-db
```

This creates:
- Database: `shebalance`
- 18 tables
- 3 sample users

### Step 3: Test Login (30 seconds)

1. Go to http://localhost:3000
2. Try logging in with:
   - Email: `priya@example.com`
   - Password: `artisan123`

## 📋 Sample User Accounts

After database initialization:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shebalance.com | admin123 |
| Artisan | priya@example.com | artisan123 |
| Buyer | rahul@example.com | buyer123 |

## 🧪 Quick Tests

### Test 1: Backend Health

Open browser: http://localhost:5000/health

Should show:
```json
{"status":"OK","timestamp":"..."}
```

### Test 2: API Connection

Open browser console (F12) on http://localhost:3000 and run:

```javascript
// Test API
fetch('http://localhost:5000/health')
  .then(r => r.json())
  .then(console.log);
```

### Test 3: Login API (After database setup)

```javascript
api.login('priya@example.com', 'artisan123')
  .then(result => {
    console.log('Login successful!', result);
  })
  .catch(error => {
    console.error('Login failed:', error);
  });
```

## 📁 Project Structure

```
SHE-BALANCE-main/SHE-Balnce-main/
├── index.html              # Landing page
├── dashboard.html          # Artisan dashboard
├── skills.html             # SkillScan page
├── admin-dashboard.html    # Admin panel
├── api-client.js           # ✨ NEW: API client
│
├── backend/                # ✨ NEW: Backend server
│   ├── server.js           # API server
│   ├── database-schema.sql # Database structure
│   ├── api-client.js       # API client (copy)
│   ├── .env                # Configuration
│   ├── package.json        # Dependencies
│   └── scripts/
│       └── init-database.js # DB setup script
│
└── Documentation/
    ├── DATABASE_SETUP_GUIDE.md
    ├── BACKEND_ARCHITECTURE.md
    ├── DEPLOYMENT_SUCCESS.md
    └── QUICK_START.md (this file)
```

## 🔌 Connecting Frontend to Backend

### Add API Client to Your Pages

Add this line before your other scripts in HTML files:

```html
<script src="api-client.js"></script>
```

### Example: Update Login Function

```javascript
// Old way (localStorage only)
function login(email, password) {
    // Just stores in localStorage
    localStorage.setItem('user', JSON.stringify({email}));
}

// New way (with backend)
async function login(email, password) {
    try {
        const result = await api.login(email, password);
        localStorage.setItem('shebalance_user', JSON.stringify(result.user));
        window.location.href = 'dashboard.html';
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
}
```

## 🎨 Features Ready to Use

### ✅ Working Now (No Database Required)

- Frontend UI
- Page navigation
- Static content display
- Client-side validation

### 🔄 Ready After Database Setup

- User registration
- User login
- Profile management
- SkillScan with storage
- Order creation
- Labour tracking
- Admin dashboard with real data

## 🗄️ Database Tables

Once initialized, you'll have:

1. **users** - User accounts
2. **artisan_profiles** - Artisan data
3. **buyer_profiles** - Buyer data
4. **corporate_profiles** - Corporate clients
5. **products** - Artisan products
6. **orders** - Order management
7. **bulk_orders** - Corporate orders
8. **skillscan_results** - AI analysis
9. **learning_progress** - Learning tracking
10. **labour_tracking** - Labour hours
11. **ai_conversations** - AI Sakhi chats
12. **support_requests** - Support tickets
13. **payment_requests** - Payment requests
14. **transactions** - Financial records
15. **favorites** - Buyer favorites
16. **reviews** - Ratings & reviews
17. **notifications** - User notifications
18. **health_alerts** - AI monitoring

## 🔍 Verify Everything is Working

### Checklist

- [ ] Frontend loads at http://localhost:3000
- [ ] Backend responds at http://localhost:5000/health
- [ ] MySQL is running (XAMPP or standalone)
- [ ] Database initialized (`npm run init-db` completed)
- [ ] Can login with sample users
- [ ] API client loaded in browser console

### Check Backend Logs

The backend terminal should show:
```
🚀 SHE-BALANCE Backend Server running on port 5000
📊 Database: shebalance
🔗 API: http://localhost:5000
```

### Check Database

```bash
# Connect to MySQL
mysql -u root -p

# Check database
SHOW DATABASES;
USE shebalance;
SHOW TABLES;

# Check sample users
SELECT email, role FROM users;
```

## 🚨 Troubleshooting

### "Cannot connect to database"

**Problem**: MySQL not running
**Solution**: 
1. Open XAMPP Control Panel
2. Click "Start" next to MySQL
3. Run `npm run init-db` again

### "Port 5000 already in use"

**Problem**: Another app using port 5000
**Solution**:
1. Edit `backend/.env`
2. Change `PORT=5000` to `PORT=5001`
3. Update `api-client.js` baseURL to `http://localhost:5001/api`
4. Restart backend: `npm start`

### "npm: command not found"

**Problem**: Node.js not installed
**Solution**:
1. Download from https://nodejs.org/
2. Install LTS version
3. Restart terminal
4. Run `npm install` in backend folder

### Login returns "Invalid credentials"

**Problem**: Database not initialized
**Solution**: Run `npm run init-db` in backend folder

## 📊 What Happens When You Use Features

### When User Registers
```
Frontend → api.register() → Backend API → MySQL users table
```

### When SkillScan is Used
```
Frontend → Upload images → Backend API → Save to uploads/ folder
                                       → Save results to skillscan_results table
```

### When Order is Created
```
Buyer Dashboard → api.createOrder() → Backend API → orders table
                                                   → Notification to artisan
```

## 🎯 Next Steps

### Immediate (Today)

1. ✅ Install MySQL (XAMPP)
2. ✅ Run `npm run init-db`
3. ✅ Test login with sample users
4. ✅ Verify data in database

### Short-term (This Week)

1. Update index.html to use `api.login()`
2. Update dashboard.html to load real data
3. Connect SkillScan to save results
4. Test order creation flow

### Long-term (Production)

1. Deploy database to AWS RDS
2. Deploy backend to AWS Lambda/EC2
3. Connect AWS SageMaker for SkillScan
4. Add S3 for file storage
5. Enable email/SMS notifications

## 💡 Pro Tips

### View Database in Browser

1. Install XAMPP
2. Go to http://localhost/phpmyadmin
3. Select `shebalance` database
4. Browse tables and data

### Debug API Calls

```javascript
// Enable debug mode
localStorage.setItem('debug', 'true');

// All API calls will log to console
api.getProfile().then(console.log);
```

### Reset Database

```bash
cd backend
npm run init-db
# This recreates all tables and sample data
```

## 📞 Support

### Documentation Files

- `DATABASE_SETUP_GUIDE.md` - Detailed setup instructions
- `BACKEND_ARCHITECTURE.md` - System architecture
- `DEPLOYMENT_SUCCESS.md` - Deployment details
- `backend/README.md` - Backend API documentation

### Common Commands

```bash
# Start backend
cd backend
npm start

# Initialize database
npm run init-db

# Install dependencies
npm install

# Check Node.js version
node --version

# Check npm version
npm --version
```

## ✨ Summary

You're almost there! Just need to:

1. **Install MySQL** (XAMPP recommended)
2. **Run `npm run init-db`**
3. **Test login** with sample users

Then your app will have full database integration! 🎉

---

**Current Status**: Backend deployed and running. Database setup pending.
**Time to Complete**: ~10 minutes
**Difficulty**: Easy (just install XAMPP and run one command)
