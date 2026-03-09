/**
 * Test AWS Secrets Manager Connection
 * This script verifies the secret structure and retrieves credentials
 */

const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");

const SECRET_NAME = "shebalance-deployment";
const REGION = "us-east-1";

async function testSecretsManager() {
  console.log('🔐 Testing AWS Secrets Manager Connection...\n');
  console.log(`Secret Name: ${SECRET_NAME}`);
  console.log(`Region: ${REGION}\n`);

  const client = new SecretsManagerClient({
    region: REGION,
  });

  try {
    console.log('📡 Sending request to AWS Secrets Manager...');
    
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: SECRET_NAME,
        VersionStage: "AWSCURRENT",
      })
    );

    console.log('✅ Successfully retrieved secret from AWS Secrets Manager!\n');

    if (!response.SecretString) {
      console.error('❌ Error: SecretString is empty or undefined');
      return;
    }

    console.log('📄 Raw SecretString:');
    console.log(response.SecretString);
    console.log('');

    try {
      const secret = JSON.parse(response.SecretString);
      console.log('✅ SecretString is valid JSON\n');
      
      console.log('📋 Secret Structure:');
      console.log(JSON.stringify(secret, null, 2));
      console.log('');

      // Validate required fields
      console.log('🔍 Validating required fields...');
      
      if (secret.accessKeyId) {
        console.log(`✅ accessKeyId: Found (${secret.accessKeyId.substring(0, 8)}...)`);
      } else {
        console.log('❌ accessKeyId: MISSING');
      }

      if (secret.secretAccessKey) {
        console.log(`✅ secretAccessKey: Found (${secret.secretAccessKey.substring(0, 8)}...)`);
      } else {
        console.log('❌ secretAccessKey: MISSING');
      }

      console.log('');

      // Check for common field name variations
      console.log('🔍 Checking for common field name variations...');
      const allKeys = Object.keys(secret);
      console.log('Available keys:', allKeys.join(', '));
      console.log('');

      if (secret.accessKeyId && secret.secretAccessKey) {
        console.log('✅ SUCCESS: Secret has correct structure!');
        console.log('');
        console.log('Credentials are ready to use:');
        console.log({
          accessKeyId: secret.accessKeyId.substring(0, 8) + '...',
          secretAccessKey: secret.secretAccessKey.substring(0, 8) + '...'
        });
      } else {
        console.log('❌ FAILED: Secret is missing required fields');
        console.log('');
        console.log('Expected structure:');
        console.log(JSON.stringify({
          accessKeyId: "YOUR_AWS_ACCESS_KEY_ID",
          secretAccessKey: "YOUR_AWS_SECRET_ACCESS_KEY"
        }, null, 2));
        console.log('');
        console.log('Please update your secret in AWS Secrets Manager with the correct structure.');
      }

    } catch (parseError) {
      console.error('❌ Error: SecretString is not valid JSON');
      console.error('Parse error:', parseError.message);
    }

  } catch (error) {
    console.error('❌ Error retrieving secret from AWS Secrets Manager:');
    console.error('Error code:', error.name);
    console.error('Error message:', error.message);
    console.error('');
    
    if (error.name === 'ResourceNotFoundException') {
      console.error('💡 Solution: The secret does not exist. Create it with:');
      console.error(`   aws secretsmanager create-secret --name ${SECRET_NAME} --secret-string '{"accessKeyId":"YOUR_KEY","secretAccessKey":"YOUR_SECRET"}'`);
    } else if (error.name === 'AccessDeniedException') {
      console.error('💡 Solution: Your AWS credentials lack permission to access Secrets Manager');
      console.error('   Required permission: secretsmanager:GetSecretValue');
    } else if (error.name === 'InvalidRequestException') {
      console.error('💡 Solution: Check the secret name and region');
    }
  }
}

// Run the test
testSecretsManager()
  .then(() => {
    console.log('\n✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  });
