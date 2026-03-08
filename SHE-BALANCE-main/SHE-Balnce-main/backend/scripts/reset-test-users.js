/**
 * Reset Test Users - Delete and Recreate
 */

const db = require('../dynamodb-client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function resetTestUsers() {
    console.log('🔄 Resetting test users...\n');
    
    const testEmails = [
        'rukaiya@example.com',
        'test@example.com',
        'rahul@example.com',
        'corporate@example.com',
        'admin@example.com'
    ];
    
    // Delete existing users
    console.log('🗑️  Deleting existing test users...');
    for (const email of testEmails) {
        try {
            const user = await db.getUserByEmail(email);
            if (user) {
                await db.deleteUser(user.userId);
                console.log(`   ✅ Deleted: ${email}`);
            }
        } catch (error) {
            console.log(`   ⚠️  Could not delete ${email}:`, error.message);
        }
    }
    
    console.log('\n✅ Old users deleted\n');
    console.log('➕ Creating new users with correct password field...\n');
    
    const testUsers = [
        {
            email: 'rukaiya@example.com',
            password: 'password123',
            fullName: 'Rukaiya Khan',
            phone: '+91-9876543210',
            role: 'artisan',
            skills: ['tailoring', 'embroidery', 'henna'],
            location: 'Sarojini Nagar, Delhi'
        },
        {
            email: 'test@example.com',
            password: 'password123',
            fullName: 'Test User',
            phone: '+91-9876543211',
            role: 'artisan',
            skills: ['crochet', 'knitting'],
            location: 'Chandni Chowk, Delhi'
        },
        {
            email: 'rahul@example.com',
            password: 'password123',
            fullName: 'Rahul Sharma',
            phone: '+91-9876543212',
            role: 'buyer',
            location: 'Connaught Place, Delhi'
        },
        {
            email: 'corporate@example.com',
            password: 'password123',
            fullName: 'Corporate Buyer',
            phone: '+91-9876543213',
            role: 'corporate',
            companyName: 'ABC Corporation',
            location: 'Gurgaon, Haryana'
        },
        {
            email: 'admin@example.com',
            password: 'password123',
            fullName: 'Admin User',
            phone: '+91-9876543214',
            role: 'admin',
            location: 'Delhi'
        }
    ];
    
    let successCount = 0;
    
    for (const userData of testUsers) {
        try {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            
            const user = {
                email: userData.email,
                passwordHash: hashedPassword,  // Correct field name
                fullName: userData.fullName,
                phone: userData.phone,
                role: userData.role
            };
            
            const result = await db.createUser(user);
            console.log(`✅ Created: ${userData.email} (${userData.role})`);
            
            // Create artisan profile if needed
            if (userData.role === 'artisan' && userData.skills) {
                const artisanId = `ART-${Date.now()}-${result.userId.substring(0, 8)}`;
                
                const artisanProfile = {
                    artisanId: artisanId,
                    userId: result.userId,
                    skills: userData.skills,
                    rating: 4.5,
                    totalOrders: 0,
                    completedOrders: 0,
                    totalEarnings: 0,
                    experienceYears: 5,
                    location: userData.location,
                    verified: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                await db.createArtisanProfile(artisanProfile);
                console.log(`   ✅ Artisan profile: ${artisanId}`);
            }
            
            successCount++;
            
        } catch (error) {
            console.error(`❌ Error: ${userData.email}:`, error.message);
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`✅ Successfully created: ${successCount}/${testUsers.length} users`);
    console.log('='.repeat(60));
    console.log('\n🎓 Test users ready! Login with:');
    console.log('\n   rukaiya@example.com / password123');
    console.log('   test@example.com / password123');
    console.log('   rahul@example.com / password123');
    console.log('   corporate@example.com / password123');
    console.log('   admin@example.com / password123');
}

resetTestUsers()
    .then(() => {
        console.log('\n✅ Reset complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Reset failed:', error);
        process.exit(1);
    });
