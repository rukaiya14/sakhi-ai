/**
 * AI Sakhi Chat Lambda Function
 * Main chat endpoint with Amazon Bedrock (Llama 3 70B)
 * 
 * This Lambda handles:
 * - Chat message processing
 * - Conversation history management
 * - User context fetching
 * - Bedrock integration
 * - Intent detection
 * - Action triggering
 */

const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, QueryCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");

// Initialize AWS clients
const bedrockClient = new BedrockRuntimeClient({ 
    region: process.env.AWS_REGION || 'us-east-1'
});

const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1'
}));

// Llama 3 70B model
const LLAMA3_MODEL_ID = "meta.llama3-70b-instruct-v1:0";

// DynamoDB table names
const USERS_TABLE = process.env.USERS_TABLE;
const ARTISAN_PROFILES_TABLE = process.env.ARTISAN_PROFILES_TABLE;
const ORDERS_TABLE = process.env.ORDERS_TABLE;
const LABOUR_TABLE = process.env.LABOUR_TABLE;
const AI_CONVERSATIONS_TABLE = process.env.AI_CONVERSATIONS_TABLE;

/**
 * Lambda handler
 */
exports.handler = async (event) => {
    console.log('🤖 AI Sakhi Chat Lambda invoked');
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        // Parse request body
        const body = JSON.parse(event.body || '{}');
        const { message, conversationHistory = [] } = body;
        
        // Get user ID from authorizer context
        const userId = event.requestContext?.authorizer?.claims?.sub || 
                      event.requestContext?.authorizer?.userId ||
                      body.userId; // Fallback for testing
        
        if (!userId) {
            return createResponse(401, {
                success: false,
                error: 'Unauthorized - User ID not found'
            });
        }
        
        if (!message) {
            return createResponse(400, {
                success: false,
                error: 'Message is required'
            });
        }
        
        console.log(`💬 Processing message from user: ${userId}`);
        console.log(`📝 Message: ${message}`);
        
        // Fetch user context
        const userContext = await fetchUserContext(userId);
        console.log(`📊 User context fetched: ${JSON.stringify(userContext, null, 2)}`);
        
        // Process with Bedrock
        const response = await chatWithBedrock(message, conversationHistory, userContext);
        
        // Save conversation to DynamoDB
        await saveConversation(userId, message, response.response);
        
        // Detect intent and trigger actions if needed
        const intent = detectIntent(message, response.response);
        if (intent.shouldTriggerAction) {
            console.log(`🎯 Intent detected: ${intent.type}`);
            // Trigger action asynchronously (don't wait)
            triggerAction(userId, intent, userContext).catch(err => {
                console.error('Action trigger error:', err);
            });
        }
        
        return createResponse(200, {
            success: true,
            response: response.response,
            model: response.model,
            timestamp: new Date().toISOString(),
            intent: intent.type || 'general',
            conversationId: response.conversationId
        });
        
    } catch (error) {
        console.error('❌ Lambda error:', error);
        
        // Return fallback response
        return createResponse(200, {
            success: true,
            response: getFallbackResponse(body?.message || ''),
            model: 'fallback',
            fallback: true,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

/**
 * Fetch user context from DynamoDB
 */
async function fetchUserContext(userId) {
    try {
        const context = {
            userId,
            userName: null,
            email: null,
            orders: [],
            pendingPayments: [],
            balance: { household: 0, career: 0, selfCare: 0 },
            latestSkillScan: null
        };
        
        // Get user info
        const userResult = await dynamoClient.send(new GetCommand({
            TableName: USERS_TABLE,
            Key: { userId }
        }));
        
        if (userResult.Item) {
            context.userName = userResult.Item.fullName;
            context.email = userResult.Item.email;
        }
        
        // Get artisan profile
        const artisanResult = await dynamoClient.send(new QueryCommand({
            TableName: ARTISAN_PROFILES_TABLE,
            IndexName: 'UserIdIndex',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }));
        
        if (artisanResult.Items && artisanResult.Items.length > 0) {
            const artisanProfile = artisanResult.Items[0];
            context.artisanId = artisanProfile.artisanId;
            context.skills = artisanProfile.skills || [];
            context.rating = artisanProfile.rating || 0;
            context.totalOrders = artisanProfile.totalOrders || 0;
            context.totalEarnings = artisanProfile.totalEarnings || 0;
            
            // Get orders for this artisan
            const ordersResult = await dynamoClient.send(new QueryCommand({
                TableName: ORDERS_TABLE,
                IndexName: 'ArtisanIdIndex',
                KeyConditionExpression: 'artisanId = :artisanId',
                ExpressionAttributeValues: {
                    ':artisanId': artisanProfile.artisanId
                },
                Limit: 10
            }));
            
            if (ordersResult.Items) {
                context.orders = ordersResult.Items.map(order => ({
                    orderId: order.orderId,
                    title: order.title,
                    quantity: order.quantity,
                    completed: order.imagesCompleted || 0,
                    deadline: order.deliveryDate,
                    status: order.status,
                    buyer: order.buyerName || 'Buyer',
                    unitPrice: order.unitPrice,
                    totalAmount: order.totalAmount,
                    progressPercentage: order.progressPercentage || 0,
                    progressNote: order.progressNote || '',
                    lastUpdate: order.lastProgressUpdate || order.updatedAt
                }));
                
                // Find pending payments
                context.pendingPayments = ordersResult.Items
                    .filter(o => o.status === 'completed' && o.paymentStatus === 'pending')
                    .map(order => ({
                        orderId: order.orderId,
                        amount: order.totalAmount,
                        status: 'pending_approval',
                        completedDate: order.completedAt
                    }));
            }
            
            // Get today's labour balance
            const today = new Date().toISOString().split('T')[0];
            const labourResult = await dynamoClient.send(new QueryCommand({
                TableName: LABOUR_TABLE,
                IndexName: 'ArtisanIdIndex',
                KeyConditionExpression: 'artisanId = :artisanId AND #date = :date',
                ExpressionAttributeNames: {
                    '#date': 'date'
                },
                ExpressionAttributeValues: {
                    ':artisanId': artisanProfile.artisanId,
                    ':date': today
                }
            }));
            
            if (labourResult.Items && labourResult.Items.length > 0) {
                const todayLabour = labourResult.Items[0];
                context.balance = {
                    household: todayLabour.householdHours || 0,
                    career: todayLabour.craftHours || 0,
                    selfCare: 24 - (todayLabour.householdHours + todayLabour.craftHours)
                };
            }
        }
        
        return context;
        
    } catch (error) {
        console.error('Error fetching user context:', error);
        return {
            userId,
            userName: 'Sister',
            orders: [],
            pendingPayments: [],
            balance: { household: 0, career: 0, selfCare: 0 }
        };
    }
}

/**
 * Chat with Bedrock (Claude 3 Haiku)
 */
async function chatWithBedrock(message, conversationHistory, userContext) {
    try {
        // Build conversation context (last 5 messages)
        const conversationContext = conversationHistory.slice(-5).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
        }));
        
        // Build context info string
        let contextInfo = '';
        if (userContext.userName) {
            contextInfo += `Artisan Name: ${userContext.userName}\n`;
        }
        
        if (userContext.orders && userContext.orders.length > 0) {
            contextInfo += '\nCurrent Orders:\n';
            userContext.orders.forEach(order => {
                const progress = Math.round((order.completed / order.quantity) * 100);
                contextInfo += `- ${order.title} for ${order.buyer}\n`;
                contextInfo += `  Status: ${order.status}, Progress: ${order.completed}/${order.quantity} (${progress}%)\n`;
                contextInfo += `  Deadline: ${order.deadline}, Value: ₹${order.totalAmount.toLocaleString()}\n`;
            });
        }
        
        if (userContext.pendingPayments && userContext.pendingPayments.length > 0) {
            contextInfo += '\nPending Payments:\n';
            userContext.pendingPayments.forEach(payment => {
                contextInfo += `- Order ${payment.orderId}: ₹${payment.amount.toLocaleString()} (${payment.status})\n`;
            });
        }
        
        if (userContext.balance) {
            contextInfo += `\nWork-Life Balance Today:\n`;
            contextInfo += `- Household: ${userContext.balance.household} hours\n`;
            contextInfo += `- Career: ${userContext.balance.career} hours\n`;
            contextInfo += `- Self Care: ${userContext.balance.selfCare} hours\n`;
        }
        
        // System prompt
        const systemPrompt = `You are AI Sakhi, a compassionate AI assistant for women artisans in India working on the SHE-BALANCE platform.

Your role:
- Help artisans with bulk orders, payments, and work challenges
- Provide emotional support and encouragement  
- Speak in a warm, friendly, and respectful tone
- Use simple language (many artisans have limited education)
- Be culturally sensitive to Indian context
- Offer practical solutions and connect them to support resources
- Always address the artisan respectfully (use "Sister" or their name)

You can help with:
1. Bulk order progress updates
2. Health issues and work challenges
3. Payment requests (advance or completed work)
4. Skills development and training
5. General support and guidance

Always be empathetic, patient, and solution-oriented.

${contextInfo ? `\nCurrent Artisan Context:\n${contextInfo}` : ''}`;
        
        // Prepare Bedrock request
        const requestBody = {
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 512,
            temperature: 0.7,
            system: systemPrompt,
            messages: [
                ...conversationContext,
                {
                    role: "user",
                    content: message
                }
            ]
        };
        
        console.log('🚀 Calling Bedrock with Claude 3 Haiku...');
        
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
        
        console.log('✅ Bedrock response received');
        
        return {
            success: true,
            response: assistantMessage,
            model: 'claude-3-haiku',
            conversationId: `conv_${Date.now()}`
        };
        
    } catch (error) {
        console.error('Bedrock error:', error);
        throw error;
    }
}

