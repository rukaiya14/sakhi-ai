const fetch = require('node-fetch');

async function testLogin() {
    console.log('Testing login API...\n');
    
    const credentials = {
        email: 'priya@example.com',
        password: 'artisan123'
    };
    
    console.log('Credentials:', credentials);
    console.log('API URL: http://localhost:5000/api/auth/login\n');
    
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });
        
        const data = await response.json();
        
        console.log('Response Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
        
        if (response.ok) {
            console.log('\n✅ LOGIN SUCCESSFUL!');
            console.log('User:', data.user.fullName);
            console.log('Role:', data.user.role);
            console.log('Token:', data.token.substring(0, 30) + '...');
        } else {
            console.log('\n❌ LOGIN FAILED!');
            console.log('Error:', data.error);
        }
        
    } catch (error) {
        console.error('\n❌ CONNECTION ERROR:', error.message);
    }
}

testLogin();
