// Add Sample Bulk Orders to DynamoDB
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Configure AWS
AWS.config.update({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tablePrefix = 'shebalance-';

async function addSampleOrders() {
    console.log('📦 Adding Sample Bulk Orders to DynamoDB...\n');

    try {
        // First, get Rukaiya's artisan profile
        console.log('1. Finding Rukaiya Khan\'s artisan profile...');
        const userResult = await dynamodb.query({
            TableName: `${tablePrefix}users`,
            IndexName: 'EmailIndex',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': 'rukaiya@example.com'
            }
        }).promise();

        if (!userResult.Items || userResult.Items.length === 0) {
            console.error('❌ User not found. Please make sure rukaiya@example.com exists.');
            return;
        }

        const user = userResult.Items[0];
        console.log('✅ Found user:', user.fullName);

        // Get artisan profile
        const artisanResult = await dynamodb.query({
            TableName: `${tablePrefix}artisan-profiles`,
            IndexName: 'UserIdIndex',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': user.userId
            }
        }).promise();

        if (!artisanResult.Items || artisanResult.Items.length === 0) {
            console.error('❌ Artisan profile not found.');
            return;
        }

        const artisan = artisanResult.Items[0];
        console.log('✅ Found artisan profile:', artisan.artisanId);
        console.log('');

        // Create sample bulk orders
        const sampleOrders = [
            {
                orderId: uuidv4(),
                artisanId: artisan.artisanId,
                buyerId: 'BUYER-001', // Mock buyer ID
                orderType: 'bulk',
                title: 'Embroidered Sarees - Wedding Collection',
                description: '100 handcrafted embroidered sarees for wedding season',
                quantity: 100,
                completedQuantity: 45,
                unitPrice: 2500,
                totalAmount: 250000,
                status: 'in-progress',
                paymentStatus: 'partial',
                deliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
                progressPercentage: 45,
                progressNote: 'Working on intricate border designs. 45 pieces completed with excellent quality.',
                lastProgressUpdate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
                createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
                updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                orderId: uuidv4(),
                artisanId: artisan.artisanId,
                buyerId: 'BUYER-002',
                orderType: 'bulk',
                title: 'Traditional Kurtas - Festival Order',
                description: '50 traditional kurtas with hand embroidery for Diwali festival',
                quantity: 50,
                completedQuantity: 30,
                unitPrice: 1800,
                totalAmount: 90000,
                status: 'in-progress',
                paymentStatus: 'partial',
                deliveryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days from now
                progressPercentage: 60,
                progressNote: '30 kurtas completed. Working on remaining 20 pieces.',
                lastProgressUpdate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
                updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                orderId: uuidv4(),
                artisanId: artisan.artisanId,
                buyerId: 'BUYER-003',
                orderType: 'bulk',
                title: 'Designer Dupattas - Boutique Collection',
                description: '75 designer dupattas with zari work for boutique',
                quantity: 75,
                completedQuantity: 15,
                unitPrice: 1200,
                totalAmount: 90000,
                status: 'in-progress',
                paymentStatus: 'pending',
                deliveryDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(), // 40 days from now
                progressPercentage: 20,
                progressNote: 'Started work on zari designs. 15 pieces completed.',
                lastProgressUpdate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago (needs reminder!)
                createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
                updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                orderId: uuidv4(),
                artisanId: artisan.artisanId,
                buyerId: 'BUYER-004',
                orderType: 'bulk',
                title: 'Bridal Lehengas - Premium Collection',
                description: '20 premium bridal lehengas with heavy embroidery',
                quantity: 20,
                completedQuantity: 8,
                unitPrice: 15000,
                totalAmount: 300000,
                status: 'in-progress',
                paymentStatus: 'advance-paid',
                deliveryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
                progressPercentage: 40,
                progressNote: '8 lehengas completed with intricate work. Customer very satisfied with quality.',
                lastProgressUpdate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
                createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago
                updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                orderId: uuidv4(),
                artisanId: artisan.artisanId,
                buyerId: 'BUYER-005',
                orderType: 'bulk',
                title: 'Cotton Salwar Suits - Summer Collection',
                description: '60 cotton salwar suits with block printing',
                quantity: 60,
                completedQuantity: 60,
                unitPrice: 1500,
                totalAmount: 90000,
                status: 'completed',
                paymentStatus: 'paid',
                deliveryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Delivered 5 days ago
                progressPercentage: 100,
                progressNote: 'All 60 pieces completed and delivered. Customer very happy!',
                lastProgressUpdate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(), // 50 days ago
                updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];

        // Add orders to DynamoDB
        console.log('2. Adding sample orders to DynamoDB...\n');
        
        for (let i = 0; i < sampleOrders.length; i++) {
            const order = sampleOrders[i];
            
            await dynamodb.put({
                TableName: `${tablePrefix}orders`,
                Item: order
            }).promise();

            console.log(`✅ Order ${i + 1}/${sampleOrders.length}: ${order.title}`);
            console.log(`   Status: ${order.status} | Progress: ${order.progressPercentage}%`);
            console.log(`   Quantity: ${order.completedQuantity}/${order.quantity}`);
            console.log(`   Amount: ₹${order.totalAmount.toLocaleString()}`);
            console.log('');
        }

        console.log('');
        console.log('========================================');
        console.log('✅ SUCCESS! Sample orders added!');
        console.log('========================================');
        console.log('');
        console.log('📊 Summary:');
        console.log(`   Total orders: ${sampleOrders.length}`);
        console.log(`   In-progress: ${sampleOrders.filter(o => o.status === 'in-progress').length}`);
        console.log(`   Completed: ${sampleOrders.filter(o => o.status === 'completed').length}`);
        console.log(`   Total value: ₹${sampleOrders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}`);
        console.log('');
        console.log('🎉 Now refresh your dashboard to see the bulk orders!');
        console.log('   URL: http://localhost:8080/SHE-BALANCE-main/SHE-Balnce-main/dashboard.html');
        console.log('');

    } catch (error) {
        console.error('❌ Error adding orders:', error);
        console.error(error.stack);
    }
}

// Run the script
addSampleOrders();
