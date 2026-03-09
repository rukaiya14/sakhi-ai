/**
 * AI Sakhi Action Trigger Lambda Function
 * Triggers automated actions based on detected intents
 * 
 * This Lambda handles:
 * - Payment request creation
 * - Support ticket creation
 * - Notification sending (SNS/SES)
 * - Step Functions workflow triggering
 * - Emergency response protocols
 */

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { SFNClient, StartExecutionCommand } = require("@aws-sdk/client-sfn");

// Initialize AWS clients
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1'
}));

const snsClient = new SNSClient({
    region: process.env.AWS_REGION || 'us-east-1'
});

const sfnClient = new SFNClient({
    region: process.env.AWS_REGION || 'us-east-1'
});

// Environment variables
const SUPPORT_REQUESTS_TABLE = process.env.SUPPORT_REQUESTS_TABLE;
const PAYMENT_REQUESTS_TABLE = process.env.PAYMENT_REQUESTS_TABLE;
const NOTIFICATIONS_TABLE = process.env.NOTIFICATIONS_TABLE;
const SUPPORT_TEAM_TOPIC_ARN = process.env.SUPPORT_TEAM_TOPIC_ARN;
const WELLNESS_CHECK_STATE_MACHINE_ARN = process.env.WELLNESS_CHECK_STATE_MACHINE_ARN;

/**
 * Lambda handler
 */
