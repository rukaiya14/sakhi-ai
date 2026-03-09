/**
 * Test AWS Bedrock Connection
 * Run this to verify Bedrock is working
 */

const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

console.log('🧪 Testing AWS Bedrock Connection...\n');

// Initialize client
const client = new BedrockRuntimeClient({ 
    region: process.env.AWS_REGION || 'us-east-1'
});

const CLAUDE_MODEL_ID = "anthropic.claude-3-5-sonnet-20240620-v1:0";

async function testBedrock() {
    try {
        console.log('📍 Region:', process.env.AWS_REGION || 'us-east-1');
        console.log('🤖 Model:', CLAUDE_MODEL_ID);
        console.log('\n🚀 Sending test message to Bedrock...\n');

        const requestBody = {
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 100,
            temperature: 0.7,
            messages: [
                {
                    role: "user",
                    content: "Say hello in one sentence"
                }
            ]
        };

        const command = new InvokeModelCommand({
            modelId: CLAUDE_MODEL_ID,
            body: JSON.stringify(requestBody),
            contentType: "application/json",
            accept: "application/json"
        });

        const response = await client.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        
        console.log('✅ SUCCESS! Bedrock is working!\n');
        console.log('📝 Response:', responseBody.content[0].text);
        console.log('\n✨ AI Sakhi can now use Claude 3 Haiku!\n');
        
        return true;

    } catch (error) {
        console.error('❌ BEDROCK ERROR:\n');
        console.error('Error Type:', error.name);
        console.error('Error Message:', error.message);
        
        if (error.name === 'AccessDeniedException') {
            console.error('\n🔧 FIX: You need to enable Claude 3 Haiku in AWS Bedrock');
            console.error('   1. Go to: https://console.aws.amazon.com/bedrock/');
            console.error('   2. Click "Model access" in left sidebar');
            console.error('   3. Click "Manage model access"');
            console.error('   4. Enable "Claude 3 Haiku"');
            console.error('   5. Click "Save changes"');
            console.error('   6. Wait 1-2 minutes for activation');
        } else if (error.name === 'UnrecognizedClientException') {
            console.error('\n🔧 FIX: AWS credentials not configured');
            console.error('   Run: aws configure');
            console.error('   Enter your AWS Access Key ID and Secret Access Key');
        } else if (error.name === 'ValidationException') {
            console.error('\n🔧 FIX: Model ID might be wrong or not available in your region');
            console.error('   Try region: us-east-1 or us-west-2');
        }
        
        console.error('\n⚠️  AI Sakhi will use fallback responses until this is fixed.\n');
        return false;
    }
}

// Run test
testBedrock().then(success => {
    if (success) {
        console.log('🎉 You can now use AI Sakhi with Claude 3 Haiku!');
    } else {
        console.log('💡 AI Sakhi will still work with fallback responses.');
    }
    process.exit(success ? 0 : 1);
});
