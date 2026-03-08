/**
 * Direct test of Llama 3 integration with AI Sakhi
 */

const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

// Initialize Bedrock client
const bedrockClient = new BedrockRuntimeClient({ 
    region: process.env.AWS_REGION || 'us-east-1'
});

const LLAMA3_MODEL_ID = "meta.llama3-70b-instruct-v1:0";

async function testLlama3() {
    console.log('🧪 Testing Llama 3 (70B) with AI Sakhi...\n');
    
    const systemPrompt = `You are AI Sakhi, a compassionate AI assistant for women artisans in India.

Your role:
- Help artisans with bulk orders, payments, and work challenges
- Provide emotional support and encouragement
- Speak in a warm, friendly, and respectful tone
- Use simple language (many artisans have limited education)
- Be culturally sensitive to Indian context`;

    const userMessage = "Namaste! I need help updating my bulk order progress. I have completed 50 embroidered sarees out of 100.";

    // Build Llama 3 prompt
    const prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>

${systemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>

${userMessage}<|eot_id|><|start_header_id|>assistant<|end_header_id|>

`;

    console.log('📤 Sending request to Llama 3...');
    console.log('Model ID:', LLAMA3_MODEL_ID);
    console.log('User Message:', userMessage);
    console.log('');

    try {
        const requestBody = {
            prompt: prompt,
            max_gen_len: 512,
            temperature: 0.7,
            top_p: 0.9
        };

        const command = new InvokeModelCommand({
            modelId: LLAMA3_MODEL_ID,
            body: JSON.stringify(requestBody),
            contentType: "application/json",
            accept: "application/json"
        });

        const startTime = Date.now();
        const response = await bedrockClient.send(command);
        const endTime = Date.now();
        
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        const assistantMessage = responseBody.generation.trim();

        console.log('✅ SUCCESS!\n');
        console.log('📥 AI Sakhi Response:');
        console.log('─'.repeat(60));
        console.log(assistantMessage);
        console.log('─'.repeat(60));
        console.log('');
        console.log(`⏱️  Response time: ${endTime - startTime}ms`);
        console.log(`📊 Model: Llama 3 (70B Instruct)`);
        console.log(`🔢 Tokens generated: ~${assistantMessage.split(' ').length * 1.3} tokens`);
        
    } catch (error) {
        console.error('❌ ERROR:', error.name);
        console.error('Message:', error.message);
        
        if (error.name === 'AccessDeniedException') {
            console.error('\n⚠️  Access Denied! Please ensure:');
            console.error('1. You have Bedrock access enabled in your AWS account');
            console.error('2. Llama 3 model access is granted in Bedrock console');
            console.error('3. Your IAM role has bedrock:InvokeModel permission');
        }
        
        if (error.name === 'ValidationException') {
            console.error('\n⚠️  Validation Error! Please check:');
            console.error('1. Model ID is correct: meta.llama3-70b-instruct-v1:0');
            console.error('2. Request format matches Llama 3 requirements');
        }
    }
}

// Run test
console.log('🚀 AI Sakhi - Llama 3 Integration Test\n');
testLlama3().then(() => {
    console.log('\n✨ Test completed!');
}).catch(err => {
    console.error('\n💥 Test failed:', err);
    process.exit(1);
});
