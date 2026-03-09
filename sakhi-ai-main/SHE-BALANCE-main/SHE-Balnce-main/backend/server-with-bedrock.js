/**
 * SHE-BALANCE Backend Server with Amazon Bedrock Integration
 * Enhanced version with AI Sakhi powered by Llama 3 (70B Instruct)
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Set Llama 3 as default model
process.env.AI_SAKHI_MODEL = process.env.AI_SAKHI_MODEL || 'meta.llama3-70b-instruct-v1:0';

// Middleware
app.use(cors());
app.use(express.json());

// Load Bedrock module with Llama 3 only
let aiSakhi = null;
let modelName = 'Llama 3 (70B Instruct)';
try {
    aiSakhi = require('./ai-sakhi-bedrock');
    console.log(`✅ Amazon Bedrock module loaded - Using ${modelName}`);
} catch (error) {
    console.log('⚠️  Bedrock module not available, using fallback responses');
}

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Test route
app.get('/', (req, res) => {
    res.json({ 
        message: 'SHE-BALANCE Backend API',
        status: 'running',
        aiSakhi: aiSakhi ? modelName : 'Fallback Mode',
        model: process.env.AI_SAKHI_MODEL || 'meta.llama3-70b-instruct-v1:0',
        endpoints: [
            'POST /api/ai-sakhi/chat',
            'GET /api/ai-sakhi/suggestions'
        ]
    });
});

// AI Sakhi Chat with Bedrock (Titan)
app.post('/api/ai-sakhi/chat', authenticateToken, async (req, res) => {
    try {
        const { message, conversationHistory } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        console.log(`💬 AI Sakhi message from ${req.user.email}: ${message}`);
        
        // Try Bedrock first, fallback to intelligent responses
        if (aiSakhi) {
            try {
                const result = await aiSakhi.chatWithSakhi(
                    req.user.userId, 
                    message, 
                    conversationHistory || []
                );
                
                console.log(`✅ Response from ${result.model || 'Bedrock'}`);
                return res.json(result);
                
            } catch (bedrockError) {
                console.error('⚠️  Bedrock error, using fallback:', bedrockError.message);
            }
        }
        
        // Fallback response
        const response = getAISakhiResponse(message);
        
        res.json({
            success: true,
            response: response,
            timestamp: new Date().toISOString(),
            fallback: true,
            model: 'fallback'
        });
        
    } catch (error) {
        console.error('❌ AI Sakhi error:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
});

// AI Sakhi Suggestions
app.get('/api/ai-sakhi/suggestions', authenticateToken, (req, res) => {
    res.json({
        suggestions: [
            "Update my bulk order progress",
            "I need help with my order",
            "Request advance payment",
            "I'm facing health issues",
            "Request payment for completed work",
            "How do I improve my skills?",
            "Connect me with support team"
        ]
    });
});

// Intelligent fallback response function
function getAISakhiResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('payment') || lowerMessage.includes('money') || lowerMessage.includes('advance')) {
        return "Namaste! I can help you with payment requests. Would you like to:\n\n1. Request an advance payment for materials or emergency\n2. Request payment for completed work\n\nPlease let me know the details, and I'll connect you with our finance team right away.";
    }
    
    if (lowerMessage.includes('order') || lowerMessage.includes('bulk')) {
        return "I understand you want to discuss your bulk order. I'm here to help! Could you please tell me:\n\n1. Which order are you working on?\n2. What challenges are you facing?\n3. Do you need any support?\n\nI'll make sure you get the help you need.";
    }
    
    if (lowerMessage.includes('health') || lowerMessage.includes('sick') || lowerMessage.includes('unwell') || lowerMessage.includes('ill')) {
        return "I'm sorry to hear you're not feeling well. Your health is very important to us! 💚\n\nPlease let me know:\n1. What symptoms are you experiencing?\n2. Do you need immediate medical help?\n3. Will this affect your work deadlines?\n\nI'll immediately connect you with our support team who can provide assistance.";
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('assist')) {
        return "I'm here to help you! I can assist with:\n\n✅ Bulk order updates and progress tracking\n✅ Health issues and work challenges\n✅ Payment requests (advance or completed work)\n✅ General support and guidance\n✅ Connecting you with the right team\n\nWhat would you like help with today?";
    }
    
    if (lowerMessage.includes('skill') || lowerMessage.includes('learn') || lowerMessage.includes('training') || lowerMessage.includes('improve')) {
        return "That's wonderful that you want to improve your skills! 🌟\n\nWe have various training programs available:\n- Advanced embroidery techniques\n- Business management skills\n- Quality improvement workshops\n- Digital marketing for artisans\n\nWould you like me to connect you with our skills development team?";
    }
    
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
        return "You're very welcome! I'm always here to help you. Feel free to reach out anytime you need support. Wishing you success in your work! 🙏";
    }
    
    // Default response
    return "Namaste! I'm AI Sakhi, your personal assistant. I'm here to support you with:\n\n🔹 Work and bulk orders\n🔹 Payment requests\n🔹 Health and personal challenges\n🔹 Skills development\n🔹 General support\n\nHow can I assist you today? Please tell me what you need help with.";
}

// Start Server
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🚀 SHE-BALANCE Backend Server with Bedrock Integration');
    console.log('='.repeat(60));
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}`);
    console.log(`🤖 AI Sakhi: ${aiSakhi ? modelName : 'Fallback Mode'}`);
    if (aiSakhi) {
        console.log(`📊 Model ID: ${process.env.AI_SAKHI_MODEL}`);
    }
    console.log('='.repeat(60));
    console.log('');
    console.log('📝 Available endpoints:');
    console.log('   POST /api/ai-sakhi/chat');
    console.log('   GET  /api/ai-sakhi/suggestions');
    console.log('');
    if (!aiSakhi) {
        console.log('💡 To enable Bedrock:');
        console.log('   1. npm install @aws-sdk/client-bedrock-runtime');
        console.log('   2. Configure AWS credentials');
        console.log('   3. Request Bedrock access in AWS Console');
        console.log('');
    } else {
        console.log('✅ Using Llama 3 (70B Instruct) - meta.llama3-70b-instruct-v1:0');
        console.log('');
    }
});

// Error handling
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Rejection:', error);
});
