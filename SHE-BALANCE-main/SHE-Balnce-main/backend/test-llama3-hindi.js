/**
 * Test Llama 3 with Hindi
 */

const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

const bedrockClient = new BedrockRuntimeClient({ 
    region: process.env.AWS_REGION || 'us-east-1'
});

const LLAMA3_MODEL_ID = "meta.llama3-70b-instruct-v1:0";

async function testHindi() {
    console.log('🧪 Testing Llama 3 with Hindi...\n');
    
    const systemPrompt = `You are AI Sakhi, a compassionate AI assistant for women artisans in India. Respond in Hindi when the user speaks Hindi.`;

    const userMessage = "नमस्ते! मुझे अपने ऑर्डर की प्रगति अपडेट करनी है। मैंने 50 साड़ियाँ पूरी कर ली हैं।";

    const prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>

${systemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>

${userMessage}<|eot_id|><|start_header_id|>assistant<|end_header_id|>

`;

    console.log('📤 User Message (Hindi):', userMessage);
    console.log('');

    try {
        const command = new InvokeModelCommand({
            modelId: LLAMA3_MODEL_ID,
            body: JSON.stringify({
                prompt: prompt,
                max_gen_len: 512,
                temperature: 0.7,
                top_p: 0.9
            }),
            contentType: "application/json",
            accept: "application/json"
        });

        const startTime = Date.now();
        const response = await bedrockClient.send(command);
        const endTime = Date.now();
        
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        const assistantMessage = responseBody.generation.trim();

        console.log('✅ SUCCESS!\n');
        console.log('📥 AI Sakhi Response (Hindi):');
        console.log('─'.repeat(60));
        console.log(assistantMessage);
        console.log('─'.repeat(60));
        console.log(`\n⏱️  Response time: ${endTime - startTime}ms`);
        
    } catch (error) {
        console.error('❌ ERROR:', error.message);
    }
}

testHindi();
