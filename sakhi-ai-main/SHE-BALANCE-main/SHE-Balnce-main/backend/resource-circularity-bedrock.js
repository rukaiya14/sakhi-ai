/**
 * Resource Circularity with Amazon Bedrock Llama 3 - Local Backend
 * AI-powered waste-to-wealth matching for artisan collaboration
 */

const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

// Initialize Bedrock client
const bedrockClient = new BedrockRuntimeClient({ 
    region: process.env.AWS_REGION || 'us-east-1'
});

const LLAMA3_MODEL = "meta.llama3-70b-instruct-v1:0";

/**
 * Find AI-powered resource matches
 * 80% Llama 3 AI-generated + 20% fallback for reliability
 * Uses real data from AWS DynamoDB backend
 */
async function findResourceMatches(artisanData, userProfile = null) {
    const { wasteType, quantity, location, skill, artisanId } = artisanData;
    const db = require('./dynamodb-client');

    const userName = userProfile ? userProfile.fullName : 'an artisan';
    const userSkills = userProfile && userProfile.skills ? userProfile.skills.join(', ') : skill;
    
    console.log(`🤖 Generating AI matches for ${userName} (${userSkills})`);
    
    // Fetch real platform statistics from AWS DynamoDB
    let platformStats = {
        totalArtisans: 0,
        activeSkills: [],
        avgOrderValue: 0,
        totalWasteShared: 0
    };
    
    try {
        console.log('📊 Fetching platform data from AWS DynamoDB...');
        const allArtisans = await db.getAllArtisans();
        platformStats.totalArtisans = allArtisans.length;
        
        // Get unique skills from real artisans
        const skillsSet = new Set();
        let totalOrderValue = 0;
        let orderCount = 0;
        
        allArtisans.forEach(artisan => {
            if (artisan.skills && Array.isArray(artisan.skills)) {
                artisan.skills.forEach(s => skillsSet.add(s));
            }
            if (artisan.totalEarnings) {
                totalOrderValue += artisan.totalEarnings;
            }
            if (artisan.totalOrders) {
                orderCount += artisan.totalOrders;
            }
        });
        
        platformStats.activeSkills = Array.from(skillsSet);
        platformStats.avgOrderValue = orderCount > 0 ? Math.round(totalOrderValue / orderCount) : 2500;
        
        console.log(`✅ Platform stats: ${platformStats.totalArtisans} artisans, ${platformStats.activeSkills.length} skills`);
    } catch (error) {
        console.warn('⚠️  Could not fetch platform stats:', error.message);
    }
    
    let aiGeneratedMatches = [];
    let aiInsights = null;
    
    try {
        // Enhanced prompt with real platform data
        const matchPrompt = `You are analyzing resource circularity for a real platform with ${platformStats.totalArtisans} active artisans.

PLATFORM DATA (from AWS DynamoDB):
- Active Skills: ${platformStats.activeSkills.join(', ')}
- Average Order Value: ₹${platformStats.avgOrderValue}
- Location: Delhi NCR region

USER PROFILE:
- Name: ${userName}
- Skills: ${userSkills}
- Location: ${location}
- Available Material: ${wasteType} (${quantity})

Generate 10 high-quality waste-to-wealth matches using artisans from our REAL platform skills above. For each match, provide:
1. Target craft/skill (MUST be from the active skills list above)
2. Specific usage description (personalized for ${userName})
3. Potential monthly savings in rupees (₹1,500 - ₹5,500)
4. Match score (80-98%)
5. Business name (realistic Delhi-based business)
6. Location in Delhi NCR
7. Contact phone (+91 format)
8. Rating (4.3-4.9 out of 5)
9. Quantity needed per month
10. Urgency level (High/Medium/Low with context)
11. Preferred quality specifications

Format each match as JSON with these exact fields:
{
  "targetSkill": "Craft Name from active skills",
  "usage": "Detailed usage description mentioning ${userName}",
  "savings": 3500,
  "matchScore": 92,
  "quality": "Premium/Good/Standard",
  "distance": "1.5 km",
  "artisanName": "Business Name",
  "artisanLocation": "Area, Delhi",
  "artisanPhone": "+91 98765 43XXX",
  "artisanRating": 4.7,
  "quantityNeeded": "XX-XX kg/month",
  "urgency": "Level - Context",
  "preferredQuality": "Specifications"
}

Return ONLY a JSON array of 10 matches, no other text.`;

        console.log('📡 Calling Bedrock Llama 3 for match generation...');
        const aiResponse = await invokeLlama3(matchPrompt, 3072); // Increased tokens for 10 matches
        
        // Parse AI response
        aiGeneratedMatches = parseAIMatchesResponse(aiResponse, userProfile);
        console.log(`✅ Llama 3 generated ${aiGeneratedMatches.length} matches using real platform data`);
        
        // Get insights with real platform context
        const insightPrompt = `Based on our platform with ${platformStats.totalArtisans} artisans in skills like ${platformStats.activeSkills.slice(0, 5).join(', ')}:

${userName} with skills in ${userSkills} has ${wasteType} (${quantity}) available in ${location}.

Provide a brief insight (2-3 sentences) about the waste-to-wealth opportunity for this material, considering our actual artisan community and their skills.`;

        aiInsights = await invokeLlama3(insightPrompt);
        
    } catch (error) {
        console.error('⚠️  Llama 3 generation error:', error.message);
        aiGeneratedMatches = [];
    }
    
    // If AI generated fewer than 10 matches, fill with high-quality fallbacks (20%)
    let finalMatches = aiGeneratedMatches;
    if (finalMatches.length < 10) {
        console.log(`⚠️  Only ${finalMatches.length} AI matches, adding fallbacks...`);
        const fallbackMatches = generateSkillBasedMatches(userProfile, wasteType, 12);
        const needed = 12 - finalMatches.length;
        finalMatches = [...finalMatches, ...fallbackMatches.slice(0, needed)];
        console.log(`✅ Total matches: ${finalMatches.length} (${aiGeneratedMatches.length} AI + ${needed} fallback)`);
    } else {
        // Limit to 12 matches
        finalMatches = finalMatches.slice(0, 12);
    }

    return {
        success: true,
        matches: finalMatches,
        totalMatches: finalMatches.length,
        aiGenerated: aiGeneratedMatches.length,
        fallbackUsed: finalMatches.length - aiGeneratedMatches.length,
        aiInsights: aiInsights,
        platformData: platformStats,
        dataSource: 'AWS DynamoDB',
        artisanProfile: userProfile ? {
            name: userProfile.fullName,
            skills: userProfile.skills,
            location: userProfile.location
        } : null,
        aiModel: 'llama3-70b',
        timestamp: new Date().toISOString()
    };
}

