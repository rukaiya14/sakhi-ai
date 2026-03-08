/**
 * Test AI Sakhi Backend Integration
 */

const http = require('http');

// Test data
const testMessage = "I need help with payment";
const testToken = "test-token"; // You'll need a real token

// Test the AI Sakhi endpoint
function testAISakhi() {
    console.log('🧪 Testing AI Sakhi Backend...\n');
    
    const postData = JSON.stringify({
        message: testMessage,
        conversationHistory: []
    });
    
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/ai-sakhi/chat',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'Authorization': `Bearer ${testToken}`
        }
    };
    
    console.log('📤 Sending request to:', `http://localhost:5000${options.path}`);
    console.log('📝 Message:', testMessage);
    console.log('');
    
    const req = http.request(options, (res) => {
        let data = '';
        
        console.log('📊 Status Code:', res.statusCode);
        console.log('📋 Headers:', JSON.stringify(res.headers, null, 2));
        console.log('');
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                console.log('✅ Response received:');
                console.log(JSON.stringify(response, null, 2));
                console.log('');
                
                if (response.response) {
                    console.log('🤖 AI Sakhi says:');
                    console.log(response.response);
                    console.log('');
                    console.log('✅ Test PASSED - AI Sakhi is working!');
                } else if (response.error) {
                    console.log('❌ Error:', response.error);
                    console.log('⚠️ Test FAILED - Check error above');
                }
            } catch (error) {
                console.log('❌ Failed to parse response:', data);
                console.log('Error:', error.message);
            }
        });
    });
    
    req.on('error', (error) => {
        console.log('❌ Request failed:', error.message);
        console.log('');
        console.log('💡 Possible issues:');
        console.log('   1. Backend server not running on port 5000');
        console.log('   2. Network connection issue');
        console.log('   3. Server crashed or restarting');
        console.log('');
        console.log('🔧 Try:');
        console.log('   - Check if server is running: netstat -ano | findstr :5000');
        console.log('   - Restart server: node server.js');
    });
    
    req.write(postData);
    req.end();
}

// Test without authentication (should fail gracefully)
function testWithoutAuth() {
    console.log('\n🧪 Testing without authentication...\n');
    
    const postData = JSON.stringify({
        message: "Hello",
        conversationHistory: []
    });
    
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/ai-sakhi/chat',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    
    const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('Status:', res.statusCode);
            console.log('Response:', data);
            
            if (res.statusCode === 401) {
                console.log('✅ Authentication check working correctly');
            } else {
                console.log('⚠️ Expected 401 status code');
            }
        });
    });
    
    req.on('error', (error) => {
        console.log('❌ Request failed:', error.message);
    });
    
    req.write(postData);
    req.end();
}

// Check if server is running
function checkServer() {
    console.log('🔍 Checking if backend server is running...\n');
    
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/',
        method: 'GET'
    };
    
    const req = http.request(options, (res) => {
        console.log('✅ Server is running on port 5000');
        console.log('Status:', res.statusCode);
        console.log('');
        
        // Now test AI Sakhi
        testWithoutAuth();
    });
    
    req.on('error', (error) => {
        console.log('❌ Server is NOT running on port 5000');
        console.log('Error:', error.message);
        console.log('');
        console.log('🔧 Start the server with: node server.js');
    });
    
    req.end();
}

// Run tests
console.log('='.repeat(60));
console.log('AI SAKHI BACKEND TEST');
console.log('='.repeat(60));
console.log('');

checkServer();
