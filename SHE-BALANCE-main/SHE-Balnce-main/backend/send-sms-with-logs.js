/**
 * Send SMS with Detailed Logging
 */

require('dotenv').config();
const AWS = require('aws-sdk');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\n' + '='.repeat(60));
console.log('📱 Send SMS with Detailed Logging');
console.log('='.repeat(60) + '\n');

rl.question('Enter your VERIFIED phone number (e.g., +919876543210): ', async (phoneNumber) => {
    
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
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 Configuration');
    console.log('='.repeat(60));
    console.log('Phone Number:', phoneNumber);
    console.log('Region:', process.env.AWS_REGION);
    console.log('Access Key:', process.env.AWS_ACCESS_KEY_ID.substring(0, 8) + '...');
    console.log('='.repeat(60));
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
    
    console.log('📤 Sending SMS...');
    console.log('');
    
    try {
        const startTime = Date.now();
        const result = await sns.publish(params).promise();
        const endTime = Date.now();
        
        console.log('='.repeat(60));
        console.log('✅ SMS REQUEST SUCCESSFUL!');
        console.log('='.repeat(60));
        console.log('');
        console.log('📊 Response Details:');
        console.log('   Message ID:', result.MessageId);
        console.log('   Phone:', phoneNumber);
        console.log('   Request Time:', (endTime - startTime) + 'ms');
        console.log('   Timestamp:', new Date().toISOString());
        console.log('');
        console.log('='.repeat(60));
        console.log('📱 CHECK YOUR PHONE NOW!');
        console.log('='.repeat(60));
        console.log('');
        console.log('⏰ SMS should arrive within 1-5 minutes');
        console.log('');
        console.log('📝 If you don\'t receive SMS:');
        console.log('   1. Wait 5 minutes (SMS can be delayed)');
        console.log('   2. Check if phone number is correct');
        console.log('   3. Check if phone number is verified in AWS Console');
        console.log('   4. Check AWS CloudWatch logs for delivery status');
        console.log('');
        console.log('🔍 To check delivery status:');
        console.log('   1. Go to AWS Console → CloudWatch');
        console.log('   2. Click "Logs" → "Log groups"');
        console.log('   3. Search for SNS logs');
        console.log('   4. Look for Message ID:', result.MessageId);
        console.log('');
        console.log('💰 Cost: ~$0.00645 per SMS');
        console.log('📝 Note: This is SMS, not WhatsApp');
        console.log('');
        
    } catch (error) {
        console.log('='.repeat(60));
        console.log('❌ SMS REQUEST FAILED!');
        console.log('='.repeat(60));
        console.log('');
        console.log('Error Code:', error.code);
        console.log('Error Message:', error.message);
        console.log('');
        
        if (error.code === 'InvalidParameter') {
            console.log('💡 Fix: Check phone number format');
            console.log('   Must be E.164 format: +[country code][number]');
            console.log('   Example: +919876543210 (India)');
        } else if (error.code === 'AccessDenied') {
            console.log('💡 Fix: Add SNS:Publish permission to IAM user');
        } else if (error.code === 'OptedOut') {
            console.log('💡 Fix: This number has opted out of SMS');
            console.log('   Try a different number');
        } else if (error.code === 'InvalidClientTokenId') {
            console.log('💡 Fix: AWS Access Key ID is invalid');
        } else if (error.code === 'SignatureDoesNotMatch') {
            console.log('💡 Fix: AWS Secret Access Key is invalid');
        } else {
            console.log('💡 Unknown error. Full details:');
            console.log(error);
        }
        console.log('');
    }
    
    rl.close();
});
