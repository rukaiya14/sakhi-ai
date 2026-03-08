/**
 * AI Sakhi Intent Detection Lambda Function
 * Analyzes user messages to detect intent and classify requests
 * 
 * This Lambda provides:
 * - Intent classification (payment, health, order, support, general)
 * - Confidence scoring
 * - Entity extraction
 * - Action recommendations
 * - Priority assessment
 */

/**
 * Lambda handler
 */
exports.handler = async (event) => {
    console.log('🎯 AI Sakhi Intent Detection Lambda invoked');
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        // Parse request body
        const body = JSON.parse(event.body || '{}');
        const { message, conversationHistory = [], userContext = {} } = body;
        
        if (!message) {
            return createResponse(400, {
                success: false,
                error: 'Message is required'
            });
        }
        
        console.log(`📝 Analyzing message: ${message}`);
        
        // Detect intent
        const intent = detectIntent(message, conversationHistory, userContext);
        
        // Extract entities
        const entities = extractEntities(message, intent.type);
        
        // Determine priority
        const priority = assessPriority(intent, entities, userContext);
        
        // Generate action recommendations
        const actions = recommendActions(intent, entities, priority, userContext);
        
        return createResponse(200, {
            success: true,
            intent: {
                type: intent.type,
                confidence: intent.confidence,
                subType: intent.subType,
                description: intent.description
            },
            entities,
            priority,
            actions,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Lambda error:', error);
        return createResponse(500, {
            success: false,
            error: error.message
        });
    }
};

/**
 * Detect intent from message
 */
function detectIntent(message, conversationHistory, userContext) {
    const lowerMessage = message.toLowerCase();
    const words = lowerMessage.split(/\s+/);
    
    // Payment intent keywords
    const paymentKeywords = ['payment', 'money', 'pay', 'advance', 'salary', 'earning', 'rupee', 'rupees', '₹', 'paid', 'pending payment'];
    const paymentScore = countKeywords(words, paymentKeywords);
    
    // Health intent keywords
    const healthKeywords = ['health', 'sick', 'ill', 'unwell', 'doctor', 'hospital', 'medicine', 'fever', 'pain', 'emergency'];
    const healthScore = countKeywords(words, healthKeywords);
    
    // Order intent keywords
    const orderKeywords = ['order', 'bulk', 'progress', 'update', 'complete', 'deadline', 'delivery', 'quantity', 'pieces'];
    const orderScore = countKeywords(words, orderKeywords);
    
    // Support intent keywords
    const supportKeywords = ['help', 'support', 'problem', 'issue', 'difficulty', 'challenge', 'stuck', 'confused'];
    const supportScore = countKeywords(words, supportKeywords);
    
    // Skills intent keywords
    const skillsKeywords = ['skill', 'learn', 'training', 'course', 'improve', 'better', 'teach', 'skillscan'];
    const skillsScore = countKeywords(words, skillsKeywords);
    
    // Calculate scores
    const scores = {
        payment: paymentScore,
        health: healthScore,
        order: orderScore,
        support: supportScore,
        skills: skillsScore
    };
    
    // Find highest score
    const maxScore = Math.max(...Object.values(scores));
    const intentType = Object.keys(scores).find(key => scores[key] === maxScore);
    
    // Determine confidence
    let confidence = 0.5;
    if (maxScore >= 3) confidence = 0.95;
    else if (maxScore >= 2) confidence = 0.85;
    else if (maxScore >= 1) confidence = 0.7;
    
    // Determine sub-type
    let subType = null;
    let description = '';
    
    switch (intentType) {
        case 'payment':
            if (lowerMessage.includes('advance')) {
                subType = 'advance_request';
                description = 'User is requesting advance payment';
            } else if (lowerMessage.includes('pending') || lowerMessage.includes('completed')) {
                subType = 'payment_for_work';
                description = 'User is requesting payment for completed work';
            } else {
                subType = 'general_payment';
                description = 'User has a payment-related query';
            }
            break;
            
        case 'health':
            if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
                subType = 'emergency';
                description = 'User has an urgent health emergency';
                confidence = 0.98;
            } else if (lowerMessage.includes('sick') || lowerMessage.includes('ill')) {
                subType = 'illness';
                description = 'User is reporting illness';
            } else {
                subType = 'general_health';
                description = 'User has a health-related concern';
            }
            break;
            
        case 'order':
            if (lowerMessage.includes('update') || lowerMessage.includes('progress')) {
                subType = 'progress_update';
                description = 'User wants to update order progress';
            } else if (lowerMessage.includes('problem') || lowerMessage.includes('issue')) {
                subType = 'order_issue';
                description = 'User is facing an issue with an order';
            } else {
                subType = 'general_order';
                description = 'User has an order-related query';
            }
            break;
            
        case 'support':
            if (lowerMessage.includes('urgent') || lowerMessage.includes('emergency')) {
                subType = 'urgent_support';
                description = 'User needs urgent support';
            } else {
                subType = 'general_support';
                description = 'User needs general support';
            }
            break;
            
        case 'skills':
            if (lowerMessage.includes('skillscan')) {
                subType = 'skillscan_query';
                description = 'User has a SkillScan-related query';
            } else if (lowerMessage.includes('training') || lowerMessage.includes('course')) {
                subType = 'training_request';
                description = 'User is interested in training';
            } else {
                subType = 'skill_improvement';
                description = 'User wants to improve skills';
            }
            break;
            
        default:
            subType = 'general';
            description = 'General conversation';
            confidence = 0.5;
    }
    
    return {
        type: intentType || 'general',
        subType,
        confidence,
        description,
        scores
    };
}

