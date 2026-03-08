# SheBalance Login Credentials

## User Login
- **Email:** mariyam@gmail.com
- **Password:** mariyam123
- **Role:** User
- **Access:** Standard user dashboard with all features

## Admin Login
- **Email:** admin@shebalance.com
- **Password:** admin123
- **Role:** Admin
- **Access:** Admin dashboard with additional management features

## Signup (New User Registration)
You can also create a new account using the signup form:
1. Click "Join Now" or "Sign up" button
2. Fill in all required fields:
   - Full Name
   - Email (must be unique, not already registered)
   - Phone Number
   - Preferred Language
   - Password (minimum 6 characters)
3. Click "Create Account"
4. You'll be automatically logged in and redirected to dashboard

**Note:** Emails `mariyam@gmail.com` and `admin@shebalance.com` are already registered and cannot be used for signup.

## Features
- ✅ Email-based authentication
- ✅ Role-based access (User/Admin)
- ✅ Session management with localStorage
- ✅ Automatic redirect to dashboard after login/signup
- ✅ Logout functionality
- ✅ Protected dashboard (requires login)
- ✅ Admin badge display for admin users
- ✅ Form validation for signup
- ✅ Duplicate email detection
- ✅ Password strength requirement (min 6 characters)

## How to Use

### Login:
1. Go to http://localhost:8000/index.html
2. Click "Login" button in the navigation
3. Enter one of the credentials above
4. You'll be redirected to the dashboard
5. Click "Logout" button to sign out

### Signup:
1. Go to http://localhost:8000/index.html
2. Click "Join Now" button in the navigation
3. Fill in the signup form with your details
4. Click "Create Account"
5. You'll be automatically logged in and redirected to dashboard

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
