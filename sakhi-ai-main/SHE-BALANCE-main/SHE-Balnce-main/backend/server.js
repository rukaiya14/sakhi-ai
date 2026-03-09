// SHE-BALANCE Backend Server
// Node.js + Express + MySQL/PostgreSQL

// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('./dynamodb-client');

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
    process.exit(1);
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
        
        // Validate input
        if (!email || !password || !fullName || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        // Check if user exists
        const [existingUsers] = await pool.query(
            'SELECT user_id FROM users WHERE email = ?',
            [email]
        );
        
        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        
        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);
        const userId = uuidv4();
        
        // Insert user
        await pool.query(
            'INSERT INTO users (user_id, email, password_hash, full_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, email, passwordHash, fullName, phone, role]
        );
        
        // Create role-specific profile
        if (role === 'artisan') {
            await pool.query(
                'INSERT INTO artisan_profiles (artisan_id, user_id) VALUES (?, ?)',
                [uuidv4(), userId]
            );
        } else if (role === 'buyer') {
            await pool.query(
                'INSERT INTO buyer_profiles (buyer_id, user_id) VALUES (?, ?)',
                [uuidv4(), userId]
            );
        } else if (role === 'corporate') {
            await pool.query(
                'INSERT INTO corporate_profiles (corporate_id, user_id) VALUES (?, ?)',
                [uuidv4(), userId]
            );
        }
        
        // Generate token
        const token = jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
        
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { userId, email, fullName, role }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Get user
        const user = await db.getUserByEmail(email);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Verify password
        const validPassword = await bcrypt.compare(password, user.passwordHash);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Update last login
        await db.updateUser(user.userId, { lastLogin: new Date().toISOString() });
        
        // Generate token
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
        // Get user from DynamoDB
        const user = await db.getUserById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Get role-specific profile
        let profile = {};
        if (user.role === 'artisan') {
            profile = await db.getArtisanProfileByUserId(user.userId) || {};
        } else if (user.role === 'buyer') {
            profile = await db.getBuyerProfileByUserId(user.userId) || {};
        } else if (user.role === 'corporate') {
            profile = await db.getCorporateProfileByUserId(user.userId) || {};
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
        
        // Update user table
        const userUpdates = {};
        if (fullName) userUpdates.fullName = fullName;
        if (phone) userUpdates.phone = phone;
        
        if (Object.keys(userUpdates).length > 0) {
            await db.updateUser(req.user.userId, userUpdates);
        }
        
        // Update role-specific profile
        if (req.user.role === 'artisan') {
            const artisanProfile = await db.getArtisanProfileByUserId(req.user.userId);
            if (artisanProfile) {
                const profileUpdates = {};
                if (bio) profileUpdates.bio = bio;
                if (skills) profileUpdates.skills = skills;
                if (location) profileUpdates.location = location;
                
                if (Object.keys(profileUpdates).length > 0) {
                    await db.updateArtisanProfile(artisanProfile.artisanId, profileUpdates);
                }
            }
        }
        
        res.json({ message: 'Profile updated successfully' });
        
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// ==================== ARTISAN ROUTES ====================

// Get All Artisans (for buyers/admin)
app.get('/api/artisans', async (req, res) => {
    try {
        const { category, skill, location, minRating } = req.query;
        
        let query = `
            SELECT u.user_id, u.full_name, u.profile_image, 
                   a.artisan_id, a.skills, a.location, a.rating, a.total_orders, a.bio
            FROM users u
            JOIN artisan_profiles a ON u.user_id = a.user_id
            WHERE u.status = 'active' AND a.verification_status = 'verified'
        `;
        
        const params = [];
        
        if (minRating) {
            query += ' AND a.rating >= ?';
            params.push(minRating);
        }
        
        if (location) {
            query += ' AND a.location LIKE ?';
            params.push(`%${location}%`);
        }
        
        query += ' ORDER BY a.rating DESC, a.total_orders DESC';
        
        const [artisans] = await pool.query(query, params);
        
        res.json({ artisans });
        
    } catch (error) {
        console.error('Get artisans error:', error);
        res.status(500).json({ error: 'Failed to fetch artisans' });
    }
});

// Get Artisan Details
app.get('/api/artisans/:artisanId', async (req, res) => {
    try {
        const [artisans] = await pool.query(`
            SELECT u.*, a.*
            FROM users u
            JOIN artisan_profiles a ON u.user_id = a.user_id
            WHERE a.artisan_id = ?
        `, [req.params.artisanId]);
        
        if (artisans.length === 0) {
            return res.status(404).json({ error: 'Artisan not found' });
        }
        
        // Get recent reviews
        const [reviews] = await pool.query(`
            SELECT r.*, u.full_name as buyer_name
            FROM reviews r
            JOIN buyer_profiles b ON r.buyer_id = b.buyer_id
            JOIN users u ON b.user_id = u.user_id
            WHERE r.artisan_id = ?
            ORDER BY r.created_at DESC
            LIMIT 10
        `, [req.params.artisanId]);
        
        res.json({ artisan: artisans[0], reviews });
        
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
        
        // TODO: Call AWS SageMaker for actual analysis
        // For now, return mock data
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
        
        // Get artisan_id
        const [artisan] = await pool.query(
            'SELECT artisan_id FROM artisan_profiles WHERE user_id = ?',
            [req.user.userId]
        );
        
        if (artisan.length === 0) {
            return res.status(404).json({ error: 'Artisan profile not found' });
        }
        
        const scanId = uuidv4();
        
        // Save to database
        await pool.query(`
            INSERT INTO skillscan_results 
            (scan_id, artisan_id, category, skill_level, overall_score, breakdown_scores, strengths, improvements, images)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            scanId,
            artisan[0].artisan_id,
            category,
            mockAnalysis.skillLevel,
            mockAnalysis.overallScore,
            JSON.stringify(mockAnalysis.breakdown),
            JSON.stringify(mockAnalysis.strengths),
            JSON.stringify(mockAnalysis.improvements),
            JSON.stringify(images)
        ]);
        
        res.json({
            message: 'SkillScan analysis completed',
            scanId,
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
        const [artisan] = await pool.query(
            'SELECT artisan_id FROM artisan_profiles WHERE user_id = ?',
            [req.user.userId]
        );
        
        if (artisan.length === 0) {
            return res.status(404).json({ error: 'Artisan profile not found' });
        }
        
        const [scans] = await pool.query(`
            SELECT * FROM skillscan_results 
            WHERE artisan_id = ?
            ORDER BY scan_date DESC
        `, [artisan[0].artisan_id]);
        
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
        
        // Get buyer_id
        const [buyer] = await pool.query(
            'SELECT buyer_id FROM buyer_profiles WHERE user_id = ?',
            [req.user.userId]
        );
        
        if (buyer.length === 0) {
            return res.status(403).json({ error: 'Only buyers can create orders' });
        }
        
        const orderId = uuidv4();
        const totalAmount = quantity * unitPrice;
        
        await pool.query(`
            INSERT INTO orders 
            (order_id, buyer_id, artisan_id, product_id, order_type, title, description, quantity, unit_price, total_amount)
            VALUES (?, ?, ?, ?, 'product', ?, ?, ?, ?, ?)
        `, [orderId, buyer[0].buyer_id, artisanId, productId, title, description, quantity, unitPrice, totalAmount]);
        
        res.status(201).json({
            message: 'Order created successfully',
            orderId
        });
        
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Get Orders (for artisan or buyer)
app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
        let orders = [];
        
        if (req.user.role === 'artisan') {
            // Get artisan profile
            const artisanProfile = await db.getArtisanProfileByUserId(req.user.userId);
            
            if (!artisanProfile) {
                return res.status(404).json({ error: 'Artisan profile not found' });
            }
            
            // Get orders for this artisan
            orders = await db.getOrdersByArtisan(artisanProfile.artisanId);
            
            // Enrich with buyer names
            for (let order of orders) {
                if (order.buyerId) {
                    const buyerProfile = await db.getBuyerProfile(order.buyerId);
                    if (buyerProfile) {
                        const buyerUser = await db.getUserById(buyerProfile.userId);
                        order.buyer_name = buyerUser ? buyerUser.fullName : 'Unknown Buyer';
                    }
                }
            }
            
        } else if (req.user.role === 'buyer') {
            // Get buyer profile
            const buyerProfile = await db.getBuyerProfileByUserId(req.user.userId);
            
            if (!buyerProfile) {
                return res.status(404).json({ error: 'Buyer profile not found' });
            }
            
            // Get orders for this buyer
            orders = await db.getOrdersByBuyer(buyerProfile.buyerId);
            
            // Enrich with artisan names
            for (let order of orders) {
                if (order.artisanId) {
                    const artisanProfile = await db.getArtisanProfile(order.artisanId);
                    if (artisanProfile) {
                        const artisanUser = await db.getUserById(artisanProfile.userId);
                        order.artisan_name = artisanUser ? artisanUser.fullName : 'Unknown Artisan';
                    }
                }
            }
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

// ==================== LABOUR TRACKING ROUTES ====================

// Log Labour Hours
app.post('/api/labour/log', authenticateToken, async (req, res) => {
    try {
        const { orderId, craftHours, householdHours, date, notes } = req.body;
        
        const [artisan] = await pool.query(
            'SELECT artisan_id FROM artisan_profiles WHERE user_id = ?',
            [req.user.userId]
        );
        
        if (artisan.length === 0) {
            return res.status(403).json({ error: 'Only artisans can log labour hours' });
        }
        
        const labourId = uuidv4();
        
        await pool.query(`
            INSERT INTO labour_tracking 
            (labour_id, artisan_id, order_id, craft_hours, household_hours, date, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [labourId, artisan[0].artisan_id, orderId, craftHours, householdHours, date, notes]);
        
        res.status(201).json({
            message: 'Labour hours logged successfully',
            labourId
        });
        
    } catch (error) {
        console.error('Log labour error:', error);
        res.status(500).json({ error: 'Failed to log labour hours' });
    }
});

// Get Labour History
app.get('/api/labour/history', authenticateToken, async (req, res) => {
    try {
        const [artisan] = await pool.query(
            'SELECT artisan_id FROM artisan_profiles WHERE user_id = ?',
            [req.user.userId]
        );
        
        const [labourRecords] = await pool.query(`
            SELECT l.*, o.title as order_title
            FROM labour_tracking l
            LEFT JOIN orders o ON l.order_id = o.order_id
            WHERE l.artisan_id = ?
            ORDER BY l.date DESC
        `, [artisan[0].artisan_id]);
        
        res.json({ labourRecords });
        
    } catch (error) {
        console.error('Get labour history error:', error);
        res.status(500).json({ error: 'Failed to fetch labour history' });
    }
});

// ==================== ADMIN ROUTES ====================

// Get All Users (Admin only)
app.get('/api/admin/users', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        const [users] = await pool.query(`
            SELECT user_id, email, full_name, phone, role, status, created_at, last_login
            FROM users
            ORDER BY created_at DESC
        `);
        
        res.json({ users });
        
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get Platform Statistics (Admin only)
app.get('/api/admin/statistics', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        const [totalUsers] = await pool.query('SELECT COUNT(*) as count FROM users');
        const [activeArtisans] = await pool.query('SELECT COUNT(*) as count FROM artisan_profiles WHERE verification_status = "verified"');
        const [totalOrders] = await pool.query('SELECT COUNT(*) as count FROM orders');
        const [totalRevenue] = await pool.query('SELECT SUM(total_amount) as total FROM orders WHERE status = "completed"');
        
        res.json({
            totalUsers: totalUsers[0].count,
            activeArtisans: activeArtisans[0].count,
            totalOrders: totalOrders[0].count,
            totalRevenue: totalRevenue[0].total || 0
        });
        
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ==================== AI SAKHI ROUTES ====================

// AI Sakhi Chat with Bedrock (Llama 3) - TESTING: Auth temporarily removed
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
                
                // Get pending payments (completed orders with pending payment)
                userContext.pendingPayments = orders
                    .filter(o => o.status === 'completed' && o.paymentStatus === 'pending')
                    .map(order => ({
                        orderId: order.orderId,
                        amount: order.totalAmount,
                        status: 'pending_approval',
                        completedDate: order.completedAt
                    }));
                
                // Get labour tracking (today's balance)
                const labourHistory = await db.getLabourHistory(artisanProfile.artisanId);
                const today = new Date().toISOString().split('T')[0];
                const todayLabour = labourHistory.find(l => l.date === today);
                
                if (todayLabour) {
                    userContext.balance = {
                        household: todayLabour.householdHours || 0,
                        career: todayLabour.craftHours || 0,
                        selfCare: 24 - (todayLabour.householdHours + todayLabour.craftHours)
                    };
                } else {
                    userContext.balance = {
                        household: 0,
                        career: 0,
                        selfCare: 0
                    };
                }
                
                // Get recent SkillScan results
                const skillScans = await db.getSkillScanHistory(artisanProfile.artisanId);
                if (skillScans.length > 0) {
                    const latestScan = skillScans[0];
                    userContext.latestSkillScan = {
                        category: latestScan.category,
                        skillLevel: latestScan.skillLevel,
                        overallScore: latestScan.overallScore,
                        strengths: latestScan.strengths,
                        improvements: latestScan.improvements
                    };
                }
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
                // Import getFallbackResponse from ai-sakhi-bedrock
                const { getFallbackResponse } = require('./ai-sakhi-bedrock');
                const fallbackResponse = getFallbackResponse(message);
                
                return res.json({
                    success: true,
                    response: fallbackResponse,
                    model: 'fallback',
                    fallback: true,
                    timestamp: new Date().toISOString()
                });
            }
        } else {
            throw new Error('Bedrock not available');
        }
        
    } catch (error) {
        console.error('❌ AI Sakhi route error:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
});

// ==================== GROWTH PATH ROUTES ====================

// const growthPathService = require('./growth-path-service');
// Growth path features temporarily disabled

// Generate growth path for artisan
app.post('/api/growth-path/generate', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'artisan') {
            return res.status(403).json({ error: 'Only artisans can generate growth paths' });
        }
        
        console.log(`📈 Generating growth path for: ${req.user.email}`);
        
        const growthPath = await growthPathService.generateGrowthPath(req.user.userId);
        
        res.json({
            success: true,
            growthPath,
            message: 'Growth path generated successfully'
        });
        
    } catch (error) {
        console.error('Generate growth path error:', error);
        res.status(500).json({ error: 'Failed to generate growth path' });
    }
});

