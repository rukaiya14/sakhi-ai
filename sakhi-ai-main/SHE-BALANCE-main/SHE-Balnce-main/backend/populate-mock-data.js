/**
 * Populate DynamoDB with Mock Data for AI Sakhi
 * Run this script to create sample orders, payments, and user data
 */

const db = require('./dynamodb-client');
const bcrypt = require('bcryptjs');

async function populateMockData() {
    console.log('🚀 Starting to populate mock data...\n');

    try {
        // 1. Create Artisan User (Rukaiya)
        console.log('1️⃣  Creating artisan user...');
        const passwordHash = await bcrypt.hash('artisan123', 10);
        
        let rukaiyaUser;
        try {
            rukaiyaUser = await db.createUser({
                email: 'rukaiya@example.com',
                passwordHash: passwordHash,
                fullName: 'Rukaiya',
                phone: '+919876543210',
                role: 'artisan'
            });
            console.log('✅ Created user:', rukaiyaUser.email);
        } catch (error) {
            if (error.code === 'ConditionalCheckFailedException') {
                console.log('⚠️  User already exists, fetching...');
                rukaiyaUser = await db.getUserByEmail('rukaiya@example.com');
            } else {
                throw error;
            }
        }

        // Update user status to active
        await db.updateUser(rukaiyaUser.userId, { status: 'active' });

        // 2. Create Artisan Profile
        console.log('\n2️⃣  Creating artisan profile...');
        let artisanProfile = await db.getArtisanProfileByUserId(rukaiyaUser.userId);
        
        if (!artisanProfile) {
            artisanProfile = await db.createArtisanProfile(rukaiyaUser.userId);
            await db.updateArtisanProfile(artisanProfile.artisanId, {
                skills: ['Embroidery', 'Crochet', 'Hand-weaving'],
                experienceYears: 8,
                location: 'Mumbai, Maharashtra',
                bio: 'Experienced artisan specializing in traditional embroidery and crochet work',
                rating: 4.8,
                totalOrders: 47,
                totalEarnings: 285000,
                verificationStatus: 'verified',
                availabilityStatus: 'available'
            });
            console.log('✅ Created artisan profile');
        } else {
            console.log('⚠️  Artisan profile already exists');
        }

        // 3. Create Buyer Users
        console.log('\n3️⃣  Creating buyer users...');
        const buyers = [
            {
                email: 'fashion.boutique@example.com',
                name: 'Fashion Boutique Ltd',
                phone: '+919123456789'
            },
            {
                email: 'homedecor@example.com',
                name: 'Home Decor Co',
                phone: '+919234567890'
            }
        ];

        const buyerProfiles = [];
        for (const buyerData of buyers) {
            let buyer = await db.getUserByEmail(buyerData.email);
            if (!buyer) {
                buyer = await db.createUser({
                    email: buyerData.email,
                    passwordHash: await bcrypt.hash('buyer123', 10),
                    fullName: buyerData.name,
                    phone: buyerData.phone,
                    role: 'buyer'
                });
                await db.updateUser(buyer.userId, { status: 'active' });
                
                const buyerProfile = await db.createBuyerProfile(buyer.userId);
                await db.updateUser(buyer.userId, { 
                    companyName: buyerData.name 
                });
                buyerProfiles.push(buyerProfile);
                console.log(`✅ Created buyer: ${buyerData.name}`);
            } else {
                const buyerProfile = await db.getBuyerProfileByUserId(buyer.userId);
                buyerProfiles.push(buyerProfile);
                console.log(`⚠️  Buyer already exists: ${buyerData.name}`);
            }
        }

        // 4. Create Mock Orders
        console.log('\n4️⃣  Creating mock orders...');
        
        const orders = [
            {
                buyerId: buyerProfiles[0].buyerId,
                artisanId: artisanProfile.artisanId,
                title: 'Hand-embroidered Sarees - Bulk Order',
                description: '50 pieces of traditional hand-embroidered sarees with intricate patterns',
                quantity: 50,
                unitPrice: 2500,
                totalAmount: 125000,
                status: 'in_progress',
                paymentStatus: 'partial',
                deliveryDate: '2026-03-15',
                progressPercentage: 70,
                progressNote: 'Working on final 15 pieces, quality is excellent',
                imagesCompleted: 35,
                lastProgressUpdate: new Date().toISOString()
            },
            {
                buyerId: buyerProfiles[1].buyerId,
                artisanId: artisanProfile.artisanId,
                title: 'Crochet Table Runners',
                description: '20 handmade crochet table runners with floral patterns',
                quantity: 20,
                unitPrice: 800,
                totalAmount: 16000,
                status: 'completed',
                paymentStatus: 'pending',
                deliveryDate: '2026-03-10',
                progressPercentage: 100,
                progressNote: 'All pieces completed and delivered',
                imagesCompleted: 20,
                lastProgressUpdate: '2026-03-08T10:00:00.000Z',
                completedAt: '2026-03-08T10:00:00.000Z'
            },
            {
                buyerId: buyerProfiles[0].buyerId,
                artisanId: artisanProfile.artisanId,
                title: 'Embroidered Cushion Covers',
                description: '30 decorative cushion covers with traditional motifs',
                quantity: 30,
                unitPrice: 450,
                totalAmount: 13500,
                status: 'pending',
                paymentStatus: 'pending',
                deliveryDate: '2026-03-25',
                progressPercentage: 0,
                progressNote: 'Order confirmed, materials being arranged',
                imagesCompleted: 0,
                lastProgressUpdate: new Date().toISOString()
            }
        ];

        const createdOrders = [];
        for (const orderData of orders) {
            const order = await db.createOrder(orderData);
            
            // Update progress if specified
            if (orderData.progressPercentage > 0) {
                await db.updateOrderProgress(order.orderId, {
                    progressPercentage: orderData.progressPercentage,
                    progressNote: orderData.progressNote,
                    imagesCompleted: orderData.imagesCompleted,
                    lastProgressUpdate: orderData.lastProgressUpdate
                });
            }
            
            // Update status
            await db.updateOrderStatus(order.orderId, orderData.status);
            
            createdOrders.push(order);
            console.log(`✅ Created order: ${orderData.title}`);
        }

        // 5. Create Labour Tracking Records
        console.log('\n5️⃣  Creating labour tracking records...');
        
        const labourRecords = [
            {
                artisanId: artisanProfile.artisanId,
                orderId: createdOrders[0].orderId,
                craftHours: 6,
                householdHours: 5,
                date: new Date().toISOString().split('T')[0],
                notes: 'Completed 3 sarees today, household work in morning'
            },
            {
                artisanId: artisanProfile.artisanId,
                orderId: createdOrders[0].orderId,
                craftHours: 7,
                householdHours: 4,
                date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                notes: 'Good progress on embroidery work'
            }
        ];

        for (const labourData of labourRecords) {
            await db.logLabourHours(labourData);
        }
        console.log('✅ Created labour tracking records');

        // 6. Create SkillScan Results
        console.log('\n6️⃣  Creating SkillScan results...');
        
        const skillScanData = {
            artisanId: artisanProfile.artisanId,
            category: 'Embroidery',
            skillLevel: 'Advanced',
            overallScore: 87,
            breakdownScores: {
                'Technique Quality': 90,
                'Pattern Complexity': 85,
                'Finishing Quality': 88,
                'Color Coordination': 85,
                'Speed & Efficiency': 86
            },
            strengths: [
                'Excellent stitch consistency',
                'Beautiful color combinations',
                'High attention to detail',
                'Fast and efficient work'
            ],
            improvements: [
                'Can explore more complex patterns',
                'Try contemporary design elements',
                'Experiment with new thread types'
            ],
            recommendations: [
                'Advanced embroidery workshop',
                'Contemporary design course',
                'Business management training'
            ],
            images: ['scan1.jpg', 'scan2.jpg', 'scan3.jpg']
        };

        await db.createSkillScanResult(skillScanData);
        console.log('✅ Created SkillScan result');

        // 7. Create Notifications
        console.log('\n7️⃣  Creating notifications...');
        
        const notifications = [
            {
                userId: rukaiyaUser.userId,
                title: 'Payment Pending Approval',
                message: 'Your payment of ₹16,000 for completed order is pending approval',
                type: 'payment',
                actionUrl: '/orders'
            },
            {
                userId: rukaiyaUser.userId,
                title: 'Order Deadline Approaching',
                message: 'Bulk order deadline is in 11 days. 15 pieces remaining.',
                type: 'deadline',
                actionUrl: '/orders'
            },
            {
                userId: rukaiyaUser.userId,
                title: 'New Training Available',
                message: 'Advanced embroidery workshop starting next week',
                type: 'training',
                actionUrl: '/learning'
            }
        ];

        for (const notifData of notifications) {
            await db.createNotification(notifData);
        }
        console.log('✅ Created notifications');

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('✅ MOCK DATA POPULATION COMPLETE!');
        console.log('='.repeat(60));
        console.log('\n📊 Summary:');
        console.log(`   👤 Users: 3 (1 artisan, 2 buyers)`);
        console.log(`   📦 Orders: ${createdOrders.length}`);
        console.log(`   ⏰ Labour Records: ${labourRecords.length}`);
        console.log(`   🎓 SkillScan Results: 1`);
        console.log(`   🔔 Notifications: ${notifications.length}`);
        console.log('\n🎯 Test Login:');
        console.log(`   Email: rukaiya@example.com`);
        console.log(`   Password: artisan123`);
        console.log('\n💬 AI Sakhi can now answer questions about:');
        console.log(`   - Order progress (70% complete on sarees)`);
        console.log(`   - Pending payments (₹16,000)`);
        console.log(`   - Work-life balance`);
        console.log(`   - Skills and training`);
        console.log('\n');

    } catch (error) {
        console.error('❌ Error populating mock data:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    populateMockData()
        .then(() => {
            console.log('✅ Script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Script failed:', error);
            process.exit(1);
        });
}

module.exports = { populateMockData };