exports.handler = async (event) => {
    console.log('🎬 AI Sakhi Action Trigger Lambda invoked');
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        // Parse request body
        const body = JSON.parse(event.body || '{}');
        const { userId, intent, entities, priority, userContext, message } = body;
        
        if (!userId || !intent) {
            return createResponse(400, {
                success: false,
                error: 'userId and intent are required'
            });
        }
        
        console.log(`🎯 Triggering actions for intent: ${intent.type} (${intent.subType})`);
        
        const results = [];
        
        // Execute actions based on intent type
        switch (intent.type) {
            case 'payment':
                const paymentResult = await handlePaymentIntent(userId, intent, entities, userContext, message);
                results.push(paymentResult);
                break;
                
            case 'health':
                const healthResult = await handleHealthIntent(userId, intent, priority, userContext, message);
                results.push(healthResult);
                break;
                
            case 'order':
                const orderResult = await handleOrderIntent(userId, intent, entities, userContext, message);
                results.push(orderResult);
                break;
                
            case 'support':
                const supportResult = await handleSupportIntent(userId, intent, priority, userContext, message);
                results.push(supportResult);
                break;
                
            default:
                results.push({
                    action: 'no_action',
                    success: true,
                    message: 'No automated action required'
                });
        }
        
        return createResponse(200, {
            success: true,
            actionsTriggered: results,
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
 * Handle payment intent
 */
async function handlePaymentIntent(userId, intent, entities, userContext, message) {
    console.log('💰 Handling payment intent...');
    
    try {
        const paymentRequestId = `PAY_${Date.now()}_${userId.substring(0, 8)}`;
        
        // Determine payment type and amount
        let paymentType = 'completed_work';
        let amount = null;
        
        if (intent.subType === 'advance_request') {
            paymentType = 'advance';
        }
        
        // Extract amount from entities
        if (entities.amounts && entities.amounts.length > 0) {
            amount = entities.amounts[0];
        }
        
        // Create payment request in DynamoDB
        await dynamoClient.send(new PutCommand({
            TableName: PAYMENT_REQUESTS_TABLE,
            Item: {
                paymentRequestId,
                userId,
                artisanId: userContext.artisanId,
                paymentType,
                requestedAmount: amount,
                status: 'pending_review',
                reason: message,
                priority: intent.subType === 'advance_request' ? 'high' : 'medium',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        }));
        
        console.log(`✅ Payment request created: ${paymentRequestId}`);
        
        // Send notification to finance team
        await sendNotification(
            'finance_team',
            `New ${paymentType} payment request from ${userContext.userName}`,
            {
                paymentRequestId,
                userId,
                amount,
                type: paymentType
            }
        );
        
        // Create notification for user
        await createUserNotification(
            userId,
            'Payment Request Submitted',
            `Your ${paymentType} payment request has been submitted and is under review. You will be notified once it's processed.`,
            'payment'
        );
        
        return {
            action: 'create_payment_request',
            success: true,
            paymentRequestId,
            message: 'Payment request created successfully'
        };
        
    } catch (error) {
        console.error('Error handling payment intent:', error);
        return {
            action: 'create_payment_request',
            success: false,
            error: error.message
        };
    }
}

/**
 * Handle health intent
 */
async function handleHealthIntent(userId, intent, priority, userContext, message) {
    console.log('🏥 Handling health intent...');
    
    try {
        const healthAlertId = `HEALTH_${Date.now()}_${userId.substring(0, 8)}`;
        
        // Create health alert
        await dynamoClient.send(new PutCommand({
            TableName: 'shebalance-health-alerts',
            Item: {
                healthAlertId,
                userId,
                artisanId: userContext.artisanId,
                severity: intent.subType === 'emergency' ? 'critical' : 'moderate',
                description: message,
                status: 'open',
                priority: priority.level,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        }));
        
        console.log(`✅ Health alert created: ${healthAlertId}`);
        
        // Alert support team via SNS
        if (SUPPORT_TEAM_TOPIC_ARN) {
            await snsClient.send(new PublishCommand({
                TopicArn: SUPPORT_TEAM_TOPIC_ARN,
                Subject: `${priority.level === 'critical' ? '🚨 URGENT' : '⚠️'} Health Alert - ${userContext.userName}`,
                Message: `Health Alert Details:
                
Artisan: ${userContext.userName}
User ID: ${userId}
Severity: ${intent.subType === 'emergency' ? 'CRITICAL' : 'Moderate'}
Priority: ${priority.level}

Message: ${message}

Alert ID: ${healthAlertId}
Time: ${new Date().toISOString()}

${priority.level === 'critical' ? 'IMMEDIATE ACTION REQUIRED!' : 'Please follow up within 2 hours.'}`,
                MessageAttributes: {
                    priority: {
                        DataType: 'String',
                        StringValue: priority.level
                    },
                    alertType: {
                        DataType: 'String',
                        StringValue: 'health'
                    }
                }
            }));
            
            console.log('✅ Support team notified via SNS');
        }
        
        // Trigger wellness check workflow if not emergency
        if (intent.subType !== 'emergency' && WELLNESS_CHECK_STATE_MACHINE_ARN) {
            await sfnClient.send(new StartExecutionCommand({
                stateMachineArn: WELLNESS_CHECK_STATE_MACHINE_ARN,
                input: JSON.stringify({
                    userId,
                    artisanId: userContext.artisanId,
                    healthAlertId,
                    severity: intent.subType,
                    message
                })
            }));
            
            console.log('✅ Wellness check workflow triggered');
        }
        
        // Create notification for user
        await createUserNotification(
            userId,
            'Health Support Initiated',
            `We've received your health concern and our support team has been notified. ${priority.level === 'critical' ? 'Someone will contact you immediately.' : 'Someone will reach out to you within 2 hours.'}`,
            'health'
        );
        
        return {
            action: 'handle_health_issue',
            success: true,
            healthAlertId,
            supportTeamNotified: true,
            workflowTriggered: intent.subType !== 'emergency',
            message: 'Health alert created and support team notified'
        };
        
    } catch (error) {
        console.error('Error handling health intent:', error);
        return {
            action: 'handle_health_issue',
            success: false,
            error: error.message
        };
    }
}

/**
 * Handle order intent
 */
async function handleOrderIntent(userId, intent, entities, userContext, message) {
    console.log('📦 Handling order intent...');
    
    try {
        if (intent.subType === 'order_issue') {
            // Create support ticket for order issue
            const ticketId = `TICKET_${Date.now()}_${userId.substring(0, 8)}`;
            
            await dynamoClient.send(new PutCommand({
                TableName: SUPPORT_REQUESTS_TABLE,
                Item: {
                    ticketId,
                    userId,
                    artisanId: userContext.artisanId,
                    category: 'order_issue',
                    subject: 'Order Issue',
                    description: message,
                    status: 'open',
                    priority: 'medium',
                    orderId: entities.orderIds && entities.orderIds.length > 0 ? entities.orderIds[0] : null,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            }));
            
            console.log(`✅ Support ticket created: ${ticketId}`);
            
            // Notify support team
            await sendNotification(
                'support_team',
                `New order issue ticket from ${userContext.userName}`,
                { ticketId, userId, category: 'order_issue' }
            );
            
            // Notify user
            await createUserNotification(
                userId,
                'Support Ticket Created',
                `Your order issue has been logged (Ticket #${ticketId}). Our support team will respond within 24 hours.`,
                'support'
            );
            
            return {
                action: 'create_support_ticket',
                success: true,
                ticketId,
                message: 'Support ticket created for order issue'
            };
        }
        
        return {
            action: 'no_action',
            success: true,
            message: 'No automated action required for this order intent'
        };
        
    } catch (error) {
        console.error('Error handling order intent:', error);
        return {
            action: 'handle_order_intent',
            success: false,
            error: error.message
        };
    }
}

/**
 * Handle support intent
 */
async function handleSupportIntent(userId, intent, priority, userContext, message) {
    console.log('🤝 Handling support intent...');
    
    try {
        const ticketId = `TICKET_${Date.now()}_${userId.substring(0, 8)}`;
        
        await dynamoClient.send(new PutCommand({
            TableName: SUPPORT_REQUESTS_TABLE,
            Item: {
                ticketId,
                userId,
                artisanId: userContext.artisanId,
                category: 'general_support',
                subject: 'General Support Request',
                description: message,
                status: 'open',
                priority: priority.level,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        }));
        
        console.log(`✅ Support ticket created: ${ticketId}`);
        
        // Notify support team if high priority
        if (priority.level === 'high' || priority.level === 'critical') {
            await sendNotification(
                'support_team',
                `${priority.level === 'critical' ? '🚨 URGENT' : '⚠️ High Priority'} Support Request from ${userContext.userName}`,
                { ticketId, userId, priority: priority.level }
            );
        }
        
        // Notify user
        await createUserNotification(
            userId,
            'Support Request Received',
            `Your support request has been received (Ticket #${ticketId}). ${priority.level === 'high' || priority.level === 'critical' ? 'Our team will respond within 2 hours.' : 'Our team will respond within 24 hours.'}`,
            'support'
        );
        
        return {
            action: 'create_support_ticket',
            success: true,
            ticketId,
            message: 'Support ticket created successfully'
        };
        
    } catch (error) {
        console.error('Error handling support intent:', error);
        return {
            action: 'create_support_ticket',
            success: false,
            error: error.message
        };
    }
}

/**
 * Send notification via SNS
 */
async function sendNotification(recipient, subject, data) {
    try {
        // In a real implementation, this would send to appropriate SNS topic
        console.log(`📧 Notification sent to ${recipient}: ${subject}`);
        console.log('Data:', JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error sending notification:', error);
        return false;
    }
}

/**
 * Create user notification in DynamoDB
 */
async function createUserNotification(userId, title, message, type) {
    try {
        const notificationId = `NOTIF_${Date.now()}_${userId.substring(0, 8)}`;
        
        await dynamoClient.send(new PutCommand({
            TableName: NOTIFICATIONS_TABLE,
            Item: {
                notificationId,
                userId,
                title,
                message,
                type,
                readStatus: false,
                createdAt: new Date().toISOString(),
                ttl: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days TTL
            }
        }));
        
        console.log(`✅ User notification created: ${notificationId}`);
        return notificationId;
        
    } catch (error) {
        console.error('Error creating user notification:', error);
        return null;
    }
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
