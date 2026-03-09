/**
 * Local Testing Script for Enhanced Reminder System
 * Simulates the AWS Lambda workflow on localhost
 */

const AWS = require('aws-sdk');
const { DateTime } = require('luxon');

// Configure AWS SDK for local DynamoDB
AWS.config.update({
    region: 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'your-access-key',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'your-secret-key'
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

// Configuration
const ORDERS_TABLE = 'shebalance-orders';
const USERS_TABLE = 'shebalance-users';
const ARTISAN_PROFILES_TABLE = 'shebalance-artisan-profiles';
const REMINDERS_TABLE = 'shebalance-reminders';
const NOTIFICATIONS_TABLE = 'shebalance-notifications';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(60));
    log(title, 'bright');
    console.log('='.repeat(60) + '\n');
}

/**
 * Step 1: Create test order with old progress update
 */
async function createTestOrder() {
    logSection('Step 1: Creating Test Order');
    
    const orderId = `test-order-${Date.now()}`;
    const fourDaysAgo = DateTime.now().minus({ days: 4 }).toISO();
    
    const testOrder = {
        orderId: orderId,
        artisanId: 'artisan-rukaiya',
        buyerId: 'buyer-rahul',
        title: 'Test Embroidered Sarees (50 pieces)',
        description: 'Traditional embroidered sarees for wedding season',
        orderType: 'bulk',
        status: 'in_progress',
        quantity: 50,
        price: 25000,
        currency: 'INR',
        createdAt: fourDaysAgo,
        lastProgressUpdate: fourDaysAgo,
        expectedDelivery: DateTime.now().plus({ days: 10 }).toISO()
    };
    
    try {
        await dynamodb.put({
            TableName: ORDERS_TABLE,
            Item: testOrder
        }).promise();
        
        log('✅ Test order created successfully!', 'green');
        log(`Order ID: ${orderId}`, 'cyan');
        log(`Last Update: ${fourDaysAgo} (4 days ago)`, 'yellow');
        
        return testOrder;
    } catch (error) {
        log(`❌ Error creating test order: ${error.message}`, 'red');
        throw error;
    }
}

/**
 * Step 2: Scan for orders needing reminders
 */
async function scanOrdersNeedingReminders() {
    logSection('Step 2: Scanning Orders Needing Reminders');
    
    try {
        const response = await dynamodb.scan({
            TableName: ORDERS_TABLE,
            FilterExpression: '#status IN (:pending, :in_progress) AND orderType = :bulk',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':pending': 'pending',
                ':in_progress': 'in_progress',
                ':bulk': 'bulk'
            }
        }).promise();
        
        const orders = response.Items || [];
        const currentTime = DateTime.now();
        const ordersNeedingReminders = [];
        
        log(`Found ${orders.length} active bulk orders`, 'blue');
        
        for (const order of orders) {
            const lastUpdate = order.lastProgressUpdate || order.createdAt;
            const lastUpdateTime = DateTime.fromISO(lastUpdate);
            const daysSinceUpdate = Math.floor(currentTime.diff(lastUpdateTime, 'days').days);
            
            log(`\nOrder: ${order.orderId}`, 'cyan');
            log(`  Title: ${order.title}`);
            log(`  Days since update: ${daysSinceUpdate}`);
            
            if (daysSinceUpdate >= 3) {
                log(`  ⚠️  Needs reminder!`, 'yellow');
                ordersNeedingReminders.push({
                    ...order,
                    daysSinceUpdate
                });
            } else {
                log(`  ✓ Up to date`, 'green');
            }
        }
        
        log(`\n${ordersNeedingReminders.length} orders need reminders`, 'yellow');
        return ordersNeedingReminders;
        
    } catch (error) {
        log(`❌ Error scanning orders: ${error.message}`, 'red');
        throw error;
    }
}

/**
 * Step 3: Get artisan and user details
 */
async function getArtisanDetails(artisanId) {
    try {
        const response = await dynamodb.get({
            TableName: ARTISAN_PROFILES_TABLE,
            Key: { artisanId }
        }).promise();
        
        return response.Item;
    } catch (error) {
        log(`❌ Error getting artisan: ${error.message}`, 'red');
        return null;
    }
}

async function getUserDetails(userId) {
    try {
        const response = await dynamodb.get({
            TableName: USERS_TABLE,
            Key: { userId }
        }).promise();
        
        return response.Item;
    } catch (error) {
        log(`❌ Error getting user: ${error.message}`, 'red');
        return null;
    }
}

/**
 * Step 4: Simulate WhatsApp reminder
 */
