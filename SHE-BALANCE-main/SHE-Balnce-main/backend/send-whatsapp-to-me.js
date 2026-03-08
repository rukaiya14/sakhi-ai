/**
 * Send WhatsApp Test Message to Your Number
 * Quick test to send WhatsApp updates to +917666544797
 */

require('dotenv').config();
const whatsappService = require('./whatsapp-service');

// Your phone number
const MY_PHONE = '+917666544797';

async function sendTestMessage() {
    console.log('🌸 SHE-BALANCE WhatsApp Test');
    console.log('=' .repeat(60));
    console.log('');
    
    // Check configuration
    const status = whatsappService.getWhatsAppStatus();
    console.log('📱 WhatsApp Configuration:');
    console.log(`   Configured: ${status.configured ? '✅ Yes' : '❌ No'}`);
    console.log(`   Account SID: ${status.accountSid}`);
    console.log(`   WhatsApp Number: ${status.whatsappNumber}`);
    console.log('');
    
    if (!status.configured) {
        console.error('❌ WhatsApp is not configured!');
        console.log('Please check your .env file for:');
        console.log('  - TWILIO_ACCOUNT_SID');
        console.log('  - TWILIO_AUTH_TOKEN');
        console.log('  - TWILIO_WHATSAPP_NUMBER');
        return;
    }
    
    console.log(`📤 Sending test message to: ${MY_PHONE}`);
    console.log('');
    
    try {
        const message = `🌸 *SHE-BALANCE Test Message*

नमस्ते! 🙏

This is a test message from your SHE-BALANCE platform!

✅ WhatsApp integration is working
✅ Messages will be sent to: ${MY_PHONE}

🔔 You will receive updates for:
• Order reminders
• Progress updates
• System notifications
• AI Sakhi alerts

धन्यवाद! 💚
-- Team SHE-BALANCE

Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;

        const result = await whatsappService.sendWhatsAppMessage(MY_PHONE, message);
        
        console.log('✅ Message sent successfully!');
        console.log('');
        console.log('📊 Message Details:');
        console.log(`   Message ID: ${result.messageId}`);
        console.log(`   Status: ${result.status}`);
        console.log(`   To: ${result.to}`);
        console.log(`   Timestamp: ${result.timestamp}`);
        console.log('');
        console.log('💡 Check your WhatsApp for the message!');
        console.log('');
        
    } catch (error) {
        console.error('❌ Failed to send message:');
        console.error('');
        console.error(error.message);
        console.error('');
        
        if (error.code === 63007) {
            console.log('⚠️  Sandbox Issue:');
            console.log('   You need to join the Twilio WhatsApp Sandbox first!');
            console.log('');
            console.log('📱 Steps to join:');
            console.log('   1. Send WhatsApp message to: +1 415 523 8886');
            console.log('   2. Message text: join <your-sandbox-code>');
            console.log('   3. Wait for confirmation');
            console.log('   4. Run this script again');
            console.log('');
        }
    }
    
    console.log('=' .repeat(60));
}

// Run the test
sendTestMessage().catch(console.error);
