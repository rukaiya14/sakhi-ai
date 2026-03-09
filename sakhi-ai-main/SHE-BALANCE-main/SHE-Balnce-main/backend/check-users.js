const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });
const dynamodb = new AWS.DynamoDB.DocumentClient();

async function checkUsers() {
    console.log('Checking users in DynamoDB...\n');
    
    try {
        // Scan all users
        const result = await dynamodb.scan({
            TableName: 'shebalance-users'
        }).promise();
        
        console.log(`Found ${result.Items.length} users:\n`);
        
        result.Items.forEach((user, index) => {
            console.log(`${index + 1}. ${user.fullName}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Status: ${user.status}`);
            console.log(`   Has password: ${user.passwordHash ? 'Yes' : 'No'}`);
            console.log('');
        });
        
        // Test query by email
        console.log('Testing email query for priya@example.com...');
        const queryResult = await dynamodb.query({
            TableName: 'shebalance-users',
            IndexName: 'EmailIndex',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': 'priya@example.com'
            }
        }).promise();
        
        if (queryResult.Items.length > 0) {
            console.log('✅ Found user by email!');
            console.log('User:', queryResult.Items[0].fullName);
        } else {
            console.log('❌ User not found by email query');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkUsers();
