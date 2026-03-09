// Database Initialization Script
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
    console.log('🔧 Initializing SHE-BALANCE Database...\n');
    
    try {
        // Connect without database first
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });
        
        console.log('✅ Connected to MySQL server');
        
        // Create database if not exists
        const dbName = process.env.DB_NAME || 'shebalance';
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
        console.log(`✅ Database '${dbName}' created/verified`);
        
        // Use the database
        await connection.query(`USE ${dbName}`);
        
        // Read and execute schema file
        const schemaPath = path.join(__dirname, '..', 'database-schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = schema
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log(`\n📋 Executing ${statements.length} SQL statements...\n`);
        
        for (const statement of statements) {
            try {
                await connection.query(statement);
                // Extract table name for logging
                const match = statement.match(/CREATE TABLE (\w+)/i);
                if (match) {
                    console.log(`  ✓ Created table: ${match[1]}`);
                }
            } catch (error) {
                // Ignore "table already exists" errors
                if (!error.message.includes('already exists')) {
                    console.error(`  ✗ Error: ${error.message}`);
                }
            }
        }
        
        // Insert sample admin user
        const bcrypt = require('bcryptjs');
        const { v4: uuidv4 } = require('uuid');
        
        const adminId = uuidv4();
        const adminPassword = await bcrypt.hash('admin123', 10);
        
        try {
            await connection.query(`
                INSERT INTO users (user_id, email, password_hash, full_name, role, status)
                VALUES (?, 'admin@shebalance.com', ?, 'Admin User', 'admin', 'active')
            `, [adminId, adminPassword]);
            
            console.log('\n✅ Sample admin user created:');
            console.log('   Email: admin@shebalance.com');
            console.log('   Password: admin123');
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                console.log('\n⚠️  Admin user already exists');
            }
        }
        
        // Insert sample artisan
        const artisanUserId = uuidv4();
        const artisanId = uuidv4();
        const artisanPassword = await bcrypt.hash('artisan123', 10);
        
        try {
            await connection.query(`
                INSERT INTO users (user_id, email, password_hash, full_name, phone, role, status)
                VALUES (?, 'priya@example.com', ?, 'Priya Sharma', '+919876543210', 'artisan', 'active')
            `, [artisanUserId, artisanPassword]);
            
            await connection.query(`
                INSERT INTO artisan_profiles (artisan_id, user_id, skills, experience_years, location, bio, verification_status, rating)
                VALUES (?, ?, ?, 5, 'Mumbai, India', 'Expert in traditional embroidery and handloom weaving', 'verified', 4.8)
            `, [artisanId, artisanUserId, JSON.stringify(['embroidery', 'weaving', 'tailoring'])]);
            
            console.log('\n✅ Sample artisan user created:');
            console.log('   Email: priya@example.com');
            console.log('   Password: artisan123');
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                console.log('\n⚠️  Sample artisan already exists');
            }
        }
        
        // Insert sample buyer
        const buyerUserId = uuidv4();
        const buyerId = uuidv4();
        const buyerPassword = await bcrypt.hash('buyer123', 10);
        
        try {
            await connection.query(`
                INSERT INTO users (user_id, email, password_hash, full_name, phone, role, status)
                VALUES (?, 'rahul@example.com', ?, 'Rahul Kumar', '+919876543211', 'buyer', 'active')
            `, [buyerUserId, buyerPassword]);
            
            await connection.query(`
                INSERT INTO buyer_profiles (buyer_id, user_id, address)
                VALUES (?, ?, 'Delhi, India')
            `, [buyerId, buyerUserId]);
            
            console.log('\n✅ Sample buyer user created:');
            console.log('   Email: rahul@example.com');
            console.log('   Password: buyer123');
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                console.log('\n⚠️  Sample buyer already exists');
            }
        }
        
        console.log('\n🎉 Database initialization completed successfully!\n');
        
        await connection.end();
        
    } catch (error) {
        console.error('\n❌ Database initialization failed:', error.message);
        process.exit(1);
    }
}

// Run initialization
initializeDatabase();
