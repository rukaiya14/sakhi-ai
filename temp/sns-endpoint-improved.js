/**
 * Improved SNS WhatsApp/SMS Endpoint
 * Replace the existing endpoint in server-dynamodb.js with this code
 */

// ==================== SNS WHATSAPP/SMS ROUTES ====================

// Send WhatsApp/SMS message via SNS
app.post('/api/sns/send-whatsapp', async (req, res) => {
    try {
        const { phoneNumber, messageType, orderId, message } = req.body;
        
        // Validate phone number
        if (!phoneNumber) {
            return res.status(400).json({ 
                success: false,
                error: 'Phone number is required' 
            });
        }
        
        // Validate phone number format (E.164)
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid phone number format',
                details: 'Use E.164 format (e.g., +919876543210 for India, +14155552671 for USA)',
                example: '+919876543210'
            });
        }
        
        // Check AWS credentials
        if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === '') {
            return res.status(500).json({ 
                success: false,
                error: 'AWS credentials not configured',
                details: 'AWS_ACCESS_KEY_ID is missing in .env file',
                solution: 'Add AWS credentials to backend/.env file'
            });
        }
        
        if (!process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY === '') {
            return res.status(500).json({ 
                success: false,
                error: 'AWS credentials not configured',
                details: 'AWS_SECRET_ACCESS_KEY is missing in .env file',
                solution: 'Add AWS credentials to backend/.env file'
            });
        }
        
        // Prepare message text
        let messageText = '';
        
        if (messageType === 'reminder') {
            // Order reminder message
            messageText = `🌸 SHE-BALANCE Order Reminder

📦 Order ID: ${orderId || 'N/A'}
⚠️ IMPORTANT: Please update your order progress.

Your order needs attention. Please log in to update the progress.

Update now: http://localhost:8080/dashboard.html

Need help? Contact support at 1800-XXX-XXXX

-- Team SHE-BALANCE 🌸`;
        } else if (messageType === 'custom' && message) {
            // Custom message
            messageText = message;
        } else {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid message type or missing message',
                details: 'messageType must be "reminder" or "custom". For custom, provide "message" field.'
            });
        }
        
        // Initialize AWS SNS with explicit credentials
        const AWS = require('aws-sdk');
        const sns = new AWS.SNS({ 
            region: process.env.AWS_REGION || 'us-east-1',
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        });
        
        // Prepare SNS parameters
        const params = {
            Message: messageText,
            PhoneNumber: phoneNumber,
            MessageAttributes: {
                'AWS.SNS.SMS.SMSType': {
                    DataType: 'String',
                    StringValue: 'Transactional'
                }
            }
        };
        
        // Log attempt
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📤 Sending SMS via AWS SNS`);
        console.log(`📞 To: ${phoneNumber}`);
        console.log(`📝 Type: ${messageType}`);
        console.log(`⏰ Time: ${new Date().toISOString()}`);
        console.log('='.repeat(60));
        
        // Send SMS via SNS
        const result = await sns.publish(params).promise();
        
        // Log success
        console.log(`✅ SMS sent successfully!`);
        console.log(`📱 Message ID: ${result.MessageId}`);
        console.log('='.repeat(60) + '\n');
        
        // Return success response
        res.json({
            success: true,
            message: 'SMS sent successfully via AWS SNS',
            messageId: result.MessageId,
            phoneNumber: phoneNumber,
            messageType: messageType,
            timestamp: new Date().toISOString(),
            note: '⚠️ This sends SMS, not WhatsApp. For WhatsApp, use WhatsApp Business API.',
            cost: 'Approximately $0.00645 per SMS'
        });
        
    } catch (error) {
        console.error('\n' + '='.repeat(60));
        console.error('❌ SNS Error occurred');
        console.error('='.repeat(60));
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
        console.error('='.repeat(60) + '\n');
        
        // Determine error type and provide helpful message
        let errorMessage = 'Failed to send SMS';
        let errorDetails = error.message;
        let solution = '';
        
        if (error.code === 'InvalidClientTokenId') {
            errorMessage = 'Invalid AWS Access Key ID';
            errorDetails = 'Your AWS_ACCESS_KEY_ID is invalid or incorrect';
            solution = 'Go to AWS IAM Console → Users → Security credentials → Create new access key';
        } else if (error.code === 'SignatureDoesNotMatch') {
            errorMessage = 'Invalid AWS Secret Access Key';
            errorDetails = 'Your AWS_SECRET_ACCESS_KEY is invalid or incorrect';
            solution = 'Check for typos in .env file or regenerate access keys in AWS IAM Console';
        } else if (error.code === 'AccessDenied' || error.code === 'AccessDeniedException') {
            errorMessage = 'Access Denied - Missing SNS Permissions';
            errorDetails = 'Your IAM user does not have permission to publish SNS messages';
            solution = 'Add SNS:Publish permission to your IAM user in AWS Console';
        } else if (error.code === 'InvalidParameter' || error.code === 'InvalidParameterException') {
            errorMessage = 'Invalid phone number format';
            errorDetails = 'Phone number must be in E.164 format';
            solution = 'Use format: +[country code][number] (e.g., +919876543210)';
        } else if (error.code === 'OptedOut') {
            errorMessage = 'Phone number has opted out';
            errorDetails = 'This phone number has opted out of receiving SMS messages';
            solution = 'Try a different phone number or contact AWS support to remove opt-out';
        } else if (error.code === 'Throttling' || error.code === 'ThrottlingException') {
            errorMessage = 'Rate limit exceeded';
            errorDetails = 'Too many SMS messages sent in a short time';
            solution = 'Wait a few minutes before sending more messages';
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

// Get SMS sending statistics
app.get('/api/sns/stats', async (req, res) => {
    try {
        // Check AWS credentials
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
            return res.status(500).json({ 
                error: 'AWS credentials not configured' 
            });
        }
        
        const AWS = require('aws-sdk');
        const sns = new AWS.SNS({ 
            region: process.env.AWS_REGION || 'us-east-1',
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        });
        
        // Get SMS attributes
        const attrs = await sns.getSMSAttributes().promise();
        
        res.json({
            success: true,
            region: process.env.AWS_REGION || 'us-east-1',
            attributes: attrs.attributes || {},
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error getting SNS stats:', error);
        res.status(500).json({ 
            error: 'Failed to get SNS statistics',
            details: error.message 
        });
    }
});

// Test SNS connection
app.get('/api/sns/test-connection', async (req, res) => {
    try {
        // Check AWS credentials
        if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === '') {
            return res.json({ 
                success: false,
                configured: false,
                error: 'AWS_ACCESS_KEY_ID not configured',
                solution: 'Add AWS credentials to .env file'
            });
        }
        
        if (!process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY === '') {
            return res.json({ 
                success: false,
                configured: false,
                error: 'AWS_SECRET_ACCESS_KEY not configured',
                solution: 'Add AWS credentials to .env file'
            });
        }
        
        const AWS = require('aws-sdk');
        const sns = new AWS.SNS({ 
            region: process.env.AWS_REGION || 'us-east-1',
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        });
        
        // Try to get SMS attributes (this tests permissions)
        await sns.getSMSAttributes().promise();
        
        res.json({
            success: true,
            configured: true,
            message: 'AWS SNS connection successful',
            region: process.env.AWS_REGION || 'us-east-1',
            accessKeyId: process.env.AWS_ACCESS_KEY_ID.substring(0, 8) + '...',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        let errorMessage = error.message;
        let solution = '';
        
        if (error.code === 'InvalidClientTokenId') {
            errorMessage = 'Invalid AWS Access Key ID';
            solution = 'Generate new access keys in AWS IAM Console';
        } else if (error.code === 'SignatureDoesNotMatch') {
            errorMessage = 'Invalid AWS Secret Access Key';
            solution = 'Check .env file for typos or regenerate keys';
        } else if (error.code === 'AccessDenied') {
            errorMessage = 'Missing SNS permissions';
            solution = 'Add SNS:Publish and SNS:GetSMSAttributes permissions to IAM user';
        }
        
        res.json({
            success: false,
            configured: true,
            error: errorMessage,
            solution: solution,
            code: error.code,
            timestamp: new Date().toISOString()
        });
    }
});

console.log('✅ SNS routes configured');
console.log('   POST /api/sns/send-whatsapp - Send SMS via SNS');
console.log('   GET  /api/sns/stats - Get SMS statistics');
console.log('   GET  /api/sns/test-connection - Test SNS connection');