/**
 * Count keyword matches
 */
function countKeywords(words, keywords) {
    let count = 0;
    for (const word of words) {
        for (const keyword of keywords) {
            if (word.includes(keyword) || keyword.includes(word)) {
                count++;
            }
        }
    }
    return count;
}

/**
 * Extract entities from message
 */
function extractEntities(message, intentType) {
    const entities = {
        amounts: [],
        dates: [],
        orderIds: [],
        numbers: []
    };
    
    // Extract amounts (₹ or rupees)
    const amountRegex = /₹\s*(\d+(?:,\d+)*(?:\.\d+)?)|(\d+(?:,\d+)*(?:\.\d+)?)\s*rupees?/gi;
    let match;
    while ((match = amountRegex.exec(message)) !== null) {
        const amount = match[1] || match[2];
        entities.amounts.push(parseFloat(amount.replace(/,/g, '')));
    }
    
    // Extract dates
    const dateRegex = /\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2}/g;
    const dates = message.match(dateRegex);
    if (dates) {
        entities.dates = dates;
    }
    
    // Extract order IDs (ORD-YYYY-NNN or similar patterns)
    const orderIdRegex = /ORD[-_]?\d{4}[-_]?\d{3,}/gi;
    const orderIds = message.match(orderIdRegex);
    if (orderIds) {
        entities.orderIds = orderIds;
    }
    
    // Extract numbers
    const numberRegex = /\b\d+\b/g;
    const numbers = message.match(numberRegex);
    if (numbers) {
        entities.numbers = numbers.map(n => parseInt(n));
    }
    
    return entities;
}

/**
 * Assess priority level
 */
