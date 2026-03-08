# SheBalance Login Credentials

## Multi-User Type Authentication System

### Artisan/User Login
- **Email:** mariyam@gmail.com
- **Password:** mariyam123
- **Role:** Artisan/User
- **Access:** Standard user dashboard with artisan features
- **Dashboard:** dashboard.html

### Buyer Login
- **Email:** buyer@shebalance.com
- **Password:** buyer123
- **Role:** Buyer
- **Access:** Buyer dashboard to browse artisans and place orders
- **Dashboard:** buyer-dashboard.html

### Corporate Buyer Login
- **Email:** corporate@shebalance.com
- **Password:** corporate123
- **Role:** Corporate Buyer
- **Access:** Buyer dashboard with B2B features
- **Dashboard:** buyer-dashboard.html

### Admin Login
- **Email:** admin@shebalance.com
- **Password:** admin123
- **Role:** Admin
- **Access:** Admin dashboard with management features
- **Dashboard:** dashboard.html (with admin features)

## Signup (New User Registration)
You can also create a new account using the signup form:
1. Click "Join Now" or "Sign up" button
2. Fill in all required fields:
   - Full Name
   - Email (must be unique, not already registered)
   - Phone Number
   - **User Type** (NEW): Select from dropdown
     - Artisan/User
     - Buyer
     - Corporate Buyer
     - Admin
   - Preferred Language
   - Password (minimum 6 characters)
3. Click "Create Account"
4. You'll be automatically logged in and redirected to the appropriate dashboard based on your selected role

**Note:** Emails `mariyam@gmail.com`, `admin@shebalance.com`, `buyer@shebalance.com`, and `corporate@shebalance.com` are already registered and cannot be used for signup.

## Role-Based Dashboard Routing

### Artisan/User → dashboard.html
- Skill assessment
- Job opportunities
- Progress tracking
- Earnings management
- Food marketplace access

### Buyer/Corporate Buyer → buyer-dashboard.html
- Browse artisans by category
- Filter by skill level, price, location
- View artisan profiles and ratings
- Contact artisans
- Manage orders and favorites
- Track purchases

### Admin → dashboard.html
- User management
- Platform analytics
- Content moderation
- System settings

## Features
- ✅ Multi-user type authentication (4 roles)
- ✅ Role-based dashboard routing
- ✅ Email-based authentication
- ✅ Session management with localStorage
- ✅ Automatic redirect to appropriate dashboard after login/signup
- ✅ Logout functionality
- ✅ Protected dashboards (requires login)
- ✅ Role selection in signup form
- ✅ Form validation for signup
- ✅ Duplicate email detection
- ✅ Password strength requirement (min 6 characters)
- ✅ Separate buyer dashboard with artisan browsing
- ✅ Category filtering and search functionality

## How to Use

### Login:
1. Go to http://localhost:8000/index.html
2. Click "Login" button in the navigation
3. Enter one of the credentials above
4. You'll be redirected to the appropriate dashboard based on your role
5. Click "Logout" button to sign out

### Signup:
1. Go to http://localhost:8000/index.html
2. Click "Join Now" button in the navigation
3. Fill in the signup form with your details
4. **Select your user type** from the dropdown
5. Click "Create Account"
6. You'll be automatically logged in and redirected to the appropriate dashboard

## Dashboard Access

### For Artisans/Users:
- Login → dashboard.html
- Features: Skill assessment, job matching, earnings tracking

### For Buyers:
- Login → buyer-dashboard.html
- Features: Browse artisans, filter by category, contact artisans, manage orders

### For Corporate Buyers:
- Login → buyer-dashboard.html
- Features: Same as buyers with B2B focus

### For Admins:
- Login → dashboard.html
- Features: Platform management, user administration

## Security Note
This is a demo implementation. In production:
- Use proper backend authentication
- Hash passwords
- Use JWT tokens or session cookies
- Implement HTTPS
- Add rate limiting
- Add password reset functionality
- Add email verification
- Store user data in a database
- Implement role-based access control (RBAC)
- Add two-factor authentication (2FA)

