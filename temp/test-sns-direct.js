/**
 * Direct SNS Test Script
 * Tests AWS SNS configuration and sends a test SMS
 */

const AWS = require('aws-sdk');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'SHE-BALANCE-main/SHE-Balnce-main/backend/.env') });

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testSNS() {
    console.log('\n' + '='.repeat(60));
    log('🧪 AWS SNS Direct Test', 'cyan');
    console.log('='.repeat(60) + '\n');
    
    try {
        // Test 1: Check credentials
        log('1️⃣  Checking AWS credentials...', 'blue');
        
        if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === '') {
            log('❌ AWS_ACCESS_KEY_ID not found in .env file', 'red');
            log('\n📝 To fix:', 'yellow');
            log('   1. Go to AWS Console → IAM → Users', 'yellow');
            log('   2. Select your user → Security credentials', 'yellow');
            log('   3. Create access key', 'yellow');
            log('   4. Add to .env file:', 'yellow');
            log('      AWS_ACCESS_KEY_ID=your_key_here', 'yellow');
            return;
        }
        
        if (!process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY === '') {
            log('❌ AWS_SECRET_ACCESS_KEY not found in .env file', 'red');
            log('\n📝 To fix: Add AWS_SECRET_ACCESS_KEY to .env file', 'yellow');
            return;
        }
        
        log('✅ AWS credentials found', 'green');
        log(`   Region: ${process.env.AWS_REGION || 'us-east-1'}`, 'cyan');
        log(`   Access Key: ${process.env.AWS_ACCESS_KEY_ID.substring(0, 8)}...`, 'cyan');
        console.log('');
        
        // Initialize SNS
        const sns = new AWS.SNS({ 
            region: process.env.AWS_REGION || 'us-east-1',
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        });
        
        // Test 2: Check SNS permissions
        log('2️⃣  Checking SNS permissions...', 'blue');
        
        try {
            const attrs = await sns.getSMSAttributes().promise();
            log('✅ SNS permissions OK', 'green');
            
            if (attrs.attributes && Object.keys(attrs.attributes).length > 0) {
                log('📊 Current SMS Attributes:', 'cyan');
                Object.entries(attrs.attributes).forEach(([key, value]) => {
                    log(`   ${key}: ${value}`, 'cyan');
                });
            } else {
                log('   No SMS attributes configured (this is OK)', 'cyan');
            }
            console.log('');
        } catch (error) {
            if (error.code === 'AccessDenied') {
                log('❌ Access Denied - IAM user lacks SNS permissions', 'red');
                log('\n📝 To fix:', 'yellow');
                log('   1. Go to AWS Console → IAM → Users → [Your User]', 'yellow');
                log('   2. Add permissions → Attach policies', 'yellow');
                log('   3. Add this policy:', 'yellow');
                log('      {', 'yellow');
                log('        "Effect": "Allow",', 'yellow');
                log('        "Action": ["sns:Publish", "sns:GetSMSAttributes"],', 'yellow');
                log('        "Resource": "*"', 'yellow');
                log('      }', 'yellow');
                return;
            }
            throw error;
        }
        
        // Test 3: Prompt for phone number
        log('3️⃣  Ready to send test SMS', 'blue');
        log('⚠️  IMPORTANT: Update the phone number below before running!', 'yellow');
        console.log('');
        
        // CHANGE THIS TO YOUR PHONE NUMBER
        const phoneNumber = '+919876543210'; // ⚠️ CHANGE THIS!
        
        if (phoneNumber === '+919876543210') {
            log('⚠️  Using default test number: +919876543210', 'yellow');
            log('   Please edit test-sns-direct.js and change the phone number', 'yellow');
            console.log('');
        }
        
        log(`📞 Sending test SMS to: ${phoneNumber}`, 'cyan');
        
        const params = {
            Message: '🌸 Test from SHE-BALANCE!\n\nIf you receive this message, AWS SNS is working correctly.\n\nThis is an SMS, not WhatsApp. For WhatsApp, you need WhatsApp Business API.\n\n-- SHE-BALANCE Team',
            PhoneNumber: phoneNumber,
            MessageAttributes: {
                'AWS.SNS.SMS.SMSType': {
                    DataType: 'String',
                    StringValue: 'Transactional'
                }
            }
        };
        
        log('📤 Sending...', 'cyan');
        const result = await sns.publish(params).promise();
        
        console.log('');
        log('✅ SMS sent successfully!', 'green');
        log(`📱 Message ID: ${result.MessageId}`, 'green');
        log(`📞 Sent to: ${phoneNumber}`, 'green');
        console.log('');
        log('🎉 AWS SNS is working correctly!', 'green');
        log('📱 Check your phone for the SMS message', 'green');
        console.log('');
        log('📝 Note: This sends SMS, not WhatsApp', 'yellow');
        log('   For WhatsApp, you need WhatsApp Business API', 'yellow');
        
    } catch (error) {
        console.log('');
        log('❌ Error occurred:', 'red');
        log(`   ${error.message}`, 'red');
        console.log('');
        
        log('🔍 Troubleshooting:', 'yellow');
        
        if (error.code === 'InvalidClientTokenId') {
            log('   ❌ Your AWS Access Key ID is invalid', 'red');
            log('   📝 Solution:', 'yellow');
            log('      1. Go to AWS IAM Console', 'yellow');
            log('      2. Generate new access keys', 'yellow');
            log('      3. Update .env file', 'yellow');
        } else if (error.code === 'SignatureDoesNotMatch') {
            log('   ❌ Your AWS Secret Access Key is incorrect', 'red');
            log('   📝 Solution:', 'yellow');
            log('      1. Check for typos in .env file', 'yellow');
            log('      2. Make sure there are no extra spaces', 'yellow');
            log('      3. Regenerate keys if needed', 'yellow');
        } else if (error.code === 'AccessDenied') {
            log('   ❌ Your IAM user lacks SNS permissions', 'red');
            log('   📝 Solution:', 'yellow');
            log('      1. Go to AWS IAM Console', 'yellow');
            log('      2. Add SNS:Publish permission to your user', 'yellow');
        } else if (error.code === 'InvalidParameter') {
            log('   ❌ Phone number format is invalid', 'red');
            log('   📝 Solution:', 'yellow');
            log('      Use E.164 format: +[country code][number]', 'yellow');
            log('      Example: +919876543210 (India)', 'yellow');
            log('      Example: +14155552671 (USA)', 'yellow');
        } else if (error.code === 'OptedOut') {
            log('   ❌ This phone number has opted out of SMS', 'red');
            log('   📝 Solution:', 'yellow');
            log('      Try a different phone number', 'yellow');
        } else {
            log(`   ❌ Unknown error: ${error.code}`, 'red');
            log('   📝 Full error:', 'yellow');
            console.log(error);
        }
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
}

// Run the test
testSNS();
