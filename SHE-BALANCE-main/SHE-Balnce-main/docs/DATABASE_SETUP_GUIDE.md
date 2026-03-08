# 🗄️ SHE-BALANCE Database Setup Guide

Complete guide to set up the database backend for your SHE-BALANCE application.

## 📋 What's Been Created

Your backend now includes:

1. **MySQL Database Schema** (`backend/database-schema.sql`)
   - 18 comprehensive tables
   - User management, orders, SkillScan, labour tracking, and more

2. **Node.js API Server** (`backend/server.js`)
   - RESTful API with authentication
   - File upload support
   - JWT-based security

3. **Frontend API Client** (`backend/api-client.js`)
   - Easy-to-use JavaScript client
   - Works with your existing HTML/JS files

4. **AWS DynamoDB Option** (`backend/aws-dynamodb-setup.js`)
   - For serverless/production deployment

## 🚀 Quick Start (5 Minutes)

### Step 1: Install MySQL

**Windows:**
1. Download XAMPP from https://www.apachefriends.org/
2. Install and start MySQL from XAMPP Control Panel

**Mac:**
```bash
brew install mysql
brew services start mysql
```

**Linux:**
```bash
sudo apt-get install mysql-server
sudo systemctl start mysql
```

### Step 2: Install Node.js

Download from https://nodejs.org/ (LTS version recommended)

### Step 3: Setup Backend

```bash
# Navigate to backend folder
cd SHE-BALANCE-main/SHE-Balnce-main/backend

# Install dependencies
npm install

# Create environment file
copy .env.example .env

# Edit .env with your MySQL password (if any)
# For XAMPP, usually no password needed

# Initialize database (creates tables and sample users)
npm run init-db
```

### Step 4: Start Backend Server

```bash
npm start
```

You should see:
```
🚀 SHE-BALANCE Backend Server running on port 5000
📊 Database: shebalance
🔗 API: http://localhost:5000
```

### Step 5: Connect Frontend to Backend

Add this to your HTML files (before other scripts):

```html
<script src="backend/api-client.js"></script>
```

## 💡 Testing the Backend

### Test 1: Check Server Health

Open browser: http://localhost:5000/health

Should show:
```json
{
  "status": "OK",
  "timestamp": "2026-03-02T..."
}
```

### Test 2: Login with Sample User

Open browser console and run:

```javascript
// Login as artisan
const result = await api.login('priya@example.com', 'artisan123');
console.log('Logged in:', result);

// Get profile
const profile = await api.getProfile();
console.log('Profile:', profile);
```

### Test 3: Test SkillScan Upload

In your `skills.html` page, the SkillScan feature will now save to database:

```javascript
// This will now save to backend
async function startSkillScanAnalysis() {
    const files = uploadedFiles;
    const category = selectedCategory;
    
    try {
        const result = await api.submitSkillScan(category, files);
        console.log('Analysis saved to database:', result);
    } catch (error) {
        console.error('Error:', error);
    }
}
```

## 🔌 Integrating with Your Pages

### Dashboard Page

```javascript
// In dashboard.js
async function loadUserData() {
    try {
        const { user, profile } = await api.getProfile();
        document.getElementById('userName').textContent = user.full_name;
        // Update UI with real data
    } catch (error) {
        console.error('Failed to load profile:', error);
    }
}

// Load orders
async function loadOrders() {
    try {
        const { orders } = await api.getOrders();
        // Display orders in UI
    } catch (error) {
        console.error('Failed to load orders:', error);
    }
}
```

### Admin Dashboard

```javascript
// In admin-dashboard.js
async function loadPlatformStats() {
    try {
        const stats = await api.getPlatformStatistics();
        document.getElementById('totalUsers').textContent = stats.totalUsers;
        document.getElementById('activeArtisans').textContent = stats.activeArtisans;
        // Update other stats
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

async function loadAllUsers() {
    try {
        const { users } = await api.getAllUsers();
        // Display users in table
    } catch (error) {
        console.error('Failed to load users:', error);
    }
}
```

### Skills Page (SkillScan)

