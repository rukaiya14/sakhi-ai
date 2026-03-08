/**
 * Create AWS Cognito User Pool with 4 test users
 */

const { 
    CognitoIdentityProviderClient, 
    CreateUserPoolCommand,
    CreateUserPoolClientCommand,
    AdminCreateUserCommand,
    AdminSetUserPasswordCommand
} = require("@aws-sdk/client-cognito-identity-provider");

const AWS_REGION = 'us-east-1';
const AWS_ACCESS_KEY = 'AKIAQ6QTGQFJMMLWKLON';
const AWS_SECRET_KEY = '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';

const client = new CognitoIdentityProviderClient({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_KEY
    }
});

async function createCognitoSetup() {
    try {
        console.log('🚀 Creating Cognito User Pool...\n');

        // Step 1: Create User Pool
        const createPoolCommand = new CreateUserPoolCommand({
            PoolName: 'she-balance-users',
            Policies: {
                PasswordPolicy: {
                    MinimumLength: 8,
                    RequireUppercase: false,
                    RequireLowercase: false,
                    RequireNumbers: false,
                    RequireSymbols: false
                }
            },
            AutoVerifiedAttributes: ['email'],
            UsernameAttributes: ['email'],
            UsernameConfiguration: {
                CaseSensitive: false
            },
            Schema: [
                {
                    Name: 'email',
                    AttributeDataType: 'String',
                    Required: true,
                    Mutable: true
                }
            ],
            AdminCreateUserConfig: {
                AllowAdminCreateUserOnly: true
            }
        });

        const poolResponse = await client.send(createPoolCommand);
        const userPoolId = poolResponse.UserPool.Id;
        
        console.log('✅ User Pool Created!');
        console.log('   Pool ID:', userPoolId);
        console.log('');

        // Step 2: Create App Client
        const createClientCommand = new CreateUserPoolClientCommand({
            UserPoolId: userPoolId,
            ClientName: 'she-balance-web',
            GenerateSecret: false,
            ExplicitAuthFlows: [
                'ALLOW_USER_PASSWORD_AUTH',
                'ALLOW_REFRESH_TOKEN_AUTH'
            ],
            PreventUserExistenceErrors: 'ENABLED'
        });

        const clientResponse = await client.send(createClientCommand);
        const clientId = clientResponse.UserPoolClient.ClientId;
        
        console.log('✅ App Client Created!');
        console.log('   Client ID:', clientId);
        console.log('');

        // Step 3: Create 4 test users
        const users = [
            { email: 'rukaiya@example.com', password: 'artisan123', name: 'Rukaiya Khan', role: 'artisan' },
            { email: 'rahul@example.com', password: 'buyer123', name: 'Rahul Kumar', role: 'buyer' },
            { email: 'corporate@shebalance.com', password: 'corporate123', name: 'Corporate Buyer', role: 'corporate' },
            { email: 'admin@shebalance.com', password: 'admin123', name: 'Admin User', role: 'admin' }
        ];

        console.log('👥 Creating test users...\n');

        for (const user of users) {
            try {
                // Create user
                const createUserCommand = new AdminCreateUserCommand({
                    UserPoolId: userPoolId,
                    Username: user.email,
                    UserAttributes: [
                        { Name: 'email', Value: user.email },
                        { Name: 'email_verified', Value: 'true' },
                        { Name: 'name', Value: user.name }
                    ],
                    MessageAction: 'SUPPRESS',
                    TemporaryPassword: 'TempPass123!'
                });

                await client.send(createUserCommand);

                // Set permanent password
                const setPasswordCommand = new AdminSetUserPasswordCommand({
                    UserPoolId: userPoolId,
                    Username: user.email,
                    Password: user.password,
                    Permanent: true
                });

                await client.send(setPasswordCommand);

                console.log(`✅ Created: ${user.name}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Password: ${user.password}`);
                console.log(`   Role: ${user.role}`);
                console.log('');

            } catch (error) {
                console.error(`❌ Failed to create ${user.email}:`, error.message);
            }
        }

        // Step 4: Generate .env content
        console.log('\n' + '='.repeat(60));
        console.log('✅ COGNITO SETUP COMPLETE!');
        console.log('='.repeat(60));
        console.log('\nAdd these to your .env file:\n');
        console.log(`COGNITO_USER_POOL_ID=${userPoolId}`);
        console.log(`COGNITO_CLIENT_ID=${clientId}`);
        console.log(`COGNITO_REGION=${AWS_REGION}`);
        console.log('\n' + '='.repeat(60));
        console.log('\nNext steps:');
        console.log('1. Copy the above values to SHE-BALANCE-main/SHE-Balnce-main/backend/.env');
        console.log('2. Run: cd SHE-BALANCE-main\\SHE-Balnce-main\\backend && npm install @aws-sdk/client-cognito-identity-provider');
        console.log('3. Tell me "Cognito is ready" and I\'ll integrate it!');
        console.log('='.repeat(60));

        return { userPoolId, clientId };

    } catch (error) {
        console.error('❌ Error creating Cognito setup:', error);
        throw error;
    }
}

// Run the setup
createCognitoSetup()
    .then(() => {
        console.log('\n✅ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Setup failed:', error.message);
        process.exit(1);
    });