// Get existing growth path
app.get('/api/growth-path', authenticateToken, async (req, res) => {
    try {
        const growthPath = await growthPathService.getGrowthPath(req.user.userId);
        
        if (!growthPath) {
            return res.status(404).json({ error: 'Growth path not found' });
        }
        
        const overallProgress = growthPathService.calculateOverallProgress(growthPath);
        const nextAction = growthPathService.getNextAction(growthPath);
        
        res.json({
            success: true,
            growthPath,
            overallProgress,
            nextAction
        });
        
    } catch (error) {
        console.error('Get growth path error:', error);
        res.status(500).json({ error: 'Failed to fetch growth path' });
    }
});

// Update step progress
app.put('/api/growth-path/step/:stepNumber', authenticateToken, async (req, res) => {
    try {
        const { stepNumber } = req.params;
        const { progress, completed, notes } = req.body;
        
        const updatedPath = await growthPathService.updateStepProgress(
            req.user.userId,
            parseInt(stepNumber),
            { progress, completed, notes }
        );
        
        res.json({
            success: true,
            growthPath: updatedPath,
            message: 'Step progress updated'
        });
        
    } catch (error) {
        console.error('Update step progress error:', error);
        res.status(500).json({ error: 'Failed to update step progress' });
    }
});

// Get marketplace demands
app.get('/api/growth-path/marketplace-demands', authenticateToken, async (req, res) => {
    try {
        const demands = growthPathService.getMarketplaceDemands();
        res.json({ success: true, demands });
    } catch (error) {
        console.error('Get marketplace demands error:', error);
        res.status(500).json({ error: 'Failed to fetch marketplace demands' });
    }
});

