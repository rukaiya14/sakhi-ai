/**
 * Fix Sample Data - Link orders to correct artisan
 */

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({
    region: process.env.AWS_REGION || 'us-east-1'
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

// Helper function to get date X days ago
function daysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
}

async function main() {
    try {
        console.log('🔍 Finding Rukaiya\'s user and artisan profile...\n');
        
        // Find user by email
        const usersResponse = await dynamodb.scan({
            TableName: 'shebalance-users',
            FilterExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': 'rukaiya@example.com'
            }
        }).promise();
        
        if (!usersResponse.Items || usersResponse.Items.length === 0) {
            console.error('❌ User rukaiya@example.com not found!');
            console.log('\nTrying to find any artisan user...');
            
            const allUsersResponse = await dynamodb.scan({
                TableName: 'shebalance-users',
                FilterExpression: '#role = :role',
                ExpressionAttributeNames: {
                    '#role': 'role'
                },
                ExpressionAttributeValues: {
                    ':role': 'artisan'
                }
            }).promise();
            
            console.log(`\nFound ${allUsersResponse.Items.length} artisan users:`);
            allUsersResponse.Items.forEach(user => {
                console.log(`  - ${user.fullName} (${user.email}) - userId: ${user.userId}`);
            });
            
            process.exit(1);
        }
        
        const user = usersResponse.Items[0];
        console.log(`✅ Found user: ${user.fullName} (${user.email})`);
        console.log(`   User ID: ${user.userId}\n`);
        
        // Find artisan profile
        const profilesResponse = await dynamodb.scan({
            TableName: 'shebalance-artisan-profiles',
            FilterExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': user.userId
            }
        }).promise();
        
        if (!profilesResponse.Items || profilesResponse.Items.length === 0) {
            console.error('❌ Artisan profile not found for this user!');
            process.exit(1);
        }
        
        const artisanProfile = profilesResponse.Items[0];
        console.log(`✅ Found artisan profile`);
        console.log(`   Artisan ID: ${artisanProfile.artisanId}\n`);
        
        // Delete old sample orders
        console.log('🗑️  Deleting old sample orders...\n');
        const oldOrdersResponse = await dynamodb.scan({
            TableName: 'shebalance-orders'
        }).promise();
        
        for (const order of oldOrdersResponse.Items || []) {
            await dynamodb.delete({
                TableName: 'shebalance-orders',
                Key: { orderId: order.orderId }
            }).promise();
            console.log(`   Deleted: ${order.title}`);
        }
        
        console.log('\n📦 Creating new sample orders with correct artisan ID...\n');
        
        // Create sample orders with correct IDs
        const sampleOrders = [
            // Orders needing reminders (3+ days old)
            {
                orderId: `order-${Date.now()}-1`,
                artisanId: artisanProfile.artisanId,
                buyerId: 'buyer-rahul',
                title: 'Embroidered Sarees (50 pieces)',
                description: 'Traditional hand-embroidered sarees for wedding season',
                orderType: 'bulk',
                status: 'in_progress',
                quantity: 50,
                price: 75000,
                currency: 'INR',
                createdAt: daysAgo(10),
                lastProgressUpdate: daysAgo(5),
                expectedDelivery: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
                progressPercentage: 40,
                progressNote: 'Working on intricate border designs'
            },
            {
                orderId: `order-${Date.now()}-2`,
                artisanId: artisanProfile.artisanId,
                buyerId: 'buyer-corporate',
                title: 'Corporate Gift Hampers (100 pieces)',
                description: 'Handcrafted gift hampers with traditional items',
                orderType: 'bulk',
                status: 'in_progress',
                quantity: 100,
                price: 150000,
                currency: 'INR',
                createdAt: daysAgo(8),
                lastProgressUpdate: daysAgo(4),
                expectedDelivery: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
                progressPercentage: 30,
                progressNote: 'Sourcing materials for remaining hampers'
            },
            {
                orderId: `order-${Date.now()}-3`,
                artisanId: artisanProfile.artisanId,
                buyerId: 'buyer-rahul',
                title: 'Henna Design Service (Wedding)',
                description: 'Bridal henna design for wedding ceremony',
                orderType: 'bulk',
                status: 'in_progress',
                quantity: 1,
                price: 5000,
                currency: 'INR',
                createdAt: daysAgo(6),
                lastProgressUpdate: daysAgo(3),
                expectedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                progressPercentage: 60,
                progressNote: 'Design finalized, waiting for wedding date'
            },
            
            // Orders that are up to date (less than 3 days)
            {
                orderId: `order-${Date.now()}-4`,
                artisanId: artisanProfile.artisanId,
                buyerId: 'buyer-rahul',
                title: 'Crochet Baby Blankets (20 pieces)',
                description: 'Handmade crochet baby blankets in pastel colors',
                orderType: 'bulk',
                status: 'in_progress',
                quantity: 20,
                price: 30000,
                currency: 'INR',
                createdAt: daysAgo(5),
                lastProgressUpdate: daysAgo(1),
                expectedDelivery: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
                progressPercentage: 70,
                progressNote: 'Completed 14 blankets, 6 remaining'
            },
            {
                orderId: `order-${Date.now()}-5`,
                artisanId: artisanProfile.artisanId,
                buyerId: 'buyer-corporate',
                title: 'Tailored Uniforms (30 pieces)',
                description: 'Custom tailored uniforms for corporate staff',
                orderType: 'bulk',
                status: 'in_progress',
                quantity: 30,
                price: 45000,
                currency: 'INR',
                createdAt: daysAgo(3),
                lastProgressUpdate: new Date().toISOString(),
                expectedDelivery: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
                progressPercentage: 50,
                progressNote: 'Just updated - 15 uniforms completed'
            },
            
            // Completed orders
            {
                orderId: `order-${Date.now()}-6`,
                artisanId: artisanProfile.artisanId,
                buyerId: 'buyer-rahul',
                title: 'Home-cooked Meal Packages (50 meals)',
                description: 'Traditional home-cooked meals for office catering',
                orderType: 'bulk',
                status: 'completed',
                quantity: 50,
                price: 25000,
                currency: 'INR',
                createdAt: daysAgo(15),
                lastProgressUpdate: daysAgo(2),
                completedAt: daysAgo(2),
                expectedDelivery: daysAgo(2),
                progressPercentage: 100,
                progressNote: 'All meals delivered successfully'
            },
            {
                orderId: `order-${Date.now()}-7`,
                artisanId: artisanProfile.artisanId,
                buyerId: 'buyer-corporate',
                title: 'Woven Table Runners (40 pieces)',
                description: 'Handwoven table runners for corporate gifting',
                orderType: 'bulk',
                status: 'completed',
                quantity: 40,
                price: 32000,
                currency: 'INR',
                createdAt: daysAgo(20),
                lastProgressUpdate: daysAgo(5),
                completedAt: daysAgo(5),
                expectedDelivery: daysAgo(5),
                progressPercentage: 100,
                progressNote: 'Completed and delivered'
            },
            
            // Pending orders (just created)
            {
                orderId: `order-${Date.now()}-8`,
                artisanId: artisanProfile.artisanId,
                buyerId: 'buyer-rahul',
                title: 'Embroidered Cushion Covers (25 pieces)',
                description: 'Decorative cushion covers with traditional embroidery',
                orderType: 'bulk',
                status: 'pending',
                quantity: 25,
                price: 18750,
                currency: 'INR',
                createdAt: new Date().toISOString(),
                lastProgressUpdate: new Date().toISOString(),
                expectedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                progressPercentage: 0,
                progressNote: 'New order - starting soon'
            }
        ];
        
        let created = 0;
        for (const order of sampleOrders) {
            await dynamodb.put({
                TableName: 'shebalance-orders',
                Item: order
            }).promise();
            
            const daysSince = Math.floor((Date.now() - new Date(order.lastProgressUpdate).getTime()) / (1000 * 60 * 60 * 24));
            const needsReminder = daysSince >= 3 && order.status !== 'completed' && order.status !== 'cancelled';
            
            console.log(`✅ ${order.title}`);
            console.log(`   Status: ${order.status} | Progress: ${order.progressPercentage}% | Days: ${daysSince}`);
            if (needsReminder) {
                console.log(`   ⚠️  NEEDS REMINDER`);
            }
            console.log('');
            
            created++;
        }
        
        console.log('='.repeat(60));
        console.log('✅ Sample data fixed successfully!\n');
        console.log(`Created ${created} orders for artisan: ${user.fullName}`);
        console.log(`Artisan ID: ${artisanProfile.artisanId}`);
        console.log(`User ID: ${user.userId}\n`);
        console.log('Orders needing reminders: 3');
        console.log('Orders up to date: 2');
        console.log('Completed orders: 2');
        console.log('Pending orders: 1\n');
        console.log('Next steps:');
        console.log('1. Login at: http://localhost:3000/login.html');
        console.log('2. Email: rukaiya@example.com');
        console.log('3. Password: artisan123');
        console.log('4. View orders in dashboard\n');
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('\n❌ Error:', error);
        process.exit(1);
    }
}

main();
