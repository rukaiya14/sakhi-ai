/**
 * Send Test SMS via AWS SNS
 * IMPORTANT: Update the phone number below before running!
 */

require('dotenv').config();
const AWS = require('aws-sdk');

// ⚠️ CHANGE THIS TO YOUR PHONE NUMBER!
const TEST_PHONE_NUMBER = '+919876543210'; // Change this!

console.log('\n' + '='.repeat(60));
console.log('📱 Send Test SMS via AWS SNS');
console.log('='.repeat(60) + '\n');

if (TEST_PHONE_NUMBER === '+919876543210') {
    console.log('⚠️  WARNING: Using default test number!');
    console.log('   Please edit send-test-sms.js and change TEST_PHONE_NUMBER');
    console.log('   to your actual phone number.\n');
}

console.log('Phone Number:', TEST_PHONE_NUMBER);
console.log('Region:', process.env.AWS_REGION);
console.log('');

const sns = new AWS.SNS({ 
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const message = `🌸 Test from SHE-BALANCE!

This is a test SMS from your SNS system.

If you receive this, your AWS SNS is working perfectly!

Time: ${new Date().toLocaleString()}

-- SHE-BALANCE Team`;

const params = {
    Message: message,
    PhoneNumber: TEST_PHONE_NUMBER,
    MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional'
        }
    }
};

console.log('📤 Sending SMS...\n');

sns.publish(params).promise()
    .then((result) => {
        console.log('✅ SMS SENT SUCCESSFULLY!\n');
        console.log('Message ID:', result.MessageId);
        console.log('Phone:', TEST_PHONE_NUMBER);
        console.log('');
        console.log('='.repeat(60));
        console.log('🎉 Check your phone for the SMS!');
        console.log('='.repeat(60));
        console.log('');
        console.log('💰 Cost: ~$0.00645 per SMS');
        console.log('📝 Note: This is SMS, not WhatsApp');
        console.log('');
    })
    .catch((err) => {
        console.error('❌ FAILED TO SEND SMS\n');
        console.error('Error Code:', err.code);
        console.error('Error Message:', err.message);
        console.error('');
        
        if (err.code === 'InvalidParameter') {
            console.error('💡 Fix: Check phone number format');
            console.error('   Must be E.164 format: +[country code][number]');
            console.error('   Example: +919876543210 (India)');
        } else if (err.code === 'AccessDenied') {
            console.error('💡 Fix: Add SNS:Publish permission to IAM user');
        } else if (err.code === 'OptedOut') {
            console.error('💡 Fix: This number has opted out of SMS');
            console.error('   Try a different number');
        }
        console.error('');
    });