// Get AI Sakhi suggestions
app.get('/api/ai-sakhi/suggestions', authenticateToken, async (req, res) => {
    try {
        const suggestions = [
            "Update my bulk order progress",
            "I need help with my order",
            "Request advance payment",
            "I'm facing health issues",
            "Request payment for completed work",
            "How do I improve my skills?",
            "Connect me with support team"
        ];
        
        res.json({ suggestions });
    } catch (error) {
        console.error('Suggestions error:', error);
        res.status(500).json({ error: 'Failed to get suggestions' });
    }
});

// ==================== AI LEARNING MENTOR ROUTES ====================

// OLD AI Learning Mentor Chat endpoint - DISABLED (using new one at line 1612)
// app.post('/api/ai-mentor/chat', authenticateToken, async (req, res) => {
//     ... old code removed ...
// });

// Get learning progress - OLD VERSION - DISABLED (using new one at line 1673)
/*
app.get('/api/learning/progress', authenticateToken, async (req, res) => {
    try {
        const artisanProfile = await db.getArtisanProfileByUserId(req.user.userId);
        
        if (!artisanProfile) {
            return res.status(404).json({ error: 'Artisan profile not found' });
        }
        
        // Get learning data
        const skillScans = await db.getSkillScanHistory(artisanProfile.artisanId);
        const labourHistory = await db.getLabourHistory(artisanProfile.artisanId);
        
        const totalLearningHours = labourHistory.reduce((sum, record) => {
            return sum + (record.learningHours || 0);
        }, 0);
        
        res.json({
            success: true,
            skills: artisanProfile.skills || [],
            skillScans: skillScans,
            totalLearningHours: totalLearningHours,
            rating: artisanProfile.rating || 0
        });
        
    } catch (error) {
        console.error('Get learning progress error:', error);
        res.status(500).json({ error: 'Failed to fetch learning progress' });
    }
});
*/

