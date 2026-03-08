/**
 * AI Sakhi Context Lambda Function
 * Fetches comprehensive user context for AI conversations
 * 
 * This Lambda provides:
 * - User profile information
 * - Active orders and progress
 * - Pending payments
 * - Labour tracking data
 * - SkillScan results
 * - Recent activity
 */

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");

// Initialize DynamoDB client
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1'
}));

// DynamoDB table names
const USERS_TABLE = process.env.USERS_TABLE;
const ARTISAN_PROFILES_TABLE = process.env.ARTISAN_PROFILES_TABLE;
const ORDERS_TABLE = process.env.ORDERS_TABLE;
const LABOUR_TABLE = process.env.LABOUR_TABLE;
const SKILLSCAN_TABLE = process.env.SKILLSCAN_TABLE;
const AI_CONVERSATIONS_TABLE = process.env.AI_CONVERSATIONS_TABLE;

/**
 * Lambda handler
 */
exports.handler = async (event) => {
    console.log('📊 AI Sakhi Context Lambda invoked');
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        // Get user ID from path parameters or authorizer
        const userId = event.pathParameters?.userId || 
                      event.requestContext?.authorizer?.claims?.sub ||
                      event.requestContext?.authorizer?.userId;
        
        if (!userId) {
            return createResponse(401, {
                success: false,
                error: 'Unauthorized - User ID not found'
            });
        }
        
        console.log(`🔍 Fetching context for user: ${userId}`);
        
        // Fetch all context data in parallel
        const [
            userInfo,
            artisanProfile,
            orders,
            labourData,
            skillScans,
            recentConversations
        ] = await Promise.all([
            getUserInfo(userId),
            getArtisanProfile(userId),
            getOrders(userId),
            getLabourData(userId),
            getSkillScans(userId),
            getRecentConversations(userId)
        ]);
        
        // Build comprehensive context
        const context = {
            user: userInfo,
            artisan: artisanProfile,
            orders: {
                active: orders.filter(o => o.status === 'in_progress' || o.status === 'pending'),
                completed: orders.filter(o => o.status === 'completed'),
                total: orders.length,
                pendingPayments: orders.filter(o => o.status === 'completed' && o.paymentStatus === 'pending')
            },
            labour: labourData,
            skills: skillScans,
            recentActivity: recentConversations,
            summary: generateSummary(userInfo, artisanProfile, orders, labourData)
        };
        
        return createResponse(200, {
            success: true,
            context,
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
 * Get user information
 */
async function getUserInfo(userId) {
    try {
        const result = await dynamoClient.send(new GetCommand({
            TableName: USERS_TABLE,
            Key: { userId }
        }));
        
        if (!result.Item) {
            return null;
        }
        
        return {
            userId: result.Item.userId,
            fullName: result.Item.fullName,
            email: result.Item.email,
            phone: result.Item.phone,
            role: result.Item.role,
            status: result.Item.status,
            createdAt: result.Item.createdAt,
            lastLogin: result.Item.lastLogin
        };
        
    } catch (error) {
        console.error('Error fetching user info:', error);
        return null;
    }
}

/**
 * Get artisan profile
 */
async function getArtisanProfile(userId) {
    try {
        const result = await dynamoClient.send(new QueryCommand({
            TableName: ARTISAN_PROFILES_TABLE,
            IndexName: 'UserIdIndex',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }));
        
        if (!result.Items || result.Items.length === 0) {
            return null;
        }
        
        const profile = result.Items[0];
        
        return {
            artisanId: profile.artisanId,
            skills: profile.skills || [],
            experienceYears: profile.experienceYears || 0,
            location: profile.location,
            bio: profile.bio,
            rating: profile.rating || 0,
            totalOrders: profile.totalOrders || 0,
            totalEarnings: profile.totalEarnings || 0,
            verificationStatus: profile.verificationStatus,
            availabilityStatus: profile.availabilityStatus
        };
        
    } catch (error) {
        console.error('Error fetching artisan profile:', error);
        return null;
    }
}

/**
 * Get orders for artisan
 */
async function getOrders(userId) {
    try {
        // First get artisan ID
        const artisanResult = await dynamoClient.send(new QueryCommand({
            TableName: ARTISAN_PROFILES_TABLE,
            IndexName: 'UserIdIndex',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }));
        
        if (!artisanResult.Items || artisanResult.Items.length === 0) {
            return [];
        }
        
        const artisanId = artisanResult.Items[0].artisanId;
        
        // Get orders
        const ordersResult = await dynamoClient.send(new QueryCommand({
            TableName: ORDERS_TABLE,
            IndexName: 'ArtisanIdIndex',
            KeyConditionExpression: 'artisanId = :artisanId',
            ExpressionAttributeValues: {
                ':artisanId': artisanId
            },
            Limit: 20,
            ScanIndexForward: false // Most recent first
        }));
        
        if (!ordersResult.Items) {
            return [];
        }
        
        return ordersResult.Items.map(order => ({
            orderId: order.orderId,
            title: order.title,
            description: order.description,
            quantity: order.quantity,
            completed: order.imagesCompleted || 0,
            unitPrice: order.unitPrice,
            totalAmount: order.totalAmount,
            status: order.status,
            paymentStatus: order.paymentStatus || 'pending',
            deliveryDate: order.deliveryDate,
            progressPercentage: order.progressPercentage || 0,
            progressNote: order.progressNote,
            lastProgressUpdate: order.lastProgressUpdate,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            completedAt: order.completedAt,
            buyerName: order.buyerName || 'Buyer'
        }));
        
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
}

/**
 * Get labour tracking data
 */
async function getLabourData(userId) {
    try {
        // First get artisan ID
        const artisanResult = await dynamoClient.send(new QueryCommand({
            TableName: ARTISAN_PROFILES_TABLE,
            IndexName: 'UserIdIndex',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }));
        
        if (!artisanResult.Items || artisanResult.Items.length === 0) {
            return null;
        }
        
        const artisanId = artisanResult.Items[0].artisanId;
        
        // Get today's labour data
        const today = new Date().toISOString().split('T')[0];
        const todayResult = await dynamoClient.send(new QueryCommand({
            TableName: LABOUR_TABLE,
            IndexName: 'ArtisanIdIndex',
            KeyConditionExpression: 'artisanId = :artisanId AND #date = :date',
            ExpressionAttributeNames: {
                '#date': 'date'
            },
            ExpressionAttributeValues: {
                ':artisanId': artisanId,
                ':date': today
            }
        }));
        
        // Get last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
        
        const weekResult = await dynamoClient.send(new QueryCommand({
            TableName: LABOUR_TABLE,
            IndexName: 'ArtisanIdIndex',
            KeyConditionExpression: 'artisanId = :artisanId AND #date >= :date',
            ExpressionAttributeNames: {
                '#date': 'date'
            },
            ExpressionAttributeValues: {
                ':artisanId': artisanId,
                ':date': sevenDaysAgoStr
            }
        }));
        
        const todayLabour = todayResult.Items && todayResult.Items.length > 0 ? todayResult.Items[0] : null;
        const weekLabour = weekResult.Items || [];
        
        // Calculate weekly totals
        const weeklyTotals = weekLabour.reduce((acc, day) => {
            acc.craftHours += day.craftHours || 0;
            acc.householdHours += day.householdHours || 0;
            acc.totalHours += day.totalHours || 0;
            return acc;
        }, { craftHours: 0, householdHours: 0, totalHours: 0 });
        
        return {
            today: todayLabour ? {
                craftHours: todayLabour.craftHours || 0,
                householdHours: todayLabour.householdHours || 0,
                totalHours: todayLabour.totalHours || 0,
                selfCareHours: 24 - (todayLabour.totalHours || 0),
                date: todayLabour.date,
                notes: todayLabour.notes
            } : null,
            thisWeek: {
                craftHours: weeklyTotals.craftHours,
                householdHours: weeklyTotals.householdHours,
                totalHours: weeklyTotals.totalHours,
                averagePerDay: weekLabour.length > 0 ? weeklyTotals.totalHours / weekLabour.length : 0,
                daysLogged: weekLabour.length
            },
            balance: todayLabour ? {
                household: todayLabour.householdHours || 0,
                career: todayLabour.craftHours || 0,
                selfCare: 24 - (todayLabour.totalHours || 0)
            } : { household: 0, career: 0, selfCare: 0 }
        };
        
    } catch (error) {
        console.error('Error fetching labour data:', error);
        return null;
    }
}

/**
 * Get SkillScan results
 */
async function getSkillScans(userId) {
    try {
        // First get artisan ID
        const artisanResult = await dynamoClient.send(new QueryCommand({
            TableName: ARTISAN_PROFILES_TABLE,
            IndexName: 'UserIdIndex',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }));
        
        if (!artisanResult.Items || artisanResult.Items.length === 0) {
            return [];
        }
        
        const artisanId = artisanResult.Items[0].artisanId;
        
        // Get skill scans
        const result = await dynamoClient.send(new QueryCommand({
            TableName: SKILLSCAN_TABLE,
            IndexName: 'ArtisanIdIndex',
            KeyConditionExpression: 'artisanId = :artisanId',
            ExpressionAttributeValues: {
                ':artisanId': artisanId
            },
            Limit: 5,
            ScanIndexForward: false // Most recent first
        }));
        
        if (!result.Items) {
            return [];
        }
        
        return result.Items.map(scan => ({
            scanId: scan.scanId,
            category: scan.category,
            skillLevel: scan.skillLevel,
            overallScore: scan.overallScore,
            strengths: scan.strengths,
            improvements: scan.improvements,
            scanDate: scan.scanDate
        }));
        
    } catch (error) {
        console.error('Error fetching skill scans:', error);
        return [];
    }
}

/**
 * Get recent conversations
 */
async function getRecentConversations(userId) {
    try {
        const result = await dynamoClient.send(new QueryCommand({
            TableName: AI_CONVERSATIONS_TABLE,
            IndexName: 'UserIdIndex',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            Limit: 10,
            ScanIndexForward: false // Most recent first
        }));
        
        if (!result.Items) {
            return [];
        }
        
        return result.Items.map(conv => ({
            conversationId: conv.conversationId,
            userMessage: conv.userMessage,
            assistantResponse: conv.assistantResponse,
            timestamp: conv.timestamp
        }));
        
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return [];
    }
}

/**
 * Generate context summary
 */
function generateSummary(userInfo, artisanProfile, orders, labourData) {
    const activeOrders = orders.filter(o => o.status === 'in_progress' || o.status === 'pending');
    const completedOrders = orders.filter(o => o.status === 'completed');
    const pendingPayments = orders.filter(o => o.status === 'completed' && o.paymentStatus === 'pending');
    
    return {
        userName: userInfo?.fullName || 'Sister',
        artisanStatus: artisanProfile?.verificationStatus || 'pending',
        activeOrdersCount: activeOrders.length,
        completedOrdersCount: completedOrders.length,
        pendingPaymentsCount: pendingPayments.length,
        totalEarnings: artisanProfile?.totalEarnings || 0,
        rating: artisanProfile?.rating || 0,
        todayWorkHours: labourData?.today?.craftHours || 0,
        todayHouseholdHours: labourData?.today?.householdHours || 0,
        needsAttention: activeOrders.length > 0 || pendingPayments.length > 0
    };
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
            'Access-Control-Allow-Methods': 'GET,OPTIONS'
        },
        body: JSON.stringify(body)
    };
}
