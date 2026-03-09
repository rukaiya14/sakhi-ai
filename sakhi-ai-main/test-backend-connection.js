// Test backend connection
const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/ai-mentor/chat',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token-123'
    }
};

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('Response:', data);
        try {
            const json = JSON.parse(data);
            console.log('\nParsed Response:');
            console.log('- Success:', json.success);
            console.log('- Model:', json.model);
            console.log('- Response length:', json.response?.length || 0);
            console.log('- First 100 chars:', json.response?.substring(0, 100));
        } catch (e) {
            console.log('Could not parse JSON');
        }
    });
});

req.on('error', (error) => {
    console.error('Error:', error.message);
});

const body = JSON.stringify({
    message: 'hello',
    conversationHistory: []
});

req.write(body);
req.end();