// ==================== AWS VOICE SERVICES ROUTES ====================

const { StartTranscriptionJobCommand, GetTranscriptionJobCommand } = require("@aws-sdk/client-transcribe");
const { TranslateTextCommand } = require("@aws-sdk/client-translate");
const { SynthesizeSpeechCommand } = require("@aws-sdk/client-polly");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require('fs');
const { 
    createTranscribeClient, 
    createTranslateClient, 
    createPollyClient, 
    createS3Client 
} = require('./utils/aws-clients');

// Initialize AWS clients (will be set asynchronously)
let transcribeClient, translateClient, pollyClient, s3Client;

(async () => {
    try {
        transcribeClient = await createTranscribeClient();
        translateClient = await createTranslateClient();
        pollyClient = await createPollyClient();
        s3Client = await createS3Client();
        console.log('✅ Server voice AWS clients initialized with Secrets Manager');
    } catch (error) {
        console.error('❌ Failed to initialize server voice AWS clients:', error.message);
    }
})();

// Voice transcription endpoint
app.post('/api/voice/transcribe', upload.single('audio'), async (req, res) => {
    try {
        const { language } = req.body;
        const audioFile = req.file;
        
        if (!audioFile) {
            return res.status(400).json({ error: 'Audio file required' });
        }
        
        console.log('🎤 Transcribing audio:', audioFile.originalname);
        console.log('📍 Language:', language);
        
        // For now, use a simple mock transcription
        // In production, you would upload to S3 and use AWS Transcribe
        const mockTranscripts = {
            'en-US': 'Show me my earnings',
            'hi-IN': 'मुझे मेरी कमाई दिखाओ',
            'bn-IN': 'আমার আয় দেখান',
            'mr-IN': 'माझी कमाई दाखवा',
            'ta-IN': 'எனது வருமானத்தைக் காட்டு',
            'te-IN': 'నా సంపాదనను చూపించు'
        };
        
        const transcript = mockTranscripts[language] || 'Show me my earnings';
        
        console.log('✅ Transcript:', transcript);
        
        res.json({
            success: true,
            transcript: transcript,
            language: language
        });
        
    } catch (error) {
        console.error('❌ Transcription error:', error);
        res.status(500).json({ error: 'Transcription failed' });
    }
});

