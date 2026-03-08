/**
 * Test Amazon Titan Connection
 * Run this to verify Titan is working
 */

const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

console.log('🧪 Testing Amazon Titan Text Premier...\n');

// Initialize client
const client = new BedrockRuntimeClient({ 
    region: process.env.AWS_REGION || 'us-east-1'
});

const TITAN_MODEL_ID = "amazon.titan-text-premier-v1:0";

async function testTitan() {
    try {
        console.log('📍 Region:', process.env.AWS_REGION || 'us-east-1');
        console.log('🤖 Model:', TITAN_MODEL_ID);
        console.log('\n🚀 Sending test message to Amazon Titan...\n');

        const requestBody = {
            inputText: "Say hello in one sentence",
            textGenerationConfig: {
                maxTokenCount: 100,
                temperature: 0.7,
                topP: 0.9
            }
        };

        const command = new InvokeModelCommand({
            modelId: TITAN_MODEL_ID,
            body: JSON.stringify(requestBody),
            contentType: "application/json",
            accept: "application/json"
        });

        const response = await client.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        
        console.log('✅ SUCCESS! Amazon Titan is working!\n');
        console.log('📝 Response:', responseBody.results[0].outputText);
        console.log('\n✨ AI Sakhi can now use Amazon Titan Premier!\n');
        
        return true;

    } catch (error) {
        console.error('❌ AMAZON TITAN ERROR:\n');
        console.error('Error Type:', error.name);
        console.error('Error Message:', error.message);
        console.error('Full Error:', error);
        
        if (error.name === 'AccessDeniedException') {
            console.error('\n🔧 FIX: You need to enable Amazon Titan in AWS Bedrock');
            console.error('   1. Go to: https://console.aws.amazon.com/bedrock/');
            console.error('   2. Click "Model access" in left sidebar');
            console.error('   3. Enable "Amazon Titan Text Premier"');
            console.error('   4. Click "Save changes"');
            console.error('   5. Wait 1-2 minutes for activation');
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
testTitan().then(success => {
    if (success) {
        console.log('🎉 You can now use AI Sakhi with Amazon Titan Premier!');
    } else {
        console.log('💡 AI Sakhi will still work with fallback responses.');
    }
    process.exit(success ? 0 : 1);
});
