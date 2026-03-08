/**
 * AI Sakhi with Claude 3 Haiku - Simplified Version
 * Based on test-bedrock-now.js that successfully connected
 */

const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

// Initialize Bedrock client
const bedrockClient = new BedrockRuntimeClient({ 
    region: process.env.AWS_REGION || 'us-east-1'
});

// Use Claude 3.5 Sonnet (most powerful, best quality)
const CLAUDE_MODEL_ID = "anthropic.claude-3-5-sonnet-20240620-v1:0";

/**
 * Chat with AI Sakhi using Claude via Bedrock
 */
async function chatWithSakhi(artisanId, message, conversationHistory = [], userContext = {}) {
    try {
        console.log('🚀 Calling Claude 3 Haiku via Bedrock...');
        console.log('📝 User message:', message.substring(0, 50) + '...');
        
        // Build context string
        let contextInfo = '';
        if (userContext.userName) {
            contextInfo += `Artisan: ${userContext.userName}\n`;
        }
        
        if (userContext.orders && userContext.orders.length > 0) {
            contextInfo += `\nActive Orders (${userContext.orders.length}):\n`;
            userContext.orders.slice(0, 3).forEach(order => {
                const progress = order.progressPercentage || Math.round((order.completed / order.quantity) * 100);
                contextInfo += `- ${order.title} for ${order.buyer}: ${progress}% complete\n`;
                contextInfo += `  Status: ${order.status}, Deadline: ${order.deadline}\n`;
            });
        }
        
        if (userContext.pendingPayments && userContext.pendingPayments.length > 0) {
            contextInfo += `\nPending Payments: ${userContext.pendingPayments.length} orders\n`;
            userContext.pendingPayments.forEach(payment => {
                contextInfo += `- ₹${payment.amount.toLocaleString()} for order ${payment.orderId}\n`;
            });
        }
        
        if (userContext.balance) {
            contextInfo += `\nToday's Balance:\n`;
            contextInfo += `- Household: ${userContext.balance.household}h, Career: ${userContext.balance.career}h, Self-care: ${userContext.balance.selfCare}h\n`;
        }

        // Use custom system prompt if provided (for Learning Mentor), otherwise use default
        let systemPrompt;
        if (userContext.systemPrompt) {
            systemPrompt = userContext.systemPrompt;
        } else {
            // Default AI Sakhi prompt
            systemPrompt = `You are AI Sakhi, a compassionate AI assistant for women artisans in India working on the SHE-BALANCE platform.

Your role:
- Help artisans manage bulk orders and track progress
- Provide emotional support and encouragement
- Assist with payment requests and work challenges
- Speak warmly, respectfully, and use simple language
- Be culturally sensitive to Indian context
- Offer practical, actionable solutions

You can help with:
1. Bulk order progress updates
2. Health issues affecting work
3. Payment requests (advance or completed work)
4. Work-life balance guidance
5. General support

Always be empathetic, patient, and solution-oriented.

${contextInfo ? `\nCurrent Context:\n${contextInfo}` : ''}`;
        }

        // Build conversation history
        let messages = [];
        
        // Add recent conversation (last 4 messages)
        if (conversationHistory && conversationHistory.length > 0) {
            conversationHistory.slice(-4).forEach(msg => {
                messages.push({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content
                });
            });
        }
        
        // Add current message
        messages.push({
            role: "user",
            content: message
        });

        // Prepare request for Claude
        const requestBody = {
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 500,
            temperature: 0.7,
            system: systemPrompt,
            messages: messages
        };

        console.log('📤 Sending request to Bedrock...');

        // Call Bedrock
        const command = new InvokeModelCommand({
            modelId: CLAUDE_MODEL_ID,
            body: JSON.stringify(requestBody),
            contentType: "application/json",
            accept: "application/json"
        });

        const response = await bedrockClient.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        
        const assistantMessage = responseBody.content[0].text;

        console.log('✅ Claude 3 Haiku response received!');
        console.log('📝 Response preview:', assistantMessage.substring(0, 80) + '...');

        return {
            success: true,
            response: assistantMessage,
            model: 'claude-3-haiku',
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('❌ Bedrock/Claude error:', error.name);
        console.error('❌ Error message:', error.message);
        
        // Throw error so server can handle it
        throw error;
    }
}

module.exports = {
    chatWithSakhi
};
