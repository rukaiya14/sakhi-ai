/**
 * Create Sample Data for Enhanced Reminder System
 * This script creates realistic sample orders and reminders for testing
 */

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Configure AWS
AWS.config.update({
    region: process.env.AWS_REGION || 'us-east-1'
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

// Sample data configuration
const ORDERS_TABLE = 'shebalance-orders';
const REMINDERS_TABLE = 'shebalance-reminders';

// Helper function to get date X days ago
function daysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
}

// Sample orders with various scenarios
const sampleOrders = [
    // Orders needing reminders (3+ days old)
    {
        orderId: `order-${Date.now()}-1`,
        artisanId: 'artisan-rukaiya',
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
        progressPercentage: 40
    },
    {
        orderId: `order-${Date.now()}-2`,
        artisanId: 'artisan-rukaiya',
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
        progressPercentage: 30
    },
    {
        orderId: `order-${Date.now()}-3`,
        artisanId: 'artisan-rukaiya',
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
        progressPercentage: 60
    },
    
    // Orders that are up to date (less than 3 days)
    {
        orderId: `order-${Date.now()}-4`,
        artisanId: 'artisan-rukaiya',
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
        progressPercentage: 70
    },
    {
        orderId: `order-${Date.now()}-5`,
        artisanId: 'artisan-rukaiya',
        buyerId: 'buyer-corporate',
        title: 'Tailored Uniforms (30 pieces)',
        description: 'Custom tailored uniforms for corporate staff',
        orderType: 'bulk',
        status: 'in_progress',
        quantity: 30,
        price: 45000,
        currency: 'INR',
        createdAt: daysAgo(3),
        lastProgressUpdate: daysAgo(0),
        expectedDelivery: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        progressPercentage: 50
    },
    
    // Completed orders
    {
        orderId: `order-${Date.now()}-6`,
        artisanId: 'artisan-rukaiya',
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
        progressPercentage: 100
    },
    {
        orderId: `order-${Date.now()}-7`,
        artisanId: 'artisan-rukaiya',
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
        progressPercentage: 100
    },
    
    // Pending orders (just created)
    {
        orderId: `order-${Date.now()}-8`,
        artisanId: 'artisan-rukaiya',
        buyerId: 'buyer-rahul',
        title: 'Embroidered Cushion Covers (25 pieces)',
        description: 'Decorative cushion covers with traditional embroidery',
        orderType: 'bulk',
        status: 'pending',
        quantity: 25,
        price: 18750,
        currency: 'INR',
        createdAt: daysAgo(0),
        lastProgressUpdate: daysAgo(0),
        expectedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        progressPercentage: 0
    }
];

// Sample reminders for orders that have been reminded
const sampleReminders = [
    {
        orderId: `order-${Date.now()}-1`,
        reminderId: `reminder-${Date.now()}-1`,
        artisanId: 'artisan-rukaiya',
        userId: 'user-rukaiya',
        phoneNumber: '+919876543210',
        messageId: `msg-${Date.now()}-1`,
        reminderType: 'whatsapp',
        status: 'sent',
        sentAt: daysAgo(1),
        responseReceived: false,
        createdAt: daysAgo(1)
    },
    {
        orderId: `order-${Date.now()}-2`,
        reminderId: `reminder-${Date.now()}-2`,
        artisanId: 'artisan-rukaiya',
        userId: 'user-rukaiya',
        phoneNumber: '+919876543210',
        messageId: `msg-${Date.now()}-2`,
        reminderType: 'whatsapp',
        status: 'voice_call_initiated',
        sentAt: daysAgo(2),
        callInitiatedAt: daysAgo(1),
        responseReceived: false,
        createdAt: daysAgo(2)
    }
];

/**
 * Create sample orders in DynamoDB
 */
async function createSampleOrders() {
    console.log('\n📦 Creating sample orders...\n');
    
    let created = 0;
    let errors = 0;
    
    for (const order of sampleOrders) {
        try {
            await dynamodb.put({
                TableName: ORDERS_TABLE,
                Item: order
            }).promise();
            
            console.log(`✅ Created order: ${order.title}`);
            console.log(`   Order ID: ${order.orderId}`);
            console.log(`   Status: ${order.status}`);
            console.log(`   Days since update: ${Math.floor((Date.now() - new Date(order.lastProgressUpdate).getTime()) / (1000 * 60 * 60 * 24))}`);
            console.log('');
            
            created++;
        } catch (error) {
            console.error(`❌ Error creating order ${order.title}:`, error.message);
            errors++;
        }
    }
    
    return { created, errors };
}

/**
 * Create sample reminders in DynamoDB
 */
async function createSampleReminders() {
    console.log('\n📱 Creating sample reminders...\n');
    
    let created = 0;
    let errors = 0;
    
    for (const reminder of sampleReminders) {
        try {
            await dynamodb.put({
                TableName: REMINDERS_TABLE,
                Item: reminder
            }).promise();
            
            console.log(`✅ Created reminder: ${reminder.reminderId}`);
            console.log(`   Order ID: ${reminder.orderId}`);
            console.log(`   Type: ${reminder.reminderType}`);
            console.log(`   Status: ${reminder.status}`);
            console.log('');
            
            created++;
        } catch (error) {
            console.error(`❌ Error creating reminder ${reminder.reminderId}:`, error.message);
            errors++;
        }
    }
    
    return { created, errors };
}

/**
 * Display summary statistics
 */
function displaySummary(ordersResult, remindersResult) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 SAMPLE DATA CREATION SUMMARY');
    console.log('='.repeat(60));
    console.log('');
    console.log(`Orders Created: ${ordersResult.created}/${sampleOrders.length}`);
    console.log(`  - Needing reminders (3+ days): 3`);
    console.log(`  - Up to date (< 3 days): 2`);
    console.log(`  - Completed: 2`);
    console.log(`  - Pending: 1`);
    console.log('');
    console.log(`Reminders Created: ${remindersResult.created}/${sampleReminders.length}`);
    console.log(`  - WhatsApp sent: 1`);
    console.log(`  - Voice call initiated: 1`);
    console.log('');
    
    if (ordersResult.errors > 0 || remindersResult.errors > 0) {
        console.log(`⚠️  Errors: ${ordersResult.errors + remindersResult.errors}`);
        console.log('');
    }
    
    console.log('✅ Sample data creation complete!');
    console.log('');
    console.log('Next Steps:');
    console.log('1. Open http://localhost:3000 to view orders in frontend');
    console.log('2. Open http://localhost:5000/test to test reminder system');
    console.log('3. Check DynamoDB tables to verify data');
    console.log('');
    console.log('Verify in DynamoDB:');
    console.log('  aws dynamodb scan --table-name shebalance-orders --limit 10');
    console.log('  aws dynamodb scan --table-name shebalance-reminders --limit 10');
    console.log('');
    console.log('='.repeat(60));
}

/**
 * Main execution
 */
async function main() {
    try {
        console.log('='.repeat(60));
        console.log('🚀 CREATING SAMPLE DATA FOR REMINDER SYSTEM');
        console.log('='.repeat(60));
        console.log('');
        console.log('This will create:');
        console.log(`  - ${sampleOrders.length} sample orders`);
        console.log(`  - ${sampleReminders.length} sample reminders`);
        console.log('');
        console.log('Tables:');
        console.log(`  - ${ORDERS_TABLE}`);
        console.log(`  - ${REMINDERS_TABLE}`);
        console.log('');
        console.log('AWS Region:', process.env.AWS_REGION || 'us-east-1');
        console.log('');
        
        // Create orders
        const ordersResult = await createSampleOrders();
        
        // Create reminders
        const remindersResult = await createSampleReminders();
        
        // Display summary
        displaySummary(ordersResult, remindersResult);
        
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { createSampleOrders, createSampleReminders };
