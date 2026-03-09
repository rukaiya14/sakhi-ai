/**
 * AI Learning Mentor - Frontend JavaScript
 * Connects to backend API for personalized learning guidance
 */

const API_BASE_URL = 'http://localhost:5000/api';
let conversationHistory = [];
let userToken = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Get auth token - try multiple storage locations
    userToken = localStorage.getItem('token') || 
                localStorage.getItem('authToken') || 
                sessionStorage.getItem('token') ||
                sessionStorage.getItem('authToken');
    
    // For testing, create a dummy token if none exists
    if (!userToken) {
        console.log('No token found, creating test token');
        userToken = 'test-token-' + Date.now();
        localStorage.setItem('token', userToken);
    }

    // Load user progress
    loadUserProgress();
    
    // Focus input
    document.getElementById('messageInput').focus();
});

/**
 * Load user progress from backend
 */
async function loadUserProgress() {
    try {
        const response = await fetch(`${API_BASE_URL}/learning/progress`, {
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateProgressDisplay(data);
        } else {
            // Use default values if API fails
            console.log('Using default progress values');
            updateProgressDisplay({
                overallProgress: 0,
                skillsMastered: 0,
                totalSkills: 10,
                learningHours: 0
            });
        }
    } catch (error) {
        console.log('Could not load progress:', error);
        // Use default values
        updateProgressDisplay({
            overallProgress: 0,
            skillsMastered: 0,
            totalSkills: 10,
            learningHours: 0
        });
    }
}

/**
 * Update progress display
 */
function updateProgressDisplay(data) {
    const overallProgress = data.overallProgress || 0;
    const skillsMastered = data.skillsMastered || 0;
    const totalSkills = data.totalSkills || 10;
    const learningHours = data.learningHours || 0;

    document.getElementById('overallProgress').textContent = `${overallProgress}%`;
    document.getElementById('overallProgressBar').style.width = `${overallProgress}%`;

    document.getElementById('skillsMastered').textContent = `${skillsMastered}/${totalSkills}`;
    const skillsPercent = (skillsMastered / totalSkills) * 100;
    document.getElementById('skillsProgressBar').style.width = `${skillsPercent}%`;

    document.getElementById('learningHours').textContent = `${learningHours}h`;
    const hoursPercent = Math.min((learningHours / 100) * 100, 100);
    document.getElementById('hoursProgressBar').style.width = `${hoursPercent}%`;
}

/**
 * Send message to AI mentor
 */
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();

    if (!message) return;

    // Disable input
    input.disabled = true;
    document.getElementById('sendBtn').disabled = true;

    // Add user message to chat
    addMessage(message, 'user');
    input.value = '';

    // Show typing indicator
    showTypingIndicator();

    try {
        // Call backend API
        const response = await fetch(`${API_BASE_URL}/ai-mentor/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({
                message: message,
                conversationHistory: conversationHistory
            })
        });

        hideTypingIndicator();

        if (response.ok) {
            const data = await response.json();
            
            // Add AI response to chat
            addMessage(data.response, 'mentor');

            // Update conversation history
            conversationHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: data.response }
            );

            // Keep only last 10 messages
            if (conversationHistory.length > 10) {
                conversationHistory = conversationHistory.slice(-10);
            }
        } else {
            // Fallback response if API fails
            const fallbackResponse = getFallbackResponse(message);
            addMessage(fallbackResponse, 'mentor');
        }
    } catch (error) {
        hideTypingIndicator();
        console.error('Chat error:', error);
        
        // Fallback response if connection fails
        const fallbackResponse = getFallbackResponse(message);
        addMessage(fallbackResponse, 'mentor');
    }

    // Re-enable input
    input.disabled = false;
    document.getElementById('sendBtn').disabled = false;
    input.focus();
}

/**
 * Get fallback response when API is unavailable
 */
function getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Crochet specific
    if (lowerMessage.includes('crochet')) {
        return `Hey! 😊 Crochet is such a beautiful choice!

I love that you want to learn this. It's actually one of the easiest crafts to start with, and you can make money from it pretty quickly!

Here's how we can get you started:

🧶 First 2 weeks:
Learn the basic stitches - chain, single crochet, double crochet. Practice for just 30 minutes daily!

🧶 Next 2 weeks:
Make simple things like coasters and dishcloths. These are great for practice and you can even sell them!

🧶 After a month:
Start making scarves, bags, or cute amigurumi toys. These sell really well! 💰

You can earn ₹500-2000 per item once you get good at it.

The best part? You only need ₹300-500 to start - just yarn and a hook!

Want me to suggest some good YouTube channels to learn from?`;
    }
    
    // Embroidery
    if (lowerMessage.includes('embroid')) {
        return `Wonderful choice! 🪡 Embroidery is so beautiful and in high demand right now!

I'm excited to help you learn this. Women are making really good money from embroidery work - especially on sarees and cushions.

Let me break it down for you:

🪡 Month 1 - Basics:
Start with simple stitches like backstitch and satin stitch. Practice on old cloth first!

🪡 Month 2 - Getting Better:
Learn French knots and lazy daisy. Try making simple floral patterns.

🪡 Month 3 - Ready to Sell:
Create beautiful designs on cushion covers, sarees, or wall hangings! 💰

You can charge ₹1000-5000 per piece depending on the work.

Starting cost? Just ₹200-300 for threads, needles, and fabric!

Should I tell you which stitches to learn first?`;
    }
    
    // Cooking/culinary
    if (lowerMessage.includes('cook') || lowerMessage.includes('chef') || lowerMessage.includes('food') || lowerMessage.includes('baking')) {
        return `That's amazing! 👩‍🍳 Food business is one of the best ways to earn steady income!

So many women are running successful tiffin services and home bakeries now. You can too!

Here's your path:

👩‍🍳 First Month:
Master 5-10 dishes really well. Focus on what you already cook best!

👩‍🍳 Second Month:
Start with 2-3 regular customers. Get their feedback and improve.

👩‍🍳 Third Month:
Grow to 10-15 customers. You'll be earning ₹10,000-30,000/month! 💰

Best options:
• Tiffin service (daily meals)
• Weekend baking orders
• Party catering
• Healthy meal prep

You can start with what you already have in your kitchen!

What type of food do you love cooking? Let's build your menu! 🍴`;
    }
    
    // Tailoring/sewing
    if (lowerMessage.includes('tailor') || lowerMessage.includes('sewing') || lowerMessage.includes('stitch')) {
        return `Perfect! ✂️ Tailoring is such a valuable skill!

You know what's great? There's ALWAYS demand for good tailors. Especially for blouse stitching!

Let me show you the path:

✂️ Month 1:
Learn to use the machine properly and take accurate measurements. Practice on old clothes!

✂️ Month 2-3:
Start with simple alterations - hemming, fitting. Then move to blouse stitching.

✂️ Month 4 onwards:
Make full outfits! Kurtis, dresses, even bridal wear! 💰

Earnings:
• Simple alterations: ₹50-200
• Blouse stitching: ₹300-800
• Full outfits: ₹1000-3000

If you already have a sewing machine, you're ready to start!

Want to know the most in-demand items to stitch?`;
    }
    
    // Weaving
    if (lowerMessage.includes('weav')) {
        return `Beautiful choice! 🧵 Weaving is such a traditional and respected art!

Modern customers LOVE handwoven items. They pay premium prices for authentic handmade work!

Here's how to start:

🧵 Month 1:
Understand different loom types. You can start with a simple frame loom (₹1000-2000).

🧵 Month 2-3:
Learn basic patterns and color combinations. Make simple scarves and table runners.

🧵 Month 4-6:
Create market-ready products! Shawls, stoles, home decor items. 💰

You can earn ₹800-5000 per piece!

The beautiful thing? Each piece is unique and customers value that!

Want to know which loom is best for beginners?`;
    }
    
    // General craft learning
    if (lowerMessage.includes('craft') || lowerMessage.includes('handmade') || lowerMessage.includes('art')) {
        return `Yay! 🎨 I'm so happy you want to learn crafts!

Let me tell you about the most popular ones right now:

🧶 Crochet (Super easy to start!)
Learn in: 2-3 months
Earn: ₹500-2000/item

🪡 Embroidery (Beautiful & profitable)
Learn in: 3-4 months  
Earn: ₹1000-5000/piece

💍 Jewelry Making (Creative & fun!)
Learn in: 1-2 months
Earn: ₹300-3000/piece

🎨 Fabric Painting (Artistic)
Learn in: 2 months
Earn: ₹800-4000/item

All of these have good demand and you can start with small investment!

Which one sounds most interesting to you? Or tell me what you like doing and I'll suggest the perfect craft! ✨`;
    }
    
    // Learning path request
    if (lowerMessage.includes('learning path') || lowerMessage.includes('roadmap') || lowerMessage.includes('plan')) {
        return `I'd love to create a perfect learning plan for you! 😊

To make it just right for you, tell me:

1️⃣ Which skill excites you most?
(Like crochet, cooking, embroidery, tailoring...)

2️⃣ How much time can you give daily?
(Even 30 minutes is great!)

3️⃣ What's your goal?
(Earn money? Start business? Learn for fun?)

Once I know this, I'll create a step-by-step plan just for you!

Or you can just tell me "I want to learn [skill name]" and we'll start right away! 🌟`;
    }
    
    // Skills recommendation
    if (lowerMessage.includes('skill') || lowerMessage.includes('learn') || lowerMessage.includes('what should')) {
        return `Great question! 🌟 Let me tell you what's really in demand right now:

🔥 TOP SKILLS FOR 2026:

Craft Skills:
🧶 Crochet - Everyone wants handmade items!
🪡 Embroidery - Premium pricing, high demand
💍 Jewelry - Low investment, quick returns

Food Skills:
🍴 Tiffin Service - Steady monthly income
🧁 Baking - Special occasions, good money
🥗 Healthy Meals - Growing trend!

My honest advice? 💭

Start with ONE skill you're interested in. Master it in 2-3 months. Start earning!

Then add digital skills like:
📸 Product photography
📱 Social media marketing

This combo = More customers = More money! 💰

What are you naturally good at? Let's build on that!`;
    }
    
    // Progress/achievement
    if (lowerMessage.includes('progress') || lowerMessage.includes('achievement') || lowerMessage.includes('how am i')) {
        return `You're doing amazing! 🌟

Just by being here and asking questions, you're already ahead!

Look at you:
✅ Taking initiative to learn
✅ Thinking about your growth
✅ Ready to improve your skills

That's the mindset of a successful artisan! 💪

Here's what to do next:

1️⃣ Pick ONE skill to focus on
2️⃣ Practice for 30 minutes daily
3️⃣ Make your first project this week!

Remember: Every expert started exactly where you are now. The only difference? They took the first step!

You've got this! 💫

What skill should we start with today?`;
    }
    
    // Career/opportunities
    if (lowerMessage.includes('career') || lowerMessage.includes('opportunity') || lowerMessage.includes('job') || lowerMessage.includes('earn')) {
        return `So many opportunities waiting for you! 🚀

Let me show you the real income potential:

💰 STARTING OUT (Month 1-3):
Take small orders, build portfolio
Earn: ₹5,000-20,000/month

💰 GROWING (Month 4-12):
Regular customers, online presence
Earn: ₹20,000-50,000/month

💰 ESTABLISHED (Year 2+):
Your own brand, bulk orders
Earn: ₹50,000-1,00,000+/month

Real paths women are taking:

🎯 Custom Orders
Start small, grow big!

🎯 Online Selling
Instagram, WhatsApp, marketplaces

🎯 Teaching Others
Workshops and classes (₹1000-3000/class)

🎯 Corporate Bulk Orders
Big orders, steady income!

The secret? Master one skill → Build portfolio → Start marketing!

Which path sounds good to you?`;
    }
    
    // Greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.includes('namaste')) {
        return `Namaste! 🙏 So happy to see you here!

I'm your AI Learning Mentor, and I'm here to help you learn new skills and grow your income! 💫

You can ask me about:

📚 Learning any craft skill
💰 How to earn money from your skills
🎯 Creating your learning plan
💼 Finding opportunities

Popular questions:
• "I want to learn crochet"
• "How can I earn from cooking?"
• "What skills should I learn?"
• "Create a learning path for me"

What would you like to explore today? I'm all ears! 😊`;
    }
    
    // Thank you
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
        return `You're so welcome! 😊

I'm always here whenever you need help!

Feel free to ask me:
💭 About any skill you want to learn
💭 For tips and guidance
💭 About earning opportunities
💭 For motivation when you need it!

Keep learning and growing! You're doing great! 🌟

What else can I help you with?`;
    }
    
    // Default response with suggestions
    return `Hey! 😊 I'm here to help you learn and grow!

Try asking me things like:

💬 "I want to learn crochet"
💬 "What skills are in demand?"
💬 "How can I earn money?"
💬 "Create a learning path for me"
💬 "I want to start a food business"

Or just tell me what you're interested in, and I'll guide you!

What's on your mind today? 🌟`;
}

/**
 * Add message to chat
 */
function addMessage(text, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    const avatar = document.createElement('div');
    avatar.className = `message-avatar ${sender === 'mentor' ? 'mentor-avatar' : 'user-avatar'}`;
    avatar.innerHTML = sender === 'mentor' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';

    const content = document.createElement('div');
    content.className = 'message-content';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;

    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    content.appendChild(bubble);
    content.appendChild(time);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);

    messagesContainer.appendChild(messageDiv);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message';
    typingDiv.id = 'typingIndicator';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar mentor-avatar';
    avatar.innerHTML = '<i class="fas fa-robot"></i>';

    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator active';
    indicator.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';

    typingDiv.appendChild(avatar);
    typingDiv.appendChild(indicator);

    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Hide typing indicator
 */
function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

/**
 * Send quick message
 */
function sendQuickMessage(message) {
    document.getElementById('messageInput').value = message;
    sendMessage();
}

/**
 * Handle Enter key press
 */
function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}