// Voice translation endpoint
app.post('/api/voice/translate', async (req, res) => {
    try {
        const { text, sourceLanguage, targetLanguage } = req.body;
        
        if (!text || !sourceLanguage || !targetLanguage) {
            return res.status(400).json({ error: 'Text, source and target languages required' });
        }
        
        console.log('🌐 Translating:', text);
        console.log(`📍 ${sourceLanguage} → ${targetLanguage}`);
        
        // Map language codes
        const langMap = {
            'en': 'en',
            'hi': 'hi',
            'bn': 'bn',
            'mr': 'mr',
            'ta': 'ta',
            'te': 'te'
        };
        
        const sourceLang = langMap[sourceLanguage] || 'en';
        const targetLang = langMap[targetLanguage] || 'en';
        
        // Call AWS Translate
        const command = new TranslateTextCommand({
            Text: text,
            SourceLanguageCode: sourceLang,
            TargetLanguageCode: targetLang
        });
        
        const response = await translateClient.send(command);
        const translatedText = response.TranslatedText;
        
        console.log('✅ Translation:', translatedText);
        
        res.json({
            success: true,
            translatedText: translatedText,
            sourceLanguage: sourceLang,
            targetLanguage: targetLang
        });
        
    } catch (error) {
        console.error('❌ Translation error:', error);
        
        // Fallback translations
        const fallbackTranslations = {
            'Showing your earnings': {
                'hi': 'आपकी कमाई दिखा रहे हैं',
                'bn': 'আপনার আয় দেখাচ্ছি',
                'mr': 'तुमची कमाई दाखवत आहे',
                'ta': 'உங்கள் வருமானத்தைக் காட்டுகிறது',
                'te': 'మీ సంపాదనను చూపిస్తోంది'
            }
        };
        
        const translated = fallbackTranslations[req.body.text]?.[req.body.targetLanguage] || req.body.text;
        
        res.json({
            success: true,
            translatedText: translated,
            fallback: true
        });
    }
});

// Voice synthesis endpoint
app.post('/api/voice/speak', async (req, res) => {
    try {
        const { text, language } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Text required' });
        }
        
        console.log('🔊 Synthesizing speech:', text);
        console.log('📍 Language:', language);
        
        // Map language to Polly voice
        const voiceMap = {
            'en': 'Joanna',
            'hi': 'Aditi',
            'bn': 'Aditi',  // Use Hindi voice for Bengali
            'mr': 'Aditi',  // Use Hindi voice for Marathi
            'ta': 'Aditi',  // Use Hindi voice for Tamil
            'te': 'Aditi'   // Use Hindi voice for Telugu
        };
        
        const langMap = {
            'en': 'en-US',
            'hi': 'hi-IN',
            'bn': 'hi-IN',
            'mr': 'hi-IN',
            'ta': 'hi-IN',
            'te': 'hi-IN'
        };
        
        const voiceId = voiceMap[language] || 'Joanna';
        const languageCode = langMap[language] || 'en-US';
        
        // Call AWS Polly
        const command = new SynthesizeSpeechCommand({
            Text: text,
            OutputFormat: 'mp3',
            VoiceId: voiceId,
            LanguageCode: languageCode,
            Engine: 'neural'
        });
        
        const response = await pollyClient.send(command);
        
        // Stream audio back
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Disposition': 'inline'
        });
        
        // Convert stream to buffer and send
        const audioStream = response.AudioStream;
        const chunks = [];
        
        for await (const chunk of audioStream) {
            chunks.push(chunk);
        }
        
        const audioBuffer = Buffer.concat(chunks);
        
        console.log('✅ Speech synthesized:', audioBuffer.length, 'bytes');
        
        res.send(audioBuffer);
        
    } catch (error) {
        console.error('❌ Speech synthesis error:', error);
        res.status(500).json({ error: 'Speech synthesis failed' });
    }
});

// Voice Command Processing with Transcribe, Translate, and Polly
app.post('/api/voice-command', authenticateToken, async (req, res) => {
    try {
        const { action, audio, text, language } = req.body;
        
        if (action === 'process-voice-command') {
            // Process voice command with AWS services
            const voiceCommandService = require('./voice-command-service');
            const result = await voiceCommandService.processVoiceCommand(audio);
            
            res.json(result);
            
        } else if (action === 'text-to-speech') {
            // Convert text to speech
            const voiceCommandService = require('./voice-command-service');
            const result = await voiceCommandService.textToSpeech(text, language);
            
            res.json(result);
            
        } else {
            res.status(400).json({ error: 'Invalid action' });
        }
        
    } catch (error) {
        console.error('❌ Voice command error:', error);
        res.status(500).json({ 
            error: 'Voice command processing failed',
            details: error.message 
        });
    }
});

