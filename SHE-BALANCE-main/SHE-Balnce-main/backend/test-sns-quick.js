/**
 * Quick SNS Test
 */

require('dotenv').config();
const AWS = require('aws-sdk');

console.log('\n🧪 Testing AWS SNS...\n');

console.log('Credentials:');
console.log('  Access Key:', process.env.AWS_ACCESS_KEY_ID ? process.env.AWS_ACCESS_KEY_ID.substring(0, 8) + '...' : 'NOT FOUND');
console.log('  Region:', process.env.AWS_REGION);
console.log('');

const sns = new AWS.SNS({ 
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

sns.getSMSAttributes().promise()
    .then((data) => {
        console.log('✅ SUCCESS! AWS SNS is working!\n');
        console.log('Your SNS is configured correctly.');
        console.log('You can now send SMS messages.\n');
    })
    .catch((err) => {
        console.error('❌ ERROR:', err.code);
        console.error('   Message:', err.message);
        console.error('');
        
        if (err.code === 'AccessDenied') {
            console.error('💡 Fix: Add SNS:Publish permission to your IAM user');
        }
    });
