// Test with proper login
const http = require('http');

// Step 1: Login to get token
function login() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const json = JSON.parse(data);
                    console.log('✅ Login successful');
                    console.log('   Token:', json.token.substring(0, 20) + '...');
                    resolve(json.token);
                } else {
                    console.log('❌ Login failed:', data);
                    reject(new Error('Login failed'));
                }
            });
        });

        req.on('error', reject);
        req.write(JSON.stringify({
            email: 'rukaiya@example.com',
            password: 'password123'
        }));
        req.end();
    });
}

// Step 2: Test AI Mentor with valid token
function testAIMentor(token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/ai-mentor/chat',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        const req = http.request(options, (res) => {
            console.log(`\n📡 AI Mentor API Status: ${res.statusCode}`);
            
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    console.log('\n✅ Response received:');
                    console.log('   Success:', json.success);
                    console.log('   Model:', json.model);
                    console.log('   Response Time:', json.responseTime + 'ms');
                    console.log('   Response length:', json.response?.length || 0);
                    console.log('\n📝 AI Response:');
                    console.log(json.response);
                    resolve();
                } catch (e) {
                    console.log('❌ Could not parse response:', data);
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.write(JSON.stringify({
            message: 'hello',
            conversationHistory: []
        }));
        req.end();
    });
}

// Run test
(async () => {
    try {
        console.log('🔐 Step 1: Logging in...\n');
        const token = await login();
        
        console.log('\n🤖 Step 2: Testing AI Learning Mentor...\n');
        await testAIMentor(token);
        
        console.log('\n✅ Test complete!');
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
    }
})();