// Fallback AI Sakhi response function
function getFallbackAISakhiResponse(message, userContext = {}) {
    const lowerMessage = message.toLowerCase();
    const userName = userContext.userName || 'Sister';
    
    if (lowerMessage.includes('order') || lowerMessage.includes('bulk') || lowerMessage.includes('progress')) {
        if (userContext.orders && userContext.orders.length > 0) {
            const activeOrder = userContext.orders.find(o => o.status === 'in_progress');
            if (activeOrder) {
                const progress = Math.round((activeOrder.completed / activeOrder.quantity) * 100);
                return `Namaste ${userName}! I can see your bulk order "${activeOrder.title}" for ${activeOrder.buyer}.\n\n📊 Progress: ${activeOrder.completed}/${activeOrder.quantity} pieces completed (${progress}%)\n⏰ Deadline: ${activeOrder.deadline}\n💰 Total Value: ₹${activeOrder.totalAmount.toLocaleString()}\n\nYou're doing great! ${activeOrder.quantity - activeOrder.completed} pieces remaining. Would you like to update your progress or need any support?`;
            }
        }
        return `Namaste ${userName}! I understand you want to discuss your bulk order. I'm here to help! Could you please tell me more about your order status or any challenges you're facing?`;
    }
    
    if (lowerMessage.includes('payment') || lowerMessage.includes('money') || lowerMessage.includes('advance')) {
        if (userContext.pendingPayments && userContext.pendingPayments.length > 0) {
            const pending = userContext.pendingPayments[0];
            return `Namaste ${userName}! I can see you have a pending payment:\n\n💰 Amount: ₹${pending.amount.toLocaleString()}\n📋 Order: ${pending.orderId}\n✅ Status: ${pending.status.replace('_', ' ')}\n\nYour payment is being processed. Would you like me to connect you with our finance team to expedite this, or do you need an advance for your current work?`;
        }
        return `I can help you with payment requests, ${userName}. Would you like to request an advance payment or payment for completed work? Please let me know the details, and I'll connect you with our finance team.`;
    }
    
    if (lowerMessage.includes('health') || lowerMessage.includes('sick') || lowerMessage.includes('unwell')) {
        return `I'm sorry to hear you're not feeling well, ${userName}. Your health is very important to us! Please let me know what's happening, and I'll immediately connect you with our support team who can help with:\n\n🏥 Medical assistance\n⏰ Deadline extensions\n👥 Temporary work support\n💰 Emergency financial help\n\nWhat kind of support do you need right now?`;
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
        return `I'm here to help you, ${userName}! I can assist with:\n\n1. 📦 Bulk order updates and progress tracking\n2. 🏥 Health issues and work challenges\n3. 💰 Payment requests (advance or completed work)\n4. 📚 Skills development and training\n5. 🤝 General support and guidance\n\nWhat would you like help with today?`;
    }
    
    if (lowerMessage.includes('skill') || lowerMessage.includes('learn') || lowerMessage.includes('training')) {
        return `That's wonderful that you want to improve your skills, ${userName}! We have various training programs and resources available:\n\n📚 Online video tutorials\n👩‍🏫 Live skill workshops\n🎓 Certification programs\n🤝 Mentorship opportunities\n\nWould you like me to connect you with our skills development team?`;
    }
    
    return `Namaste ${userName}! I'm AI Sakhi, your personal assistant. I'm here to support you with your work, orders, payments, and any challenges you're facing. How can I assist you today?`;
}

// ==================== RESOURCE CIRCULARITY ROUTES ====================

// Load Resource Circularity AI module
let resourceCircularityAI = null;
try {
    resourceCircularityAI = require('./resource-circularity-bedrock');
    console.log('✅ Resource Circularity AI (Llama 3) module loaded');
} catch (error) {
    console.error('⚠️  Resource Circularity AI module not available:', error.message);
}

// Find AI-powered resource matches
app.post('/api/resource-circularity/find-matches', authenticateToken, async (req, res) => {
    try {
        if (!resourceCircularityAI) {
            return res.status(503).json({ 
                error: 'Resource Circularity AI not available',
                message: 'Please configure AWS Bedrock access'
            });
        }

        const { wasteType, quantity, location, skill } = req.body;
        const artisanId = req.user.userId;

        if (!wasteType) {
            return res.status(400).json({ error: 'wasteType is required' });
        }

        console.log(`🔍 Finding matches for ${artisanId}: ${wasteType}`);

        // Fetch user profile for personalized recommendations
        let userProfile = null;
        try {
            const user = await db.getUserById(artisanId);
            if (user && user.role === 'artisan') {
                const artisanProfile = await db.getArtisanProfileByUserId(artisanId);
                if (artisanProfile) {
                    userProfile = {
                        fullName: user.fullName,
                        skills: artisanProfile.skills || [],
                        experienceYears: artisanProfile.experienceYears,
                        location: artisanProfile.location,
                        bio: artisanProfile.bio
                    };
                    console.log(`👤 User profile loaded: ${user.fullName} (${userProfile.skills.join(', ')})`);
                }
            }
        } catch (profileError) {
            console.warn('⚠️  Could not load user profile:', profileError.message);
            // Continue without profile - AI will use generic recommendations
        }

        const result = await resourceCircularityAI.findResourceMatches({
            artisanId,
            wasteType,
            quantity,
            location,
            skill
        }, userProfile);

        res.json(result);

    } catch (error) {
        console.error('❌ Find matches error:', error);
        res.status(500).json({ 
            error: 'Failed to find matches',
            message: error.message 
        });
    }
});

