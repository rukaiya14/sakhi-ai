# WhatsApp Integration - Corporate Dashboard

## ✅ Implementation Complete!

The corporate dashboard now has WhatsApp integration for both "Request Quote" and "Send Message" buttons.

## 🔧 How to Update Your WhatsApp Number

### Step 1: Open the JavaScript File
Open: `SHE-BALANCE-main/SHE-Balnce-main/corporate-dashboard.js`

### Step 2: Find and Replace Your Number
Look for these two functions and replace the WhatsApp number:

```javascript
// In contactArtisan function (line ~260)
const whatsappNumber = '919876543210'; // Replace with your number

// In sendWhatsAppMessage function (line ~300)
const whatsappNumber = '919876543210'; // Replace with your number
```

### Step 3: Format Your Number Correctly
- Remove all spaces, dashes, and the + sign
- Format: `CountryCode + PhoneNumber`
- Example for India: `919876543210`
- Example for US: `14155551234`

## 📱 How It Works

### Request Quote Button
When clicked, it opens WhatsApp with a detailed message including:
- Corporate buyer's name and company
- Artisan details (name, skill, location)
- Capacity and bulk discount information
- Specific discussion points (pricing, delivery, customization)

### Send Message Button
When clicked, it opens WhatsApp with a general inquiry message including:
- Corporate buyer's introduction
- Artisan profile summary
- Interest in collaboration

## 🎨 Features

1. **Two Action Buttons**: Each artisan card now has:
   - 📄 Request Quote (Orange button)
   - 💬 Send Message (Green WhatsApp button)

2. **Custom Messages**: Pre-filled messages with all relevant details

3. **Professional Format**: Messages include:
   - Buyer information
   - Artisan details
   - Structured formatting with bullet points
   - Clear call-to-action

4. **Responsive Design**: Buttons adapt to different screen sizes

## 🧪 Testing

1. Open the corporate dashboard: `corporate-dashboard.html`
2. Click on any artisan's "Request Quote" or "Send Message" button
3. WhatsApp Web/App will open with the pre-filled message
4. The message will be sent to your configured number

## 📝 Customization Options

### Change Message Templates
Edit the `message` variable in both functions to customize:
- Greeting style
- Information included
- Discussion points
- Closing remarks

### Change Button Colors
Edit `corporate-dashboard.css`:
```css
.btn-message {
    background: #25D366; /* WhatsApp green */
}

.btn-contact {
    background: var(--secondary-color); /* Orange */
}
```

### Add More Artisan Details
Modify the artisan data in `corporate-dashboard.js` to include:
- Phone numbers
- Email addresses
- Portfolio links
- Certifications

## 🚀 Next Steps

1. Replace the placeholder WhatsApp number with your actual number
2. Test the integration
3. Customize message templates if needed
4. Consider adding analytics to track quote requests

## 💡 Tips

- Make sure your WhatsApp number is active and can receive messages
- Test on both mobile and desktop
- The messages are URL-encoded, so special characters work fine
- You can add emojis to make messages more friendly

## 🔗 WhatsApp URL Format

```
https://wa.me/[PHONE_NUMBER]?text=[ENCODED_MESSAGE]
```

Example:
```
https://wa.me/919876543210?text=Hello%20from%20SheBalance
```

---

**Need Help?** Check the WhatsApp Business API documentation for advanced features.
