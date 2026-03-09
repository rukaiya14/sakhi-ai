/**
 * Add Test Users to DynamoDB
 * Creates test users for testing AI Learning Mentor and other features
 */

const db = require('../dynamodb-client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function addTestUsers() {
    console.log('🔐 Adding test users to DynamoDB...\n');
    
    const testUsers = [
        {
            email: 'rukaiya@example.com',
            password: 'password123',
            fullName: 'Rukaiya Khan',
            phone: '+91-9876543210',
            role: 'artisan',
            skills: ['tailoring', 'embroidery', 'henna'],
            location: 'Sarojini Nagar, Delhi',
            bio: 'Experienced artisan specializing in traditional embroidery and tailoring'
        },
        {
            email: 'test@example.com',
            password: 'password123',
            fullName: 'Test User',
            phone: '+91-9876543211',
            role: 'artisan',
            skills: ['crochet', 'knitting'],
            location: 'Chandni Chowk, Delhi',
            bio: 'Learning new craft skills'
        },
        {
            email: 'rahul@example.com',
            password: 'password123',
            fullName: 'Rahul Sharma',
            phone: '+91-9876543212',
            role: 'buyer',
            location: 'Connaught Place, Delhi',
            bio: 'Looking for quality handmade products'
        },
        {
            email: 'corporate@example.com',
            password: 'password123',
            fullName: 'Corporate Buyer',
            phone: '+91-9876543213',
            role: 'corporate',
            companyName: 'ABC Corporation',
            location: 'Gurgaon, Haryana',
            bio: 'Bulk orders for corporate gifting'
        },
        {
            email: 'admin@example.com',
            password: 'password123',
            fullName: 'Admin User',
            phone: '+91-9876543214',
            role: 'admin',
            location: 'Delhi',
            bio: 'Platform administrator'
        }
    ];
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const userData of testUsers) {
        try {
            // Check if user already exists
            const existingUser = await db.getUserByEmail(userData.email);
            if (existingUser) {
                console.log(`⚠️  User already exists: ${userData.email}`);
                continue;
            }
            
            // Hash password
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            
            // Create user ID
            const userId = uuidv4();
            
            // Create user object
            const user = {
                userId: userId,
                email: userData.email,
                passwordHash: hashedPassword,  // Changed from 'password' to 'passwordHash'
                fullName: userData.fullName,
                phone: userData.phone,
                role: userData.role,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Add optional fields
            if (userData.companyName) user.companyName = userData.companyName;
            if (userData.location) user.location = userData.location;
            if (userData.bio) user.bio = userData.bio;
            
            // Create user in DynamoDB
            await db.createUser(user);
            console.log(`✅ Created user: ${userData.email} (${userData.role})`);
            
            // If artisan, create artisan profile
            if (userData.role === 'artisan') {
                const artisanId = `ART-${Date.now()}-${userId.substring(0, 8)}`;
                
                const artisanProfile = {
                    artisanId: artisanId,
                    userId: userId,
                    skills: userData.skills || [],
                    rating: 4.5,
                    totalOrders: 0,
                    completedOrders: 0,
                    totalEarnings: 0,
                    experienceYears: Math.floor(Math.random() * 10) + 1,
                    location: userData.location || 'Delhi',
                    verified: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                await db.createArtisanProfile(artisanProfile);
                console.log(`   ✅ Created artisan profile: ${artisanId}`);
            }
            
            successCount++;
            
        } catch (error) {
            console.error(`❌ Error creating user ${userData.email}:`, error.message);
            errorCount++;
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`   ✅ Successfully created: ${successCount} users`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📝 Total users: ${testUsers.length}`);
    console.log('='.repeat(60));
    console.log('\n✅ Test users ready! You can now login with:');
    console.log('\n   Artisan: rukaiya@example.com / password123');
    console.log('   Artisan: test@example.com / password123');
    console.log('   Buyer: rahul@example.com / password123');
    console.log('   Corporate: corporate@example.com / password123');
    console.log('   Admin: admin@example.com / password123');
    console.log('\n🎓 Now you can test AI Learning Mentor!');
}

// Run the script
addTestUsers()
    .then(() => {
        console.log('\n✅ Script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Script failed:', error);
        process.exit(1);
    });
