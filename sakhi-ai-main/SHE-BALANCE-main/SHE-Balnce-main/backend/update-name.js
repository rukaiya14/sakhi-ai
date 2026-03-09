const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });
const dynamodb = new AWS.DynamoDB.DocumentClient();

async function updateName() {
    console.log('Updating name for priya@example.com to Rukaiya...\n');
    
    try {
        // Find user by email
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
        
        // Update all users with this email (in case of duplicates)
        for (const user of queryResult.Items) {
            console.log(`Updating user ${user.userId}...`);
            
            await dynamodb.update({
                TableName: 'shebalance-users',
                Key: { userId: user.userId },
                UpdateExpression: 'SET fullName = :name, updatedAt = :timestamp',
                ExpressionAttributeValues: {
                    ':name': 'Rukaiya',
                    ':timestamp': new Date().toISOString()
                }
            }).promise();
            
            console.log('✅ Updated successfully');
        }
        
        console.log('\n🎉 Name updated to Rukaiya!');
        console.log('\nYou can now login with:');
        console.log('Email: priya@example.com');
        console.log('Password: artisan123');
        console.log('Name will show as: Rukaiya');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

updateName();