```javascript
// In skills.js - Update the analysis function
async function startSkillScanAnalysis() {
    if (!selectedCategory || uploadedFiles.length === 0) {
        showNotification('Please select category and upload images', 'warning');
        return;
    }
    
    showAnalysisLoading();
    
    try {
        // Submit to backend
        const result = await api.submitSkillScan(selectedCategory, uploadedFiles);
        
        // Display results
        displayAnalysisResults(result.analysis);
        
        showNotification('Analysis saved to your profile!', 'success');
    } catch (error) {
        console.error('SkillScan error:', error);
        showNotification('Analysis failed. Please try again.', 'error');
    }
}
```

## 📊 Database Tables Overview

### Key Tables You'll Use Most:

1. **users** - All user accounts
   - Stores email, password, role (artisan/buyer/corporate/admin)

2. **artisan_profiles** - Artisan details
   - Skills, location, rating, verification status

3. **orders** - Order management
   - Buyer orders, artisan work, status tracking

4. **skillscan_results** - AI skill analysis
   - Stores SkillScan results with scores and recommendations

5. **labour_tracking** - Invisible labour hours
   - Tracks craft hours + household hours

6. **ai_conversations** - AI Sakhi chat
   - Stores conversation history

## 🔐 Sample User Accounts

After running `npm run init-db`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shebalance.com | admin123 |
| Artisan | priya@example.com | artisan123 |
| Buyer | rahul@example.com | buyer123 |

## 🎯 Next Steps

### 1. Update Login Page

Replace localStorage-only auth with real backend:

```javascript
// In your login form handler
async function handleLogin(email, password) {
    try {
        const result = await api.login(email, password);
        
        // Store user data
        localStorage.setItem('shebalance_user', JSON.stringify(result.user));
        
        // Redirect based on role
        if (result.user.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else if (result.user.role === 'artisan') {
            window.location.href = 'dashboard.html';
        } else if (result.user.role === 'buyer') {
            window.location.href = 'buyer-dashboard.html';
        }
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
}
```

### 2. Update Registration

```javascript
async function handleRegister(formData) {
    try {
        const result = await api.register({
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
            phone: formData.phone,
            role: formData.role
        });
        
        alert('Registration successful!');
        window.location.href = 'dashboard.html';
    } catch (error) {
        alert('Registration failed: ' + error.message);
    }
}
```

### 3. Protect Pages

Add authentication check to all protected pages:

```javascript
// At top of dashboard.js, admin-dashboard.js, etc.
async function checkAuth() {
    try {
        const profile = await api.getProfile();
        return profile;
    } catch (error) {
        // Not authenticated, redirect to login
        window.location.href = 'index.html';
    }
}

// Call on page load
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    // Load page content
});
```

## 🔧 Troubleshooting

### "Cannot connect to database"
- Make sure MySQL is running (check XAMPP Control Panel)
- Verify DB_PASSWORD in `.env` file
- Try: `mysql -u root -p` to test connection

### "Port 5000 already in use"
- Change PORT in `.env` to 5001 or another port
- Update API client baseURL accordingly

### "npm: command not found"
- Install Node.js from https://nodejs.org/
- Restart terminal after installation

### "Module not found"
- Run `npm install` in backend folder
- Make sure you're in the correct directory

## 🚀 Production Deployment

### Option 1: Traditional Server (VPS/EC2)

1. Install Node.js and MySQL on server
2. Upload backend folder
3. Run `npm install --production`
4. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start server.js
pm2 save
```

### Option 2: AWS Serverless

1. Use AWS RDS for MySQL database
2. Deploy API to AWS Lambda + API Gateway
3. Use S3 for file uploads
4. Run DynamoDB setup instead of MySQL:
```bash
node aws-dynamodb-setup.js create
```

## 📞 Need Help?

Common issues and solutions:

1. **Database not created**: Run `npm run init-db` again
2. **Login not working**: Check if backend server is running
3. **CORS errors**: Make sure frontend and backend are on same domain or configure CORS
4. **File upload fails**: Check `uploads/` folder exists and has write permissions

## ✅ Verification Checklist

- [ ] MySQL installed and running
- [ ] Node.js installed
- [ ] Backend dependencies installed (`npm install`)
- [ ] Database initialized (`npm run init-db`)
- [ ] Backend server running (`npm start`)
- [ ] Can access http://localhost:5000/health
- [ ] Can login with sample users
- [ ] Frontend connected to backend

---

**Your app is now running with a real database backend!** 🎉

The frontend (http://localhost:3000) and backend (http://localhost:5000) are both running. Test the features and let me know which areas need AWS integration next.
