/**
 * AI Sakhi with Groq (Free, Fast, Reliable)
 * Uses Llama 3 model - No credit card required
 */

const https = require('https');

// Groq API Key - Get free at https://console.groq.com
const GROQ_API_KEY = process.env.GROQ_API_KEY || 'your-groq-api-key-here';

/**
 * Chat with AI Sakhi using Groq
 */
async function chatWithSakhi(artisanId, message, conversationHistory = [], userContext = {}) {
    return new Promise((resolve, reject) => {
        console.log('🚀 Calling Groq (Llama 3)...');
        console.log('📝 Message:', message);
        
        // Build context
        let contextInfo = '';
        if (userContext.userName) {
            contextInfo += `Artisan: ${userContext.userName}\n`;
        }
        if (userContext.orders && userContext.orders.length > 0) {
            contextInfo += `Active Orders: ${userContext.orders.length}\n`;
            userContext.orders.slice(0, 2).forEach(order => {
                contextInfo += `- ${order.title}: ${order.completed}/${order.quantity} completed\n`;
            });
        }
        
        // Use custom system prompt if provided (for Learning Mentor), otherwise use default
        let systemPrompt;
        if (userContext.systemPrompt) {
            systemPrompt = userContext.systemPrompt;
        } else {
            // Default AI Sakhi prompt
            systemPrompt = `You are AI Sakhi, a compassionate AI assistant for women artisans in India working on the SHE-BALANCE platform.

Your role:
- Help artisans with bulk orders, payments, and work challenges
- Provide emotional support and encouragement
- Speak in a warm, friendly, respectful tone
- Use simple language
- Be culturally sensitive to Indian context
- Offer practical solutions

${contextInfo ? 'Current Context:\n' + contextInfo : ''}

Keep responses concise and helpful.`;
        }
        
        // Prepare messages
        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
        ];
        
        // Request body
        const requestBody = JSON.stringify({
            model: "llama3-70b-8192",
            messages: messages,
            max_tokens: 400,
            temperature: 0.7
        });
        
        // API request options
        const options = {
            hostname: 'api.groq.com',
            port: 443,
            path: '/openai/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Length': Buffer.byteLength(requestBody)
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    
                    if (response.error) {
                        console.error('❌ Groq error:', response.error.message);
                        reject(new Error(response.error.message));
                        return;
                    }
                    
                    const assistantMessage = response.choices[0].message.content;
                    
                    console.log('✅ Groq response received!');
                    console.log('📝 Response:', assistantMessage.substring(0, 100) + '...');
                    
                    resolve({
                        success: true,
                        response: assistantMessage,
                        model: 'llama3-70b',
                        timestamp: new Date().toISOString()
                    });
                } catch (error) {
                    console.error('❌ Parse error:', error);
                    reject(error);
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('❌ Request error:', error);
            reject(error);
        });
        
        req.write(requestBody);
        req.end();
    });
}

module.exports = {
    chatWithSakhi
};
