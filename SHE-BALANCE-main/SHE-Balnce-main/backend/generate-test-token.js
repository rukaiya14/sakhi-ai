/**
 * Generate a test JWT token for AI Sakhi testing
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key-change-in-production';

// Create test user
const testUser = {
    userId: 'test-user-123',
    email: 'test@shebalance.com',
    name: 'Test User',
    role: 'artisan'
};

// Generate token
const token = jwt.sign(testUser, JWT_SECRET, { expiresIn: '24h' });

console.log('='.repeat(60));
console.log('🔑 Test JWT Token Generated');
console.log('='.repeat(60));
console.log('');
console.log('Token:');
console.log(token);
console.log('');
console.log('='.repeat(60));
console.log('');
console.log('📋 To use this token:');
console.log('');
console.log('1. Open browser console (F12)');
console.log('2. Run this command:');
console.log('');
console.log(`localStorage.setItem('shebalance_token', '${token}');`);
console.log(`localStorage.setItem('shebalance_user', '${JSON.stringify(JSON.stringify(testUser))}');`);
console.log('');
console.log('3. Refresh the page');
console.log('4. Try AI Sakhi chat');
console.log('');
console.log('='.repeat(60));
console.log('');
console.log('✅ Token valid for 24 hours');
console.log('');
