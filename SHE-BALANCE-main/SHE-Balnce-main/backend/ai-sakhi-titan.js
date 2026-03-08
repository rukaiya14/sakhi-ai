/**
 * AI Sakhi with Amazon Titan Text Express
 * AWS Bedrock - Simpler and more reliable than Claude
 */

const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

// Initialize Bedrock client
const bedrockClient = new BedrockRuntimeClient({ 
    region: process.env.AWS_REGION || 'us-east-1'
});

// Amazon Titan Text Premier - Latest AWS model (March 2024)
const TITAN_MODEL_ID = "amazon.titan-text-premier-v1:0";

/**
 * Chat with AI Sakhi using Amazon Titan
 */
async function chatWithSakhi(artisanId, message, conversationHistory = [], userContext = {}) {
    try {
        console.log('🚀 Calling Amazon Titan Text Premier...');
        console.log('📝 Message:', message);
        
        // Build context
        let contextInfo = '';
        if (userContext.userName) {
            contextInfo += `Artisan: ${userContext.userName}\n`;
        }
        if (userContext.orders && userContext.orders.length > 0) {
            contextInfo += `Active Orders: ${userContext.orders.length}\n`;
            userContext.orders.slice(0, 2).forEach(order => {
                const progress = Math.round((order.completed / order.quantity) * 100);
                contextInfo += `- ${order.title}: ${progress}% complete (${order.completed}/${order.quantity})\n`;
            });
        }
        if (userContext.pendingPayments && userContext.pendingPayments.length > 0) {
            contextInfo += `Pending Payments: ${userContext.pendingPayments.length}\n`;
        }
        
        // Build prompt for Titan
        const prompt = `You are AI Sakhi, a helpful assistant for women artisans in India.

${contextInfo ? 'Context:\n' + contextInfo + '\n' : ''}User: ${message}

AI Sakhi:`;
        
        // Prepare request for Titan
        const requestBody = {
            inputText: prompt,
            textGenerationConfig: {
                maxTokenCount: 400,
                temperature: 0.7,
                topP: 0.9
            }
        };

        console.log('📤 Sending request to Amazon Titan...');
        
        // Call Bedrock with Titan
        const command = new InvokeModelCommand({
            modelId: TITAN_MODEL_ID,
            body: JSON.stringify(requestBody),
            contentType: "application/json",
            accept: "application/json"
        });

        const response = await bedrockClient.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        
        const assistantMessage = responseBody.results[0].outputText.trim();

        console.log('✅ Amazon Titan response received!');
        console.log('📝 Response:', assistantMessage.substring(0, 100) + '...');

        return {
            success: true,
            response: assistantMessage,
            model: 'amazon-titan-premier',
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('❌ Amazon Titan error:', error.name);
        console.error('❌ Error message:', error.message);
        
        // Throw error so server can handle it
        throw error;
    }
}

module.exports = {
    chatWithSakhi
};