/**
 * Save conversation to DynamoDB
 */
async function saveConversation(userId, userMessage, assistantResponse) {
    try {
        const conversationId = `conv_${userId}_${Date.now()}`;
        
        await dynamoClient.send(new PutCommand({
            TableName: AI_CONVERSATIONS_TABLE,
            Item: {
                conversationId,
                userId,
                userMessage,
                assistantResponse,
                timestamp: new Date().toISOString(),
                ttl: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days TTL
            }
        }));
        
        console.log('💾 Conversation saved to DynamoDB');
        
    } catch (error) {
        console.error('Error saving conversation:', error);
        // Don't throw - this is not critical
    }
}

/**
 * Detect intent from message
 */
function detectIntent(userMessage, assistantResponse) {
    const lowerMessage = userMessage.toLowerCase();
    const lowerResponse = assistantResponse.toLowerCase();
    
    // Payment intent
    if (lowerMessage.includes('payment') || lowerMessage.includes('money') || 
        lowerMessage.includes('advance') || lowerMessage.includes('pay')) {
        return {
            type: 'payment_request',
            shouldTriggerAction: true,
            confidence: 0.9
        };
    }
    
    // Health issue intent
    if (lowerMessage.includes('health') || lowerMessage.includes('sick') || 
        lowerMessage.includes('unwell') || lowerMessage.includes('ill')) {
        return {
            type: 'health_issue',
            shouldTriggerAction: true,
            confidence: 0.95
        };
    }
    
    // Order update intent
    if (lowerMessage.includes('order') || lowerMessage.includes('progress') || 
        lowerMessage.includes('update') || lowerMessage.includes('bulk')) {
        return {
            type: 'order_update',
            shouldTriggerAction: false,
            confidence: 0.8
        };
    }
    
    // Support request intent
    if (lowerMessage.includes('help') || lowerMessage.includes('support') || 
        lowerMessage.includes('problem') || lowerMessage.includes('issue')) {
        return {
            type: 'support_request',
            shouldTriggerAction: true,
            confidence: 0.85
        };
    }
    
    return {
        type: 'general',
        shouldTriggerAction: false,
        confidence: 0.5
    };
}

