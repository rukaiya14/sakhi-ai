// AWS DynamoDB Client for SHE-BALANCE
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Configure AWS
AWS.config.update({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tablePrefix = process.env.DYNAMODB_TABLE_PREFIX || 'shebalance-';

class DynamoDBClient {
    constructor() {
        this.tables = {
            users: `${tablePrefix}users`,
            artisanProfiles: `${tablePrefix}artisan-profiles`,
            buyerProfiles: `${tablePrefix}buyer-profiles`,
            corporateProfiles: `${tablePrefix}corporate-profiles`,
            products: `${tablePrefix}products`,
            orders: `${tablePrefix}orders`,
            bulkOrders: `${tablePrefix}bulk-orders`,
            skillscanResults: `${tablePrefix}skillscan-results`,
            learningProgress: `${tablePrefix}learning-progress`,
            labourTracking: `${tablePrefix}labour-tracking`,
            aiConversations: `${tablePrefix}ai-conversations`,
            supportRequests: `${tablePrefix}support-requests`,
            paymentRequests: `${tablePrefix}payment-requests`,
            transactions: `${tablePrefix}transactions`,
            favorites: `${tablePrefix}favorites`,
            reviews: `${tablePrefix}reviews`,
            notifications: `${tablePrefix}notifications`,
            healthAlerts: `${tablePrefix}health-alerts`
        };
    }

    // ==================== USER OPERATIONS ====================

    async createUser(userData) {
        const userId = uuidv4();
        const timestamp = new Date().toISOString();
        
        const item = {
            userId,
            email: userData.email,
            passwordHash: userData.passwordHash,
            fullName: userData.fullName,
            phone: userData.phone || null,
            role: userData.role,
            status: 'pending',
            profileImage: null,
            createdAt: timestamp,
            updatedAt: timestamp,
            lastLogin: null,
            emailVerified: false,
            phoneVerified: false
        };

        await dynamodb.put({
            TableName: this.tables.users,
            Item: item,
            ConditionExpression: 'attribute_not_exists(email)'
        }).promise();

        return { userId, ...item };
    }

    async getUserByEmail(email) {
        const result = await dynamodb.query({
            TableName: this.tables.users,
            IndexName: 'EmailIndex',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': email
            }
        }).promise();

        return result.Items[0] || null;
    }

    async getUserById(userId) {
        const result = await dynamodb.get({
            TableName: this.tables.users,
            Key: { userId }
        }).promise();

        return result.Item || null;
    }

    async updateUser(userId, updates) {
        const timestamp = new Date().toISOString();
        updates.updatedAt = timestamp;

        const updateExpression = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};

        Object.keys(updates).forEach((key, index) => {
            const placeholder = `#attr${index}`;
            const valuePlaceholder = `:val${index}`;
            updateExpression.push(`${placeholder} = ${valuePlaceholder}`);
            expressionAttributeNames[placeholder] = key;
            expressionAttributeValues[valuePlaceholder] = updates[key];
        });

        await dynamodb.update({
            TableName: this.tables.users,
            Key: { userId },
            UpdateExpression: `SET ${updateExpression.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues
        }).promise();
    }

    async getAllUsers() {
        const result = await dynamodb.scan({
            TableName: this.tables.users
        }).promise();

        return result.Items || [];
    }

    // ==================== ARTISAN PROFILE OPERATIONS ====================

    async createArtisanProfile(userId) {
        const artisanId = uuidv4();
        
        const item = {
            artisanId,
            userId,
            skills: [],
            experienceYears: 0,
            location: null,
            bio: null,
            portfolioImages: [],
            certifications: [],
            rating: 0,
            totalOrders: 0,
            totalEarnings: 0,
            verificationStatus: 'pending',
            verificationDocuments: [],
            bankDetails: {},
            availabilityStatus: 'available'
        };

        await dynamodb.put({
            TableName: this.tables.artisanProfiles,
            Item: item
        }).promise();

        return item;
    }

    async getArtisanProfileByUserId(userId) {
        const result = await dynamodb.query({
            TableName: this.tables.artisanProfiles,
            IndexName: 'UserIdIndex',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();

        return result.Items[0] || null;
    }

    async getArtisanProfile(artisanId) {
        const result = await dynamodb.get({
            TableName: this.tables.artisanProfiles,
            Key: { artisanId }
        }).promise();

        return result.Item || null;
    }

    async updateArtisanProfile(artisanId, updates) {
        const updateExpression = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};

        Object.keys(updates).forEach((key, index) => {
            const placeholder = `#attr${index}`;
            const valuePlaceholder = `:val${index}`;
            updateExpression.push(`${placeholder} = ${valuePlaceholder}`);
            expressionAttributeNames[placeholder] = key;
            expressionAttributeValues[valuePlaceholder] = updates[key];
        });

        await dynamodb.update({
            TableName: this.tables.artisanProfiles,
            Key: { artisanId },
            UpdateExpression: `SET ${updateExpression.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues
        }).promise();
    }

    async getAllArtisans() {
        const result = await dynamodb.scan({
            TableName: this.tables.artisanProfiles,
            FilterExpression: 'verificationStatus = :status',
            ExpressionAttributeValues: {
                ':status': 'verified'
            }
        }).promise();

        return result.Items || [];
    }

    // ==================== BUYER PROFILE OPERATIONS ====================

    async createBuyerProfile(userId) {
        const buyerId = uuidv4();
        
        const item = {
            buyerId,
            userId,
            companyName: null,
            address: null,
            preferences: {},
            totalOrders: 0,
            totalSpent: 0
        };

        await dynamodb.put({
            TableName: this.tables.buyerProfiles,
            Item: item
        }).promise();

        return item;
    }

    async getBuyerProfileByUserId(userId) {
        const result = await dynamodb.query({
            TableName: this.tables.buyerProfiles,
            IndexName: 'UserIdIndex',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();

        return result.Items[0] || null;
    }

    async getBuyerProfile(buyerId) {
        const result = await dynamodb.get({
            TableName: this.tables.buyerProfiles,
            Key: { buyerId }
        }).promise();

        return result.Item || null;
    }

    // ==================== CORPORATE PROFILE OPERATIONS ====================

    async createCorporateProfile(userId, companyName) {
        const corporateId = uuidv4();
        
        const item = {
            corporateId,
            userId,
            companyName,
            companyType: null,
            gstNumber: null,
            address: null,
            contactPerson: null,
            totalContracts: 0,
            totalSpent: 0
        };

        await dynamodb.put({
            TableName: this.tables.corporateProfiles,
            Item: item
        }).promise();

        return item;
    }

    async getCorporateProfileByUserId(userId) {
        const result = await dynamodb.query({
            TableName: this.tables.corporateProfiles,
            IndexName: 'UserIdIndex',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();

        return result.Items[0] || null;
    }

    // ==================== ORDER OPERATIONS ====================

    async createOrder(orderData) {
        const orderId = uuidv4();
        const timestamp = new Date().toISOString();
        
        const item = {
            orderId,
            buyerId: orderData.buyerId,
            artisanId: orderData.artisanId,
            productId: orderData.productId || null,
            orderType: orderData.orderType || 'product',
            title: orderData.title,
            description: orderData.description || null,
            quantity: orderData.quantity || 1,
            unitPrice: orderData.unitPrice,
            totalAmount: orderData.totalAmount,
            status: 'pending',
            paymentStatus: 'pending',
            deliveryDate: orderData.deliveryDate || null,
            createdAt: timestamp,
            updatedAt: timestamp,
            completedAt: null
        };

        await dynamodb.put({
            TableName: this.tables.orders,
            Item: item
        }).promise();

        return item;
    }

    async getOrdersByArtisan(artisanId) {
        const result = await dynamodb.query({
            TableName: this.tables.orders,
            IndexName: 'ArtisanIdIndex',
            KeyConditionExpression: 'artisanId = :artisanId',
            ExpressionAttributeValues: {
                ':artisanId': artisanId
            }
        }).promise();

        return result.Items || [];
    }

    async getOrdersByBuyer(buyerId) {
        const result = await dynamodb.query({
            TableName: this.tables.orders,
            IndexName: 'BuyerIdIndex',
            KeyConditionExpression: 'buyerId = :buyerId',
            ExpressionAttributeValues: {
                ':buyerId': buyerId
            }
        }).promise();

        return result.Items || [];
    }

    async updateOrderStatus(orderId, status) {
        const timestamp = new Date().toISOString();
        
        await dynamodb.update({
            TableName: this.tables.orders,
            Key: { orderId },
            UpdateExpression: 'SET #status = :status, updatedAt = :timestamp',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':status': status,
                ':timestamp': timestamp
            }
        }).promise();
    }

    async updateOrderProgress(orderId, progressData) {
        const timestamp = new Date().toISOString();
        
        const updateExpression = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};

        if (progressData.progressPercentage !== undefined) {
            updateExpression.push('#progress = :progress');
            expressionAttributeNames['#progress'] = 'progressPercentage';
            expressionAttributeValues[':progress'] = progressData.progressPercentage;
        }

        if (progressData.progressNote) {
            updateExpression.push('progressNote = :note');
            expressionAttributeValues[':note'] = progressData.progressNote;
        }

        if (progressData.imagesCompleted !== undefined) {
            updateExpression.push('imagesCompleted = :images');
            expressionAttributeValues[':images'] = progressData.imagesCompleted;
        }

        // Always update lastProgressUpdate timestamp
        updateExpression.push('lastProgressUpdate = :lastUpdate, updatedAt = :timestamp');
        expressionAttributeValues[':lastUpdate'] = progressData.lastProgressUpdate || timestamp;
        expressionAttributeValues[':timestamp'] = timestamp;

        await dynamodb.update({
            TableName: this.tables.orders,
            Key: { orderId },
            UpdateExpression: `SET ${updateExpression.join(', ')}`,
            ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
            ExpressionAttributeValues: expressionAttributeValues
        }).promise();
    }

    async getOrderProgressHistory(orderId) {
        // Get order with progress information
        const result = await dynamodb.get({
            TableName: this.tables.orders,
            Key: { orderId }
        }).promise();

        const order = result.Item;
        
        if (!order) {
            return null;
        }

        return {
            orderId: order.orderId,
            progressPercentage: order.progressPercentage || 0,
            progressNote: order.progressNote || null,
            imagesCompleted: order.imagesCompleted || 0,
            lastProgressUpdate: order.lastProgressUpdate || order.createdAt,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        };
    }

    // ==================== SKILLSCAN OPERATIONS ====================

    async createSkillScanResult(scanData) {
        const scanId = uuidv4();
        const timestamp = new Date().toISOString();
        
        const item = {
            scanId,
            artisanId: scanData.artisanId,
            category: scanData.category,
            skillLevel: scanData.skillLevel,
            overallScore: scanData.overallScore,
            breakdownScores: scanData.breakdownScores,
            strengths: scanData.strengths,
            improvements: scanData.improvements,
            recommendations: scanData.recommendations || [],
            images: scanData.images,
            scanDate: timestamp
        };

        await dynamodb.put({
            TableName: this.tables.skillscanResults,
            Item: item
        }).promise();

        return item;
    }

    async getSkillScanHistory(artisanId) {
        const result = await dynamodb.query({
            TableName: this.tables.skillscanResults,
            IndexName: 'ArtisanIdIndex',
            KeyConditionExpression: 'artisanId = :artisanId',
            ExpressionAttributeValues: {
                ':artisanId': artisanId
            },
            ScanIndexForward: false  // Sort by date descending
        }).promise();

        return result.Items || [];
    }

    // ==================== LABOUR TRACKING OPERATIONS ====================

    async logLabourHours(labourData) {
        const labourId = uuidv4();
        const timestamp = new Date().toISOString();
        
        const item = {
            labourId,
            artisanId: labourData.artisanId,
            orderId: labourData.orderId || null,
            craftHours: labourData.craftHours,
            householdHours: labourData.householdHours,
            totalHours: labourData.craftHours + labourData.householdHours,
            date: labourData.date,
            notes: labourData.notes || null,
            createdAt: timestamp
        };

        await dynamodb.put({
            TableName: this.tables.labourTracking,
            Item: item
        }).promise();

        return item;
    }

    async getLabourHistory(artisanId) {
        const result = await dynamodb.query({
            TableName: this.tables.labourTracking,
            IndexName: 'ArtisanIdIndex',
            KeyConditionExpression: 'artisanId = :artisanId',
            ExpressionAttributeValues: {
                ':artisanId': artisanId
            },
            ScanIndexForward: false
        }).promise();

        return result.Items || [];
    }

    // ==================== AI CONVERSATION OPERATIONS ====================

    async saveConversation(conversationData) {
        const conversationId = uuidv4();
        const timestamp = new Date().toISOString();
        
        const item = {
            conversationId,
            userId: conversationData.userId,
            messageType: conversationData.messageType,
            message: conversationData.message,
            intent: conversationData.intent || null,
            sentiment: conversationData.sentiment || null,
            createdAt: timestamp
        };

        await dynamodb.put({
            TableName: this.tables.aiConversations,
            Item: item
        }).promise();

        return item;
    }

    async getConversationHistory(userId, limit = 50) {
        const result = await dynamodb.query({
            TableName: this.tables.aiConversations,
            IndexName: 'UserIdIndex',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            Limit: limit,
            ScanIndexForward: false
        }).promise();

        return result.Items || [];
    }

    // ==================== NOTIFICATION OPERATIONS ====================

    async createNotification(notificationData) {
        const notificationId = uuidv4();
        const timestamp = new Date().toISOString();
        
        const item = {
            notificationId,
            userId: notificationData.userId,
            title: notificationData.title,
            message: notificationData.message,
            type: notificationData.type || 'info',
            readStatus: false,
            actionUrl: notificationData.actionUrl || null,
            createdAt: timestamp
        };

        await dynamodb.put({
            TableName: this.tables.notifications,
            Item: item
        }).promise();

        return item;
    }

    async getUserNotifications(userId) {
        const result = await dynamodb.query({
            TableName: this.tables.notifications,
            IndexName: 'UserIdIndex',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: false
        }).promise();

        return result.Items || [];
    }

    // ==================== STATISTICS ====================

    async getPlatformStatistics() {
        const [users, artisans, orders] = await Promise.all([
            dynamodb.scan({ TableName: this.tables.users, Select: 'COUNT' }).promise(),
            dynamodb.scan({ 
                TableName: this.tables.artisanProfiles,
                FilterExpression: 'verificationStatus = :status',
                ExpressionAttributeValues: { ':status': 'verified' },
                Select: 'COUNT'
            }).promise(),
            dynamodb.scan({ TableName: this.tables.orders, Select: 'COUNT' }).promise()
        ]);

        // Calculate total revenue
        const completedOrders = await dynamodb.scan({
            TableName: this.tables.orders,
            FilterExpression: '#status = :status',
            ExpressionAttributeNames: { '#status': 'status' },
            ExpressionAttributeValues: { ':status': 'completed' }
        }).promise();

        const totalRevenue = completedOrders.Items.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        return {
            totalUsers: users.Count,
            activeArtisans: artisans.Count,
            totalOrders: orders.Count,
            totalRevenue
        };
    }
}

module.exports = new DynamoDBClient();