// Get match insights
app.post('/api/resource-circularity/match-insights', authenticateToken, async (req, res) => {
    try {
        if (!resourceCircularityAI) {
            return res.status(503).json({ 
                error: 'Resource Circularity AI not available'
            });
        }

        const { artisan1, artisan2, material } = req.body;

        if (!artisan1 || !artisan2 || !material) {
            return res.status(400).json({ 
                error: 'artisan1, artisan2, and material are required' 
            });
        }

        console.log(`💡 Getting insights for match: ${material}`);

        const result = await resourceCircularityAI.getMatchInsights({
            artisan1,
            artisan2,
            material
        });

        res.json(result);

    } catch (error) {
        console.error('❌ Get insights error:', error);
        res.status(500).json({ 
            error: 'Failed to get insights',
            message: error.message 
        });
    }
});

// Analyze compatibility
app.post('/api/resource-circularity/analyze-compatibility', authenticateToken, async (req, res) => {
    try {
        if (!resourceCircularityAI) {
            return res.status(503).json({ 
                error: 'Resource Circularity AI not available'
            });
        }

        const { wasteType, targetSkill, quality } = req.body;

        if (!wasteType || !targetSkill) {
            return res.status(400).json({ 
                error: 'wasteType and targetSkill are required' 
            });
        }

        console.log(`🔬 Analyzing compatibility: ${wasteType} -> ${targetSkill}`);

        const result = await resourceCircularityAI.analyzeCompatibility({
            wasteType,
            targetSkill,
            quality
        });

        res.json(result);

    } catch (error) {
        console.error('❌ Analyze compatibility error:', error);
        res.status(500).json({ 
            error: 'Failed to analyze compatibility',
            message: error.message 
        });
    }
});

// Get recommendations
app.get('/api/resource-circularity/recommendations', authenticateToken, async (req, res) => {
    try {
        if (!resourceCircularityAI) {
            return res.status(503).json({ 
                error: 'Resource Circularity AI not available'
            });
        }

        const artisanId = req.user.userId;

        console.log(`📊 Getting recommendations for ${artisanId}`);

        const result = await resourceCircularityAI.getCircularityRecommendations(artisanId);

        res.json(result);

    } catch (error) {
        console.error('❌ Get recommendations error:', error);
        res.status(500).json({ 
            error: 'Failed to get recommendations',
            message: error.message 
        });
    }
});

// Get waste-to-wealth insights
app.get('/api/resource-circularity/insights', authenticateToken, async (req, res) => {
    try {
        if (!resourceCircularityAI) {
            return res.status(503).json({ 
                error: 'Resource Circularity AI not available'
            });
        }

        console.log('📈 Getting waste-to-wealth insights');

        const result = await resourceCircularityAI.getWasteToWealthInsights();

        res.json(result);

    } catch (error) {
        console.error('❌ Get insights error:', error);
        res.status(500).json({ 
            error: 'Failed to get insights',
            message: error.message 
        });
    }
});

// ==================== VIRTUAL FACTORY ROUTES ====================

// Load Virtual Factory module
let virtualFactory = null;
try {
    virtualFactory = require('./virtual-factory-titan');
    console.log('✅ Virtual Factory (Titan Embeddings V2) module loaded');
} catch (error) {
    console.error('⚠️  Virtual Factory module not available:', error.message);
}

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

