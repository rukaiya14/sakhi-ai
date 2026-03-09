const bcrypt = require('bcryptjs');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({ region: 'us-east-1' });
const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createCorporateUser() {
    console.log('Creating corporate buyer user...\n');
    
    try {
        const email = 'corporate@shebalance.com';
        const password = 'corporate123';
        const fullName = 'Corporate Buyer';
        
        // Check if user already exists
        const existing = await dynamodb.query({
            TableName: 'shebalance-users',
            IndexName: 'EmailIndex',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': email
            }
        }).promise();
        
        if (existing.Items.length > 0) {
            console.log('✅ Corporate user already exists');
            console.log('Email:', email);
            console.log('Password: corporate123');
            return;
        }
        
        // Create user
        const userId = uuidv4();
        const passwordHash = await bcrypt.hash(password, 10);
        const timestamp = new Date().toISOString();
        
        await dynamodb.put({
            TableName: 'shebalance-users',
            Item: {
                userId,
                email,
                passwordHash,
                fullName,
                phone: '+91-9999999999',
                role: 'corporate',
                status: 'active',
                profileImage: null,
                createdAt: timestamp,
                updatedAt: timestamp,
                lastLogin: null,
                emailVerified: false,
                phoneVerified: false
            }
        }).promise();
        
        console.log('✅ Corporate user created successfully!');
        console.log('\nLogin credentials:');
        console.log('Email:', email);
        console.log('Password: corporate123');
        console.log('Role: corporate');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createCorporateUser();
