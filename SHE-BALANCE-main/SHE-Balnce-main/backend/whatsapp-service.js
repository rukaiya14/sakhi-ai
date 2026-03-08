/**
 * WhatsApp Service using Twilio
 * Send WhatsApp messages to users
 */

require('dotenv').config();

// Check if Twilio is configured
const isTwilioConfigured = () => {
    return !!(
        process.env.TWILIO_ACCOUNT_SID && 
        process.env.TWILIO_AUTH_TOKEN && 
        process.env.TWILIO_WHATSAPP_NUMBER
    );
};

// Initialize Twilio client (lazy loading)
let twilioClient = null;

const getTwilioClient = () => {
    if (!twilioClient && isTwilioConfigured()) {
        const twilio = require('twilio');
        twilioClient = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
    }
    return twilioClient;
};

/**
 * Send WhatsApp message
 * @param {string} to - Recipient phone number (E.164 format)
 * @param {string} message - Message text
 * @returns {Promise<object>} - Message details
 */
async function sendWhatsAppMessage(to, message) {
    if (!isTwilioConfigured()) {
        throw new Error('Twilio WhatsApp is not configured. Please add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER to .env file');
    }
    
    const client = getTwilioClient();
    
    // Format phone numbers for WhatsApp
    const fromWhatsApp = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;
    const toWhatsApp = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    
    try {
        const result = await client.messages.create({
            from: fromWhatsApp,
            to: toWhatsApp,
            body: message
        });
        
        return {
            success: true,
            messageId: result.sid,
            status: result.status,
            to: to,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('WhatsApp send error:', error);
        throw error;
    }
}

/**
 * Send order reminder via WhatsApp
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} orderId - Order ID
 * @param {object} orderDetails - Order details (optional)
 * @returns {Promise<object>} - Message details
 */
async function sendOrderReminder(phoneNumber, orderId, orderDetails = {}) {
    const artisanName = orderDetails.artisanName || 'Artisan';
    const orderTitle = orderDetails.title || 'Your Order';
    const progress = orderDetails.progress || 0;
    const daysInactive = orderDetails.daysInactive || 0;
    const deadline = orderDetails.deadline || 'Soon';
    
    const message = `🌸 *SHE-BALANCE Order Update Reminder*

नमस्ते ${artisanName} जी! 🙏

📦 *Order Details:*
• Order ID: ${orderId}
• Item: ${orderTitle}
• Current Progress: ${progress}%
• Deadline: ${deadline}

${daysInactive > 0 ? `⚠️ *Notice:* No update for ${daysInactive} days` : ''}

${progress < 100 ? `
📊 *Please Update Your Progress:*
✅ Log in to your dashboard
✅ Update order status
✅ Keep customers informed
` : ''}

🔗 *Update Now:*
http://localhost:8080/dashboard.html

💬 *Need Help?*
Contact support: 1800-XXX-XXXX

धन्यवाद! 💚
-- Team SHE-BALANCE`;

    return await sendWhatsAppMessage(phoneNumber, message);
}

/**
 * Send custom WhatsApp message
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} message - Custom message
 * @returns {Promise<object>} - Message details
 */
async function sendCustomMessage(phoneNumber, message) {
    return await sendWhatsAppMessage(phoneNumber, message);
}

/**
 * Check if WhatsApp is configured
 * @returns {boolean}
 */
function isWhatsAppConfigured() {
    return isTwilioConfigured();
}

/**
 * Get WhatsApp configuration status
 * @returns {object}
 */
function getWhatsAppStatus() {
    return {
        configured: isTwilioConfigured(),
        accountSid: process.env.TWILIO_ACCOUNT_SID ? 
            process.env.TWILIO_ACCOUNT_SID.substring(0, 8) + '...' : 'Not set',
        whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || 'Not set'
    };
}

module.exports = {
    sendWhatsAppMessage,
    sendOrderReminder,
    sendCustomMessage,
    isWhatsAppConfigured,
    getWhatsAppStatus
};
