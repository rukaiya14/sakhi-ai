/**
 * Test AI Sakhi Endpoint Directly
 * This simulates what the frontend does
 */

const axios = require('axios');

console.log('🧪 Testing AI Sakhi Chat Endpoint...\n');

async function testAISakhi() {
    try {
        console.log('📤 Sending test message to backend...');
        console.log('URL: http://localhost:5000/api/ai-sakhi/chat');
        console.log('Message: "Hello AI Sakhi!"\n');

        const response = await axios.post('http://localhost:5000/api/ai-sakhi/chat', {
            message: 'Hello AI Sakhi!',
            conversationHistory: []
        }, {
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0LXVzZXItaWQiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiYXJ0aXNhbiIsImlhdCI6MTYxNjIzOTAyMn0.test',
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        console.log('✅ SUCCESS! AI Sakhi responded!\n');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        console.log('\n🎉 AI Sakhi is working correctly!');
        
        return true;

    } catch (error) {
        console.error('❌ ERROR!\n');
        
        if (error.code === 'ECONNREFUSED') {
            console.error('Backend server is not running!');
            console.error('\nSOLUTION:');
            console.error('1. Open a new terminal');
            console.error('2. Run: cd SHE-BALANCE-main\\SHE-Balnce-main\\backend');
            console.error('3. Run: node server.js');
            console.error('4. Then run this test again');
        } else if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Error:', error.response.data);
            
            if (error.response.status === 401) {
                console.error('\nThis is just a token issue - the endpoint is working!');
            } else if (error.response.status === 500) {
                console.error('\nBackend error - check server logs for details');
            }
        } else {
            console.error('Error:', error.message);
        }
        
        return false;
    }
}

// Check if server is running first
async function checkServer() {
    try {
        await axios.get('http://localhost:5000/health', { timeout: 2000 });
        console.log('✅ Backend server is running\n');
        return true;
    } catch (error) {
        console.log('❌ Backend server is NOT running\n');
        console.log('Please start the backend server first:');
        console.log('  cd SHE-BALANCE-main\\SHE-Balnce-main\\backend');
        console.log('  node server.js\n');
        return false;
    }
}

// Run test
(async () => {
    const serverRunning = await checkServer();
    if (serverRunning) {
        await testAISakhi();
    }
    process.exit(0);
})();
