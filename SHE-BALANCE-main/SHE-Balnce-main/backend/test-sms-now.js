/**
 * Quick SMS Test - Just enter your phone number
 */

require('dotenv').config();
const AWS = require('aws-sdk');

// Get phone number from command line argument
const phoneNumber = process.argv[2];

if (!phoneNumber) {
    console.log('\n❌ Please provide phone number as argument');
    console.log('\nUsage: node test-sms-now.js +919876543210');
    console.log('');
    process.exit(1);
}

console.log('\n' + '='.repeat(60));
console.log('📱 Sending Test SMS');
console.log('='.repeat(60));
console.log('');
console.log('To:', phoneNumber);
console.log('Region:', process.env.AWS_REGION);
console.log('');

const sns = new AWS.SNS({ 
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const message = `🌸 SHE-BALANCE Test SMS

This is a test message from your SNS system.

If you receive this, everything is working!

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

console.log('📤 Sending...\n');

sns.publish(params).promise()
    .then((result) => {
        console.log('='.repeat(60));
        console.log('✅ SUCCESS!');
        console.log('='.repeat(60));
        console.log('');
        console.log('Message ID:', result.MessageId);
        console.log('Status: Sent to AWS SNS');
        console.log('');
        console.log('📱 CHECK YOUR PHONE!');
        console.log('');
        console.log('⏰ SMS should arrive within 1-5 minutes');
        console.log('💰 Cost: ~$0.00645');
        console.log('');
        console.log('If you don\'t receive it:');
        console.log('  1. Wait 5 minutes (can be delayed)');
        console.log('  2. Check phone number is verified in AWS Console');
        console.log('  3. Check AWS CloudWatch logs');
        console.log('');
    })
    .catch((error) => {
        console.log('='.repeat(60));
        console.log('❌ FAILED!');
        console.log('='.repeat(60));
        console.log('');
        console.log('Error:', error.code);
        console.log('Message:', error.message);
        console.log('');
        
        if (error.code === 'InvalidParameter') {
            console.log('💡 Phone number format is wrong');
            console.log('   Use: +[country code][number]');
            console.log('   Example: +919876543210');
        }
        console.log('');
    });
