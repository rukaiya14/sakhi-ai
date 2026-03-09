/**
 * WhatsApp Routes for Express Server
 * Add these routes to your server-dynamodb.js
 */

const whatsappService = require('./whatsapp-service');

module.exports = function(app) {
    
    // ==================== WHATSAPP ROUTES ====================
    
    // Send WhatsApp message
    app.post('/api/whatsapp/send', async (req, res) => {
        try {
            const { phoneNumber, messageType, orderId, message, orderDetails } = req.body;
            
            // Validate phone number
            if (!phoneNumber) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Phone number is required' 
                });
            }
            
            // Check if WhatsApp is configured
            if (!whatsappService.isWhatsAppConfigured()) {
                return res.status(500).json({ 
                    success: false,
                    error: 'WhatsApp is not configured',
                    details: 'Please add Twilio credentials to .env file',
                    guide: 'See WHATSAPP_SETUP_GUIDE.md for setup instructions'
                });
            }
            
            // Validate phone number format (E.164)
            const phoneRegex = /^\+[1-9]\d{1,14}$/;
            if (!phoneRegex.test(phoneNumber)) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Invalid phone number format',
                    details: 'Use E.164 format (e.g., +919876543210 for India)',
                    example: '+919876543210'
                });
            }
            
            let result;
            
            // Send based on message type
            if (messageType === 'reminder') {
                result = await whatsappService.sendOrderReminder(
                    phoneNumber, 
                    orderId || 'N/A',
                    orderDetails || {}
                );
            } else if (messageType === 'custom' && message) {
                result = await whatsappService.sendCustomMessage(phoneNumber, message);
            } else {
                return res.status(400).json({ 
                    success: false,
                    error: 'Invalid message type or missing message',
                    details: 'messageType must be "reminder" or "custom". For custom, provide "message" field.'
                });
            }
            
            // Log success
            console.log(`\n${'='.repeat(60)}`);
            console.log(`📱 WhatsApp message sent successfully`);
            console.log(`📞 To: ${phoneNumber}`);
            console.log(`📝 Type: ${messageType}`);
            console.log(`📨 Message ID: ${result.messageId}`);
            console.log(`⏰ Time: ${new Date().toISOString()}`);
            console.log('='.repeat(60) + '\n');
            
            // Return success response
            res.json({
                success: true,
                message: 'WhatsApp message sent successfully',
                messageId: result.messageId,
                status: result.status,
                phoneNumber: phoneNumber,
                messageType: messageType,
                timestamp: result.timestamp,
                platform: 'Twilio WhatsApp'
            });
            
        } catch (error) {
            console.error('\n' + '='.repeat(60));
            console.error('❌ WhatsApp Error occurred');
            console.error('='.repeat(60));
            console.error('Error Code:', error.code);
            console.error('Error Message:', error.message);
            console.error('='.repeat(60) + '\n');
            
            // Determine error type and provide helpful message
            let errorMessage = 'Failed to send WhatsApp message';
            let errorDetails = error.message;
            let solution = '';
            
            if (error.code === 21211) {
                errorMessage = 'Invalid phone number';
                errorDetails = 'The phone number is not valid';
                solution = 'Check phone number format (E.164: +919876543210)';
            } else if (error.code === 21408) {
                errorMessage = 'Permission denied';
                errorDetails = 'Cannot send to this number';
                solution = 'Make sure the recipient has joined your WhatsApp sandbox';
            } else if (error.code === 21606) {
                errorMessage = 'Phone not opted in';
                errorDetails = 'The phone number has not joined the WhatsApp sandbox';
                solution = 'Ask the recipient to send "join <your-code>" to your Twilio WhatsApp number';
            } else if (error.code === 20003) {
                errorMessage = 'Authentication failed';
                errorDetails = 'Invalid Twilio credentials';
                solution = 'Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env file';
            }
            
            res.status(500).json({ 
                success: false,
                error: errorMessage,
                details: errorDetails,
                solution: solution,
                code: error.code,
                timestamp: new Date().toISOString()
            });
        }
    });
    
    // Test WhatsApp connection
    app.get('/api/whatsapp/test-connection', async (req, res) => {
        try {
            const status = whatsappService.getWhatsAppStatus();
            
            if (!status.configured) {
                return res.json({ 
                    success: false,
                    configured: false,
                    error: 'WhatsApp not configured',
                    solution: 'Add Twilio credentials to .env file',
                    guide: 'See WHATSAPP_SETUP_GUIDE.md'
                });
            }
            
            res.json({
                success: true,
                configured: true,
                message: 'WhatsApp is configured',
                accountSid: status.accountSid,
                whatsappNumber: status.whatsappNumber,
                platform: 'Twilio WhatsApp',
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            res.json({
                success: false,
                configured: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    });
    
    // Get WhatsApp status
    app.get('/api/whatsapp/status', (req, res) => {
        const status = whatsappService.getWhatsAppStatus();
        res.json({
            ...status,
            platform: 'Twilio WhatsApp',
            timestamp: new Date().toISOString()
        });
    });
    
    console.log('✅ WhatsApp routes configured');
    console.log('   POST /api/whatsapp/send - Send WhatsApp message');
    console.log('   GET  /api/whatsapp/test-connection - Test WhatsApp connection');
    console.log('   GET  /api/whatsapp/status - Get WhatsApp status');
};