/**
 * Trigger action based on intent
 */
async function triggerAction(userId, intent, userContext) {
    console.log(`🎬 Triggering action for intent: ${intent.type}`);
    
    // In a real implementation, this would:
    // 1. Invoke Step Functions workflow
    // 2. Send notifications via SNS
    // 3. Create support tickets
    // 4. Initiate payment workflows
    
    // For now, just log
    console.log(`Action triggered: ${intent.type} for user ${userId}`);
}

/**
 * Fallback response if Bedrock fails
 */
function getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('order') || lowerMessage.includes('bulk')) {
        return "Namaste Sister! I understand you want to discuss your bulk order. I'm here to help! Could you please tell me more about your order status or any challenges you're facing?";
    }
    
    if (lowerMessage.includes('payment') || lowerMessage.includes('money')) {
        return "I can help you with payment requests, Sister. Would you like to request an advance payment or payment for completed work? Please let me know the details, and I'll connect you with our finance team.";
    }
    
    if (lowerMessage.includes('health') || lowerMessage.includes('sick')) {
        return "I'm sorry to hear you're not feeling well, Sister. Your health is very important to us! Please let me know what's happening, and I'll immediately connect you with our support team who can help.";
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
        return "I'm here to help you, Sister! I can assist with:\n\n1. 📦 Bulk order updates\n2. 🏥 Health issues\n3. 💰 Payment requests\n4. 📚 Skills development\n5. 🤝 General support\n\nWhat would you like help with today?";
    }
    
    return "Namaste Sister! I'm AI Sakhi, your personal assistant. I'm here to support you with your work, orders, payments, and any challenges you're facing. How can I assist you today?";
}

/**
 * Create HTTP response
 */
function createResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'POST,OPTIONS'
        },
        body: JSON.stringify(body)
    };
}
