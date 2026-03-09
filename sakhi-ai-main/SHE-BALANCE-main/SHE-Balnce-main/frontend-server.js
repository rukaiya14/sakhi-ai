/**
 * Simple Frontend Server
 * Serves static HTML files on port 3000
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// Serve static files from current directory
app.use(express.static(__dirname));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'backend/uploads')));

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log('');
    console.log('='.repeat(60));
    console.log('🌸 SHE-BALANCE Frontend Server');
    console.log('='.repeat(60));
    console.log('');
    console.log(`✅ Server running on: http://localhost:${PORT}`);
    console.log('');
    console.log('📄 Available pages:');
    console.log(`   🏠 Home: http://localhost:${PORT}/index.html`);
    console.log(`   🔐 Login: http://localhost:${PORT}/login.html`);
    console.log(`   📊 Dashboard: http://localhost:${PORT}/dashboard.html`);
    console.log(`   📱 Test Messaging: http://localhost:${PORT}/test-messaging.html`);
    console.log('');
    console.log('⚠️  Make sure backend is running on port 5000!');
    console.log('');
    console.log('Press Ctrl+C to stop');
    console.log('='.repeat(60));
    console.log('');
});
