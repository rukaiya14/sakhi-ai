/**
 * Test Claude 3.7 Sonnet Connection
 */

const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

console.log('🧪 Testing Claude 3.7 Sonnet...\n');

const client = new BedrockRuntimeClient({ 
    region: process.env.AWS_REGION || 'us-east-1'
});

const SONNET_MODEL_ID = "anthropic.claude-3-7-sonnet-20250219-v1:0";

async function testSonnet() {
    try {
        console.log('📍 Region:', process.env.AWS_REGION || 'us-east-1');
        console.log('🤖 Model: Claude 3.7 Sonnet');
        console.log('\n🚀 Sending test message...\n');

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
            modelId: SONNET_MODEL_ID,
            body: JSON.stringify(requestBody),
            contentType: "application/json",
            accept: "application/json"
        });

        const response = await client.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        
        console.log('✅ SUCCESS! Claude 3.7 Sonnet is working!\n');
        console.log('📝 Response:', responseBody.content[0].text);
        console.log('\n✨ AI Sakhi can now use Claude 3.7 Sonnet!\n');
        
        return true;

    } catch (error) {
        console.error('❌ ERROR:\n');
        console.error('Error Type:', error.name);
        console.error('Error Message:', error.message);
        
        if (error.name === 'AccessDeniedException') {
            console.error('\n🔧 FIX: Enable Claude 3.7 Sonnet in AWS Bedrock');
            console.error('   Same approval process as Haiku - should be instant!');
        }
        
        console.error('\n⚠️  AI Sakhi will use fallback until this is fixed.\n');
        return false;
    }
}

testSonnet().then(success => {
    process.exit(success ? 0 : 1);
});
