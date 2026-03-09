/**
 * Send Test SMS via AWS SNS - Interactive Version
 */

require('dotenv').config();
const AWS = require('aws-sdk');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\n' + '='.repeat(60));
console.log('📱 Send Test SMS via AWS SNS');
console.log('='.repeat(60) + '\n');

rl.question('Enter your phone number (E.164 format, e.g., +919876543210): ', (phoneNumber) => {
    
    if (!phoneNumber || phoneNumber.trim() === '') {
        console.log('❌ Phone number is required!');
        rl.close();
        return;
    }
    
    phoneNumber = phoneNumber.trim();
    
    // Validate format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
        console.log('❌ Invalid phone number format!');
        console.log('   Use E.164 format: +[country code][number]');
        console.log('   Example: +919876543210 (India)');
        rl.close();
        return;
    }
    
    console.log('\n📞 Phone Number:', phoneNumber);
    console.log('🌍 Region:', process.env.AWS_REGION);
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
        PhoneNumber: phoneNumber,
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
            console.log('Phone:', phoneNumber);
            console.log('');
            console.log('='.repeat(60));
            console.log('🎉 Check your phone for the SMS!');
            console.log('='.repeat(60));
            console.log('');
            console.log('💰 Cost: ~$0.00645 per SMS');
            console.log('📝 Note: This is SMS, not WhatsApp');
            console.log('');
            rl.close();
        })
        .catch((err) => {
            console.error('❌ FAILED TO SEND SMS\n');
            console.error('Error Code:', err.code);
            console.error('Error Message:', err.message);
            console.error('');
            
            if (err.code === 'InvalidParameter') {
                console.error('💡 Fix: Check phone number format');
                console.error('   Must be E.164 format: +[country code][number]');
            } else if (err.code === 'AccessDenied') {
                console.error('💡 Fix: Add SNS:Publish permission to IAM user');
            } else if (err.code === 'OptedOut') {
                console.error('💡 Fix: This number has opted out of SMS');
            }
            console.error('');
            rl.close();
        });
});
