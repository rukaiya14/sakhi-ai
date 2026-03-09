// Initialize Sample Data in DynamoDB
const bcrypt = require('bcryptjs');
const db = require('../dynamodb-client');
require('dotenv').config();

async function initializeSampleData() {
    console.log('🔧 Initializing Sample Data in DynamoDB...\n');
    
    try {
        // Create Admin User
        console.log('Creating admin user...');
        const adminPassword = await bcrypt.hash('admin123', 10);
        
        try {
            const adminUser = await db.createUser({
                email: 'admin@shebalance.com',
                passwordHash: adminPassword,
                fullName: 'Admin User',
                phone: '+919999999999',
                role: 'admin'
            });
            
            await db.updateUser(adminUser.userId, { status: 'active' });
            
            console.log('✅ Admin user created');
            console.log('   Email: admin@shebalance.com');
            console.log('   Password: admin123\n');
        } catch (error) {
            if (error.code === 'ConditionalCheckFailedException') {
                console.log('⚠️  Admin user already exists\n');
            } else {
                throw error;
            }
        }
        
        // Create Sample Artisan
        console.log('Creating sample artisan...');
        const artisanPassword = await bcrypt.hash('artisan123', 10);
        
        try {
            const artisanUser = await db.createUser({
                email: 'priya@example.com',
                passwordHash: artisanPassword,
                fullName: 'Priya Sharma',
                phone: '+919876543210',
                role: 'artisan'
            });
            
            await db.updateUser(artisanUser.userId, { status: 'active' });
            
            const artisanProfile = await db.createArtisanProfile(artisanUser.userId);
            
            await db.updateArtisanProfile(artisanProfile.artisanId, {
                skills: ['embroidery', 'weaving', 'tailoring'],
                experienceYears: 5,
                location: 'Mumbai, India',
                bio: 'Expert in traditional embroidery and handloom weaving with 5 years of experience',
                rating: 4.8,
                verificationStatus: 'verified'
            });
            
            console.log('✅ Sample artisan created');
            console.log('   Email: priya@example.com');
            console.log('   Password: artisan123\n');
        } catch (error) {
            if (error.code === 'ConditionalCheckFailedException') {
                console.log('⚠️  Sample artisan already exists\n');
            } else {
                throw error;
            }
        }
        
        // Create Rukaiya Artisan
        console.log('Creating Rukaiya artisan...');
        
        try {
            const rukaiyaUser = await db.createUser({
                email: 'rukaiya@example.com',
                passwordHash: artisanPassword,
                fullName: 'Rukaiya Khan',
                phone: '+919876543211',
                role: 'artisan'
            });
            
            await db.updateUser(rukaiyaUser.userId, { status: 'active' });
            
            const rukaiyaProfile = await db.createArtisanProfile(rukaiyaUser.userId);
            
            await db.updateArtisanProfile(rukaiyaProfile.artisanId, {
                skills: ['tailoring', 'embroidery', 'henna'],
                experienceYears: 8,
                location: 'Delhi, India',
                bio: 'Skilled artisan specializing in tailoring, embroidery, and henna art with 8 years of experience',
                rating: 4.9,
                verificationStatus: 'verified'
            });
            
            console.log('✅ Rukaiya artisan created');
            console.log('   Email: rukaiya@example.com');
            console.log('   Password: artisan123\n');
        } catch (error) {
            if (error.code === 'ConditionalCheckFailedException') {
                console.log('⚠️  Rukaiya artisan already exists\n');
            } else {
                throw error;
            }
        }
        
        // Create Sample Buyer
        console.log('Creating sample buyer...');
        const buyerPassword = await bcrypt.hash('buyer123', 10);
        
        try {
            const buyerUser = await db.createUser({
                email: 'rahul@example.com',
                passwordHash: buyerPassword,
                fullName: 'Rahul Kumar',
                phone: '+919876543211',
                role: 'buyer'
            });
            
            await db.updateUser(buyerUser.userId, { status: 'active' });
            
            await db.createBuyerProfile(buyerUser.userId);
            
            console.log('✅ Sample buyer created');
            console.log('   Email: rahul@example.com');
            console.log('   Password: buyer123\n');
        } catch (error) {
            if (error.code === 'ConditionalCheckFailedException') {
                console.log('⚠️  Sample buyer already exists\n');
            } else {
                throw error;
            }
        }
        
        // Create Corporate Buyer
        console.log('Creating corporate buyer...');
        const corporatePassword = await bcrypt.hash('corporate123', 10);
        
        try {
            const corporateUser = await db.createUser({
                email: 'corporate@shebalance.com',
                passwordHash: corporatePassword,
                fullName: 'Corporate Buyer',
                phone: '+919876543212',
                role: 'corporate'
            });
            
            await db.updateUser(corporateUser.userId, { status: 'active' });
            
            await db.createCorporateProfile(corporateUser.userId);
            
            console.log('✅ Corporate buyer created');
            console.log('   Email: corporate@shebalance.com');
            console.log('   Password: corporate123\n');
        } catch (error) {
            if (error.code === 'ConditionalCheckFailedException') {
                console.log('⚠️  Corporate buyer already exists\n');
            } else {
                throw error;
            }
        }
        
        console.log('🎉 Sample data initialization completed!\n');
        console.log('You can now login with:');
        console.log('  Admin:     admin@shebalance.com / admin123');
        console.log('  Artisan:   rukaiya@example.com / artisan123');
        console.log('  Buyer:     rahul@example.com / buyer123');
        console.log('  Corporate: corporate@shebalance.com / corporate123\n');
        
    } catch (error) {
        console.error('\n❌ Sample data initialization failed:', error.message);
        console.error('Error details:', error);
        process.exit(1);
    }
}

// Run initialization
initializeSampleData();
