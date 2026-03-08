/**
 * Test AWS SNS Connection
 * Quick test to verify AWS credentials work
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'SHE-BALANCE-main/SHE-Balnce-main/backend/.env') });
const AWS = require('aws-sdk');

console.log('\n' + '='.repeat(60));
console.log('🧪 Testing AWS SNS Connection');
console.log('='.repeat(60) + '\n');

// Check credentials
console.log('1️⃣  Checking credentials from .env file...');
if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === '') {
    console.error('❌ AWS_ACCESS_KEY_ID is empty');
    process.exit(1);
}
if (!process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY === '') {
    console.error('❌ AWS_SECRET_ACCESS_KEY is empty');
    process.exit(1);
}

console.log('✅ Credentials found in .env');
console.log(`   Region: ${process.env.AWS_REGION}`);
console.log(`   Access Key: ${process.env.AWS_ACCESS_KEY_ID.substring(0, 8)}...`);
console.log('');

// Initialize SNS
console.log('2️⃣  Initializing AWS SNS client...');
const sns = new AWS.SNS({ 
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
console.log('✅ SNS client initialized');
console.log('');

// Test connection
console.log('3️⃣  Testing SNS permissions...');
sns.getSMSAttributes().promise()
    .then((data) => {
        console.log('✅ AWS SNS Connection Successful!');
        console.log('');
        console.log('📊 SMS Attributes:');
        if (data.attributes && Object.keys(data.attributes).length > 0) {
            Object.entries(data.attributes).forEach(([key, value]) => {
                console.log(`   ${key}: ${value}`);
            });
        } else {
            console.log('   No attributes configured (this is OK)');
        }
        console.log('');
        console.log('='.repeat(60));
        console.log('🎉 SUCCESS! Your SNS is configured correctly!');
        console.log('='.repeat(60));
        console.log('');
        console.log('✅ Next steps:');
        console.log('   1. Start backend: cd SHE-BALANCE-main\\SHE-Balnce-main\\backend && node server-dynamodb.js');
        console.log('   2. Open test page: http://localhost:3000/test-sns-whatsapp.html');
        console.log('   3. Send a test SMS to your phone');
        console.log('');
    })
    .catch((err) => {
        console.error('❌ Error connecting to AWS SNS');
        console.error('');
        console.error('Error Code:', err.code);
        console.error('Error Message:', err.message);
        console.error('');
        
        if (err.code === 'InvalidClientTokenId') {
            console.error('💡 Solution: Your AWS Access Key ID is invalid');
            console.error('   Check the AWS_ACCESS_KEY_ID in .env file');
        } else if (err.code === 'SignatureDoesNotMatch') {
            console.error('💡 Solution: Your AWS Secret Access Key is invalid');
            console.error('   Check the AWS_SECRET_ACCESS_KEY in .env file');
        } else if (err.code === 'AccessDenied') {
            console.error('💡 Solution: Your IAM user lacks SNS permissions');
            console.error('   Add SNS:Publish permission in AWS IAM Console');
        } else {
            console.error('💡 Unknown error. Check AWS credentials and permissions.');
        }
        console.error('');
        process.exit(1);
    });