/**
 * Get detailed match insights
 */
async function getMatchInsights(matchData) {
    const { artisan1, artisan2, material } = matchData;

    const prompt = `Analyze this resource circularity match:
- Provider: ${artisan1.skill} artisan (${artisan1.name})
- Receiver: ${artisan2.skill} artisan (${artisan2.name})
- Material: ${material}

Provide detailed insights:
1. Material compatibility analysis
2. Transportation feasibility
3. Environmental impact (CO2 saved in kg)
4. Community benefit score (0-10)
5. Recommended exchange terms
6. Potential challenges and solutions

Be specific and practical for Indian artisan communities.`;

    try {
        const insights = await invokeLlama3(prompt);

        return {
            success: true,
            insights,
            aiModel: 'llama3-70b',
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('❌ Get insights error:', error);
        throw error;
    }
}

/**
 * Analyze resource compatibility
 */
async function analyzeCompatibility(compatibilityData) {
    const { wasteType, targetSkill, quality } = compatibilityData;

    const prompt = `Analyze compatibility for resource circularity:
- Waste Material: ${wasteType}
- Target Craft: ${targetSkill}
- Quality Grade: ${quality || 'Standard'}

Provide:
1. Compatibility score (0-100%)
2. Best use cases for this material in ${targetSkill}
3. Processing requirements (if any)
4. Cost savings potential (in ₹)
5. Quality considerations
6. Practical recommendations

Focus on actionable insights for artisans.`;

    try {
        const analysis = await invokeLlama3(prompt);

        return {
            success: true,
            wasteType,
            targetSkill,
            analysis,
            aiModel: 'llama3-70b',
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('❌ Analyze compatibility error:', error);
        throw error;
    }
}

/**
 * Get AI recommendations for resource circularity
 */
async function getCircularityRecommendations(artisanId) {
    const prompt = `Provide 3 top resource circularity opportunities for artisan communities in India right now.

For each opportunity:
1. Waste material type
2. Source craft (who generates this waste)
3. Target craft (who can use it)
4. Potential savings (in ₹)
5. Current demand trend (increasing/stable/decreasing)
6. Implementation difficulty (easy/moderate/hard)
7. Environmental impact

Focus on high-impact, practical opportunities that are easy to implement.`;

    try {
        const recommendations = await invokeLlama3(prompt);

        return {
            success: true,
            recommendations,
            aiModel: 'llama3-70b',
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('❌ Get recommendations error:', error);
        throw error;
    }
}

/**
 * Get waste-to-wealth insights using real AWS backend data
 */
async function getWasteToWealthInsights() {
    const db = require('./dynamodb-client');
    
    try {
        console.log('📊 Fetching real data from AWS DynamoDB...');
        
        // Fetch real artisan data from DynamoDB
        const artisans = await db.getAllArtisans();
        
        // Analyze real data
        const skillsDistribution = {};
        const totalArtisans = artisans.length;
        let totalOrders = 0;
        let totalEarnings = 0;
        
        artisans.forEach(artisan => {
            // Count skills
            if (artisan.skills && Array.isArray(artisan.skills)) {
                artisan.skills.forEach(skill => {
                    skillsDistribution[skill] = (skillsDistribution[skill] || 0) + 1;
                });
            }
            
            // Sum orders and earnings
            totalOrders += artisan.totalOrders || 0;
            totalEarnings += artisan.totalEarnings || 0;
        });
        
        // Get top 3 skills
        const topSkills = Object.entries(skillsDistribution)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([skill, count]) => ({ skill, count, percentage: ((count / totalArtisans) * 100).toFixed(1) }));
        
        console.log(`✅ Analyzed ${totalArtisans} artisans from DynamoDB`);
        console.log(`   Top skills: ${topSkills.map(s => s.skill).join(', ')}`);
        
        // Create data-driven prompt with real statistics
        const prompt = `Based on real data from our platform with ${totalArtisans} artisans:

TOP SKILLS IN OUR COMMUNITY:
${topSkills.map((s, i) => `${i + 1}. ${s.skill}: ${s.count} artisans (${s.percentage}%)`).join('\n')}

PLATFORM STATISTICS:
- Total Active Artisans: ${totalArtisans}
- Total Orders Completed: ${totalOrders}
- Total Platform Earnings: ₹${totalEarnings.toLocaleString()}
- Average Earnings per Artisan: ₹${Math.round(totalEarnings / totalArtisans).toLocaleString()}

Provide waste-to-wealth insights specifically for these artisan skills:
1. What waste materials do ${topSkills[0].skill} artisans typically generate?
2. Which of our ${topSkills[1].skill} or ${topSkills[2].skill} artisans could use these materials?
3. Estimated cost savings potential (in ₹) for resource sharing
4. Environmental impact (CO2 reduction, waste diverted)
5. One specific actionable recommendation for our community

Keep it concise (3-4 sentences) and data-driven with specific numbers.`;

        const insights = await invokeLlama3(prompt);

        return {
            success: true,
            insights,
            dataSource: 'AWS DynamoDB',
            statistics: {
                totalArtisans,
                totalOrders,
                totalEarnings,
                topSkills: topSkills.map(s => s.skill),
                analysisDate: new Date().toISOString()
            },
            aiModel: 'llama3-70b',
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('❌ Get insights error:', error);
        
        // Fallback to generic insights if database fails
        console.warn('⚠️  Using fallback insights (database unavailable)');
        const fallbackPrompt = `Provide current insights on waste-to-wealth opportunities in Indian artisan communities:

1. Top 3 trending waste materials with high reuse potential
2. Cost savings statistics (average % reduction)
3. Environmental impact metrics
4. Success stories or best practices
5. Emerging opportunities

Keep it concise and data-driven.`;

        const insights = await invokeLlama3(fallbackPrompt);
        
        return {
            success: true,
            insights,
            dataSource: 'Generic (database unavailable)',
            aiModel: 'llama3-70b',
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Invoke Bedrock Llama 3 model
 */
async function invokeLlama3(userPrompt, maxTokens = 2048) {
    const systemPrompt = `You are an AI expert in resource circularity and waste-to-wealth transformation for artisan communities in India.

Your expertise includes:
- Material compatibility analysis across different crafts (tailoring, jewelry, pottery, embroidery, weaving, etc.)
- Cost-benefit analysis for resource sharing
- Environmental impact assessment
- Logistics and transportation feasibility
- Quality grading and material specifications
- Cultural context of Indian artisan communities

Provide practical, actionable insights that help artisans:
- Save costs through resource sharing
- Reduce waste and environmental impact
- Build collaborative networks
- Improve sustainability

Use simple, clear language suitable for artisans with varying education levels.
Focus on real-world feasibility and community benefit.
Provide specific numbers and metrics when possible.

When asked to generate matches in JSON format, return ONLY valid JSON with no additional text.`;

    const llamaPrompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>

${systemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>

${userPrompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>

`;

    const requestBody = {
        prompt: llamaPrompt,
        max_gen_len: maxTokens,
        temperature: 0.7,
        top_p: 0.9
    };

    const command = new InvokeModelCommand({
        modelId: LLAMA3_MODEL,
        body: JSON.stringify(requestBody),
        contentType: "application/json",
        accept: "application/json"
    });

    console.log(`🤖 Calling Bedrock Llama 3 (max_tokens: ${maxTokens})...`);
    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    console.log('✅ Bedrock response received');
    return responseBody.generation.trim();
}

/**
 * Parse AI matching response from Llama 3
 */
function parseAIMatchesResponse(aiResponse, userProfile = null) {
    try {
        // Try to extract JSON array from response
        let jsonStr = aiResponse.trim();
        
        // Remove markdown code blocks if present
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        
        // Find JSON array
        const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
            jsonStr = arrayMatch[0];
        }
        
        const matches = JSON.parse(jsonStr);
        
        if (Array.isArray(matches)) {
            console.log(`✅ Successfully parsed ${matches.length} AI-generated matches`);
            
            // Ensure all required fields are present
            return matches.map(match => ({
                targetSkill: match.targetSkill || 'Artisan',
                usage: match.usage || 'Can use this material for their craft',
                savings: match.savings || 2000,
                quality: match.quality || 'Good',
                matchScore: match.matchScore || 85,
                distance: match.distance || '2 km',
                artisanName: match.artisanName || match.businessName || 'Local Artisan',
                artisanLocation: match.artisanLocation || match.location || 'Delhi',
                artisanPhone: match.artisanPhone || match.phone || '+91 98765 43200',
                artisanRating: match.artisanRating || match.rating || 4.5,
                quantityNeeded: match.quantityNeeded || match.quantity || '10-20 kg/month',
                urgency: match.urgency || 'Medium - Regular orders',
                preferredQuality: match.preferredQuality || match.preferred || 'Quality materials',
                material: match.material || 'Various',
                artisanSkills: userProfile && userProfile.skills ? userProfile.skills.join(', ') : 'Various'
            }));
        }
        
        console.warn('⚠️  AI response is not a valid array');
        return [];
        
    } catch (error) {
        console.error('❌ Failed to parse AI response:', error.message);
        console.log('Raw AI response:', aiResponse.substring(0, 500));
        return [];
    }
}

/**
 * Parse AI matching response (legacy - kept for compatibility)
 */
function parseMatchingResponse(aiResponse, userProfile = null) {
    // Try to extract structured data from AI response
    const matches = [];
    
    // Look for numbered items or bullet points
    const lines = aiResponse.split('\n');
    let currentMatch = null;
    
    for (const line of lines) {
        const trimmed = line.trim();
        
        // Detect new match (numbered or with keywords)
        if (trimmed.match(/^(\d+\.|Match \d+|•)/i)) {
            if (currentMatch) {
                matches.push(currentMatch);
            }
            currentMatch = {
                targetSkill: '',
                usage: '',
                savings: 0,
                quality: 'Good',
                matchScore: 85,
                distance: '1-3 km',
                artisanSkills: userProfile && userProfile.skills ? userProfile.skills.join(', ') : 'Various'
            };
        }
        
        // Extract information
        if (currentMatch) {
            if (trimmed.toLowerCase().includes('skill') || trimmed.toLowerCase().includes('craft')) {
                currentMatch.targetSkill = extractValue(trimmed);
            } else if (trimmed.toLowerCase().includes('use') || trimmed.toLowerCase().includes('usage')) {
                currentMatch.usage = extractValue(trimmed);
            } else if (trimmed.toLowerCase().includes('saving') || trimmed.includes('₹')) {
                currentMatch.savings = extractNumber(trimmed);
            } else if (trimmed.toLowerCase().includes('quality')) {
                currentMatch.quality = extractValue(trimmed);
            } else if (trimmed.toLowerCase().includes('score')) {
                currentMatch.matchScore = extractNumber(trimmed);
            } else if (trimmed.toLowerCase().includes('distance')) {
                currentMatch.distance = extractValue(trimmed);
            }
        }
    }
    
    if (currentMatch) {
        matches.push(currentMatch);
    }
    
    // If parsing failed, return fallback matches with user context
    if (matches.length === 0) {
        return getFallbackMatches(userProfile);
    }
    
    return matches.slice(0, 3); // Return top 3 matches
}

/**
 * Extract value from text
 */
function extractValue(text) {
    const colonIndex = text.indexOf(':');
    if (colonIndex !== -1) {
        return text.substring(colonIndex + 1).trim();
    }
    return text.replace(/^(\d+\.|•|-|\*)\s*/, '').trim();
}

/**
 * Extract number from text
 */
function extractNumber(text) {
    const match = text.match(/(\d+(?:,\d+)*(?:\.\d+)?)/);
    if (match) {
        return parseInt(match[1].replace(/,/g, ''));
    }
    return 0;
}

/**
 * Generate skill-based matches (high quality fallback/supplement)
 */
function generateSkillBasedMatches(userProfile, wasteType, count = 12) {
    const userName = userProfile ? userProfile.fullName : 'Artisan';
    const userSkills = userProfile && userProfile.skills ? userProfile.skills : ['tailoring'];
    const userLocation = userProfile?.location || 'India';
    
    // Comprehensive match database based on user skills
    const matchDatabase = {
        tailoring: [
            {
                targetSkill: 'Jewelry Making',
                usage: `Perfect for ${userName}! Jewelry artisans can use your fabric scraps for textile-wrapped beads, fabric-backed pendants, and decorative jewelry elements. Your precision cutting from tailoring ensures premium quality materials.`,
                savings: 4200,
                quality: 'Premium',
                matchScore: 96,
                distance: '1.2 km',
                artisanName: 'Meera Jewels Studio',
                artisanLocation: 'Chandni Chowk, Delhi',
                artisanPhone: '+91 98765 43210',
                artisanRating: 4.8,
                quantityNeeded: '30-40 kg/month',
                urgency: 'High - Ongoing orders',
                preferredQuality: 'Premium cotton/silk scraps'
            },
            {
                targetSkill: 'Home Decor Crafts',
                usage: `Excellent match! Home decor artisans can repurpose your ${wasteType} for cushion covers, wall hangings, table runners, and decorative items. Your tailoring expertise means perfectly cut, professional-grade materials.`,
                savings: 3800,
                quality: 'Premium',
                matchScore: 94,
                distance: '800m',
                artisanName: 'Desi Decor Creations',
                artisanLocation: 'Lajpat Nagar, Delhi',
                artisanPhone: '+91 98765 43211',
                artisanRating: 4.7,
                quantityNeeded: '40-50 kg/month',
                urgency: 'Medium - Regular need',
                preferredQuality: 'Mixed fabrics, all colors'
            },
            {
                targetSkill: 'Bag & Purse Making',
                usage: `Great opportunity for ${userName}! Bag makers can use your fabric scraps for patchwork bags, linings, inner pockets, and decorative patches. Your tailoring precision adds significant value.`,
                savings: 3200,
                quality: 'Good',
                matchScore: 91,
                distance: '1.5 km',
                artisanName: 'Eco Bags Delhi',
                artisanLocation: 'Sarojini Nagar, Delhi',
                artisanPhone: '+91 98765 43212',
                artisanRating: 4.6,
                quantityNeeded: '25-35 kg/month',
                urgency: 'High - Festival season',
                preferredQuality: 'Durable cotton/denim'
            },
            {
                targetSkill: 'Toy Making',
                usage: `Creative use! Toy makers can utilize your ${wasteType} for stuffed toys, doll clothes, and soft toy accessories. Your clean cutting techniques ensure child-safe materials.`,
                savings: 2800,
                quality: 'Good',
                matchScore: 88,
                distance: '2.1 km',
                artisanName: 'Happy Kids Toys',
                artisanLocation: 'Karol Bagh, Delhi',
                artisanPhone: '+91 98765 43213',
                artisanRating: 4.9,
                quantityNeeded: '15-20 kg/month',
                urgency: 'Medium - Steady demand',
                preferredQuality: 'Soft, colorful fabrics'
            },
            {
                targetSkill: 'Quilting & Patchwork',
                usage: `Perfect synergy! Quilters can use your fabric scraps for patchwork quilts, bedspreads, and artistic textile pieces. Your tailoring background means uniform, quality pieces.`,
                savings: 3500,
                quality: 'Premium',
                matchScore: 93,
                distance: '1.8 km',
                artisanName: 'Heritage Quilts',
                artisanLocation: 'Hauz Khas, Delhi',
                artisanPhone: '+91 98765 43214',
                artisanRating: 4.8,
                quantityNeeded: '35-45 kg/month',
                urgency: 'Low - Seasonal work',
                preferredQuality: 'Varied patterns & colors'
            },
            {
                targetSkill: 'Upholstery Work',
                usage: `Valuable for ${userName}! Upholstery artisans can use your materials for furniture padding, cushion covers, and decorative upholstery elements. Your professional cutting is highly valued.`,
                savings: 4500,
                quality: 'Good',
                matchScore: 89,
                distance: '2.5 km',
                artisanName: 'Royal Upholstery',
                artisanLocation: 'Mayur Vihar, Delhi',
                artisanPhone: '+91 98765 43215',
                artisanRating: 4.5,
                quantityNeeded: '50-60 kg/month',
                urgency: 'High - Bulk orders',
                preferredQuality: 'Heavy-duty fabrics'
            },
            {
                targetSkill: 'Art & Craft Supplies',
                usage: `Creative opportunity! Art supply makers can use your ${wasteType} for collage materials, textile art supplies, and craft kits. Your quality standards ensure premium products.`,
                savings: 2200,
                quality: 'Mixed',
                matchScore: 85,
                distance: '3.2 km',
                artisanName: 'Craft Corner Delhi',
                artisanLocation: 'Nehru Place, Delhi',
                artisanPhone: '+91 98765 43216',
                artisanRating: 4.4,
                quantityNeeded: '10-15 kg/month',
                urgency: 'Low - As available',
                preferredQuality: 'All types welcome'
            },
            {
                targetSkill: 'Pet Accessories',
                usage: `Growing market! Pet accessory makers can use your fabric for pet beds, toys, and clothing. Your tailoring skills mean durable, well-cut materials perfect for pet products.`,
                savings: 2600,
                quality: 'Good',
                matchScore: 87,
                distance: '1.9 km',
                artisanName: 'Pawsome Creations',
                artisanLocation: 'Vasant Kunj, Delhi',
                artisanPhone: '+91 98765 43217',
                artisanRating: 4.7,
                quantityNeeded: '20-25 kg/month',
                urgency: 'Medium - Growing demand',
                preferredQuality: 'Washable, durable fabrics'
            },
            {
                targetSkill: 'Book Binding & Covers',
                usage: `Unique use for ${userName}! Book binders can use your fabric scraps for decorative book covers, journals, and handmade notebooks. Your precision cutting is ideal for this craft.`,
                savings: 1800,
                quality: 'Premium',
                matchScore: 84,
                distance: '2.8 km',
                artisanName: 'Bookworm Bindery',
                artisanLocation: 'Connaught Place, Delhi',
                artisanPhone: '+91 98765 43218',
                artisanRating: 4.6,
                quantityNeeded: '8-12 kg/month',
                urgency: 'Low - Custom orders',
                preferredQuality: 'Elegant, textured fabrics'
            },
            {
                targetSkill: 'Gift Wrapping & Packaging',
                usage: `Eco-friendly option! Packaging artisans can use your ${wasteType} for reusable gift wraps, fabric bags, and sustainable packaging. Your quality materials command premium prices.`,
                savings: 2400,
                quality: 'Good',
                matchScore: 86,
                distance: '1.6 km',
                artisanName: 'Green Wrap Studio',
                artisanLocation: 'Greater Kailash, Delhi',
                artisanPhone: '+91 98765 43219',
                artisanRating: 4.5,
                quantityNeeded: '18-22 kg/month',
                urgency: 'High - Festival season',
                preferredQuality: 'Attractive prints'
            },
            {
                targetSkill: 'Fashion Accessories',
                usage: `Trendy opportunity! Accessory makers can use your fabric for hair accessories, scarves, headbands, and fashion items. Your tailoring expertise ensures fashion-grade quality.`,
                savings: 3100,
                quality: 'Premium',
                matchScore: 90,
                distance: '1.3 km',
                artisanName: 'Chic Accessories',
                artisanLocation: 'Janpath, Delhi',
                artisanPhone: '+91 98765 43220',
                artisanRating: 4.8,
                quantityNeeded: '22-28 kg/month',
                urgency: 'High - Fashion season',
                preferredQuality: 'Trendy colors & patterns'
            },
            {
                targetSkill: 'Eco-Friendly Products',
                usage: `Sustainable choice for ${userName}! Eco-product makers can use your materials for reusable shopping bags, produce bags, and zero-waste products. Your quality supports the green movement.`,
                savings: 2900,
                quality: 'Good',
                matchScore: 88,
                distance: '2.2 km',
                artisanName: 'Earth Friendly Crafts',
                artisanLocation: 'Dwarka, Delhi',
                artisanPhone: '+91 98765 43221',
                artisanRating: 4.7,
                quantityNeeded: '30-40 kg/month',
                urgency: 'Medium - Steady orders',
                preferredQuality: 'Natural fibers preferred'
            }
        ],
        embroidery: [
            {
                targetSkill: 'Luxury Jewelry',
                usage: `Premium match for ${userName}! Luxury jewelers can use your embroidered fabric pieces for high-end jewelry backing, textile jewelry, and decorative elements. Your embroidery skills add exceptional value.`,
                savings: 5200,
                quality: 'Premium',
                matchScore: 98,
                distance: '900m',
                artisanName: 'Regal Jewels Studio',
                artisanLocation: 'Karol Bagh, Delhi',
                artisanPhone: '+91 98765 43230',
                artisanRating: 4.9,
                quantityNeeded: '15-20 kg/month',
                urgency: 'High - Luxury orders',
                preferredQuality: 'Premium embroidered pieces'
            },
            {
                targetSkill: 'Bridal Accessories',
                usage: `Excellent opportunity! Bridal accessory makers can repurpose your embroidered ${wasteType} for wedding favors, decorative items, and bridal gift packaging. Your intricate work is highly sought after.`,
                savings: 4800,
                quality: 'Premium',
                matchScore: 96,
                distance: '1.1 km',
                artisanName: 'Shaadi Elegance',
                artisanLocation: 'Lajpat Nagar, Delhi',
                artisanPhone: '+91 98765 43231',
                artisanRating: 4.8,
                quantityNeeded: '20-30 kg/month',
                urgency: 'High - Wedding season',
                preferredQuality: 'Intricate embroidery work'
            },
            {
                targetSkill: 'Home Textiles',
                usage: `Perfect for ${userName}! Home textile artisans can use your embroidered pieces for premium cushion covers, table linens, and decorative home items. Your craftsmanship ensures luxury products.`,
                savings: 4200,
                quality: 'Premium',
                matchScore: 94,
                distance: '1.4 km',
                artisanName: 'Luxury Home Textiles',
                artisanLocation: 'South Extension, Delhi',
                artisanPhone: '+91 98765 43232',
                artisanRating: 4.7,
                quantityNeeded: '30-40 kg/month',
                urgency: 'Medium - Regular orders',
                preferredQuality: 'Premium embroidered fabrics'
            },
            {
                targetSkill: 'Fashion Design',
                usage: `High-value match! Fashion designers can incorporate your embroidered ${wasteType} into garment embellishments, patches, and decorative elements. Your skill level matches designer requirements.`,
                savings: 5500,
                quality: 'Premium',
                matchScore: 97,
                distance: '1.7 km',
                artisanName: 'Couture Creations',
                artisanLocation: 'Hauz Khas, Delhi',
                artisanPhone: '+91 98765 43233',
                artisanRating: 4.9,
                quantityNeeded: '25-35 kg/month',
                urgency: 'High - Fashion week prep',
                preferredQuality: 'Designer-grade embroidery'
            },
            {
                targetSkill: 'Art Framing',
                usage: `Creative use for ${userName}! Art framers can use your embroidered pieces for textile art, framed embroidery displays, and decorative wall art. Your artistry becomes gallery-worthy.`,
                savings: 3200,
                quality: 'Premium',
                matchScore: 91,
                distance: '2.3 km',
                artisanName: 'Gallery Frames Delhi',
                artisanLocation: 'Connaught Place, Delhi',
                artisanPhone: '+91 98765 43234',
                artisanRating: 4.6,
                quantityNeeded: '10-15 kg/month',
                urgency: 'Low - Custom projects',
                preferredQuality: 'Artistic embroidery pieces'
            },
            {
                targetSkill: 'Luxury Bags',
                usage: `Premium opportunity! Luxury bag makers can use your embroidered materials for high-end bag panels, decorative elements, and limited edition pieces. Your embroidery commands premium prices.`,
                savings: 4600,
                quality: 'Premium',
                matchScore: 95,
                distance: '1.6 km',
                artisanName: 'Elite Bags Studio',
                artisanLocation: 'Greater Kailash, Delhi',
                artisanPhone: '+91 98765 43235',
                artisanRating: 4.8,
                quantityNeeded: '18-25 kg/month',
                urgency: 'High - Luxury collection',
                preferredQuality: 'Premium embroidered materials'
            },
            {
                targetSkill: 'Greeting Cards',
                usage: `Unique application! Handmade card makers can use small embroidered pieces for luxury greeting cards, invitations, and special occasion cards. Your detailed work adds exclusivity.`,
                savings: 1800,
                quality: 'Premium',
                matchScore: 86,
                distance: '2.9 km',
                artisanName: 'Artisan Cards Delhi',
                artisanLocation: 'Nehru Place, Delhi',
                artisanPhone: '+91 98765 43236',
                artisanRating: 4.5,
                quantityNeeded: '5-8 kg/month',
                urgency: 'Low - Seasonal demand',
                preferredQuality: 'Small embroidered pieces'
            },
            {
                targetSkill: 'Ethnic Wear',
                usage: `Cultural value for ${userName}! Ethnic wear designers can use your embroidered ${wasteType} for traditional garment embellishments, blouse pieces, and cultural accessories. Your traditional skills are invaluable.`,
                savings: 4400,
                quality: 'Premium',
                matchScore: 93,
                distance: '1.9 km',
                artisanName: 'Heritage Ethnic Wear',
                artisanLocation: 'Chandni Chowk, Delhi',
                artisanPhone: '+91 98765 43237',
                artisanRating: 4.8,
                quantityNeeded: '28-35 kg/month',
                urgency: 'High - Festival season',
                preferredQuality: 'Traditional embroidery'
            },
            {
                targetSkill: 'Interior Design',
                usage: `Designer match! Interior designers can use your embroidered pieces for custom curtain panels, decorative wall hangings, and bespoke home accents. Your craftsmanship elevates spaces.`,
                savings: 5000,
                quality: 'Premium',
                matchScore: 94,
                distance: '2.1 km',
                artisanName: 'Designer Interiors Delhi',
                artisanLocation: 'Vasant Vihar, Delhi',
                artisanPhone: '+91 98765 43238',
                artisanRating: 4.9,
                quantityNeeded: '22-30 kg/month',
                urgency: 'Medium - Project based',
                preferredQuality: 'Designer embroidery pieces'
            },
            {
                targetSkill: 'Boutique Items',
                usage: `Boutique opportunity! Boutique owners can use your embroidered materials for exclusive accessories, limited edition items, and artisan collections. Your work defines boutique quality.`,
                savings: 3900,
                quality: 'Premium',
                matchScore: 92,
                distance: '1.5 km',
                artisanName: 'Boutique Artisan',
                artisanLocation: 'Khan Market, Delhi',
                artisanPhone: '+91 98765 43239',
                artisanRating: 4.7,
                quantityNeeded: '15-22 kg/month',
                urgency: 'Medium - Boutique collection',
                preferredQuality: 'Exclusive embroidery'
            },
            {
                targetSkill: 'Cultural Crafts',
                usage: `Heritage value for ${userName}! Cultural craft artisans can use your embroidered pieces for traditional items, cultural souvenirs, and heritage products. Your skills preserve traditions.`,
                savings: 3400,
                quality: 'Premium',
                matchScore: 90,
                distance: '2.4 km',
                artisanName: 'Heritage Crafts India',
                artisanLocation: 'Dilli Haat, Delhi',
                artisanPhone: '+91 98765 43240',
                artisanRating: 4.6,
                quantityNeeded: '18-25 kg/month',
                urgency: 'Low - Cultural events',
                preferredQuality: 'Traditional embroidery'
            },
            {
                targetSkill: 'Premium Packaging',
                usage: `Luxury packaging! High-end packaging artisans can use your embroidered ${wasteType} for luxury gift boxes, premium product packaging, and exclusive wrapping. Your artistry adds prestige.`,
                savings: 3700,
                quality: 'Premium',
                matchScore: 89,
                distance: '2.6 km',
                artisanName: 'Luxury Pack Studio',
                artisanLocation: 'Saket, Delhi',
                artisanPhone: '+91 98765 43241',
                artisanRating: 4.7,
                quantityNeeded: '12-18 kg/month',
                urgency: 'High - Corporate orders',
                preferredQuality: 'Premium embroidered fabrics'
            }
        ],
        henna: [
            {
                targetSkill: 'Natural Dye Making',
                usage: `Perfect for ${userName}! Natural dye artisans can use your leftover henna powder for fabric dyeing, creating organic color palettes, and eco-friendly textile coloring. Your henna expertise ensures quality dyes.`,
                savings: 2800,
                quality: 'Good',
                matchScore: 92,
                distance: '1.5 km',
                artisanName: 'Natural Dyes Studio',
                artisanLocation: 'Mehrauli, Delhi',
                artisanPhone: '+91 98765 43250',
                artisanRating: 4.6,
                quantityNeeded: '10-15 kg/month',
                urgency: 'Medium - Regular orders',
                preferredQuality: 'Pure henna powder'
            },
            {
                targetSkill: 'Cosmetics Crafting',
                usage: `Excellent match! Cosmetic artisans can incorporate your henna waste into natural beauty products, hair care items, and organic cosmetics. Your knowledge of henna quality is valuable.`,
                savings: 3200,
                quality: 'Premium',
                matchScore: 94,
                distance: '1.2 km',
                artisanName: 'Organic Beauty Lab',
                artisanLocation: 'Green Park, Delhi',
                artisanPhone: '+91 98765 43251',
                artisanRating: 4.8,
                quantityNeeded: '12-18 kg/month',
                urgency: 'High - Product launch',
                preferredQuality: 'Premium quality henna'
            },
            {
                targetSkill: 'Art Supplies',
                usage: `Creative opportunity for ${userName}! Art supply makers can use your henna for natural pigments, eco-friendly art materials, and organic painting supplies. Your henna adds authenticity.`,
                savings: 1600,
                quality: 'Good',
                matchScore: 85,
                distance: '2.8 km',
                artisanName: 'Eco Art Supplies',
                artisanLocation: 'Rajouri Garden, Delhi',
                artisanPhone: '+91 98765 43252',
                artisanRating: 4.4,
                quantityNeeded: '8-12 kg/month',
                urgency: 'Low - As needed',
                preferredQuality: 'Natural henna powder'
            },
            {
                targetSkill: 'Herbal Products',
                usage: `Natural synergy! Herbal product makers can use your henna waste for ayurvedic products, herbal hair treatments, and natural wellness items. Your expertise in henna quality is crucial.`,
                savings: 2400,
                quality: 'Good',
                matchScore: 89,
                distance: '1.9 km',
                artisanName: 'Ayurvedic Wellness',
                artisanLocation: 'Pitampura, Delhi',
                artisanPhone: '+91 98765 43253',
                artisanRating: 4.7,
                quantityNeeded: '15-20 kg/month',
                urgency: 'Medium - Regular production',
                preferredQuality: 'Quality henna waste'
            },
            {
                targetSkill: 'Organic Farming',
                usage: `Sustainable use! Organic farmers can use your henna waste as natural fertilizer, compost additive, and soil enrichment. Your henna contributes to organic agriculture.`,
                savings: 1200,
                quality: 'Standard',
                matchScore: 80,
                distance: '4.2 km',
                artisanName: 'Green Farm Delhi',
                artisanLocation: 'Najafgarh, Delhi',
                artisanPhone: '+91 98765 43254',
                artisanRating: 4.3,
                quantityNeeded: '50-100 kg/month',
                urgency: 'Low - Seasonal',
                preferredQuality: 'Any henna waste'
            },
            {
                targetSkill: 'Textile Printing',
                usage: `Innovative application for ${userName}! Textile printers can use your henna for natural fabric printing, eco-friendly textile designs, and organic pattern making. Your henna creates unique prints.`,
                savings: 2600,
                quality: 'Good',
                matchScore: 88,
                distance: '2.1 km',
                artisanName: 'Eco Print Studio',
                artisanLocation: 'Okhla, Delhi',
                artisanPhone: '+91 98765 43255',
                artisanRating: 4.6,
                quantityNeeded: '18-25 kg/month',
                urgency: 'Medium - Regular printing',
                preferredQuality: 'Pure henna for dyes'
            },
            {
                targetSkill: 'Natural Soap Making',
                usage: `Wellness opportunity! Soap makers can incorporate your henna into natural soaps, herbal cleansers, and organic bath products. Your quality henna enhances product value.`,
                savings: 2200,
                quality: 'Good',
                matchScore: 87,
                distance: '1.7 km',
                artisanName: 'Natural Soap Co',
                artisanLocation: 'Malviya Nagar, Delhi',
                artisanPhone: '+91 98765 43256',
                artisanRating: 4.5,
                quantityNeeded: '12-16 kg/month',
                urgency: 'Medium - Production batches',
                preferredQuality: 'Quality henna powder'
            },
            {
                targetSkill: 'Eco-Friendly Packaging',
                usage: `Green solution! Eco-packaging artisans can use henna-based dyes from your waste for natural packaging colors and organic wrapping materials. Your henna supports sustainability.`,
                savings: 1800,
                quality: 'Standard',
                matchScore: 83,
                distance: '3.1 km',
                artisanName: 'Green Pack Solutions',
                artisanLocation: 'Rohini, Delhi',
                artisanPhone: '+91 98765 43257',
                artisanRating: 4.4,
                quantityNeeded: '10-15 kg/month',
                urgency: 'Low - Experimental',
                preferredQuality: 'Any henna waste'
            },
            {
                targetSkill: 'Traditional Medicine',
                usage: `Ayurvedic value for ${userName}! Traditional medicine practitioners can use your henna waste for medicinal preparations, herbal remedies, and ayurvedic treatments. Your quality standards matter.`,
                savings: 2900,
                quality: 'Premium',
                matchScore: 91,
                distance: '1.4 km',
                artisanName: 'Ayurveda Clinic',
                artisanLocation: 'Laxmi Nagar, Delhi',
                artisanPhone: '+91 98765 43258',
                artisanRating: 4.8,
                quantityNeeded: '15-22 kg/month',
                urgency: 'High - Patient demand',
                preferredQuality: 'Premium quality henna'
            },
            {
                targetSkill: 'Natural Ink Making',
                usage: `Artistic use! Ink makers can use your henna for natural inks, organic writing materials, and eco-friendly art supplies. Your henna creates authentic natural inks.`,
                savings: 1500,
                quality: 'Good',
                matchScore: 82,
                distance: '3.5 km',
                artisanName: 'Artisan Inks',
                artisanLocation: 'Janakpuri, Delhi',
                artisanPhone: '+91 98765 43259',
                artisanRating: 4.3,
                quantityNeeded: '6-10 kg/month',
                urgency: 'Low - Small batches',
                preferredQuality: 'Natural henna'
            },
            {
                targetSkill: 'Hair Care Products',
                usage: `Beauty industry match! Hair care product makers can use your henna waste for hair masks, conditioning treatments, and natural hair colors. Your henna expertise ensures quality.`,
                savings: 3400,
                quality: 'Premium',
                matchScore: 93,
                distance: '1.1 km',
                artisanName: 'Natural Hair Studio',
                artisanLocation: 'Kalkaji, Delhi',
                artisanPhone: '+91 98765 43260',
                artisanRating: 4.9,
                quantityNeeded: '20-30 kg/month',
                urgency: 'High - High demand',
                preferredQuality: 'Premium henna powder'
            },
            {
                targetSkill: 'Craft Workshops',
                usage: `Educational opportunity for ${userName}! Craft workshop organizers can use your henna for teaching natural dyeing, traditional art classes, and cultural workshops. Your knowledge adds value.`,
                savings: 1900,
                quality: 'Good',
                matchScore: 84,
                distance: '2.5 km',
                artisanName: 'Craft Learning Center',
                artisanLocation: 'Mayur Vihar, Delhi',
                artisanPhone: '+91 98765 43261',
                artisanRating: 4.6,
                quantityNeeded: '8-12 kg/month',
                urgency: 'Low - Workshop based',
                preferredQuality: 'Teaching quality henna'
            }
        ]
    };
    
    // Select appropriate matches based on user skills
    let selectedMatches = [];
    
    for (const userSkill of userSkills) {
        const skillLower = userSkill.toLowerCase();
        if (matchDatabase[skillLower]) {
            selectedMatches.push(...matchDatabase[skillLower]);
        }
    }
    
    // If no specific matches, use tailoring as default
    if (selectedMatches.length === 0) {
        selectedMatches = matchDatabase.tailoring;
    }
    
    // Shuffle and return requested count
    selectedMatches = selectedMatches.sort(() => Math.random() - 0.5);
    return selectedMatches.slice(0, count).map(match => ({
        ...match,
        artisanSkills: userSkills.join(', ')
    }));
}

/**
 * Fallback matches if AI parsing fails
 */
function getFallbackMatches(userProfile = null) {
    // Use the comprehensive skill-based matches
    return generateSkillBasedMatches(userProfile, 'fabric scraps', 12);
}

module.exports = {
    findResourceMatches,
    getMatchInsights,
    analyzeCompatibility,
    getCircularityRecommendations,
    getWasteToWealthInsights
};
