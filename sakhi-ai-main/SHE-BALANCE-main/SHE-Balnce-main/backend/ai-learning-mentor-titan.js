/**
 * AI Learning Mentor Backend Module
 * Uses Llama 3 70B via Amazon Bedrock (changed from Titan per user request)
 * Provides personalized learning guidance for artisans
 */

const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

// Initialize Bedrock client
const bedrockClient = new BedrockRuntimeClient({ 
    region: process.env.AWS_REGION || 'us-east-1'
});

const LLAMA3_MODEL = "meta.llama3-70b-instruct-v1:0";

/**
 * Chat with AI Learning Mentor using Llama 3 70B (changed from Titan per user request)
 */
async function chatWithMentor(userId, message, conversationHistory = [], userContext = {}) {
    try {
        console.log(`🎓 AI Learning Mentor request from user: ${userId}`);
        console.log(`📝 Message: ${message.substring(0, 100)}...`);
        
        // Build context from conversation history (last 5 messages)
        let conversationContext = [];
        conversationHistory.slice(-5).forEach(msg => {
            conversationContext.push({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            });
        });

        // Build user context string
        let contextInfo = '';
        if (userContext.userName) {
            contextInfo += `Learner Name: ${userContext.userName}\n`;
        }
        
        if (userContext.currentSkills && userContext.currentSkills.length > 0) {
            contextInfo += `Current Skills: ${userContext.currentSkills.join(', ')}\n`;
        }
        
        if (userContext.learningGoals && userContext.learningGoals.length > 0) {
            contextInfo += `Learning Goals: ${userContext.learningGoals.join(', ')}\n`;
        }
        
        if (userContext.experienceLevel) {
            contextInfo += `Experience Level: ${userContext.experienceLevel}\n`;
        }

        // System prompt for AI Learning Mentor
        const systemPrompt = `You are a friendly AI Learning Mentor chatting with women artisans in India. You're like a supportive friend who helps them learn new skills and grow their business.

CONVERSATION STYLE - VERY IMPORTANT:
- Chat naturally like you're texting a friend, not writing an essay
- Use short paragraphs (2-3 lines max) with line breaks between them
- Start with a warm greeting or acknowledgment
- Use emojis naturally (but not too many - 2-3 per response)
- Ask follow-up questions to keep the conversation going
- Be encouraging and supportive
- Use simple, everyday language
- Break up long information with spacing and emojis

FORMATTING RULES:
✅ DO: Use short paragraphs with blank lines between them
✅ DO: Use emojis to add warmth (🌟 💪 🎨 ✨ 💰 📚)
✅ DO: Use bullet points with emojis for lists
✅ DO: End with a question or next step
❌ DON'T: Write long blocks of text
❌ DON'T: Use formal language or robotic tone
❌ DON'T: List everything at once - keep it conversational

EXAMPLE GOOD FORMAT:
"Hey! 😊 That's a great question!

Crochet is actually perfect for beginners. You can start making simple items in just 2-3 weeks!

Here's what I suggest:
🧶 Week 1: Learn basic stitches
🧶 Week 2: Make your first coaster
🧶 Week 3: Try a simple scarf

The best part? You only need ₹500 to get started with yarn and a hook! 💰

Want me to share some beginner-friendly YouTube channels?"

WHAT YOU HELP WITH:
- Craft Skills: Crochet, embroidery, tailoring, weaving, jewelry, henna, pottery
- Cooking Skills: Home chef, baking, tiffin service, catering
- Business Skills: Pricing, marketing, finding customers
- Career Guidance: How to earn money, grow your business

REMEMBER:
- Keep responses short and conversational
- Use line breaks generously
- Add emojis for warmth
- Always end with a question or suggestion
- Make it feel like chatting with a supportive friend

${contextInfo ? `\nYOU'RE CHATTING WITH:\n${contextInfo}` : ''}`;

        // Build Llama 3 prompt
        const llamaPrompt = buildLlamaPrompt(systemPrompt, conversationContext, message);

        // Prepare Llama 3 request
        const requestBody = {
            prompt: llamaPrompt,
            max_gen_len: 1024,
            temperature: 0.7,
            top_p: 0.9
        };

        console.log(`🤖 Calling Llama 3 70B for conversational learning guidance...`);
        console.log(`   Model: ${LLAMA3_MODEL}`);

        const command = new InvokeModelCommand({
            modelId: LLAMA3_MODEL,
            body: JSON.stringify(requestBody),
            contentType: "application/json",
            accept: "application/json"
        });

        const startTime = Date.now();
        const response = await bedrockClient.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        const duration = Date.now() - startTime;
        
        // Extract Llama 3 response
        const assistantMessage = responseBody.generation.trim();
        
        console.log(`✅ Llama 3 response received in ${duration}ms`);
        console.log(`   Response length: ${assistantMessage.length} characters`);

        return {
            success: true,
            response: assistantMessage,
            model: 'llama3-70b',
            responseTime: duration,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('❌ Llama 3 error:', error.name, error.message);
        console.error('   Check:');
        console.error('   1. AWS credentials are configured');
        console.error('   2. Bedrock access is enabled in your AWS account');
        console.error('   3. Llama 3 70B is available in your region');
        
        // Throw error so server.js can handle fallback
        throw error;
    }
}

/**
 * Build Llama 3 prompt format
 */
function buildLlamaPrompt(systemPrompt, conversationContext, currentMessage) {
    let prompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>

${systemPrompt}<|eot_id|>`;

    // Add conversation history
    conversationContext.forEach(msg => {
        const role = msg.role === 'user' ? 'user' : 'assistant';
        prompt += `<|start_header_id|>${role}<|end_header_id|>

${msg.content}<|eot_id|>`;
    });

    // Add current message
    prompt += `<|start_header_id|>user<|end_header_id|>

${currentMessage}<|eot_id|><|start_header_id|>assistant<|end_header_id|>

`;

    return prompt;
}

/**
 * Get learning progress for a user
 */
async function getLearningProgress(userId) {
    try {
        console.log(`📊 Getting learning progress for user: ${userId}`);
        
        // Try to fetch real user data from DynamoDB
        try {
            const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
            const { DynamoDBDocumentClient, GetCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
            
            const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
            const docClient = DynamoDBDocumentClient.from(client);
            
            // Get user data
            const userResult = await docClient.send(new GetCommand({
                TableName: 'shebalance-users',
                Key: { userId: userId }
            }));
            
            if (!userResult.Item) {
                console.log('⚠️  User not found in DynamoDB, using mock data');
                return getMockProgress();
            }
            
            const user = userResult.Item;
            
            // Get artisan profile if exists
            let artisanProfile = null;
            if (user.role === 'artisan') {
                const profileResult = await docClient.send(new QueryCommand({
                    TableName: 'shebalance-artisan-profiles',
                    IndexName: 'UserIdIndex',
                    KeyConditionExpression: 'userId = :userId',
                    ExpressionAttributeValues: {
                        ':userId': userId
                    }
                }));
                
                if (profileResult.Items && profileResult.Items.length > 0) {
                    artisanProfile = profileResult.Items[0];
                }
            }
            
            // Build progress data from real user data
            const skills = artisanProfile?.skills || [];
            const experienceYears = artisanProfile?.experienceYears || 0;
            
            // Calculate progress based on skills and experience
            const skillsMastered = skills.length;
            const totalSkills = 10; // Target number of skills
            const overallProgress = Math.min(Math.round((skillsMastered / totalSkills) * 100), 100);
            
            // Estimate learning hours (rough estimate: 500 hours per year of experience)
            const learningHours = Math.round(experienceYears * 500);
            
            // Map skills to display names
            const skillDisplayNames = {
                'tailoring': 'Tailoring & Stitching',
                'embroidery': 'Hand Embroidery',
                'henna': 'Henna Art & Design',
                'crochet': 'Crochet Basics',
                'weaving': 'Weaving Techniques',
                'jewelry': 'Jewelry Making',
                'pottery': 'Pottery & Ceramics',
                'cooking': 'Culinary Skills',
                'baking': 'Baking & Pastry',
                'painting': 'Fabric Painting'
            };
            
            const currentSkills = skills.map(skill => 
                skillDisplayNames[skill.toLowerCase()] || skill
            );
            
            // Suggest complementary skills based on current skills
            const allSkills = ['crochet', 'weaving', 'jewelry', 'pottery', 'cooking', 'baking', 'painting'];
            const upcomingSkills = allSkills
                .filter(skill => !skills.includes(skill))
                .slice(0, 3)
                .map(skill => skillDisplayNames[skill]);
            
            // Add business skills as upcoming
            upcomingSkills.push('Business Skills', 'Product Photography', 'Digital Marketing');
            
            // Determine in-progress skills (skills with less than 5 years experience)
            let inProgressSkills = [];
            if (experienceYears < 5) {
                inProgressSkills = ['Advanced Techniques', 'Business Management'];
            } else {
                inProgressSkills = ['Master Level Certification', 'Teaching & Mentoring'];
            }
            
            // Build milestones based on real data
            const milestones = [];
            
            // Milestone 1: Basic Training
            if (skillsMastered < 3) {
                milestones.push({
                    id: 1,
                    title: 'Learn Your First 3 Skills',
                    description: `You have ${skillsMastered} skill${skillsMastered !== 1 ? 's' : ''}, learn ${3 - skillsMastered} more!`,
                    status: 'in-progress',
                    progress: Math.round((skillsMastered / 3) * 100)
                });
            } else {
                milestones.push({
                    id: 1,
                    title: 'First 3 Skills Mastered',
                    description: 'You have mastered your first 3 skills!',
                    status: 'completed',
                    progress: 100
                });
            }
            
            // Milestone 2: Skill Certification
            if (skillsMastered >= 3 && skillsMastered < 5) {
                milestones.push({
                    id: 2,
                    title: 'Earn 5 Skill Certifications',
                    description: `${skillsMastered} skills certified, ${5 - skillsMastered} more to go!`,
                    status: 'in-progress',
                    progress: Math.round((skillsMastered / 5) * 100)
                });
            } else if (skillsMastered >= 5) {
                milestones.push({
                    id: 2,
                    title: '5 Skills Certified',
                    description: 'You have earned 5 skill certifications!',
                    status: 'completed',
                    progress: 100
                });
            } else {
                milestones.push({
                    id: 2,
                    title: 'Earn 5 Skill Certifications',
                    description: 'Complete 3 skills first to unlock',
                    status: 'upcoming',
                    progress: 0
                });
            }
            
            // Milestone 3: Experience Level
            if (experienceYears >= 5) {
                milestones.push({
                    id: 3,
                    title: 'Experienced Artisan',
                    description: `${experienceYears} years of experience - Well done!`,
                    status: 'completed',
                    progress: 100
                });
            } else {
                milestones.push({
                    id: 3,
                    title: 'Reach 5 Years Experience',
                    description: `${experienceYears} years completed, ${5 - experienceYears} more to go!`,
                    status: 'in-progress',
                    progress: Math.round((experienceYears / 5) * 100)
                });
            }
            
            console.log(`✅ Real progress data loaded for ${user.fullName}`);
            console.log(`   Skills: ${skills.join(', ')}`);
            console.log(`   Experience: ${experienceYears} years`);
            console.log(`   Progress: ${overallProgress}%`);
            
            return {
                success: true,
                overallProgress: overallProgress,
                skillsMastered: skillsMastered,
                totalSkills: totalSkills,
                learningHours: learningHours,
                currentSkills: currentSkills,
                inProgressSkills: inProgressSkills,
                upcomingSkills: upcomingSkills.slice(0, 5),
                milestones: milestones,
                userName: user.fullName,
                experienceYears: experienceYears,
                timestamp: new Date().toISOString()
            };
            
        } catch (dbError) {
            console.error('⚠️  Could not fetch from DynamoDB:', dbError.message);
            console.log('   Using mock progress data');
            return getMockProgress();
        }
        
    } catch (error) {
        console.error('❌ Error getting learning progress:', error);
        throw error;
    }
}

/**
 * Get mock progress data (fallback)
 */
function getMockProgress() {
    return {
        success: true,
        overallProgress: 35,
        skillsMastered: 3,
        totalSkills: 10,
        learningHours: 24,
        currentSkills: ['Crochet Basics', 'Embroidery Stitches', 'Pattern Reading'],
        inProgressSkills: ['Advanced Crochet', 'Color Theory'],
        upcomingSkills: ['Business Skills', 'Product Photography', 'Pricing Strategy'],
        milestones: [
            {
                id: 1,
                title: 'Complete Basic Training',
                description: 'Finish introductory courses',
                status: 'in-progress',
                progress: 60
            },
            {
                id: 2,
                title: 'First Skill Certification',
                description: 'Earn your first certificate',
                status: 'upcoming',
                progress: 0
            },
            {
                id: 3,
                title: 'Create First Product',
                description: 'Make your first market-ready item',
                status: 'upcoming',
                progress: 0
            }
        ],
        timestamp: new Date().toISOString()
    };
}

/**
 * Get learning recommendations using Llama 3
 */
async function getLearningRecommendations(userId, currentSkills = []) {
    try {
        console.log(`💡 Getting learning recommendations for user: ${userId}`);
        
        // Build recommendation prompt
        const systemPrompt = `You are an AI Learning Mentor for women artisans in India. Provide practical, conversational skill recommendations.`;
        
        const userMessage = `Based on an artisan who currently knows: ${currentSkills.join(', ') || 'no specific skills yet'}, recommend 3 complementary skills they should learn next to increase their income potential. 

For each skill, provide:
1. Skill name
2. Why it complements their current skills
3. Estimated learning time
4. Income potential in Indian rupees
5. Difficulty level (Beginner/Intermediate/Advanced)

Keep recommendations practical and focused on Indian artisan market. Be conversational and encouraging.`;

        const llamaPrompt = buildLlamaPrompt(systemPrompt, [], userMessage);

        const requestBody = {
            prompt: llamaPrompt,
            max_gen_len: 1024,
            temperature: 0.7,
            top_p: 0.9
        };

        const command = new InvokeModelCommand({
            modelId: LLAMA3_MODEL,
            body: JSON.stringify(requestBody),
            contentType: "application/json",
            accept: "application/json"
        });

        console.log(`🤖 Calling Llama 3 for recommendations...`);
        const response = await bedrockClient.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        const recommendations = responseBody.generation.trim();
        
        console.log(`✅ Recommendations generated`);

        return {
            success: true,
            recommendations: recommendations,
            model: 'llama3-70b',
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('❌ Error getting recommendations:', error);
        throw error;
    }
}

/**
 * Fallback response if AWS is not available
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

module.exports = {
    chatWithMentor,
    getLearningProgress,
    getLearningRecommendations,
    getFallbackResponse
};
