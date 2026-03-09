// SHE-BALANCE Backend Server with AWS DynamoDB
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('./dynamodb-client');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// AI Provider Configuration - LLAMA 3 ONLY
let aiSakhi = null;
let aiProvider = process.env.AI_PROVIDER || 'bedrock-llama3';

console.log(`🤖 AI Provider: ${aiProvider}`);

try {
    if (aiProvider === 'groq') {
        // Use Groq (Free, no payment method required)
        aiSakhi = require('./ai-sakhi-groq');
        console.log('✅ Groq (Llama 3) module loaded');
        console.log('   Using Groq - Free, fast, no payment method required');
    } else {
        // Use AWS Bedrock with Llama 3 70B (default)
        aiSakhi = require('./ai-sakhi-bedrock');
        console.log('✅ Llama 3 70B module loaded');
        console.log('   Using AWS Bedrock with Llama 3 70B');
    }
} catch (error) {
    console.error('❌ Failed to load AI module:', error.message);
    console.error('');
    console.error('If you see payment errors, you can switch to Groq (free):');
    console.error('Run: .\\switch-to-groq.bat');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// File Upload Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

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

// ==================== AUTH ROUTES ====================

// Register User
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, fullName, phone, role } = req.body;
        
        if (!email || !password || !fullName || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        
        const passwordHash = await bcrypt.hash(password, 10);
        
        const user = await db.createUser({
            email,
            passwordHash,
            fullName,
            phone,
            role
        });
        
        if (role === 'artisan') {
            await db.createArtisanProfile(user.userId);
        } else if (role === 'buyer') {
            await db.createBuyerProfile(user.userId);
        } else if (role === 'corporate') {
            await db.createCorporateProfile(user.userId, fullName);
        }
        
        const token = jwt.sign({ userId: user.userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
        
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { userId: user.userId, email, fullName, role }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed: ' + error.message });
    }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await db.getUserByEmail(email);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const validPassword = await bcrypt.compare(password, user.passwordHash);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        await db.updateUser(user.userId, { lastLogin: new Date().toISOString() });
        
        const token = jwt.sign(
            { userId: user.userId, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            message: 'Login successful',
            token,
            user: {
                userId: user.userId,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                status: user.status
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// ==================== USER ROUTES ====================

// Get User Profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
    try {
        const user = await db.getUserById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        let profile = {};
        if (user.role === 'artisan') {
            profile = await db.getArtisanProfileByUserId(user.userId);
        } else if (user.role === 'buyer') {
            profile = await db.getBuyerProfileByUserId(user.userId);
        } else if (user.role === 'corporate') {
            profile = await db.getCorporateProfileByUserId(user.userId);
        }
        
        res.json({ user, profile });
        
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Update User Profile
app.put('/api/users/profile', authenticateToken, async (req, res) => {
    try {
        const { fullName, phone, bio, skills, location } = req.body;
        
        await db.updateUser(req.user.userId, { fullName, phone });
        
        if (req.user.role === 'artisan') {
            const profile = await db.getArtisanProfileByUserId(req.user.userId);
            if (profile) {
                await db.updateArtisanProfile(profile.artisanId, { bio, skills, location });
            }
        }
        
        res.json({ message: 'Profile updated successfully' });
        
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Update User Language Preference
app.put('/api/users/language', authenticateToken, async (req, res) => {
    try {
        const { language } = req.body;
        
        if (!language) {
            return res.status(400).json({ error: 'Language is required' });
        }
        
        // Validate language code
        const validLanguages = ['hi-IN', 'ta-IN', 'te-IN', 'bn-IN', 'mr-IN', 'gu-IN', 'kn-IN', 'ml-IN', 'en-IN'];
        if (!validLanguages.includes(language)) {
            return res.status(400).json({ error: 'Invalid language code' });
        }
        
        await db.updateUser(req.user.userId, { preferredLanguage: language });
        
        res.json({ 
            message: 'Language preference updated successfully',
            language 
        });
        
    } catch (error) {
        console.error('Update language error:', error);
        res.status(500).json({ error: 'Failed to update language preference' });
    }
});

// ==================== ARTISAN ROUTES ====================

// Get All Artisans
app.get('/api/artisans', async (req, res) => {
    try {
        const artisans = await db.getAllArtisans();
        
        // Get user details for each artisan
        const artisansWithUsers = await Promise.all(
            artisans.map(async (artisan) => {
                const user = await db.getUserById(artisan.userId);
                return {
                    ...artisan,
                    fullName: user.fullName,
                    email: user.email,
                    profileImage: user.profileImage
                };
            })
        );
        
        res.json({ artisans: artisansWithUsers });
        
    } catch (error) {
        console.error('Get artisans error:', error);
        res.status(500).json({ error: 'Failed to fetch artisans' });
    }
});

// Get Artisan Details
app.get('/api/artisans/:artisanId', async (req, res) => {
    try {
        const artisan = await db.getArtisanProfile(req.params.artisanId);
        
        if (!artisan) {
            return res.status(404).json({ error: 'Artisan not found' });
        }
        
        const user = await db.getUserById(artisan.userId);
        
        res.json({ artisan: { ...artisan, ...user }, reviews: [] });
        
    } catch (error) {
        console.error('Get artisan details error:', error);
        res.status(500).json({ error: 'Failed to fetch artisan details' });
    }
});

// ==================== SKILLSCAN ROUTES ====================

// Submit SkillScan
app.post('/api/skillscan/analyze', authenticateToken, upload.array('images', 5), async (req, res) => {
    try {
        const { category } = req.body;
        const images = req.files.map(file => file.filename);
        
        // Mock analysis (replace with AWS SageMaker call)
        const mockAnalysis = {
            skillLevel: 'Intermediate',
            overallScore: 72,
            breakdown: {
                'Technique Quality': 75,
                'Pattern Complexity': 68,
                'Finishing Quality': 74,
                'Color Coordination': 71
            },
            strengths: [
                'Good basic technique',
                'Nice color selection',
                'Consistent quality'
            ],
            improvements: [
                'Work on complex patterns',
                'Improve finishing details',
                'Practice advanced techniques'
            ]
        };
        
        const artisanProfile = await db.getArtisanProfileByUserId(req.user.userId);
        
        if (!artisanProfile) {
            return res.status(404).json({ error: 'Artisan profile not found' });
        }
        
        const scanResult = await db.createSkillScanResult({
            artisanId: artisanProfile.artisanId,
            category,
            skillLevel: mockAnalysis.skillLevel,
            overallScore: mockAnalysis.overallScore,
            breakdownScores: mockAnalysis.breakdown,
            strengths: mockAnalysis.strengths,
            improvements: mockAnalysis.improvements,
            images
        });
        
        res.json({
            message: 'SkillScan analysis completed',
            scanId: scanResult.scanId,
            analysis: mockAnalysis
        });
        
    } catch (error) {
        console.error('SkillScan error:', error);
        res.status(500).json({ error: 'SkillScan analysis failed' });
    }
});

// Get SkillScan History
app.get('/api/skillscan/history', authenticateToken, async (req, res) => {
    try {
        const artisanProfile = await db.getArtisanProfileByUserId(req.user.userId);
        
        if (!artisanProfile) {
            return res.status(404).json({ error: 'Artisan profile not found' });
        }
        
        const scans = await db.getSkillScanHistory(artisanProfile.artisanId);
        
        res.json({ scans });
        
    } catch (error) {
        console.error('Get SkillScan history error:', error);
        res.status(500).json({ error: 'Failed to fetch SkillScan history' });
    }
});

// ==================== ORDER ROUTES ====================

// Create Order
app.post('/api/orders', authenticateToken, async (req, res) => {
    try {
        const { artisanId, productId, title, description, quantity, unitPrice } = req.body;
        
        const buyerProfile = await db.getBuyerProfileByUserId(req.user.userId);
        
        if (!buyerProfile) {
            return res.status(403).json({ error: 'Only buyers can create orders' });
        }
        
        const totalAmount = quantity * unitPrice;
        
        const order = await db.createOrder({
            buyerId: buyerProfile.buyerId,
            artisanId,
            productId,
            title,
            description,
            quantity,
            unitPrice,
            totalAmount
        });
        
        res.status(201).json({
            message: 'Order created successfully',
            orderId: order.orderId
        });
        
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Get Orders
app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
        let orders = [];
        
        if (req.user.role === 'artisan') {
            const artisanProfile = await db.getArtisanProfileByUserId(req.user.userId);
            orders = await db.getOrdersByArtisan(artisanProfile.artisanId);
        } else if (req.user.role === 'buyer') {
            const buyerProfile = await db.getBuyerProfileByUserId(req.user.userId);
            orders = await db.getOrdersByBuyer(buyerProfile.buyerId);
        }
        
        res.json({ orders });
        
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Update Order Status
app.put('/api/orders/:orderId/status', authenticateToken, async (req, res) => {
    try {
        const { status } = req.body;
        
        await db.updateOrderStatus(req.params.orderId, status);
        
        res.json({ message: 'Order status updated successfully' });
        
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// Update Order Progress (for bulk orders)
app.put('/api/orders/:orderId/progress', authenticateToken, async (req, res) => {
    try {
        const { progressPercentage, progressNote, imagesCompleted, sendWhatsAppNotification } = req.body;
        
        const artisanProfile = await db.getArtisanProfileByUserId(req.user.userId);
        
        if (!artisanProfile) {
            return res.status(403).json({ error: 'Only artisans can update order progress' });
        }
        
        // Update order progress
        await db.updateOrderProgress(req.params.orderId, {
            progressPercentage,
            progressNote,
            imagesCompleted,
            lastProgressUpdate: new Date().toISOString()
        });
        
        let whatsappSent = false;
        
        // Send WhatsApp notification if requested
        if (sendWhatsAppNotification) {
            try {
                // Get order details
                const order = await db.getOrder(req.params.orderId);
                
                if (order && order.buyerPhone) {
                    const whatsappService = require('./whatsapp-service');
                    
                    if (whatsappService.isWhatsAppConfigured()) {
                        const message = `🌸 *SHE-BALANCE Order Update*

नमस्ते! Your order has been updated! 🎉

📦 *Order Details:*
• Order ID: ${req.params.orderId}
• Item: ${order.title || 'Your Order'}
• Progress: ${progressPercentage}%
${progressNote ? `• Note: ${progressNote}` : ''}

${progressPercentage === 100 ? 
`✅ *Order Complete!*
Your order is ready for delivery!` : 
`📊 *In Progress*
Your artisan is working hard on your order!`}

🔗 *Track Order:*
http://localhost:8080/buyer-orders.html

धन्यवाद! 💚
-- Team SHE-BALANCE`;

                        await whatsappService.sendWhatsAppMessage(order.buyerPhone, message);
                        whatsappSent = true;
                        console.log(`✅ WhatsApp notification sent to buyer: ${order.buyerPhone}`);
                    }
                }
            } catch (whatsappError) {
                console.error('WhatsApp notification error:', whatsappError);
                // Don't fail the whole request if WhatsApp fails
            }
        }
        
        res.json({ 
            message: 'Order progress updated successfully',
            whatsappSent: whatsappSent
        });
        
    } catch (error) {
        console.error('Update order progress error:', error);
        res.status(500).json({ error: 'Failed to update order progress' });
    }
});

// Get Order Progress History
app.get('/api/orders/:orderId/progress', authenticateToken, async (req, res) => {
    try {
        const progress = await db.getOrderProgressHistory(req.params.orderId);
        
        res.json({ progress });
        
    } catch (error) {
        console.error('Get order progress error:', error);
        res.status(500).json({ error: 'Failed to fetch order progress' });
    }
});

// ==================== LABOUR TRACKING ROUTES ====================

// Log Labour Hours
app.post('/api/labour/log', authenticateToken, async (req, res) => {
    try {
        const { orderId, craftHours, householdHours, date, notes } = req.body;
        
        const artisanProfile = await db.getArtisanProfileByUserId(req.user.userId);
        
        if (!artisanProfile) {
            return res.status(403).json({ error: 'Only artisans can log labour hours' });
        }
        
        const labourRecord = await db.logLabourHours({
            artisanId: artisanProfile.artisanId,
            orderId,
            craftHours,
            householdHours,
            date,
            notes
        });
        
        res.status(201).json({
            message: 'Labour hours logged successfully',
            labourId: labourRecord.labourId
        });
        
    } catch (error) {
        console.error('Log labour error:', error);
        res.status(500).json({ error: 'Failed to log labour hours' });
    }
});

// Get Labour History
app.get('/api/labour/history', authenticateToken, async (req, res) => {
    try {
        const artisanProfile = await db.getArtisanProfileByUserId(req.user.userId);
        
        const labourRecords = await db.getLabourHistory(artisanProfile.artisanId);
        
        res.json({ labourRecords });
        
    } catch (error) {
        console.error('Get labour history error:', error);
        res.status(500).json({ error: 'Failed to fetch labour history' });
    }
});

// ==================== ADMIN ROUTES ====================

// Get All Users
app.get('/api/admin/users', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        const users = await db.getAllUsers();
        
        res.json({ users });
        
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get Platform Statistics
app.get('/api/admin/statistics', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        const stats = await db.getPlatformStatistics();
        
        res.json(stats);
        
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Root route
app.get('/', (req, res) => {
    res.json({ 
        message: 'SHE-BALANCE Backend API',
        status: 'running',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/auth/*',
            users: '/api/users/*',
            products: '/api/products/*',
            orders: '/api/orders/*'
        }
    });
});

// Health Check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        database: 'DynamoDB'
    });
});

// ==================== AI SAKHI ROUTES ====================

// AI Sakhi Chat with Bedrock (Llama 3)
app.post('/api/ai-sakhi/chat', async (req, res) => {
    // TEMPORARY: Try to get real Rukaiya user from DynamoDB, fallback to fake user
    try {
        const { createDynamoDBClient } = require('./utils/aws-clients');
        const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
        
        const docClient = await createDynamoDBClient();
        
        // Scan for Rukaiya by email
        const result = await docClient.send(new ScanCommand({
            TableName: 'shebalance-users',
            FilterExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': 'rukaiya@example.com'
            }
        }));
        
        if (result.Items && result.Items.length > 0) {
            const rukaiyaUser = result.Items[0];
            req.user = {
                userId: rukaiyaUser.userId,
                fullName: rukaiyaUser.fullName,
                email: rukaiyaUser.email,
                role: rukaiyaUser.role
            };
            console.log(`✅ Using real Rukaiya user for AI Sakhi: ${rukaiyaUser.fullName} (${rukaiyaUser.userId})`);
        } else {
            // Fallback to fake user
            req.user = { 
                userId: 'rukaiya-123', 
                fullName: 'Rukaiya', 
                email: 'rukaiya@example.com',
                role: 'artisan'
            };
            console.log('⚠️  Using fake Rukaiya user for AI Sakhi (real user not found in DB)');
        }
    } catch (dbError) {
        // Fallback to fake user if DB query fails
        req.user = { 
            userId: 'rukaiya-123', 
            fullName: 'Rukaiya', 
            email: 'rukaiya@example.com',
            role: 'artisan'
        };
        console.log('⚠️  Using fake Rukaiya user for AI Sakhi (DB query failed):', dbError.message);
    }
    
    try {
        const { message, conversationHistory } = req.body;
        const artisanId = req.user.userId;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        console.log(`💬 AI Sakhi message from ${req.user.email}: ${message}`);
        
        // Fetch REAL user context from DynamoDB
        let userContext = {};
        try {
            const user = await db.getUserById(artisanId);
            userContext.userName = user?.fullName || 'Artisan';
            userContext.email = user?.email;
            
            // Get artisan profile
            const artisanProfile = await db.getArtisanProfileByUserId(artisanId);
            if (artisanProfile) {
                userContext.artisanId = artisanProfile.artisanId;
                userContext.skills = artisanProfile.skills || [];
                userContext.rating = artisanProfile.rating || 0;
                userContext.totalOrders = artisanProfile.totalOrders || 0;
                userContext.totalEarnings = artisanProfile.totalEarnings || 0;
                
                // Get REAL orders from DynamoDB
                const orders = await db.getOrdersByArtisan(artisanProfile.artisanId);
                userContext.orders = orders.map(order => ({
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
                
                // Get pending payments
                userContext.pendingPayments = orders
                    .filter(o => o.status === 'completed' && o.paymentStatus === 'pending')
                    .map(order => ({
                        orderId: order.orderId,
                        amount: order.totalAmount,
                        status: 'pending_approval',
                        completedDate: order.completedAt
                    }));
            }
            
            console.log(`📊 Fetched context: ${userContext.orders?.length || 0} orders, ${userContext.pendingPayments?.length || 0} pending payments`);
            
        } catch (contextError) {
            console.log('⚠️  Could not fetch user context:', contextError.message);
        }
        
        // Use Bedrock with fallback
        if (aiSakhi) {
            try {
                const result = await aiSakhi.chatWithSakhi(artisanId, message, conversationHistory || [], userContext);
                console.log(`✅ Response from ${result.model || 'Bedrock'}`);
                return res.json(result);
            } catch (bedrockError) {
                console.log('⚠️  Bedrock failed, using fallback response');
                // Simple fallback response
                const fallbackResponse = `I'm here to help you with your orders and business. However, I'm currently experiencing technical difficulties. Please try again in a moment, or contact support if the issue persists.`;
                
                return res.json({
                    success: true,
                    response: fallbackResponse,
                    model: 'fallback',
                    fallback: true,
                    timestamp: new Date().toISOString()
                });
            }
        } else {
            throw new Error('AI Sakhi not available');
        }
        
    } catch (error) {
        console.error('❌ AI Sakhi route error:', error);
        res.status(500).json({ error: 'Failed to process message', details: error.message });
    }
});

// ==================== SNS WHATSAPP ROUTES ====================

// Send WhatsApp/SMS message via SNS
app.post('/api/sns/send-whatsapp', async (req, res) => {
    try {
        const { phoneNumber, messageType, orderId, message } = req.body;
        
        // Validate phone number
        if (!phoneNumber) {
            return res.status(400).json({ 
                success: false,
                error: 'Phone number is required' 
            });
        }
        
        // Validate phone number format (E.164)
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid phone number format',
                details: 'Use E.164 format (e.g., +919876543210 for India)',
                example: '+919876543210'
            });
        }
        
        // Check AWS credentials
        if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === '') {
            return res.status(500).json({ 
                success: false,
                error: 'AWS credentials not configured',
                details: 'AWS_ACCESS_KEY_ID is missing in .env file'
            });
        }
        
        if (!process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY === '') {
            return res.status(500).json({ 
                success: false,
                error: 'AWS credentials not configured',
                details: 'AWS_SECRET_ACCESS_KEY is missing in .env file'
            });
        }
        
        // Prepare message text
        let messageText = '';
        
        if (messageType === 'reminder') {
            messageText = `🌸 SHE-BALANCE Order Reminder

📦 Order ID: ${orderId || 'N/A'}
⚠️ IMPORTANT: Please update your order progress.

Your order needs attention. Please log in to update the progress.

Update now: http://localhost:8080/dashboard.html

Need help? Contact support at 1800-XXX-XXXX

-- Team SHE-BALANCE 🌸`;
        } else if (messageType === 'custom' && message) {
            messageText = message;
        } else {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid message type or missing message',
                details: 'messageType must be "reminder" or "custom". For custom, provide "message" field.'
            });
        }
        
        // Initialize AWS SNS with credentials from Secrets Manager
        const { initializeAWSv2 } = require('./utils/aws-clients');
        const clients = await initializeAWSv2();
        const sns = clients.SNS;
        
        // Prepare SNS parameters
        const params = {
            Message: messageText,
            PhoneNumber: phoneNumber,
            MessageAttributes: {
                'AWS.SNS.SMS.SMSType': {
                    DataType: 'String',
                    StringValue: 'Transactional'
                }
            }
        };
        
        // Log attempt
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📤 Sending SMS via AWS SNS`);
        console.log(`📞 To: ${phoneNumber}`);
        console.log(`📝 Type: ${messageType}`);
        console.log(`⏰ Time: ${new Date().toISOString()}`);
        console.log('='.repeat(60));
        
        // Send SMS via SNS
        const result = await sns.publish(params).promise();
        
        // Log success
        console.log(`✅ SMS sent successfully!`);
        console.log(`📱 Message ID: ${result.MessageId}`);
        console.log('='.repeat(60) + '\n');
        
        // Return success response
        res.json({
            success: true,
            message: 'SMS sent successfully via AWS SNS',
            messageId: result.MessageId,
            phoneNumber: phoneNumber,
            messageType: messageType,
            timestamp: new Date().toISOString(),
            note: '⚠️ This sends SMS, not WhatsApp. For WhatsApp, use WhatsApp Business API.'
        });
        
    } catch (error) {
        console.error('\n' + '='.repeat(60));
        console.error('❌ SNS Error occurred');
        console.error('='.repeat(60));
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
        console.error('='.repeat(60) + '\n');
        
        // Determine error type and provide helpful message
        let errorMessage = 'Failed to send SMS';
        let errorDetails = error.message;
        let solution = '';
        
        if (error.code === 'InvalidClientTokenId') {
            errorMessage = 'Invalid AWS Access Key ID';
            errorDetails = 'Your AWS_ACCESS_KEY_ID is invalid';
            solution = 'Check AWS credentials in .env file';
        } else if (error.code === 'SignatureDoesNotMatch') {
            errorMessage = 'Invalid AWS Secret Access Key';
            errorDetails = 'Your AWS_SECRET_ACCESS_KEY is invalid';
            solution = 'Check AWS credentials in .env file';
        } else if (error.code === 'AccessDenied' || error.code === 'AccessDeniedException') {
            errorMessage = 'Access Denied - Missing SNS Permissions';
            errorDetails = 'Your IAM user does not have permission to publish SNS messages';
            solution = 'Add SNS:Publish permission to your IAM user in AWS Console';
        } else if (error.code === 'InvalidParameter' || error.code === 'InvalidParameterException') {
            errorMessage = 'Invalid phone number format';
            errorDetails = 'Phone number must be in E.164 format';
            solution = 'Use format: +[country code][number] (e.g., +919876543210)';
        }
        
        res.status(500).json({ 
            success: false,
            error: errorMessage,
            details: errorDetails,
            solution: solution,
            code: error.code,
            timestamp: new Date().toISOString()
        });
    }
});

// Test SNS connection endpoint
app.get('/api/sns/test-connection', async (req, res) => {
    try {
        if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === '') {
            return res.json({ 
                success: false,
                configured: false,
                error: 'AWS_ACCESS_KEY_ID not configured'
            });
        }
        
        if (!process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY === '') {
            return res.json({ 
                success: false,
                configured: false,
                error: 'AWS_SECRET_ACCESS_KEY not configured'
            });
        }
        
        const { initializeAWSv2 } = require('./utils/aws-clients');
        const clients = await initializeAWSv2();
        const sns = clients.SNS;
        
        // Try to get SMS attributes (tests permissions)
        await sns.getSMSAttributes().promise();
        
        res.json({
            success: true,
            configured: true,
            message: 'AWS SNS connection successful',
            region: process.env.AWS_REGION || 'us-east-1',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        let errorMessage = error.message;
        let solution = '';
        
        if (error.code === 'InvalidClientTokenId') {
            errorMessage = 'Invalid AWS Access Key ID';
            solution = 'Check AWS credentials in Secrets Manager';
        } else if (error.code === 'SignatureDoesNotMatch') {
            errorMessage = 'Invalid AWS Secret Access Key';
            solution = 'Check AWS credentials in Secrets Manager';
        } else if (error.code === 'AccessDenied') {
            errorMessage = 'Missing SNS permissions';
            solution = 'Add SNS:Publish permission to IAM user';
        }
        
        res.json({
            success: false,
            configured: true,
            error: errorMessage,
            solution: solution,
            code: error.code
        });
    }
});

// ==================== WHATSAPP ROUTES ====================
// Load WhatsApp routes if twilio is installed
try {
    require('./whatsapp-routes')(app);
} catch (error) {
    console.log('⚠️  WhatsApp routes not loaded. Run: npm install twilio');
}

// ==================== VIRTUAL FACTORY ROUTES ====================

// Load Virtual Factory module
let virtualFactory = null;
try {
    virtualFactory = require('./virtual-factory-titan');
    console.log('✅ Virtual Factory (Titan Embeddings V2) module loaded');
} catch (error) {
    console.error('⚠️  Virtual Factory module not available:', error.message);
}

// Get AI-based match types
app.post('/api/virtual-factory/match-types', authenticateToken, async (req, res) => {
    try {
        if (!virtualFactory) {
            return res.status(503).json({ 
                error: 'Virtual Factory not available',
                message: 'AWS Bedrock Titan Embeddings not configured'
            });
        }

        const orderDetails = req.body;

        console.log(`🤖 Getting AI match types for: ${orderDetails.product}`);

        const result = await virtualFactory.getAIMatchTypes(orderDetails);

        res.json(result);

    } catch (error) {
        console.error('❌ Get match types error:', error);
        res.status(500).json({ 
            error: 'Failed to get match types',
            message: error.message 
        });
    }
});

// Find matching artisans for order
app.post('/api/virtual-factory/find-artisans', authenticateToken, async (req, res) => {
    try {
        if (!virtualFactory) {
            return res.status(503).json({ 
                error: 'Virtual Factory not available',
                message: 'Please configure AWS Lambda'
            });
        }

        const { product, quantity, skills, deadline, budget, company } = req.body;

        if (!product || !quantity || !skills) {
            return res.status(400).json({ 
                error: 'product, quantity, and skills are required' 
            });
        }

        console.log(`🏭 Finding artisans for ${company}: ${product} (${quantity} units)`);

        const result = await virtualFactory.findMatchingArtisans({
            product,
            quantity,
            skills,
            deadline: deadline || 30,
            budget: budget || 0,
            company
        });

        res.json(result);

    } catch (error) {
        console.error('❌ Find artisans error:', error);
        res.status(500).json({ 
            error: 'Failed to find artisans',
            message: error.message 
        });
    }
});

// Create virtual factory
app.post('/api/virtual-factory/create', authenticateToken, async (req, res) => {
    try {
        if (!virtualFactory) {
            return res.status(503).json({ 
                error: 'Virtual Factory not available'
            });
        }

        const orderDetails = req.body;

        console.log(`🏭 Creating virtual factory for: ${orderDetails.product}`);

        const result = await virtualFactory.createVirtualFactory(orderDetails);

        res.json(result);

    } catch (error) {
        console.error('❌ Create factory error:', error);
        res.status(500).json({ 
            error: 'Failed to create virtual factory',
            message: error.message 
        });
    }
});

// Get factory details
app.get('/api/virtual-factory/:factoryId', authenticateToken, async (req, res) => {
    try {
        if (!virtualFactory) {
            return res.status(503).json({ 
                error: 'Virtual Factory not available'
            });
        }

        const { factoryId } = req.params;

        console.log(`📊 Getting factory details: ${factoryId}`);

        const result = await virtualFactory.getFactoryDetails(factoryId);

        res.json(result);

    } catch (error) {
        console.error('❌ Get factory details error:', error);
        res.status(500).json({ 
            error: 'Failed to get factory details',
            message: error.message 
        });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 SHE-BALANCE Backend Server running on port ${PORT}`);
    console.log(`📊 Database: AWS DynamoDB`);
    console.log(`🔗 API: http://localhost:${PORT}`);
    console.log(`🌍 Region: ${process.env.AWS_REGION || 'us-east-1'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});


// ==================== REMINDER SYSTEM TEST ROUTES ====================

// Test: Create test order
app.post('/api/test/create-order', async (req, res) => {
    try {
        const order = req.body;
        await db.dynamodb.put({
            TableName: 'shebalance-orders',
            Item: order
        }).promise();
        
        res.json({
            success: true,
            message: 'Test order created',
            orderId: order.orderId
        });
    } catch (error) {
        console.error('Error creating test order:', error);
        res.status(500).json({ error: error.message });
    }
});

// Test: Scan orders needing reminders
app.get('/api/test/scan-orders', async (req, res) => {
    try {
        const response = await db.dynamodb.scan({
            TableName: 'shebalance-orders',
            FilterExpression: '#status IN (:pending, :in_progress) AND orderType = :bulk',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':pending': 'pending',
                ':in_progress': 'in_progress',
                ':bulk': 'bulk'
            }
        }).promise();
        
        const orders = response.Items || [];
        const currentTime = new Date();
        const ordersWithStatus = orders.map(order => {
            const lastUpdate = new Date(order.lastProgressUpdate || order.createdAt);
            const daysSinceUpdate = Math.floor((currentTime - lastUpdate) / (1000 * 60 * 60 * 24));
            
            return {
                orderId: order.orderId,
                title: order.title,
                status: order.status,
                daysSinceUpdate,
                needsReminder: daysSinceUpdate >= 3
            };
        });
        
        const ordersNeedingReminders = ordersWithStatus.filter(o => o.needsReminder);
        
        res.json({
            success: true,
            totalOrders: orders.length,
            ordersNeedingReminders: ordersNeedingReminders.length,
            orders: ordersWithStatus
        });
    } catch (error) {
        console.error('Error scanning orders:', error);
        res.status(500).json({ error: error.message });
    }
});

// Test: Send WhatsApp reminder (simulated)
app.post('/api/test/send-whatsapp', async (req, res) => {
    try {
        const { orderId } = req.body;
        
        // Get order
        const orderResponse = await db.dynamodb.get({
            TableName: 'shebalance-orders',
            Key: { orderId }
        }).promise();
        
        const order = orderResponse.Item;
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Get artisan
        const artisanResponse = await db.dynamodb.get({
            TableName: 'shebalance-artisan-profiles',
            Key: { artisanId: order.artisanId }
        }).promise();
        
        const artisan = artisanResponse.Item;
        if (!artisan) {
            return res.status(404).json({ error: 'Artisan not found' });
        }
        
        // Get user
        const userResponse = await db.dynamodb.get({
            TableName: 'shebalance-users',
            Key: { userId: artisan.userId }
        }).promise();
        
        const user = userResponse.Item;
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Calculate days since update
        const lastUpdate = new Date(order.lastProgressUpdate || order.createdAt);
        const daysSinceUpdate = Math.floor((new Date() - lastUpdate) / (1000 * 60 * 60 * 24));
        
        // Create WhatsApp message
        const message = `🔔 SHE-BALANCE Order Reminder

Hello ${user.fullName}! 👋

We noticed you haven't updated the progress for your bulk order in ${daysSinceUpdate} days.

📦 Order: ${order.title}
🆔 Order ID: ${orderId.substring(0, 8)}
📅 Last Update: ${daysSinceUpdate} days ago

⚠️ IMPORTANT: Please update your order progress within 24 hours. 
If we don't hear from you, we will call you to confirm if you can 
complete this order.

✅ Reply with:
• "DONE" - Order completed
• "PROGRESS" - Still working on it
• "HELP" - Need assistance
• "CANCEL" - Cannot complete

Update now: http://localhost:8080/dashboard

Need help? Reply to this message or contact support at 1800-XXX-XXXX

- Team SHE-BALANCE 🌸`;
        
        // Create reminder record
        const reminderId = `reminder-${Date.now()}`;
        const reminderRecord = {
            orderId: order.orderId,
            reminderId: reminderId,
            artisanId: order.artisanId,
            userId: user.userId,
            phoneNumber: user.phone,
            messageId: `msg-${Date.now()}`,
            reminderType: 'whatsapp',
            status: 'sent',
            sentAt: new Date().toISOString(),
            responseReceived: false,
            createdAt: new Date().toISOString()
        };
        
        await db.dynamodb.put({
            TableName: 'shebalance-reminders',
            Item: reminderRecord
        }).promise();
        
        // Update order
        await db.dynamodb.update({
            TableName: 'shebalance-orders',
            Key: { orderId: order.orderId },
            UpdateExpression: 'SET lastReminderSent = :timestamp',
            ExpressionAttributeValues: {
                ':timestamp': new Date().toISOString()
            }
        }).promise();
        
        res.json({
            success: true,
            message: 'WhatsApp reminder sent (simulated)',
            reminderId,
            phoneNumber: user.phone,
            messageId: reminderRecord.messageId,
            sentAt: reminderRecord.sentAt,
            message: message
        });
    } catch (error) {
        console.error('Error sending WhatsApp:', error);
        res.status(500).json({ error: error.message });
    }
});

// Test: Simulate voice call
app.post('/api/test/voice-call', async (req, res) => {
    try {
        const { orderId } = req.body;
        
        // Get order
        const orderResponse = await db.dynamodb.get({
            TableName: 'shebalance-orders',
            Key: { orderId }
        }).promise();
        
        const order = orderResponse.Item;
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Get artisan
        const artisanResponse = await db.dynamodb.get({
            TableName: 'shebalance-artisan-profiles',
            Key: { artisanId: order.artisanId }
        }).promise();
        
        const artisan = artisanResponse.Item;
        
        // Get user
        const userResponse = await db.dynamodb.get({
            TableName: 'shebalance-users',
            Key: { userId: artisan.userId }
        }).promise();
        
        const user = userResponse.Item;
        
        // Calculate days since update
        const lastUpdate = new Date(order.lastProgressUpdate || order.createdAt);
        const daysSinceUpdate = Math.floor((new Date() - lastUpdate) / (1000 * 60 * 60 * 24));
        
        // Create voice script
        const voiceScript = `नमस्ते ${user.fullName} जी।
मैं शी बैलेंस की एआई सखी हूँ।

हम आपसे आपके बल्क ऑर्डर के बारे में बात करना चाहते हैं।
ऑर्डर का नाम है: ${order.title}

हमने देखा कि आपने पिछले ${daysSinceUpdate} दिनों से इस ऑर्डर की प्रोग्रेस 
अपडेट नहीं की है। हमने आपको व्हाट्सएप पर संदेश भेजा था, 
लेकिन हमें कोई जवाब नहीं मिला।

हम जानना चाहते हैं: क्या आप इस ऑर्डर को पूरा कर पाएंगी?

अगर आपको किसी भी प्रकार की समस्या है, चाहे वह समय की कमी हो, 
सामग्री की समस्या हो, या कोई व्यक्तिगत कारण हो, तो कृपया हमें बताएं।

हम आपकी मदद करना चाहते हैं।

कृपया 24 घंटे के अंदर हमसे संपर्क करें।
धन्यवाद।`;
        
        // Update reminder record
        await db.dynamodb.update({
            TableName: 'shebalance-reminders',
            Key: { orderId: order.orderId },
            UpdateExpression: 'SET #status = :status, callInitiatedAt = :timestamp',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':status': 'voice_call_initiated',
                ':timestamp': new Date().toISOString()
            }
        }).promise();
        
        res.json({
            success: true,
            message: 'Voice call initiated (simulated)',
            callId: `call-${Date.now()}`,
            phoneNumber: user.phone,
            language: user.preferredLanguage || 'hi-IN',
            initiatedAt: new Date().toISOString(),
            script: voiceScript
        });
    } catch (error) {
        console.error('Error simulating voice call:', error);
        res.status(500).json({ error: error.message });
    }
});

// Test: Check reminder status
app.get('/api/test/reminder-status', async (req, res) => {
    try {
        const response = await db.dynamodb.scan({
            TableName: 'shebalance-reminders',
            Limit: 10
        }).promise();
        
        const reminders = response.Items || [];
        
        res.json({
            success: true,
            totalReminders: reminders.length,
            reminders: reminders
        });
    } catch (error) {
        console.error('Error checking reminder status:', error);
        res.status(500).json({ error: error.message });
    }
});

// Test: Clear test data
app.delete('/api/test/clear-data', async (req, res) => {
    try {
        // Get all test orders
        const ordersResponse = await db.dynamodb.scan({
            TableName: 'shebalance-orders',
            FilterExpression: 'begins_with(orderId, :prefix)',
            ExpressionAttributeValues: {
                ':prefix': 'test-order-'
            }
        }).promise();
        
        // Delete test orders
        for (const order of ordersResponse.Items || []) {
            await db.dynamodb.delete({
                TableName: 'shebalance-orders',
                Key: { orderId: order.orderId }
            }).promise();
        }
        
        // Get all test reminders
        const remindersResponse = await db.dynamodb.scan({
            TableName: 'shebalance-reminders'
        }).promise();
        
        // Delete reminders for test orders
        for (const reminder of remindersResponse.Items || []) {
            if (reminder.orderId.startsWith('test-order-')) {
                await db.dynamodb.delete({
                    TableName: 'shebalance-reminders',
                    Key: { orderId: reminder.orderId }
                }).promise();
            }
        }
        
        res.json({
            success: true,
            message: 'Test data cleared',
            ordersDeleted: ordersResponse.Items?.length || 0,
            remindersDeleted: remindersResponse.Items?.filter(r => r.orderId.startsWith('test-order-')).length || 0
        });
    } catch (error) {
        console.error('Error clearing test data:', error);
        res.status(500).json({ error: error.message });
    }
});


// ==================== AWS VOICE SERVICES ROUTES ====================
const AWS = require('aws-sdk');
const polly = new AWS.Polly();
const translate = new AWS.Translate();

// Text-to-Speech using AWS Polly
app.post('/api/voice/text-to-speech', async (req, res) => {
    try {
        const { text, language = 'en' } = req.body;
        
        const voiceMap = {
            'en': 'Joanna',
            'hi': 'Aditi',
            'bn': 'Aditi',
            'te': 'Aditi',
            'ta': 'Aditi',
            'mr': 'Aditi',
            'gu': 'Aditi'
        };
        
        const params = {
            Text: text,
            OutputFormat: 'mp3',
            VoiceId: voiceMap[language] || 'Joanna',
            Engine: language === 'en' ? 'neural' : 'standard'
        };
        
        const data = await polly.synthesizeSpeech(params).promise();
        
        // Convert audio stream to base64
        const audioBase64 = data.AudioStream.toString('base64');
        const audioUrl = `data:audio/mp3;base64,${audioBase64}`;
        
        res.json({
            success: true,
            audioUrl: audioUrl,
            language: language
        });
        
    } catch (error) {
        console.error('Polly error:', error);
        res.status(500).json({ error: 'Text-to-speech failed', details: error.message });
    }
});

// Translate text using AWS Translate
app.post('/api/voice/translate', async (req, res) => {
    try {
        const { text, targetLanguage, sourceLanguage = 'auto' } = req.body;
        
        const params = {
            Text: text,
            SourceLanguageCode: sourceLanguage,
            TargetLanguageCode: targetLanguage
        };
        
        const data = await translate.translateText(params).promise();
        
        res.json({
            success: true,
            translatedText: data.TranslatedText,
            sourceLanguage: data.SourceLanguageCode,
            targetLanguage: targetLanguage
        });
        
    } catch (error) {
        console.error('Translate error:', error);
        res.status(500).json({ error: 'Translation failed', details: error.message });
    }
});

// ==================== VOICE CALL ROUTES ====================

// Initiate voice call for an order
app.post('/api/voice-call/initiate', authenticateToken, async (req, res) => {
    try {
        const { orderId } = req.body;
        
        if (!orderId) {
            return res.status(400).json({ error: 'orderId is required' });
        }
        
        // Get order
        const orderResponse = await db.dynamodb.get({
            TableName: 'shebalance-orders',
            Key: { orderId }
        }).promise();
        
        const order = orderResponse.Item;
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Get artisan
        const artisanResponse = await db.dynamodb.get({
            TableName: 'shebalance-artisan-profiles',
            Key: { artisanId: order.artisanId }
        }).promise();
        
        const artisan = artisanResponse.Item;
        if (!artisan) {
            return res.status(404).json({ error: 'Artisan not found' });
        }
        
        // Get user
        const userResponse = await db.dynamodb.get({
            TableName: 'shebalance-users',
            Key: { userId: artisan.userId }
        }).promise();
        
        const user = userResponse.Item;
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Calculate days since update
        const lastUpdate = new Date(order.lastProgressUpdate || order.createdAt);
        const daysSinceUpdate = Math.floor((new Date() - lastUpdate) / (1000 * 60 * 60 * 24));
        
        // Generate voice script
        const language = user.preferredLanguage || 'hi-IN';
        const voiceScript = generateVoiceScript(user, order, daysSinceUpdate, language);
        
        // Simulate voice call (in production, this would call Lambda)
        const callId = `call-${Date.now()}`;
        const callResult = {
            callId: callId,
            orderId: orderId,
            phoneNumber: user.phone,
            language: language,
            status: 'initiated',
            initiatedAt: new Date().toISOString(),
            script: voiceScript
        };
        
        // Create or update reminder record
        await db.dynamodb.put({
            TableName: 'shebalance-reminders',
            Item: {
                orderId: orderId,
                reminderId: `reminder-${Date.now()}`,
                artisanId: order.artisanId,
                userId: user.userId,
                phoneNumber: user.phone,
                reminderType: 'voice_call',
                status: 'voice_call_initiated',
                callId: callId,
                callInitiatedAt: new Date().toISOString(),
                voiceScript: voiceScript,
                language: language,
                createdAt: new Date().toISOString()
            }
        }).promise();
        
        // Update order
        await db.dynamodb.update({
            TableName: 'shebalance-orders',
            Key: { orderId: orderId },
            UpdateExpression: 'SET lastVoiceCallAt = :timestamp',
            ExpressionAttributeValues: {
                ':timestamp': new Date().toISOString()
            }
        }).promise();
        
        res.json({
            success: true,
            message: 'Voice call initiated successfully',
            call: callResult
        });
        
    } catch (error) {
        console.error('Error initiating voice call:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get voice call status for an order
app.get('/api/voice-call/status/:orderId', authenticateToken, async (req, res) => {
    try {
        const { orderId } = req.params;
        
        // Get reminder record
        const response = await db.dynamodb.get({
            TableName: 'shebalance-reminders',
            Key: { orderId }
        }).promise();
        
        const reminder = response.Item;
        
        if (!reminder || reminder.reminderType !== 'voice_call') {
            return res.json({
                success: true,
                hasVoiceCall: false,
                reminder: null
            });
        }
        
        res.json({
            success: true,
            hasVoiceCall: true,
            reminder: {
                callId: reminder.callId,
                status: reminder.status,
                callInitiatedAt: reminder.callInitiatedAt,
                phoneNumber: reminder.phoneNumber,
                language: reminder.language
            }
        });
        
    } catch (error) {
        console.error('Error getting voice call status:', error);
        res.status(500).json({ error: error.message });
    }
});

// Helper function to generate voice script
function generateVoiceScript(user, order, daysSinceUpdate, language) {
    if (language === 'hi-IN') {
        return `नमस्ते ${user.fullName} जी। मैं शी बैलेंस की एआई सखी हूँ। हम आपसे आपके बल्क ऑर्डर के बारे में बात करना चाहते हैं। ऑर्डर का नाम है: ${order.title}। हमने देखा कि आपने पिछले ${daysSinceUpdate} दिनों से इस ऑर्डर की प्रोग्रेस अपडेट नहीं की है। हम जानना चाहते हैं: क्या आप इस ऑर्डर को पूरा कर पाएंगी? अगर आपको किसी भी प्रकार की समस्या है, तो कृपया हमें बताएं। हम आपकी मदद करना चाहते हैं। कृपया 24 घंटे के अंदर हमसे संपर्क करें। धन्यवाद। शी बैलेंस टीम।`;
    } else {
        return `Hello ${user.fullName}. This is AI Sakhi from SHE-BALANCE. We want to talk to you about your bulk order: ${order.title}. We noticed you haven't updated the progress for this order in the last ${daysSinceUpdate} days. We want to know: Can you complete this order? If you're facing any challenges, please let us know. We're here to help you. Please contact us within 24 hours. Thank you. Team SHE-BALANCE.`;
    }
}

// ==================== SERVE TEST INTERFACE ====================

// Serve test interface
app.get('/test', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reminder System Test</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #F5F5DC 0%, #E8DCC4 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .container { max-width: 900px; margin: 0 auto; }
        .header {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 { color: #5D4037; margin-bottom: 10px; }
        .header p { color: #8D6E63; }
        .test-section {
            background: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .test-section h2 {
            color: #5D4037;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .step-number {
            background: #8D6E63;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
        }
        button {
            background: #8D6E63;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s;
        }
        button:hover {
            background: #5D4037;
            transform: translateY(-2px);
        }
        .output {
            background: #f5f5f5;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            padding: 15px;
            margin-top: 15px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            max-height: 400px;
            overflow-y: auto;
            white-space: pre-wrap;
            display: none;
        }
        .output.success { border-color: #4CAF50; background: #E8F5E9; }
        .output.error { border-color: #f44336; background: #FFEBEE; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 Enhanced Reminder System Test</h1>
            <p>Test the automated WhatsApp and voice call reminder workflow</p>
        </div>

        <div class="test-section">
            <h2><span class="step-number">1</span> Create Test Order</h2>
            <button onclick="createOrder()">📦 Create Test Order</button>
            <div id="order-output" class="output"></div>
        </div>

        <div class="test-section">
            <h2><span class="step-number">2</span> Scan Orders</h2>
            <button onclick="scanOrders()">🔍 Scan Orders</button>
            <div id="scan-output" class="output"></div>
        </div>

        <div class="test-section">
            <h2><span class="step-number">3</span> Send WhatsApp</h2>
            <button onclick="sendWhatsApp()">📱 Send WhatsApp</button>
            <div id="whatsapp-output" class="output"></div>
        </div>

        <div class="test-section">
            <h2><span class="step-number">4</span> Voice Call</h2>
            <button onclick="voiceCall()">📞 Simulate Voice Call</button>
            <div id="voice-output" class="output"></div>
        </div>

        <div class="test-section">
            <h2><span class="step-number">5</span> Check Status</h2>
            <button onclick="checkStatus()">📊 Check Status</button>
            <div id="status-output" class="output"></div>
        </div>
    </div>

    <script>
        const API = 'http://localhost:5000/api';
        let testOrderId = null;

        function show(id, text, type = 'success') {
            const el = document.getElementById(id);
            el.style.display = 'block';
            el.className = \`output \${type}\`;
            el.textContent = text;
        }

        async function createOrder() {
            try {
                const fourDaysAgo = new Date();
                fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
                
                testOrderId = \`test-order-\${Date.now()}\`;
                
                const order = {
                    orderId: testOrderId,
                    artisanId: 'artisan-rukaiya',
                    buyerId: 'buyer-rahul',
                    title: 'Test Embroidered Sarees (50 pieces)',
                    orderType: 'bulk',
                    status: 'in_progress',
                    quantity: 50,
                    price: 25000,
                    createdAt: fourDaysAgo.toISOString(),
                    lastProgressUpdate: fourDaysAgo.toISOString()
                };

                const res = await fetch(\`\${API}/test/create-order\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(order)
                });

                const data = await res.json();
                show('order-output', 
                    \`✅ Test order created successfully!\\n\\nOrder ID: \${testOrderId}\\nTitle: \${order.title}\\nLast Update: 4 days ago\\nStatus: \${order.status}\\nQuantity: \${order.quantity} pieces\`,
                    'success'
                );
            } catch (error) {
                show('order-output', \`❌ Error: \${error.message}\`, 'error');
            }
        }

        async function scanOrders() {
            try {
                const res = await fetch(\`\${API}/test/scan-orders\`);
                const data = await res.json();
                
                let text = \`Found \${data.totalOrders} active bulk orders\\n\\n\`;
                text += \`Orders needing reminders: \${data.ordersNeedingReminders}\\n\\n\`;
                
                if (data.orders && data.orders.length > 0) {
                    text += 'Details:\\n' + '─'.repeat(60) + '\\n';
                    data.orders.forEach((order, index) => {
                        text += \`\\n\${index + 1}. \${order.title}\\n\`;
                        text += \`   Order ID: \${order.orderId}\\n\`;
                        text += \`   Days since update: \${order.daysSinceUpdate}\\n\`;
                        text += \`   Status: \${order.needsReminder ? '⚠️ Needs reminder' : '✓ Up to date'}\\n\`;
                    });
                }
                
                show('scan-output', text, 'success');
            } catch (error) {
                show('scan-output', \`❌ Error: \${error.message}\`, 'error');
            }
        }

        async function sendWhatsApp() {
            if (!testOrderId) {
                show('whatsapp-output', '⚠️ Please create a test order first (Step 1)!', 'error');
                return;
            }

            try {
                const res = await fetch(\`\${API}/test/send-whatsapp\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId: testOrderId })
                });

                const data = await res.json();
                show('whatsapp-output',
                    \`✅ WhatsApp reminder sent successfully!\\n\\nTo: \${data.phoneNumber}\\nMessage ID: \${data.messageId}\\nSent at: \${new Date(data.sentAt).toLocaleString()}\\n\\n📱 Message:\\n\${'-'.repeat(60)}\\n\${data.message}\`,
                    'success'
                );
            } catch (error) {
                show('whatsapp-output', \`❌ Error: \${error.message}\`, 'error');
            }
        }

        async function voiceCall() {
            if (!testOrderId) {
                show('voice-output', '⚠️ Please create a test order first (Step 1)!', 'error');
                return;
            }

            try {
                const res = await fetch(\`\${API}/test/voice-call\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId: testOrderId })
                });

                const data = await res.json();
                show('voice-output',
                    \`✅ Voice call initiated successfully!\\n\\nTo: \${data.phoneNumber}\\nCall ID: \${data.callId}\\nLanguage: \${data.language}\\nVoice: Amazon Polly (Aditi - Hindi)\\nInitiated at: \${new Date(data.initiatedAt).toLocaleString()}\\n\\n📞 Voice Script (Hindi):\\n\${'-'.repeat(60)}\\n\${data.script}\`,
                    'success'
                );
            } catch (error) {
                show('voice-output', \`❌ Error: \${error.message}\`, 'error');
            }
        }

        async function checkStatus() {
            try {
                const res = await fetch(\`\${API}/test/reminder-status\`);
                const data = await res.json();
                
                let text = \`Total reminders: \${data.totalReminders}\\n\\n\`;
                
                if (data.reminders && data.reminders.length > 0) {
                    text += 'Recent Reminders:\\n' + '─'.repeat(60) + '\\n';
                    data.reminders.forEach((reminder, index) => {
                        text += \`\\n\${index + 1}. Order: \${reminder.orderId}\\n\`;
                        text += \`   Type: \${reminder.reminderType}\\n\`;
                        text += \`   Status: \${reminder.status}\\n\`;
                        text += \`   Sent: \${new Date(reminder.sentAt).toLocaleString()}\\n\`;
                        if (reminder.callInitiatedAt) {
                            text += \`   Call: \${new Date(reminder.callInitiatedAt).toLocaleString()}\\n\`;
                        }
                    });
                } else {
                    text += 'No reminders found yet. Create a test order and send a reminder first!';
                }
                
                show('status-output', text, 'success');
            } catch (error) {
                show('status-output', \`❌ Error: \${error.message}\`, 'error');
            }
        }
    </script>
</body>
</html>
    `);
});
