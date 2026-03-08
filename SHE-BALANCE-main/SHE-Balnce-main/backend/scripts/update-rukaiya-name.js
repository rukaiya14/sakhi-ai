/**
 * Update Rukaiya's name from "Rukaiya Ghadiyali" to "Rukaiya Khan"
 */

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

async function updateRukaiyaName() {
    console.log('🔧 Updating Rukaiya\'s name to "Rukaiya Khan"...\n');
    
    try {
        // Find Rukaiya by email
        console.log('Searching for rukaiya@example.com...');
        const result = await docClient.send(new ScanCommand({
            TableName: 'shebalance-users',
            FilterExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': 'rukaiya@example.com'
            }
        }));
        
        if (!result.Items || result.Items.length === 0) {
            console.log('❌ User not found with email: rukaiya@example.com');
            console.log('\nTrying to find by partial name match...');
            
            // Try finding by name
            const nameResult = await docClient.send(new ScanCommand({
                TableName: 'shebalance-users',
                FilterExpression: 'contains(fullName, :name)',
                ExpressionAttributeValues: {
                    ':name': 'Rukaiya'
                }
            }));
            
            if (!nameResult.Items || nameResult.Items.length === 0) {
                console.log('❌ No users found with name containing "Rukaiya"');
                return;
            }
            
            console.log(`\n✅ Found ${nameResult.Items.length} user(s) with "Rukaiya" in name:`);
            nameResult.Items.forEach(user => {
                console.log(`   - ${user.fullName} (${user.email}) - ID: ${user.userId}`);
            });
            
            // Update all matching users
            for (const user of nameResult.Items) {
                console.log(`\nUpdating ${user.fullName} to "Rukaiya Khan"...`);
                
                await docClient.send(new UpdateCommand({
                    TableName: 'shebalance-users',
                    Key: { userId: user.userId },
                    UpdateExpression: 'SET fullName = :name, updatedAt = :timestamp',
                    ExpressionAttributeValues: {
                        ':name': 'Rukaiya Khan',
                        ':timestamp': new Date().toISOString()
                    }
                }));
                
                console.log(`✅ Updated ${user.email} successfully`);
            }
            
        } else {
            // Update the found user
            const user = result.Items[0];
            console.log(`\n✅ Found user: ${user.fullName} (${user.email})`);
            console.log(`   Current name: ${user.fullName}`);
            console.log(`   Updating to: Rukaiya Khan`);
            
            await docClient.send(new UpdateCommand({
                TableName: 'shebalance-users',
                Key: { userId: user.userId },
                UpdateExpression: 'SET fullName = :name, updatedAt = :timestamp',
                ExpressionAttributeValues: {
                    ':name': 'Rukaiya Khan',
                    ':timestamp': new Date().toISOString()
                }
            }));
            
            console.log('✅ Updated successfully!');
        }
        
        console.log('\n🎉 Name update complete!');
        console.log('\nRefresh your dashboard to see: Rukaiya Khan');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    }
}

// Run the update
updateRukaiyaName();
