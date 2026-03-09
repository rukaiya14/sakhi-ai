/**
 * Test WhatsApp Messaging
 * Send a test WhatsApp message using Twilio
 */

require('dotenv').config();
const whatsappService = require('./whatsapp-service');

// Get phone number from command line
const phoneNumber = process.argv[2];

if (!phoneNumber) {
    console.log('\n❌ Please provide phone number as argument');
    console.log('\nUsage: node test-whatsapp.js +919876543210');
    console.log('');
    console.log('⚠️  IMPORTANT: The recipient must have joined your WhatsApp sandbox first!');
    console.log('');
    process.exit(1);
}

console.log('\n' + '='.repeat(60));
console.log('📱 Testing WhatsApp Messaging');
console.log('='.repeat(60));
console.log('');

// Check configuration
const status = whatsappService.getWhatsAppStatus();
console.log('Configuration:');
console.log('  Configured:', status.configured ? '✅ Yes' : '❌ No');
console.log('  Account SID:', status.accountSid);
console.log('  WhatsApp Number:', status.whatsappNumber);
console.log('');

if (!status.configured) {
    console.log('❌ WhatsApp is not configured!');
    console.log('');
    console.log('Please add these to your .env file:');
    console.log('  TWILIO_ACCOUNT_SID=your_account_sid');
    console.log('  TWILIO_AUTH_TOKEN=your_auth_token');
    console.log('  TWILIO_WHATSAPP_NUMBER=+14155238886');
    console.log('');
    console.log('See WHATSAPP_SETUP_GUIDE.md for instructions');
    console.log('');
    process.exit(1);
}

console.log('Sending to:', phoneNumber);
console.log('');

const message = `🌸 *Test from SHE-BALANCE!*

This is a test WhatsApp message.

If you receive this, your WhatsApp integration is working perfectly! 🎉

Time: ${new Date().toLocaleString()}

-- SHE-BALANCE Team`;

console.log('📤 Sending WhatsApp message...\n');

whatsappService.sendCustomMessage(phoneNumber, message)
    .then((result) => {
        console.log('='.repeat(60));
        console.log('✅ SUCCESS!');
        console.log('='.repeat(60));
        console.log('');
        console.log('Message ID:', result.messageId);
        console.log('Status:', result.status);
        console.log('To:', result.to);
        console.log('');
        console.log('📱 CHECK YOUR WHATSAPP!');
        console.log('');
        console.log('⏰ Message should arrive within seconds');
        console.log('💰 Cost: ~$0.005');
        console.log('');
    })
    .catch((error) => {
        console.log('='.repeat(60));
        console.log('❌ FAILED!');
        console.log('='.repeat(60));
        console.log('');
        console.log('Error Code:', error.code);
        console.log('Error Message:', error.message);
        console.log('');
        
        if (error.code === 21211) {
            console.log('💡 Invalid phone number format');
            console.log('   Use E.164 format: +919876543210');
        } else if (error.code === 21408 || error.code === 21606) {
            console.log('💡 Recipient has not joined WhatsApp sandbox!');
            console.log('');
            console.log('   Ask them to:');
            console.log('   1. Open WhatsApp');
            console.log('   2. Send message to:', status.whatsappNumber);
            console.log('   3. Message: join <your-sandbox-code>');
            console.log('');
            console.log('   Find your sandbox code at:');
            console.log('   https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn');
        } else if (error.code === 20003) {
            console.log('💡 Invalid Twilio credentials');
            console.log('   Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env');
        } else {
            console.log('💡 Unknown error');
            console.log('   Full error:', error);
        }
        console.log('');
    });
