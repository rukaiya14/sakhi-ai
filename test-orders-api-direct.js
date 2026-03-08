// Direct test of orders API
const fetch = require('node-fetch');

async function testOrdersAPI() {
    console.log('🔍 Testing Orders API...\n');
    
    // First, login to get a token
    console.log('1. Logging in as rukaiya@example.com...');
    try {
        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'rukaiya@example.com',
                password: 'password123'
            })
        });

        const loginData = await loginResponse.json();
        
        if (!loginResponse.ok) {
            console.error('❌ Login failed:', loginData);
            return;
        }

        console.log('✅ Login successful!');
        console.log('   User:', loginData.user.fullName);
        console.log('   Role:', loginData.user.role);
        console.log('   Token:', loginData.token.substring(0, 30) + '...\n');

        // Now test orders API
        console.log('2. Fetching orders...');
        const ordersResponse = await fetch('http://localhost:5000/api/orders', {
            headers: {
                'Authorization': `Bearer ${loginData.token}`
            }
        });

        const ordersData = await ordersResponse.json();

        if (!ordersResponse.ok) {
            console.error('❌ Orders API failed:', ordersData);
            return;
        }

        console.log('✅ Orders API successful!');
        console.log('   Total orders:', ordersData.orders ? ordersData.orders.length : 0);
        
        if (ordersData.orders && ordersData.orders.length > 0) {
            console.log('\n📦 Orders:');
            ordersData.orders.forEach((order, index) => {
                console.log(`   ${index + 1}. ${order.title || 'Untitled'}`);
                console.log(`      Type: ${order.orderType || 'N/A'}`);
                console.log(`      Status: ${order.status || 'N/A'}`);
                console.log(`      Quantity: ${order.quantity || 'N/A'}`);
            });
            
            const bulkOrders = ordersData.orders.filter(o => o.orderType === 'bulk');
            console.log(`\n   Bulk orders: ${bulkOrders.length}`);
        } else {
            console.log('   No orders found in database');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    }
}

testOrdersAPI();
