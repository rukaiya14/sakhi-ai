# 🚀 Database Quick Start Guide

## 1. Test the Database (2 minutes)

Open the integration example in your browser:
```
http://localhost:3000/database/integration-example.html
```

This page lets you:
- ✅ Create users
- ✅ Save SkillScan results
- ✅ Create products
- ✅ Manage orders
- ✅ View all data

## 2. Add Database to Your Existing Pages

Add these two lines to any HTML page:

```html
<script src="database/db-config.js"></script>
<script src="database/api-client.js"></script>
```

## 3. Common Operations

### Save SkillScan Result
```javascript
// After user uploads images and gets analysis
await api.saveSkillScanResult(artisanId, {
    category: 'embroidery',
    overallScore: 75,
    skillLevel: 'Intermediate',
    breakdown: {
        'Technique Quality': 80,
        'Pattern Complexity': 70
    },
    strengths: ['Good stitch work', 'Creative patterns'],
    improvements: ['Try complex designs', 'Work on finishing']
});
```

### Get Artisan's Scans
```javascript
const scans = await db.query('skillScanResults', { 
    artisan_id: 'ART123' 
});
console.log('Artisan has', scans.length, 'scans');
```

### Create Order
```javascript
const orderId = db.generateId('ORD');
await db.save('orders', {
    order_id: orderId,
    buyer_id: buyerId,
    artisan_id: artisanId,
    product_id: productId,
    quantity: 1,
    total_amount: 2500,
    status: 'pending'
}, orderId);
```

### Send Message
```javascript
const messageId = db.generateId('MSG');
await db.save('messages', {
    message_id: messageId,
    sender_id: currentUserId,
    receiver_id: recipientId,
    message_text: 'Hello! I love your work!',
    is_read: false
}, messageId);
```

## 4. Where to Add Database Integration

### skills.html (SkillScan Page)
After analysis completes, save results:
```javascript
// In your existing startSkillScanAnalysis() function
async function startSkillScanAnalysis() {
    // ... existing analysis code ...
    
    // Save to database
    const currentUser = api.getCurrentUser();
    if (currentUser) {
        await api.saveSkillScanResult(currentUser.userId, {
            category: selectedCategory,
            overallScore: analysis.overallScore,
            skillLevel: analysis.skillLevel,
            breakdown: analysis.breakdown,
            strengths: analysis.strengths,
            improvements: analysis.improvements
        });
    }
}
```

### dashboard.html (Artisan Dashboard)
Load artisan's data:
```javascript
async function loadDashboardData() {
    const currentUser = api.getCurrentUser();
    if (!currentUser) return;
    
    // Get artisan profile
    const profile = await api.getArtisanProfile(currentUser.userId);
    
    // Get orders
    const orders = await db.query('orders', { 
        artisan_id: profile.artisan_id 
    });
    
    // Get skill scans
    const scans = await db.query('skillScanResults', { 
        artisan_id: profile.artisan_id 
    });
    
    // Update UI with data
    displayOrders(orders);
    displaySkillProgress(scans);
}
```

### admin-dashboard.html (Admin Dashboard)
Load all artisans and their data:
```javascript
async function loadArtisanVerification() {
    // Get all artisans pending verification
    const artisans = await db.query('artisanProfiles', { 
        verification_status: 'pending' 
    });
    
    // Get their skill scans
    for (const artisan of artisans) {
        const scans = await db.query('skillScanResults', { 
            artisan_id: artisan.artisan_id 
        });
        artisan.skillScans = scans;
    }
    
    // Display in UI
    displayArtisansForVerification(artisans);
}
```

### food-marketplace.html (Marketplace)
Load products:
```javascript
async function loadMarketplaceProducts() {
    // Get all active products
    const products = await db.query('products', { 
        status: 'active',
        category: 'food'
    });
    
    // Display products
    displayProducts(products);
}
```

## 5. Switch to AWS Production

When ready to deploy:

1. Deploy DynamoDB tables:
```bash
cd database
deploy-dynamodb.bat
```

2. Update configuration in `db-config.js`:
```javascript
const DB_CONFIG = {
    environment: 'production', // Change this
    aws: {
        apiEndpoint: 'https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod'
    }
};
```

3. No code changes needed! The API automatically switches to AWS.

## 6. View Your Data

### In Browser Console
```javascript
// See all users
db.query('users').then(console.log);

// See all products
db.query('products').then(console.log);

// See specific artisan's scans
db.query('skillScanResults', { artisan_id: 'ART123' }).then(console.log);
```

### In localStorage (Chrome DevTools)
1. Open DevTools (F12)
2. Go to Application tab
3. Click Local Storage
4. See all `shebalance_*` entries

## 7. Common Patterns

### Check if user is logged in
```javascript
const currentUser = api.getCurrentUser();
if (!currentUser) {
    window.location.href = 'index.html';
    return;
}
```

### Get user's role-specific data
```javascript
const currentUser = api.getCurrentUser();

if (currentUser.role === 'artisan') {
    const profile = await api.getArtisanProfile(currentUser.userId);
    const orders = await db.query('orders', { artisan_id: profile.artisan_id });
} else if (currentUser.role === 'buyer') {
    const orders = await db.query('orders', { buyer_id: currentUser.userId });
}
```

### Update record
```javascript
// Update order status
await db.update('orders', orderId, { 
    status: 'completed',
    completed_date: new Date().toISOString()
});

// Update artisan profile
await db.update('artisanProfiles', artisanId, { 
    total_orders: profile.total_orders + 1,
    total_earnings: profile.total_earnings + orderAmount
});
```

## 8. Troubleshooting

**Data not saving?**
- Check browser console for errors
- Verify you're calling `await` on async functions
- Make sure IDs are unique

**Can't see data?**
- Open integration-example.html to view all data
- Check localStorage in DevTools
- Verify table names match exactly

**Need to reset?**
- Open integration-example.html
- Click "Clear All Data" button
- Or run: `localStorage.clear()`

## 9. Next Steps

1. ✅ Test database with integration-example.html
2. ✅ Add database scripts to your HTML pages
3. ✅ Update SkillScan to save results
4. ✅ Update dashboards to load from database
5. ⬜ Deploy to AWS when ready

---

**Questions?** Check DATABASE_SETUP_GUIDE.md for detailed documentation.