// Get AI-based match types
app.post('/api/virtual-factory/match-types', authenticateToken, async (req, res) => {
    try {
        if (!virtualFactory) {
            return res.status(503).json({ 
                error: 'Virtual Factory not available'
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

// ============================================================================
// AI LEARNING MENTOR ROUTES (Amazon Titan Text Express)
// ============================================================================

let aiLearningMentor = null;
try {
    aiLearningMentor = require('./ai-learning-mentor-titan');
    console.log('✅ AI Learning Mentor module loaded (Amazon Titan Text Express)');
} catch (error) {
    console.warn('⚠️  AI Learning Mentor module not available:', error.message);
}

// Chat with AI Learning Mentor (TESTING - Auth temporarily removed)
app.post('/api/ai-mentor/chat', async (req, res) => {
    // TEMPORARY: Try to get real Rukaiya user from DynamoDB, fallback to fake user
    try {
        const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
        const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
        
        const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
        const docClient = DynamoDBDocumentClient.from(client);
        
        // Scan for Rukaiya by email (since EmailIndex might not exist)
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
                email: rukaiyaUser.email
            };
            console.log(`✅ Using real Rukaiya user: ${rukaiyaUser.fullName} (${rukaiyaUser.userId})`);
        } else {
            // Fallback to fake user
            req.user = { 
                userId: 'rukaiya-123', 
                fullName: 'Rukaiya', 
                email: 'rukaiya@example.com' 
            };
            console.log('⚠️  Using fake Rukaiya user (real user not found in DB)');
        }
    } catch (dbError) {
        // Fallback to fake user if DB query fails
        req.user = { 
            userId: 'rukaiya-123', 
            fullName: 'Rukaiya', 
            email: 'rukaiya@example.com' 
        };
        console.log('⚠️  Using fake Rukaiya user (DB query failed):', dbError.message);
    }
    
    try {
        if (!aiLearningMentor) {
            return res.status(503).json({ 
                error: 'AI Learning Mentor not available',
                response: aiLearningMentor ? aiLearningMentor.getFallbackResponse(req.body.message) : 'Service temporarily unavailable'
            });
        }

        const { message, conversationHistory = [] } = req.body;
        const userId = req.user.userId;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ 
                error: 'Message is required' 
            });
        }

        console.log(`🎓 AI Mentor chat from user ${userId}: ${message.substring(0, 50)}...`);

        // Get user context (optional - can be enhanced later)
        const userContext = {
            userName: req.user.fullName || 'Learner',
            currentSkills: [],
            learningGoals: [],
            experienceLevel: 'beginner'
        };

        try {
            const result = await aiLearningMentor.chatWithMentor(
                userId, 
                message, 
                conversationHistory,
                userContext
            );

            res.json(result);

        } catch (error) {
            console.error('❌ Llama 3 error, using fallback:', error.message);
            console.error('   Error details:', error);
            
            // Fallback response
            const fallbackResponse = aiLearningMentor.getFallbackResponse(message);
            res.json({
                success: true,
                response: fallbackResponse,
                model: 'fallback',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }

    } catch (error) {
        console.error('❌ AI Mentor chat error:', error);
        res.status(500).json({ 
            error: 'Failed to process chat',
            message: error.message 
        });
    }
});

// Get learning progress (TESTING - Auth temporarily removed)
app.get('/api/learning/progress', async (req, res) => {
    // TEMPORARY: Try to get real Rukaiya user from DynamoDB, fallback to fake user
    try {
        const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
        const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
        
        const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
        const docClient = DynamoDBDocumentClient.from(client);
        
        // Scan for Rukaiya by email (since EmailIndex might not exist)
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
                email: rukaiyaUser.email
            };
            console.log(`✅ Using real Rukaiya user for progress: ${rukaiyaUser.fullName} (${rukaiyaUser.userId})`);
        } else {
            // Fallback to fake user
            req.user = { 
                userId: 'rukaiya-123', 
                fullName: 'Rukaiya', 
                email: 'rukaiya@example.com' 
            };
            console.log('⚠️  Using fake Rukaiya user for progress (real user not found in DB)');
        }
    } catch (dbError) {
        // Fallback to fake user if DB query fails
        req.user = { 
            userId: 'rukaiya-123', 
            fullName: 'Rukaiya', 
            email: 'rukaiya@example.com' 
        };
        console.log('⚠️  Using fake Rukaiya user for progress (DB query failed):', dbError.message);
    }
    
    try {
        if (!aiLearningMentor) {
            return res.status(503).json({ 
                error: 'AI Learning Mentor not available'
            });
        }

        const userId = req.user.userId;

        console.log(`📊 Getting learning progress for user ${userId}`);

        const result = await aiLearningMentor.getLearningProgress(userId);

        res.json(result);

    } catch (error) {
        console.error('❌ Get progress error:', error);
        res.status(500).json({ 
            error: 'Failed to get progress',
            message: error.message 
        });
    }
});

// Get learning recommendations
app.get('/api/learning/recommendations', authenticateToken, async (req, res) => {
    try {
        if (!aiLearningMentor) {
            return res.status(503).json({ 
                error: 'AI Learning Mentor not available'
            });
        }

        const userId = req.user.userId;
        const currentSkills = req.query.skills ? req.query.skills.split(',') : [];

        console.log(`💡 Getting learning recommendations for user ${userId}`);

        const result = await aiLearningMentor.getLearningRecommendations(userId, currentSkills);

        res.json(result);

    } catch (error) {
        console.error('❌ Get recommendations error:', error);
        res.status(500).json({ 
            error: 'Failed to get recommendations',
            message: error.message 
        });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🚀 SHE-BALANCE Backend Server');
    console.log('='.repeat(60));
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}`);
    console.log(`🤖 AI Sakhi: Llama 3 70B (AWS Bedrock)`);
    console.log(`📊 Data: DynamoDB (AWS)`);
    console.log('='.repeat(60));
    console.log('');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    await pool.end();
    process.exit(0);
});
