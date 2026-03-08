// Test the progress API endpoint
const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/learning/progress',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

console.log('Testing /api/learning/progress endpoint...\n');

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('\nResponse:');
        try {
            const json = JSON.parse(data);
            console.log(JSON.stringify(json, null, 2));
            
            console.log('\n=== SUMMARY ===');
            console.log('Overall Progress:', json.overallProgress + '%');
            console.log('Skills Mastered:', json.skillsMastered + '/' + json.totalSkills);
            console.log('Learning Hours:', json.learningHours + 'h');
            console.log('Current Skills:', json.currentSkills?.join(', ') || 'None');
            console.log('User Name:', json.userName || 'Not provided');
            console.log('Experience Years:', json.experienceYears || 'Not provided');
        } catch (e) {
            console.log(data);
        }
    });
});

req.on('error', (error) => {
    console.error('Error:', error.message);
});

req.end();
