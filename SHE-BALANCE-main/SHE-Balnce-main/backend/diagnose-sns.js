/**
 * Diagnose SNS Issues
 * Check account status, sandbox mode, and permissions
 */

require('dotenv').config();
const AWS = require('aws-sdk');

console.log('\n' + '='.repeat(60));
console.log('🔍 AWS SNS Diagnostic Tool');
console.log('='.repeat(60) + '\n');

const sns = new AWS.SNS({ 
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

async function diagnose() {
    try {
        // Check 1: SMS Attributes
        console.log('1️⃣  Checking SMS Attributes...');
        const attrs = await sns.getSMSAttributes().promise();
        console.log('✅ SMS Attributes retrieved');
        
        if (attrs.attributes && Object.keys(attrs.attributes).length > 0) {
            console.log('\n📊 Current Settings:');
            Object.entries(attrs.attributes).forEach(([key, value]) => {
                console.log(`   ${key}: ${value}`);
            });
        } else {
            console.log('   ⚠️  No SMS attributes configured');
            console.log('   This might cause issues. Setting defaults...\n');
            
            // Set default attributes
            try {
                await sns.setSMSAttributes({
                    attributes: {
                        'DefaultSMSType': 'Transactional',
                        'MonthlySpendLimit': '1'
                    }
                }).promise();
                console.log('   ✅ Default SMS attributes set');
            } catch (err) {
                console.log('   ⚠️  Could not set attributes:', err.message);
            }
        }
        
        console.log('');
        
        // Check 2: Account Status
        console.log('2️⃣  Checking Account Status...');
        
        // Check if in sandbox mode
        const accountAttrs = await sns.getSMSAttributes({
            attributes: ['MonthlySpendLimit']
        }).promise();
        
        const spendLimit = accountAttrs.attributes?.MonthlySpendLimit || '1.00';
        console.log(`   Monthly Spend Limit: $${spendLimit}`);
        
        if (parseFloat(spendLimit) <= 1.0) {
            console.log('   ⚠️  WARNING: Low spend limit detected!');
            console.log('   Your account might be in SANDBOX MODE');
            console.log('');
            console.log('   📝 SANDBOX MODE means:');
            console.log('      - You can only send SMS to VERIFIED phone numbers');
            console.log('      - You must verify each phone number first');
            console.log('      - Production use requires moving out of sandbox');
            console.log('');
            console.log('   🔧 To verify a phone number:');
            console.log('      1. Go to AWS Console → SNS');
            console.log('      2. Click "Text messaging (SMS)"');
            console.log('      3. Click "Sandbox destination phone numbers"');
            console.log('      4. Click "Add phone number"');
            console.log('      5. Enter your phone number');
            console.log('      6. Verify with the code sent to your phone');
            console.log('');
            console.log('   🚀 To exit sandbox mode:');
            console.log('      1. Go to AWS Console → SNS');
            console.log('      2. Click "Text messaging (SMS)"');
            console.log('      3. Request production access');
            console.log('');
        } else {
            console.log('   ✅ Account appears to be in production mode');
        }
        
        console.log('');
        
        // Check 3: Opted Out Numbers
        console.log('3️⃣  Checking Opted-Out Numbers...');
        try {
            const optedOut = await sns.listPhoneNumbersOptedOut().promise();
            if (optedOut.phoneNumbers && optedOut.phoneNumbers.length > 0) {
                console.log('   ⚠️  Found opted-out numbers:');
                optedOut.phoneNumbers.forEach(num => {
                    console.log(`      - ${num}`);
                });
            } else {
                console.log('   ✅ No opted-out numbers');
            }
        } catch (err) {
            console.log('   ⚠️  Could not check opted-out numbers:', err.message);
        }
        
        console.log('');
        console.log('='.repeat(60));
        console.log('📋 SUMMARY');
        console.log('='.repeat(60));
        console.log('');
        
        if (parseFloat(spendLimit) <= 1.0) {
            console.log('⚠️  YOUR ACCOUNT IS LIKELY IN SANDBOX MODE');
            console.log('');
            console.log('This is the most common reason SMS fails!');
            console.log('');
            console.log('🔧 SOLUTION:');
            console.log('   Option 1: Verify your phone number in AWS Console');
            console.log('   Option 2: Request production access');
            console.log('');
            console.log('📝 Steps to verify phone number:');
            console.log('   1. Open: https://console.aws.amazon.com/sns/');
            console.log('   2. Click "Text messaging (SMS)" in left menu');
            console.log('   3. Scroll to "Sandbox destination phone numbers"');
            console.log('   4. Click "Add phone number"');
            console.log('   5. Enter: +[your_country_code][your_number]');
            console.log('   6. Click "Add phone number"');
            console.log('   7. Check your phone for verification code');
            console.log('   8. Enter the code in AWS Console');
            console.log('   9. Try sending SMS again!');
            console.log('');
        } else {
            console.log('✅ Account configuration looks good');
            console.log('');
            console.log('If SMS still fails, check:');
            console.log('   - Phone number format (E.164: +919876543210)');
            console.log('   - Phone number is not opted out');
            console.log('   - AWS CloudWatch logs for errors');
            console.log('');
        }
        
    } catch (error) {
        console.error('❌ Error during diagnosis:');
        console.error('   Code:', error.code);
        console.error('   Message:', error.message);
        console.error('');
        
        if (error.code === 'AccessDenied') {
            console.error('💡 Your IAM user needs these permissions:');
            console.error('   - sns:GetSMSAttributes');
            console.error('   - sns:SetSMSAttributes');
            console.error('   - sns:ListPhoneNumbersOptedOut');
        }
    }
}

diagnose();