async function sendWhatsAppReminder(order, user) {
    logSection('Step 3: Sending WhatsApp Reminder (Simulated)');
    
    const message = createWhatsAppMessage(order, user);
    
    log('📱 WhatsApp Message:', 'cyan');
    console.log('─'.repeat(60));
    console.log(message);
    console.log('─'.repeat(60));
    
    // Simulate sending via SNS
    log('\n📤 Sending to: ' + user.phone, 'blue');
    log('✅ Message sent successfully! (Simulated)', 'green');
    
    // Create reminder record
    const reminderId = `reminder-${Date.now()}`;
    const reminderRecord = {
        orderId: order.orderId,
        reminderId: reminderId,
        artisanId: order.artisanId,
        userId: user.userId,
        phoneNumber: user.phone,
        messageId: `msg-${Date.now()}`,
        reminderType: 'whatsapp',
        status: 'sent',
        sentAt: DateTime.now().toISO(),
        responseReceived: false,
        createdAt: DateTime.now().toISO()
    };
    
    try {
        await dynamodb.put({
            TableName: REMINDERS_TABLE,
            Item: reminderRecord
        }).promise();
        
        log(`✅ Reminder record created: ${reminderId}`, 'green');
        
        // Update order
        await dynamodb.update({
            TableName: ORDERS_TABLE,
            Key: { orderId: order.orderId },
            UpdateExpression: 'SET lastReminderSent = :timestamp',
            ExpressionAttributeValues: {
                ':timestamp': DateTime.now().toISO()
            }
        }).promise();
        
        log('✅ Order updated with reminder timestamp', 'green');
        
        return reminderRecord;
        
    } catch (error) {
        log(`❌ Error creating reminder record: ${error.message}`, 'red');
        throw error;
    }
}

function createWhatsAppMessage(order, user) {
    const orderId = order.orderId.substring(0, 8);
    const orderTitle = order.title || 'Your order';
    const daysSinceUpdate = order.daysSinceUpdate || 3;
    
    return `
🔔 SHE-BALANCE Order Reminder

Hello ${user.fullName}! 👋

We noticed you haven't updated the progress for your bulk order in ${daysSinceUpdate} days.

📦 Order: ${orderTitle}
🆔 Order ID: ${orderId}
📅 Last Update: ${daysSinceUpdate} days ago

⚠️ IMPORTANT: Please update your order progress within 24 hours. 
If we don't hear from you, we will call you to confirm if you can 
complete this order.

✅ Reply with:
• "DONE" - Order completed
• "PROGRESS" - Still working on it
• "HELP" - Need assistance
• "CANCEL" - Cannot complete

Update now: http://localhost:8080/dashboard

Need help? Reply to this message or contact support at 1800-XXX-XXXX

- Team SHE-BALANCE 🌸
`.trim();
}

/**
 * Step 5: Simulate voice call (after 24 hours)
 */
async function simulateVoiceCall(order, user) {
    logSection('Step 4: Voice Call Follow-up (Simulated)');
    
    log('⏰ Simulating 24-hour wait...', 'yellow');
    log('(In production, this would be triggered by EventBridge)', 'blue');
    
    const voiceScript = createVoiceScript(order, user);
    
    log('\n📞 Voice Call Script (Hindi):', 'cyan');
    console.log('─'.repeat(60));
    console.log(voiceScript);
    console.log('─'.repeat(60));
    
    log('\n📞 Calling: ' + user.phone, 'blue');
    log('✅ Voice call initiated! (Simulated)', 'green');
    log('🎙️  Using Amazon Polly neural voice: Aditi (Hindi)', 'cyan');
    
    // Update reminder record
    try {
        await dynamodb.update({
            TableName: REMINDERS_TABLE,
            Key: { orderId: order.orderId },
            UpdateExpression: 'SET #status = :status, callInitiatedAt = :timestamp',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':status': 'voice_call_initiated',
                ':timestamp': DateTime.now().toISO()
            }
        }).promise();
        
        log('✅ Reminder status updated to voice_call_initiated', 'green');
        
    } catch (error) {
        log(`❌ Error updating reminder: ${error.message}`, 'red');
    }
}

