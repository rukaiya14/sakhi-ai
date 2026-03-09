// AWS DynamoDB Setup for Production
// Alternative to MySQL for serverless deployment

const AWS = require('aws-sdk');
require('dotenv').config();

// Configure AWS
AWS.config.update({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamodb = new AWS.DynamoDB();
const tablePrefix = process.env.DYNAMODB_TABLE_PREFIX || 'shebalance-';

// Table definitions
const tables = [
    {
        TableName: `${tablePrefix}users`,
        KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' }
        ],
        AttributeDefinitions: [
            { AttributeName: 'userId', AttributeType: 'S' },
            { AttributeName: 'email', AttributeType: 'S' },
            { AttributeName: 'role', AttributeType: 'S' }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'EmailIndex',
                KeySchema: [
                    { AttributeName: 'email', KeyType: 'HASH' }
                ],
                Projection: { ProjectionType: 'ALL' },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5
                }
            },
            {
                IndexName: 'RoleIndex',
                KeySchema: [
                    { AttributeName: 'role', KeyType: 'HASH' }
                ],
                Projection: { ProjectionType: 'ALL' },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5
                }
            }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    },
    {
        TableName: `${tablePrefix}artisan-profiles`,
        KeySchema: [
            { AttributeName: 'artisanId', KeyType: 'HASH' }
        ],
        AttributeDefinitions: [
            { AttributeName: 'artisanId', AttributeType: 'S' },
            { AttributeName: 'userId', AttributeType: 'S' }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'UserIdIndex',
                KeySchema: [
                    { AttributeName: 'userId', KeyType: 'HASH' }
                ],
                Projection: { ProjectionType: 'ALL' },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5
                }
            }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    },
    {
        TableName: `${tablePrefix}buyer-profiles`,
        KeySchema: [
            { AttributeName: 'buyerId', KeyType: 'HASH' }
        ],
        AttributeDefinitions: [
            { AttributeName: 'buyerId', AttributeType: 'S' },
            { AttributeName: 'userId', AttributeType: 'S' }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'UserIdIndex',
                KeySchema: [
                    { AttributeName: 'userId', KeyType: 'HASH' }
                ],
                Projection: { ProjectionType: 'ALL' },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5
                }
            }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    },
    {
        TableName: `${tablePrefix}corporate-profiles`,
        KeySchema: [
            { AttributeName: 'corporateId', KeyType: 'HASH' }
        ],
        AttributeDefinitions: [
            { AttributeName: 'corporateId', AttributeType: 'S' },
            { AttributeName: 'userId', AttributeType: 'S' }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'UserIdIndex',
                KeySchema: [
                    { AttributeName: 'userId', KeyType: 'HASH' }
                ],
                Projection: { ProjectionType: 'ALL' },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5
                }
            }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    },
    {
        TableName: `${tablePrefix}orders`,
        KeySchema: [
            { AttributeName: 'orderId', KeyType: 'HASH' }
        ],
        AttributeDefinitions: [
            { AttributeName: 'orderId', AttributeType: 'S' },
            { AttributeName: 'buyerId', AttributeType: 'S' },
            { AttributeName: 'artisanId', AttributeType: 'S' },
            { AttributeName: 'status', AttributeType: 'S' }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'BuyerIdIndex',
                KeySchema: [
                    { AttributeName: 'buyerId', KeyType: 'HASH' }
                ],
                Projection: { ProjectionType: 'ALL' },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5
                }
            },
            {
                IndexName: 'ArtisanIdIndex',
                KeySchema: [
                    { AttributeName: 'artisanId', KeyType: 'HASH' }
                ],
                Projection: { ProjectionType: 'ALL' },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5
                }
            },
            {
                IndexName: 'StatusIndex',
                KeySchema: [
                    { AttributeName: 'status', KeyType: 'HASH' }
                ],
                Projection: { ProjectionType: 'ALL' },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5
                }
            }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    },
    {
        TableName: `${tablePrefix}skillscan-results`,
        KeySchema: [
            { AttributeName: 'scanId', KeyType: 'HASH' }
        ],
        AttributeDefinitions: [
            { AttributeName: 'scanId', AttributeType: 'S' },
            { AttributeName: 'artisanId', AttributeType: 'S' }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'ArtisanIdIndex',
                KeySchema: [
                    { AttributeName: 'artisanId', KeyType: 'HASH' }
                ],
                Projection: { ProjectionType: 'ALL' },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5
                }
            }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    },
    {
        TableName: `${tablePrefix}labour-tracking`,
        KeySchema: [
            { AttributeName: 'labourId', KeyType: 'HASH' }
        ],
        AttributeDefinitions: [
            { AttributeName: 'labourId', AttributeType: 'S' },
            { AttributeName: 'artisanId', AttributeType: 'S' }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'ArtisanIdIndex',
                KeySchema: [
                    { AttributeName: 'artisanId', KeyType: 'HASH' }
                ],
                Projection: { ProjectionType: 'ALL' },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5
                }
            }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    },
    {
        TableName: `${tablePrefix}ai-conversations`,
        KeySchema: [
            { AttributeName: 'conversationId', KeyType: 'HASH' }
        ],
        AttributeDefinitions: [
            { AttributeName: 'conversationId', AttributeType: 'S' },
            { AttributeName: 'userId', AttributeType: 'S' }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'UserIdIndex',
                KeySchema: [
                    { AttributeName: 'userId', KeyType: 'HASH' }
                ],
                Projection: { ProjectionType: 'ALL' },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 5,
                    WriteCapacityUnits: 5
                }
            }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    }
];

