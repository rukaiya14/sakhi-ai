/**
 * Send Order Update WhatsApp Message to Your Number
 * Simulates order reminder notifications
 */

require('dotenv').config();
const whatsappService = require('./whatsapp-service');

// Your phone number
const MY_PHONE = '+917666544797';

async function sendOrderUpdate() {
    console.log('🌸 SHE-BALANCE Order Update Notification');
    console.log('=' .repeat(60));
    console.log('');
    
    // Check configuration
    if (!whatsappService.isWhatsAppConfigured()) {
        console.error('❌ WhatsApp is not configured!');
        return;
    }
    
    console.log(`📤 Sending order update to: ${MY_PHONE}`);
    console.log('');
    
    try {
        // Sample order details
        const orderDetails = {
            artisanName: 'Priya Sharma',
            title: 'Handwoven Saree with Embroidery',
            progress: 45,
            daysInactive: 3,
            deadline: '15th March 2026'
        };
        
        const result = await whatsappService.sendOrderReminder(
            MY_PHONE,
            'ORD-2026-001',
            orderDetails
        );
        
        console.log('✅ Order update sent successfully!');
        console.log('');
        console.log('📊 Message Details:');
        console.log(`   Message ID: ${result.messageId}`);
        console.log(`   Status: ${result.status}`);
        console.log(`   Order ID: ORD-2026-001`);
        console.log(`   Progress: ${orderDetails.progress}%`);
        console.log(`   Timestamp: ${result.timestamp}`);
        console.log('');
        console.log('💡 Check your WhatsApp for the order reminder!');
        console.log('');
        
    } catch (error) {
        console.error('❌ Failed to send order update:');
        console.error('');
        console.error(error.message);
        console.error('');
        
        if (error.code === 63007) {
            console.log('⚠️  You need to join the Twilio WhatsApp Sandbox!');
            console.log('');
            console.log('📱 Quick Steps:');
            console.log('   1. Open WhatsApp');
            console.log('   2. Send message to: +1 415 523 8886');
            console.log('   3. Message: join <sandbox-code>');
            console.log('   4. Run this script again');
            console.log('');
        }
    }
    
    console.log('=' .repeat(60));
}

// Run the update
sendOrderUpdate().catch(console.error);
