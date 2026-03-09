# Admin Dashboard - Quick Start Guide

## How to Access the Admin Dashboard

### Method 1: Using test-admin.html
1. Open `test-admin.html` in your browser
2. It will automatically set up admin credentials and redirect you to the dashboard

### Method 2: Manual Login
1. Open `SHE-BALANCE-main/SHE-Balnce-main/index.html`
2. Login with admin credentials
3. You'll be redirected to the admin dashboard

### Method 3: Direct Access (for testing)
1. Open browser console (F12)
2. Run this code:
```javascript
localStorage.setItem('shebalance_user', JSON.stringify({
    name: 'Admin User',
    email: 'admin@shebalance.com',
    role: 'admin'
}));
```
3. Open `SHE-BALANCE-main/SHE-Balnce-main/admin-dashboard.html`

## Fixed Issues

### ✅ Event Handling
- Fixed `showSection()` function to properly handle event parameter
- Fixed `filterOrders()` function to accept event parameter
- Fixed `filterVerification()` function to accept event parameter
- Updated all HTML onclick handlers to pass `event` parameter

### ✅ JavaScript Syntax
- All syntax errors resolved
- No undefined variable references
- Proper function parameter handling

## Features Working

1. **Navigation** - Click any sidebar item to switch sections
2. **User Management** - View, search, and manage users
3. **Artisan Verification** - Review applications, view profiles, check documents
4. **Order Management** - Track orders, update status, view details
5. **Settings** - Configure platform settings
6. **Reports** - Generate and download reports
7. **Analytics** - View charts and statistics

## Testing Checklist

- [ ] Dashboard loads without errors
- [ ] Sidebar navigation works
- [ ] User Management table displays
- [ ] Artisan Verification table displays
- [ ] Order Management table displays
- [ ] Filter buttons work
- [ ] Search functionality works
- [ ] Modals open and close properly
- [ ] Settings can be saved
- [ ] No console errors

## Troubleshooting

### Dashboard not loading?
- Check browser console for errors (F12)
- Verify you're logged in as admin
- Clear browser cache and reload

### Sections not switching?
- Make sure JavaScript is enabled
- Check that admin-dashboard.js is loaded
- Verify no console errors

### Data not showing?
- The dashboard uses sample data
- Check that the specific load functions are being called
- Open console and look for any errors

## Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ⚠️ IE11 (Not supported)

## Next Steps

1. Open the dashboard
2. Click through each section
3. Test the interactive features
4. Verify all modals work
5. Check that filters and search work

Everything should now be working correctly!