async function createTable(tableParams) {
    try {
        console.log(`Creating table: ${tableParams.TableName}...`);
        await dynamodb.createTable(tableParams).promise();
        console.log(`✅ Table ${tableParams.TableName} created successfully`);
        
        // Wait for table to be active
        await dynamodb.waitFor('tableExists', { TableName: tableParams.TableName }).promise();
        console.log(`✅ Table ${tableParams.TableName} is now active`);
        
    } catch (error) {
        if (error.code === 'ResourceInUseException') {
            console.log(`⚠️  Table ${tableParams.TableName} already exists`);
        } else {
            console.error(`❌ Error creating table ${tableParams.TableName}:`, error.message);
            throw error;
        }
    }
}

async function setupDynamoDB() {
    console.log('🔧 Setting up DynamoDB tables for SHE-BALANCE...\n');
    
    try {
        for (const table of tables) {
            await createTable(table);
        }
        
        console.log('\n🎉 DynamoDB setup completed successfully!');
        console.log('\n📋 Created tables:');
        tables.forEach(table => {
            console.log(`   - ${table.TableName}`);
        });
        
    } catch (error) {
        console.error('\n❌ DynamoDB setup failed:', error);
        process.exit(1);
    }
}

async function deleteTables() {
    console.log('🗑️  Deleting all SHE-BALANCE DynamoDB tables...\n');
    
    for (const table of tables) {
        try {
            console.log(`Deleting table: ${table.TableName}...`);
            await dynamodb.deleteTable({ TableName: table.TableName }).promise();
            console.log(`✅ Table ${table.TableName} deleted`);
        } catch (error) {
            if (error.code === 'ResourceNotFoundException') {
                console.log(`⚠️  Table ${table.TableName} does not exist`);
            } else {
                console.error(`❌ Error deleting table ${table.TableName}:`, error.message);
            }
        }
    }
    
    console.log('\n✅ Cleanup completed');
}

// Command line interface
const command = process.argv[2];

if (command === 'create') {
    setupDynamoDB();
} else if (command === 'delete') {
    deleteTables();
} else {
    console.log('Usage:');
    console.log('  node aws-dynamodb-setup.js create  - Create all tables');
    console.log('  node aws-dynamodb-setup.js delete  - Delete all tables');
}

module.exports = { setupDynamoDB, deleteTables };