function assessPriority(intent, entities, userContext) {
    let priority = 'medium';
    let score = 50;
    let reasons = [];
    
    // High priority conditions
    if (intent.type === 'health' && intent.subType === 'emergency') {
        priority = 'critical';
        score = 100;
        reasons.push('Health emergency detected');
    } else if (intent.type === 'health') {
        priority = 'high';
        score = 85;
        reasons.push('Health issue reported');
    }
    
    if (intent.type === 'payment' && intent.subType === 'advance_request') {
        if (priority !== 'critical') {
            priority = 'high';
            score = Math.max(score, 80);
        }
        reasons.push('Advance payment requested');
    }
    
    // Check user context for urgency indicators
    if (userContext.orders) {
        const overdueOrders = userContext.orders.filter(o => {
            if (!o.deadline) return false;
            const deadline = new Date(o.deadline);
            return deadline < new Date() && o.status !== 'completed';
        });
        
        if (overdueOrders.length > 0) {
            priority = priority === 'medium' ? 'high' : priority;
            score = Math.max(score, 75);
            reasons.push(`${overdueOrders.length} overdue order(s)`);
        }
    }
    
    if (userContext.pendingPayments && userContext.pendingPayments.length > 0) {
        score = Math.max(score, 70);
        reasons.push(`${userContext.pendingPayments.length} pending payment(s)`);
    }
    
    // Adjust based on confidence
    if (intent.confidence < 0.6) {
        score -= 10;
        reasons.push('Low confidence in intent detection');
    }
    
    return {
        level: priority,
        score,
        reasons,
        requiresImmediate Action: priority === 'critical' || priority === 'high'
    };
}

/**
 * Recommend actions based on intent
 */
function recommendActions(intent, entities, priority, userContext) {
    const actions = [];
    
    switch (intent.type) {
        case 'payment':
            actions.push({
                type: 'create_payment_request',
                description: 'Create payment request in system',
                automated: true,
                requiresApproval: true
            });
            
            if (intent.subType === 'advance_request') {
                actions.push({
                    type: 'notify_finance_team',
                    description: 'Notify finance team of advance request',
                    automated: true,
                    requiresApproval: false
                });
            }
            
            actions.push({
                type: 'send_confirmation',
                description: 'Send confirmation message to artisan',
                automated: true,
                requiresApproval: false
            });
            break;
            
        case 'health':
            actions.push({
                type: 'alert_support_team',
                description: 'Alert community support team',
                automated: true,
                requiresApproval: false,
                urgent: priority.level === 'critical'
            });
            
            actions.push({
                type: 'schedule_wellness_check',
                description: 'Schedule wellness check call',
                automated: true,
                requiresApproval: false
            });
            
            if (priority.level === 'critical') {
                actions.push({
                    type: 'emergency_response',
                    description: 'Initiate emergency response protocol',
                    automated: true,
                    requiresApproval: false,
                    urgent: true
                });
            }
            break;
            
        case 'order':
            if (intent.subType === 'progress_update') {
                actions.push({
                    type: 'open_progress_form',
                    description: 'Open order progress update form',
                    automated: false,
                    requiresApproval: false
                });
            }
            
            if (intent.subType === 'order_issue') {
                actions.push({
                    type: 'create_support_ticket',
                    description: 'Create support ticket for order issue',
                    automated: true,
                    requiresApproval: false
                });
            }
            break;
            
        case 'support':
            actions.push({
                type: 'create_support_ticket',
                description: 'Create general support ticket',
                automated: true,
                requiresApproval: false
            });
            
            if (priority.level === 'high' || priority.level === 'critical') {
                actions.push({
                    type: 'notify_support_team',
                    description: 'Notify support team immediately',
                    automated: true,
                    requiresApproval: false,
                    urgent: true
                });
            }
            break;
            
        case 'skills':
            actions.push({
                type: 'provide_training_info',
                description: 'Provide information about training programs',
                automated: false,
                requiresApproval: false
            });
            
            if (intent.subType === 'skillscan_query') {
                actions.push({
                    type: 'open_skillscan',
                    description: 'Open SkillScan interface',
                    automated: false,
                    requiresApproval: false
                });
            }
            break;
            
        default:
            actions.push({
                type: 'continue_conversation',
                description: 'Continue general conversation',
                automated: false,
                requiresApproval: false
            });
    }
    
    return actions;
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
