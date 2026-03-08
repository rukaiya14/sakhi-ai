/**
 * Check AWS Backend Status
 * Verifies all AWS services are configured correctly
 */

const { BedrockRuntimeClient, ListFoundationModelsCommand } = require("@aws-sdk/client-bedrock-runtime");
const { STSClient, GetCallerIdentityCommand } = require("@aws-sdk/client-sts");

console.log('='.repeat(70));
console.log('🔍 AWS Backend Status Check');
console.log('='.repeat(70));
console.log('');

async function checkAWSBackend() {
    const results = {
        credentials: false,
        bedrock: false,
        titan: false
    };

    // Check 1: AWS Credentials
    console.log('1️⃣  Checking AWS Credentials...');
    try {
        const stsClient = new STSClient({ region: process.env.AWS_REGION || 'us-east-1' });
        const command = new GetCallerIdentityCommand({});
        const response = await stsClient.send(command);
        
        console.log('   ✅ AWS Credentials: VALID');
        console.log(`   📋 Account: ${response.Account}`);
        console.log(`   👤 User ARN: ${response.Arn}`);
        results.credentials = true;
    } catch (error) {
        console.log('   ❌ AWS Credentials: INVALID');
        console.log(`   Error: ${error.message}`);
        console.log('');
        console.log('   🔧 Fix:');
        console.log('      set AWS_ACCESS_KEY_ID=your_key');
        console.log('      set AWS_SECRET_ACCESS_KEY=your_secret');
        console.log('      set AWS_REGION=us-east-1');
    }
    console.log('');

    // Check 2: Bedrock Access
    console.log('2️⃣  Checking Amazon Bedrock Access...');
    try {
        const bedrockClient = new BedrockRuntimeClient({ 
            region: process.env.AWS_REGION || 'us-east-1' 
        });
        
        // Try to list models (this checks if Bedrock is accessible)
        const testCommand = new ListFoundationModelsCommand({});
        await bedrockClient.send(testCommand);
        
        console.log('   ✅ Bedrock Access: ENABLED');
        results.bedrock = true;
    } catch (error) {
        console.log('   ❌ Bedrock Access: DENIED');
        console.log(`   Error: ${error.message}`);
        console.log('');
        console.log('   🔧 Fix:');
        console.log('      1. Go to: https://console.aws.amazon.com/bedrock/');
        console.log('      2. Click "Model access"');
        console.log('      3. Enable model access');
    }
    console.log('');

    // Check 3: Titan Model
    console.log('3️⃣  Checking Amazon Titan Text Express...');
    try {
        const bedrockClient = new BedrockRuntimeClient({ 
            region: process.env.AWS_REGION || 'us-east-1' 
        });
        
        const { InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
        
        const requestBody = {
            inputText: "Test",
            textGenerationConfig: {
                maxTokenCount: 10,
                temperature: 0.7
            }
        };

        const command = new InvokeModelCommand({
            modelId: "amazon.titan-text-express-v1",
            body: JSON.stringify(requestBody),
            contentType: "application/json",
            accept: "application/json"
        });

        await bedrockClient.send(command);
        
        console.log('   ✅ Titan Model: WORKING');
        console.log('   📊 Model: amazon.titan-text-express-v1');
        results.titan = true;
    } catch (error) {
        console.log('   ❌ Titan Model: NOT ACCESSIBLE');
        console.log(`   Error: ${error.message}`);
        console.log('');
        console.log('   🔧 Fix:');
        console.log('      1. Go to: https://console.aws.amazon.com/bedrock/');
        console.log('      2. Click "Model access"');
        console.log('      3. Enable "Amazon Titan Text Express"');
        console.log('      4. Wait for approval (instant)');
    }
    console.log('');

    // Summary
    console.log('='.repeat(70));
    console.log('📊 Summary');
    console.log('='.repeat(70));
    console.log('');
    console.log(`   AWS Credentials:     ${results.credentials ? '✅ Valid' : '❌ Invalid'}`);
    console.log(`   Bedrock Access:      ${results.bedrock ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`   Titan Model:         ${results.titan ? '✅ Working' : '❌ Not Working'}`);
    console.log('');

    if (results.credentials && results.bedrock && results.titan) {
        console.log('🎉 ALL CHECKS PASSED!');
        console.log('');
        console.log('✅ Your AWS backend is fully configured and ready!');
        console.log('');
        console.log('Next Steps:');
        console.log('   1. Start backend: node server-with-bedrock.js');
        console.log('   2. Open dashboard: http://localhost:8080/dashboard.html');
        console.log('   3. Click "AI Sakhi Assistant"');
        console.log('   4. Start chatting with AI-powered responses!');
        console.log('');
    } else {
        console.log('⚠️  SOME CHECKS FAILED');
        console.log('');
        console.log('Please fix the issues above and run this check again.');
        console.log('');
        console.log('Quick Fixes:');
        if (!results.credentials) {
            console.log('   • Configure AWS credentials (see above)');
        }
        if (!results.bedrock) {
            console.log('   • Enable Bedrock access in AWS Console');
        }
        if (!results.titan) {
            console.log('   • Enable Titan model in Bedrock Console');
        }
        console.log('');
        console.log('📚 See CONNECT_TITAN_NOW.md for detailed guide');
        console.log('');
    }

    // CloudWatch Info
    console.log('='.repeat(70));
    console.log('📈 Monitoring Your Usage');
    console.log('='.repeat(70));
    console.log('');
    console.log('View API calls in CloudWatch:');
    console.log('   https://console.aws.amazon.com/cloudwatch/');
    console.log('   → Logs → /aws/bedrock/modelinvocations');
    console.log('');
    console.log('View costs in Billing:');
    console.log('   https://console.aws.amazon.com/billing/');
    console.log('   → Bills → Amazon Bedrock');
    console.log('');
    console.log('View metrics in Bedrock:');
    console.log('   https://console.aws.amazon.com/bedrock/');
    console.log('   → Metrics');
    console.log('');
}

// Run the check
checkAWSBackend().catch(error => {
    console.error('Unexpected error:', error);
});
