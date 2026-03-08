/**
 * Add 50 More Artisans to DynamoDB
 * Diverse skills, locations, and experience levels
 */

const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Configure AWS
AWS.config.update({
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tablePrefix = process.env.DYNAMODB_TABLE_PREFIX || 'shebalance-';

// Indian female names
const firstNames = [
    'Priya', 'Anjali', 'Kavita', 'Deepa', 'Sunita', 'Rekha', 'Pooja', 'Neha', 'Ritu', 'Sonia',
    'Meera', 'Lakshmi', 'Radha', 'Geeta', 'Savita', 'Kamala', 'Asha', 'Usha', 'Nisha', 'Seema',
    'Anita', 'Mamta', 'Shanti', 'Kiran', 'Poonam', 'Jyoti', 'Sarita', 'Vandana', 'Archana', 'Renu',
    'Sangeeta', 'Madhuri', 'Shobha', 'Lata', 'Manju', 'Pushpa', 'Sushma', 'Veena', 'Leela', 'Gita',
    'Rajni', 'Sudha', 'Nirmala', 'Shakuntala', 'Parvati', 'Durga', 'Saraswati', 'Indira', 'Kamini', 'Nalini'
];

const lastNames = [
    'Sharma', 'Verma', 'Patel', 'Singh', 'Kumar', 'Devi', 'Khan', 'Gupta', 'Reddy', 'Nair',
    'Iyer', 'Menon', 'Rao', 'Desai', 'Joshi', 'Mehta', 'Shah', 'Agarwal', 'Banerjee', 'Chatterjee',
    'Das', 'Ghosh', 'Roy', 'Mukherjee', 'Bose', 'Sen', 'Kapoor', 'Malhotra', 'Khanna', 'Chopra',
    'Arora', 'Bhatia', 'Sethi', 'Sinha', 'Mishra', 'Pandey', 'Tiwari', 'Dubey', 'Shukla', 'Tripathi',
    'Yadav', 'Chauhan', 'Rajput', 'Thakur', 'Jain', 'Agrawal', 'Saxena', 'Srivastava', 'Varma', 'Pillai'
];

// Delhi locations
const locations = [
    'Chandni Chowk, Delhi', 'Lajpat Nagar, Delhi', 'Sarojini Nagar, Delhi', 'Karol Bagh, Delhi',
    'Connaught Place, Delhi', 'Hauz Khas, Delhi', 'Greater Kailash, Delhi', 'Vasant Vihar, Delhi',
    'Nehru Place, Delhi', 'Dwarka, Delhi', 'Rohini, Delhi', 'Pitampura, Delhi', 'Janakpuri, Delhi',
    'Mayur Vihar, Delhi', 'Laxmi Nagar, Delhi', 'Kalkaji, Delhi', 'Saket, Delhi', 'Malviya Nagar, Delhi',
    'Green Park, Delhi', 'Rajouri Garden, Delhi', 'Punjabi Bagh, Delhi', 'Paschim Vihar, Delhi',
    'Uttam Nagar, Delhi', 'Vikaspuri, Delhi', 'Tilak Nagar, Delhi'
];

// Skill combinations
const skillSets = [
    ['embroidery', 'tailoring'],
    ['weaving', 'textile'],
    ['pottery', 'ceramics'],
    ['jewelry', 'beading'],
    ['henna', 'body art'],
    ['crochet', 'knitting'],
    ['quilting', 'patchwork'],
    ['embroidery', 'beading'],
    ['tailoring', 'fashion design'],
    ['weaving', 'handloom'],
    ['pottery', 'sculpture'],
    ['jewelry', 'metalwork'],
    ['painting', 'art'],
    ['woodwork', 'carving'],
    ['leatherwork', 'crafts'],
    ['basket weaving', 'crafts'],
    ['block printing', 'textile'],
    ['tie-dye', 'textile'],
    ['macrame', 'crafts'],
    ['candle making', 'crafts'],
    ['soap making', 'crafts'],
    ['paper crafts', 'origami'],
    ['glass painting', 'art'],
    ['fabric painting', 'textile'],
    ['embroidery', 'cross-stitch']
];

/**
 * Generate 50 artisan users
 */
async function generate50Artisans() {
    console.log('🚀 Generating 50 artisan users...\n');
    
    const artisans = [];
    
    for (let i = 0; i < 50; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const fullName = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 5}@shebalance.com`;
        
        // Random skills (1-3 skills)
        const skillSet = skillSets[Math.floor(Math.random() * skillSets.length)];
        const numSkills = Math.floor(Math.random() * 2) + 1; // 1-2 skills
        const skills = skillSet.slice(0, numSkills);
        
        // Random experience (1-15 years)
        const experienceYears = Math.floor(Math.random() * 15) + 1;
        
        // Random rating (4.0-5.0)
        const rating = (Math.random() * 1 + 4).toFixed(1);
        
        // Random location
        const location = locations[Math.floor(Math.random() * locations.length)];
        
        // Random orders and earnings based on experience
        const totalOrders = Math.floor(Math.random() * experienceYears * 10) + 5;
        const totalEarnings = totalOrders * (Math.floor(Math.random() * 3000) + 2000);
        
        artisans.push({
            fullName,
            email,
            password: 'artisan123', // Will be hashed
            phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            skills,
            experienceYears,
            rating: parseFloat(rating),
            location,
            totalOrders,
            totalEarnings,
            bio: `Experienced ${skills.join(' and ')} artisan with ${experienceYears} years of expertise.`
        });
    }
    
    return artisans;
}

/**
 * Add artisans to DynamoDB
 */
async function addArtisansToDB(artisans) {
    console.log(`📊 Adding ${artisans.length} artisans to DynamoDB...\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const artisan of artisans) {
        try {
            // Hash password
            const passwordHash = await bcrypt.hash(artisan.password, 10);
            
            // Create user
            const userId = uuidv4();
            const timestamp = new Date().toISOString();
            
            const userItem = {
                userId,
                email: artisan.email,
                passwordHash,
                fullName: artisan.fullName,
                phone: artisan.phone,
                role: 'artisan',
                status: 'verified',
                profileImage: null,
                createdAt: timestamp,
                updatedAt: timestamp,
                lastLogin: null,
                emailVerified: true,
                phoneVerified: true
            };
            
            await dynamodb.put({
                TableName: `${tablePrefix}users`,
                Item: userItem
            }).promise();
            
            // Create artisan profile
            const artisanId = uuidv4();
            
            const artisanItem = {
                artisanId,
                userId,
                skills: artisan.skills,
                experienceYears: artisan.experienceYears,
                location: artisan.location,
                bio: artisan.bio,
                portfolioImages: [],
                certifications: [],
                rating: artisan.rating,
                totalOrders: artisan.totalOrders,
                totalEarnings: artisan.totalEarnings,
                verificationStatus: 'verified',
                verificationDocuments: [],
                bankDetails: {},
                availabilityStatus: 'available'
            };
            
            await dynamodb.put({
                TableName: `${tablePrefix}artisan-profiles`,
                Item: artisanItem
            }).promise();
            
            successCount++;
            console.log(`✅ ${successCount}. ${artisan.fullName} (${artisan.skills.join(', ')}) - ${artisan.location}`);
            
        } catch (error) {
            errorCount++;
            console.error(`❌ Failed to add ${artisan.fullName}:`, error.message);
        }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Successfully added: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   📈 Total artisans in database: ${successCount + 4} (including original 4)`);
}

/**
 * Main function
 */
async function main() {
    console.log('============================================================');
    console.log('  Add 50 More Artisans to DynamoDB');
    console.log('============================================================\n');
    
    try {
        // Generate artisans
        const artisans = await generate50Artisans();
        
        // Add to DynamoDB
        await addArtisansToDB(artisans);
        
        console.log('\n============================================================');
        console.log('  ✅ Complete!');
        console.log('============================================================\n');
        console.log('Now you have 54 artisans in DynamoDB!');
        console.log('\nTest the Virtual Factory:');
        console.log('1. Restart backend server');
        console.log('2. Click "View All" or "AI Match Categories"');
        console.log('3. See many more artisans matched!\n');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { generate50Artisans, addArtisansToDB };
