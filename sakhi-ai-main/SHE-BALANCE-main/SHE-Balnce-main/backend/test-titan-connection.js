/**
 * Test Amazon Titan Connection
 * Run this to verify Bedrock is working
 */

const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

console.log('='.repeat(60));
console.log('🧪 Testing Amazon Titan Connection');
console.log('='.repeat(60));
console.log('');

// Check environment variables
console.log('📋 Checking AWS Configuration...');
console.log(`   AWS_REGION: ${process.env.AWS_REGION || 'us-east-1'}`);
console.log(`   AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Not set'}`);
console.log(`   AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Not set'}`);
console.log('');

// Initialize Bedrock client
const bedrockClient = new BedrockRuntimeClient({ 
    region: process.env.AWS_REGION || 'us-east-1'
});

const TITAN_MODEL_ID = "amazon.titan-text-express-v1";

async function testTitanConnection() {
    try {
        console.log('🚀 Sending test message to Amazon Titan...');
        console.log('');
        
        const testPrompt = `You are AI Sakhi, a helpful assistant for women artisans in India.

User: Hello, can you help me?

AI Sakhi:`;

        const requestBody = {
            inputText: testPrompt,
            textGenerationConfig: {
                maxTokenCount: 200,
                temperature: 0.7,
                topP: 0.9,
                stopSequences: ["User:", "AI Sakhi:"]
            }
        };

        const startTime = Date.now();

        const command = new InvokeModelCommand({
            modelId: TITAN_MODEL_ID,
            body: JSON.stringify(requestBody),
            contentType: "application/json",
            accept: "application/json"
        });

        console.log('⏳ Waiting for response...');
        const response = await bedrockClient.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        console.log('');
        console.log('✅ SUCCESS! Amazon Titan is working!');
        console.log('='.repeat(60));
        console.log('');
        console.log('📊 Response Details:');
        console.log(`   Model: ${TITAN_MODEL_ID}`);
        console.log(`   Response Time: ${duration} seconds`);
        console.log(`   Input Tokens: ${responseBody.inputTextTokenCount || 'N/A'}`);
        console.log('');
        console.log('💬 AI Response:');
        console.log('─'.repeat(60));
        console.log(responseBody.results[0].outputText.trim());
        console.log('─'.repeat(60));
        console.log('');
        console.log('🎉 Amazon Titan is connected and working perfectly!');
        console.log('');
        console.log('Next Steps:');
        console.log('1. Start your backend: node server-with-bedrock.js');
        console.log('2. Open dashboard: http://localhost:8080/dashboard.html');
        console.log('3. Click "AI Sakhi Assistant" and start chatting!');
        console.log('');

    } catch (error) {
        console.log('');
        console.log('❌ ERROR: Failed to connect to Amazon Titan');
        console.log('='.repeat(60));
        console.log('');
        console.log('Error Details:');
        console.log(`   Type: ${error.name}`);
        console.log(`   Message: ${error.message}`);
        console.log('');
        
        if (error.name === 'AccessDeniedException') {
            console.log('🔧 Fix: Enable Bedrock Model Access');
            console.log('   1. Go to: https://console.aws.amazon.com/bedrock/');
            console.log('   2. Click "Model access"');
            console.log('   3. Enable "Amazon Titan Text Express"');
            console.log('   4. Run this test again');
        } else if (error.name === 'UnrecognizedClientException' || error.message.includes('credentials')) {
            console.log('🔧 Fix: Configure AWS Credentials');
            console.log('   1. Get your AWS Access Key and Secret Key');
            console.log('   2. Set environment variables:');
            console.log('      set AWS_ACCESS_KEY_ID=your_key');
            console.log('      set AWS_SECRET_ACCESS_KEY=your_secret');
            console.log('      set AWS_REGION=us-east-1');
            console.log('   3. Run this test again');
        } else {
            console.log('🔧 Troubleshooting:');
            console.log('   1. Check AWS credentials are correct');
            console.log('   2. Verify Bedrock access is enabled');
            console.log('   3. Check your AWS region (should be us-east-1)');
            console.log('   4. Verify IAM permissions include bedrock:InvokeModel');
        }
        console.log('');
        console.log('📚 See CONNECT_TITAN_NOW.md for detailed setup guide');
        console.log('');
    }
}

// Run the test
testTitanConnection();
