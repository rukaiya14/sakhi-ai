const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/ai-mentor/chat',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = http.request(options, (res) => {
    console.log(`\n📡 Status: ${res.statusCode}\n`);
    
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log('✅ Response received:\n');
            console.log('Success:', json.success);
            console.log('Model:', json.model);
            console.log('Response Time:', json.responseTime ? json.responseTime + 'ms' : 'N/A');
            if (json.error) {
                console.log('Error:', json.error);
            }
            console.log('\n📝 AI Response:');
            console.log(json.response);
            console.log('\n' + '='.repeat(60));
            
            if (json.model === 'llama3-70b') {
                console.log('✅ SUCCESS! Using Llama 3 70B from AWS Bedrock!');
            } else if (json.model === 'fallback') {
                console.log('⚠️  Using fallback - AWS not connected');
                if (json.error) {
                    console.log('   Reason:', json.error);
                }
            }
        } catch (e) {
            console.log('Response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Error:', error.message);
});

req.write(JSON.stringify({
    message: 'hello',
    conversationHistory: []
}));

req.end();
