/**
 * AI Sakhi with OpenAI GPT-4
 * More reliable alternative to AWS Bedrock
 */

const https = require('https');

// OpenAI API Key - Set this in environment variable or here
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'your-openai-api-key-here';

/**
 * Chat with AI Sakhi using OpenAI GPT-4
 */
async function chatWithSakhi(artisanId, message, conversationHistory = [], userContext = {}) {
    return new Promise((resolve, reject) => {
        console.log('🚀 Calling OpenAI GPT-4...');
        console.log('📝 Message:', message);
        
        // Build context
        let contextInfo = '';
        if (userContext.userName) {
            contextInfo += `Artisan: ${userContext.userName}\n`;
        }
        if (userContext.orders && userContext.orders.length > 0) {
            contextInfo += `Active Orders: ${userContext.orders.length}\n`;
        }
        
        // System prompt
        const systemPrompt = `You are AI Sakhi, a compassionate AI assistant for women artisans in India. Help with orders, payments, and work challenges. Be warm, supportive, and practical. Keep responses concise.${contextInfo ? '\n\nContext:\n' + contextInfo : ''}`;
        
        // Prepare messages
        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
        ];
        
        // Request body
        const requestBody = JSON.stringify({
            model: "gpt-4",
            messages: messages,
            max_tokens: 300,
            temperature: 0.7
        });
        
        // API request options
        const options = {
            hostname: 'api.openai.com',
            port: 443,
            path: '/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
                        console.error('❌ OpenAI error:', response.error.message);
                        reject(new Error(response.error.message));
                        return;
                    }
                    
                    const assistantMessage = response.choices[0].message.content;
                    
                    console.log('✅ OpenAI response received!');
                    console.log('📝 Response:', assistantMessage.substring(0, 100) + '...');
                    
                    resolve({
                        success: true,
                        response: assistantMessage,
                        model: 'gpt-4',
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
