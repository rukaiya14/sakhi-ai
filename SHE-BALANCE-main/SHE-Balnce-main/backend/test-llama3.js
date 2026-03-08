/**
 * Test Llama 3 integration with AI Sakhi
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
        
        return true;
        
    } catch (error) {
        console.error('❌ ERROR:', error.name);
        console.error('Message:', error.message);
        
        if (error.name === 'AccessDeniedException') {
            console.error('\n⚠️  Access Denied! Please ensure:');
            console.error('1. You have Bedrock access enabled in your AWS account');
            console.error('2. Llama 3 model access is granted in Bedrock console');
            console.error('3. Your IAM role has bedrock:InvokeModel permission');
            console.error('\n📝 To enable Llama 3 access:');
            console.error('   1. Go to AWS Bedrock console');
            console.error('   2. Click "Model access" in left menu');
            console.error('   3. Click "Manage model access"');
            console.error('   4. Find "Meta Llama 3 70B Instruct" and enable it');
            console.error('   5. Submit and wait for approval (usually instant)');
        }
        
        if (error.name === 'ValidationException') {
            console.error('\n⚠️  Validation Error! Please check:');
            console.error('1. Model ID is correct: meta.llama3-70b-instruct-v1:0');
            console.error('2. Request format matches Llama 3 requirements');
        }
        
        if (error.name === 'ResourceNotFoundException') {
            console.error('\n⚠️  Model Not Found! Please check:');
            console.error('1. Llama 3 is available in your region (us-east-1 recommended)');
            console.error('2. Model ID is correct');
        }
        
        return false;
    }
}

// Run test
console.log('🚀 AI Sakhi - Llama 3 Integration Test\n');
testLlama3().then((success) => {
    if (success) {
        console.log('\n✨ Test completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('   1. Test with Hindi: "मुझे मदद चाहिए"');
        console.log('   2. Test with Tamil: "எனக்கு உதவி தேவை"');
        console.log('   3. Start backend: node server-with-bedrock.js');
        process.exit(0);
    } else {
        console.log('\n💥 Test failed! Please fix the errors above.');
        process.exit(1);
    }
}).catch(err => {
    console.error('\n💥 Unexpected error:', err);
    process.exit(1);
});
