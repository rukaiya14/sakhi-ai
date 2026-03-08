const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });
const dynamodb = new AWS.DynamoDB.DocumentClient();

async function updateEmail() {
    console.log('Updating email from priya@example.com to rukaiya@example.com...\n');
    
    try {
        // Find user by old email
        const queryResult = await dynamodb.query({
            TableName: 'shebalance-users',
            IndexName: 'EmailIndex',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': 'priya@example.com'
            }
        }).promise();
        
        if (queryResult.Items.length === 0) {
            console.log('❌ User not found');
            return;
        }
        
        console.log(`Found ${queryResult.Items.length} user(s) with this email`);
        
        // Keep only the first user, delete duplicates
        const mainUser = queryResult.Items[0];
        
        // Delete duplicate users
        for (let i = 1; i < queryResult.Items.length; i++) {
            const user = queryResult.Items[i];
            console.log(`Deleting duplicate user ${user.userId}...`);
            
            await dynamodb.delete({
                TableName: 'shebalance-users',
                Key: { userId: user.userId }
            }).promise();
            
            console.log('✅ Duplicate deleted');
        }
        
        // Update the main user's email
        console.log(`\nUpdating main user ${mainUser.userId}...`);
        
        await dynamodb.update({
            TableName: 'shebalance-users',
            Key: { userId: mainUser.userId },
            UpdateExpression: 'SET email = :newEmail, fullName = :name, updatedAt = :timestamp',
            ExpressionAttributeValues: {
                ':newEmail': 'rukaiya@example.com',
                ':name': 'Rukaiya',
                ':timestamp': new Date().toISOString()
            }
        }).promise();
        
        console.log('✅ Email and name updated successfully');
        
        console.log('\n🎉 Update completed!');
        console.log('\nNew login credentials:');
        console.log('Email: rukaiya@example.com');
        console.log('Password: artisan123');
        console.log('Name: Rukaiya');
        console.log('Role: artisan');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

updateEmail();