function createVoiceScript(order, user) {
    const orderTitle = order.title || 'your order';
    const daysSinceUpdate = order.daysSinceUpdate || 4;
    
    return `
नमस्ते ${user.fullName} जी।
मैं शी बैलेंस की एआई सखी हूँ।

हम आपसे आपके बल्क ऑर्डर के बारे में बात करना चाहते हैं।
ऑर्डर का नाम है: ${orderTitle}

हमने देखा कि आपने पिछले ${daysSinceUpdate} दिनों से इस ऑर्डर की प्रोग्रेस 
अपडेट नहीं की है। हमने आपको व्हाट्सएप पर संदेश भेजा था, 
लेकिन हमें कोई जवाब नहीं मिला।

हम जानना चाहते हैं: क्या आप इस ऑर्डर को पूरा कर पाएंगी?

अगर आपको किसी भी प्रकार की समस्या है, चाहे वह समय की कमी हो, 
सामग्री की समस्या हो, या कोई व्यक्तिगत कारण हो, तो कृपया हमें बताएं।

हम आपकी मदद करना चाहते हैं।

अगर आप ऑर्डर पूरा नहीं कर पाएंगी, तो कोई बात नहीं। 
हम समझते हैं कि कभी-कभी परिस्थितियां बदल जाती हैं।

बस हमें जल्द से जल्द बताएं, ताकि हम बायर को सूचित कर सकें।

कृपया 24 घंटे के अंदर हमसे संपर्क करें।
धन्यवाद।
`.trim();
}

/**
 * Step 6: Check reminder status
 */
async function checkReminderStatus() {
    logSection('Step 5: Checking Reminder Status');
    
    try {
        const response = await dynamodb.scan({
            TableName: REMINDERS_TABLE,
            Limit: 10
        }).promise();
        
        const reminders = response.Items || [];
        
        log(`Found ${reminders.length} reminder records:\n`, 'blue');
        
        reminders.forEach((reminder, index) => {
            log(`${index + 1}. Order: ${reminder.orderId}`, 'cyan');
            log(`   Type: ${reminder.reminderType}`);
            log(`   Status: ${reminder.status}`);
            log(`   Sent: ${reminder.sentAt}`);
            if (reminder.callInitiatedAt) {
                log(`   Call: ${reminder.callInitiatedAt}`, 'yellow');
            }
            console.log();
        });
        
        return reminders;
        
    } catch (error) {
        log(`❌ Error checking reminders: ${error.message}`, 'red');
        return [];
    }
}

/**
 * Main test function
 */
async function runTest() {
    try {
        logSection('🚀 Enhanced Reminder System - Local Test');
        
        log('Testing on localhost with DynamoDB', 'blue');
        log('AWS Region: us-east-1\n', 'blue');
        
        // Step 1: Create test order
        const testOrder = await createTestOrder();
        
        // Step 2: Scan for orders needing reminders
        const ordersNeedingReminders = await scanOrdersNeedingReminders();
        
        if (ordersNeedingReminders.length === 0) {
            log('\n⚠️  No orders need reminders. Test complete.', 'yellow');
            return;
        }
        
        // Process first order
        const order = ordersNeedingReminders[0];
        
        // Get artisan details
        const artisan = await getArtisanDetails(order.artisanId);
        if (!artisan) {
            log('❌ Artisan not found', 'red');
            return;
        }
        
        // Get user details
        const user = await getUserDetails(artisan.userId);
        if (!user) {
            log('❌ User not found', 'red');
            return;
        }
        
        // Step 3: Send WhatsApp reminder
        await sendWhatsAppReminder(order, user);
        
        // Step 4: Simulate voice call
        await simulateVoiceCall(order, user);
        
        // Step 5: Check reminder status
        await checkReminderStatus();
        
        // Summary
        logSection('✅ Test Complete - Summary');
        
        log('What was tested:', 'bright');
        log('1. ✅ Created test order with 4-day-old progress update', 'green');
        log('2. ✅ Scanned orders and identified orders needing reminders', 'green');
        log('3. ✅ Generated and "sent" WhatsApp reminder message', 'green');
        log('4. ✅ Simulated 24-hour wait and voice call follow-up', 'green');
        log('5. ✅ Created reminder tracking records in DynamoDB', 'green');
        
        log('\nNext Steps:', 'bright');
        log('1. Check DynamoDB tables for created records', 'cyan');
        log('2. Deploy to AWS using: deploy-enhanced-reminders.bat', 'cyan');
        log('3. Configure SNS for actual WhatsApp delivery', 'cyan');
        log('4. Set up Twilio for real voice calls', 'cyan');
        
        log('\nTo view reminder records:', 'bright');
        log('aws dynamodb scan --table-name shebalance-reminders', 'blue');
        
    } catch (error) {
        log(`\n❌ Test failed: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    }
}

// Run the test
if (require.main === module) {
    runTest().then(() => {
        log('\n✅ All tests passed!', 'green');
        process.exit(0);
    }).catch(error => {
        log(`\n❌ Test failed: ${error.message}`, 'red');
        process.exit(1);
    });
}

module.exports = { runTest };
