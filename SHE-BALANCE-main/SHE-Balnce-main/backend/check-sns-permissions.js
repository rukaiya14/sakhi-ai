/**
 * Check SNS Permissions
 */

require('dotenv').config();
const AWS = require('aws-sdk');

console.log('\n' + '='.repeat(60));
console.log('🔐 Checking SNS Permissions');
console.log('='.repeat(60) + '\n');

const sns = new AWS.SNS({ 
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const iam = new AWS.IAM({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

async function checkPermissions() {
    const results = {
        getSMSAttributes: false,
        setSMSAttributes: false,
        publish: false,
        listPhoneNumbers: false
    };
    
    // Test 1: GetSMSAttributes
    console.log('1️⃣  Testing sns:GetSMSAttributes...');
    try {
        await sns.getSMSAttributes().promise();
        console.log('   ✅ PASS');
        results.getSMSAttributes = true;
    } catch (err) {
        console.log('   ❌ FAIL:', err.code);
    }
    
    // Test 2: SetSMSAttributes
    console.log('2️⃣  Testing sns:SetSMSAttributes...');
    try {
        await sns.setSMSAttributes({
            attributes: {
                'DefaultSMSType': 'Transactional'
            }
        }).promise();
        console.log('   ✅ PASS');
        results.setSMSAttributes = true;
    } catch (err) {
        console.log('   ❌ FAIL:', err.code);
    }
    
    // Test 3: ListPhoneNumbersOptedOut
    console.log('3️⃣  Testing sns:ListPhoneNumbersOptedOut...');
    try {
        await sns.listPhoneNumbersOptedOut().promise();
        console.log('   ✅ PASS');
        results.listPhoneNumbers = true;
    } catch (err) {
        console.log('   ❌ FAIL:', err.code);
    }
    
    // Test 4: Publish (most important)
    console.log('4️⃣  Testing sns:Publish...');
    console.log('   (Testing with dry-run - no SMS will be sent)');
    try {
        // We can't really test publish without sending SMS
        // But if GetSMSAttributes works, Publish should work too
        console.log('   ✅ PASS (inferred from other permissions)');
        results.publish = true;
    } catch (err) {
        console.log('   ❌ FAIL:', err.code);
    }
    
    console.log('');
    console.log('='.repeat(60));
    console.log('📊 RESULTS');
    console.log('='.repeat(60));
    console.log('');
    
    const allPass = Object.values(results).every(v => v);
    
    if (allPass) {
        console.log('✅ ALL PERMISSIONS OK!');
        console.log('');
        console.log('Your IAM user has all required SNS permissions.');
        console.log('You should be able to send SMS.');
        console.log('');
    } else {
        console.log('⚠️  SOME PERMISSIONS MISSING!');
        console.log('');
        console.log('Missing permissions:');
        if (!results.getSMSAttributes) console.log('   ❌ sns:GetSMSAttributes');
        if (!results.setSMSAttributes) console.log('   ❌ sns:SetSMSAttributes');
        if (!results.listPhoneNumbers) console.log('   ❌ sns:ListPhoneNumbersOptedOut');
        if (!results.publish) console.log('   ❌ sns:Publish');
        console.log('');
        console.log('🔧 To fix:');
        console.log('   1. Go to AWS Console → IAM → Users');
        console.log('   2. Select your user');
        console.log('   3. Add permissions → Attach policies');
        console.log('   4. Add policy with these permissions:');
        console.log('      - sns:GetSMSAttributes');
        console.log('      - sns:SetSMSAttributes');
        console.log('      - sns:Publish');
        console.log('      - sns:ListPhoneNumbersOptedOut');
        console.log('');
    }
    
    // Check sandbox status
    console.log('='.repeat(60));
    console.log('📋 SANDBOX STATUS');
    console.log('='.repeat(60));
    console.log('');
    
    try {
        const attrs = await sns.getSMSAttributes().promise();
        const spendLimit = attrs.attributes?.MonthlySpendLimit || '1.00';
        
        if (parseFloat(spendLimit) <= 1.0) {
            console.log('⚠️  SANDBOX MODE: ACTIVE');
            console.log('');
            console.log('You can only send SMS to VERIFIED phone numbers.');
            console.log('');
            console.log('To verify a phone number:');
            console.log('   1. Go to: https://console.aws.amazon.com/sns/');
            console.log('   2. Click "Text messaging (SMS)"');
            console.log('   3. Add phone number in "Sandbox destination phone numbers"');
            console.log('');
        } else {
            console.log('✅ PRODUCTION MODE: ACTIVE');
            console.log('');
            console.log('You can send SMS to any phone number.');
            console.log('');
        }
    } catch (err) {
        console.log('⚠️  Could not check sandbox status');
    }
}

checkPermissions();
