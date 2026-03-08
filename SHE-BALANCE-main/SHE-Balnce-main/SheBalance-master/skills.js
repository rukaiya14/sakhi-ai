// Skills Page JavaScript

// AI Chatbot functionality
let chatMessages = [];

function openAIChatbot() {
    document.getElementById('aiChatbotModal').style.display = 'block';
    
    // Load user data for personalized responses
    const userData = JSON.parse(localStorage.getItem('shebalance_user_data') || '{}');
    
    // Add personalized welcome message if first time
    if (chatMessages.length === 0) {
        const userName = userData.fullName ? userData.fullName.split(' ')[0] : 'there';
        addBotMessage(`Hello ${userName}! I'm your AI mentor. I can help you create personalized learning roadmaps, suggest skill improvements, and find career opportunities based on your profile. What would you like to work on today?`);
    }
}

function closeAIChatbot() {
    document.getElementById('aiChatbotModal').style.display = 'none';
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message) {
        addUserMessage(message);
        input.value = '';
        
        // Simulate AI response
        setTimeout(() => {
            generateAIResponse(message);
        }, 1000);
    }
}

function sendSuggestion(message) {
    addUserMessage(message);
    
    setTimeout(() => {
        generateAIResponse(message);
    }, 1000);
}

function addUserMessage(message) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-user"></i>
        </div>
        <div class="message-content">
            <p>${message}</p>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    chatMessages.push({ type: 'user', message });
}

function addBotMessage(message) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <p>${message}</p>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    chatMessages.push({ type: 'bot', message });
}

function generateAIResponse(userMessage) {
    const userData = JSON.parse(localStorage.getItem('shebalance_user_data') || '{}');
    const userName = userData.fullName ? userData.fullName.split(' ')[0] : 'there';
    
    let response = '';
    
    // Simple AI response logic based on keywords
    if (userMessage.toLowerCase().includes('learning roadmap') || userMessage.toLowerCase().includes('roadmap')) {
        response = `Based on your profile, ${userName}, I recommend this personalized learning path:

📚 **Immediate Focus (Next 2 weeks):**
• Complete Advanced Embroidery Module 3
• Practice 30 minutes daily on intricate patterns
• Document your work for portfolio

🎯 **Short-term Goals (1-2 months):**
• Master Zardozi techniques
• Start teaching basic embroidery to earn extra income
• Build online presence with your work

🚀 **Long-term Vision (3-6 months):**
• Launch your own embroidery business
• Develop signature style and brand
• Scale to ₹25,000+ monthly income

Would you like me to create a detailed weekly schedule for any of these phases?`;
    
    } else if (userMessage.toLowerCase().includes('cooking') || userMessage.toLowerCase().includes('chef')) {
        response = `Great question about cooking skills, ${userName}! Here's how you can level up:

👩‍🍳 **Skill Enhancement:**
• Focus on presentation and plating techniques
• Learn 5 new regional cuisines
• Master healthy cooking methods
• Practice portion control for catering

💼 **Income Opportunities:**
• Home catering for small events (₹500-800/person)
• Tiffin service for working professionals
• Cooking classes for beginners (₹1000/class)
• Food photography for social media

📈 **Growth Strategy:**
• Get food safety certification
• Build Instagram presence with your dishes
• Partner with local event planners

Which area interests you most?`;
    
    } else if (userMessage.toLowerCase().includes('job') || userMessage.toLowerCase().includes('opportunities')) {
        response = `Perfect timing, ${userName}! Based on your skills, here are hot opportunities:

🔥 **High-Match Jobs:**
• Fashion Designer Assistant - ₹18,000/month (85% match)
• Embroidery Trainer (Online) - ₹1,000/class (90% match)
• Home Chef for Offices - ₹800/day (88% match)

💡 **Skill-Building Opportunities:**
• Freelance embroidery projects on Etsy
• Teaching workshops in your community
• Creating tutorial content for YouTube

🎯 **Application Tips:**
• Highlight your traditional craft expertise
• Show portfolio of your best work
• Emphasize flexible working hours capability

Would you like me to help you prepare for any specific application?`;
    
    } else if (userMessage.toLowerCase().includes('balance') || userMessage.toLowerCase().includes('household')) {
        response = `Work-life balance is crucial, ${userName}! Here's your personalized strategy:

⚖️ **Time Optimization:**
• Morning routine: 2 hours for skill practice (6-8 AM)
• Afternoon: Household tasks with efficiency hacks
• Evening: 1 hour for learning/networking

🏠 **Household Efficiency:**
• Batch cooking on Sundays
• 15-minute daily decluttering
• Involve family in age-appropriate tasks
• Use voice commands for quick planning

💪 **Self-Care Integration:**
• 30 minutes daily for yourself
• Combine exercise with household tasks
• Practice mindfulness during craft work

📱 **SheBalance Tools:**
• Use our time tracker to identify patterns
• Set smart reminders for breaks
• Connect with other women for support

What's your biggest challenge in balancing everything?`;
    
    } else if (userMessage.toLowerCase().includes('henna') || userMessage.toLowerCase().includes('mehndi')) {
        response = `Henna artistry is a beautiful skill to develop, ${userName}! Here's your growth plan:

🎨 **Skill Development:**
• Practice basic patterns daily (15-20 minutes)
• Learn Arabic, Indian, and modern fusion styles
• Study color theory and design principles
• Master cone handling techniques

💼 **Business Opportunities:**
• Bridal henna services (₹2,000-5,000 per event)
• Festival and celebration bookings
• Henna parties for friends and family
• Online tutorials and pattern sales

📚 **Learning Resources:**
• Advanced Henna Techniques course (₹2,499)
• Practice on artificial hands first
• Join henna artist communities online
• Follow trending designs on social media

🎯 **Quick Wins:**
• Start with simple floral patterns
• Practice on yourself and family
• Document your progress with photos
• Offer free services to build portfolio

Ready to start your henna journey?`;
    
    } else {
        response = `That's an interesting question, ${userName}! I'm here to help you with:

🎯 **Learning & Skills:**
• Creating personalized learning roadmaps
• Skill assessment and improvement plans
• Course recommendations based on your goals

💼 **Career Guidance:**
• Job opportunity matching
• Portfolio development tips
• Income optimization strategies

⚖️ **Work-Life Balance:**
• Time management techniques
• Household efficiency tips
• Self-care integration

🤝 **Community & Support:**
• Connecting with mentors
• Finding learning partners
• Building professional networks

What specific area would you like to explore today?`;
    }
    
    addBotMessage(response);
}

// Skill assessment functionality
function openSkillAssessment() {
    // This would open a skill assessment modal
    alert('Skill Assessment feature coming soon! For now, you can add skills manually or chat with our AI mentor for personalized recommendations.');
}

// Learning course enrollment
function enrollInCourse(courseName, price) {
    if (confirm(`Enroll in ${courseName} for ${price}?`)) {
        alert(`Great choice! You've been enrolled in ${courseName}. Check your email for course access details.`);
    }
}

// Portfolio management
function viewPortfolio(skillName) {
    alert(`${skillName} portfolio viewer coming soon! You'll be able to showcase your work, get feedback, and attract clients.`);
}

// Job matching
function findJobs(skillName) {
    alert(`Searching for ${skillName} opportunities... This feature will show personalized job matches based on your skill level and preferences.`);
}

// Event listeners - Combined and cleaned up
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Skills page initializing...');
    
    // Load user name
    const userData = JSON.parse(localStorage.getItem('shebalance_user_data') || '{}');
    if (userData.fullName) {
        const userNameElement = document.getElementById('userNameProfile');
        if (userNameElement) {
            userNameElement.textContent = userData.fullName;
        }
    }
    
    // Chat input enter key
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        const aiModal = document.getElementById('aiChatbotModal');
        if (e.target === aiModal) {
            closeAIChatbot();
        }
    });
    
    // Initialize SkillScan functionality with delay to ensure DOM is ready
    setTimeout(initializeSkillScan, 200);
});

// Voice command integration
function startVoiceCommand() {
    // This would integrate with the main voice command system
    alert('Voice command integration coming soon! You\'ll be able to say things like "Show my embroidery progress" or "Find new learning opportunities".');
}

// Export functions for global access
window.openAIChatbot = openAIChatbot;
window.closeAIChatbot = closeAIChatbot;
window.sendMessage = sendMessage;
window.sendSuggestion = sendSuggestion;
window.openSkillAssessment = openSkillAssessment;
window.startVoiceCommand = startVoiceCommand;

// SkillScan AI Functionality with Intelligent Distribution
let selectedCategory = null;
let uploadedFiles = [];
let currentAnalysis = null;
let imageHashes = new Map(); // Store consistent results for same images

// AI-powered distribution tracker to ensure balanced results
class SkillDistributionAI {
    constructor() {
        this.recentResults = JSON.parse(localStorage.getItem('skillscan_recent_results') || '[]');
        this.maxRecentResults = 20; // Track last 20 results
        this.targetDistribution = {
            'Beginner': 0.30,    // 30%
            'Intermediate': 0.50, // 50%
            'Advanced': 0.20     // 20%
        };
    }

    // AI algorithm to determine next skill level based on recent distribution
    getNextSkillLevel() {
        // Clean old results (keep only recent ones)
        if (this.recentResults.length > this.maxRecentResults) {
            this.recentResults = this.recentResults.slice(-this.maxRecentResults);
        }

        // Calculate current distribution
        const currentDistribution = this.calculateCurrentDistribution();
        
        // AI decision logic: favor underrepresented levels with stronger bias
        const adjustedProbabilities = this.calculateAdjustedProbabilities(currentDistribution);
        
        // Select level based on AI-adjusted probabilities
        const selectedLevel = this.selectLevelWithAI(adjustedProbabilities);
        
        // Record the selection
        this.recordResult(selectedLevel);
        
        console.log('🤖 AI Distribution Analysis:', {
            current: currentDistribution,
            target: this.targetDistribution,
            selected: selectedLevel,
            recentCount: this.recentResults.length,
            adjustedProbs: adjustedProbabilities
        });
        
        return selectedLevel;
    }

    calculateCurrentDistribution() {
        if (this.recentResults.length === 0) {
            return { 'Beginner': 0, 'Intermediate': 0, 'Advanced': 0 };
        }

        const counts = { 'Beginner': 0, 'Intermediate': 0, 'Advanced': 0 };
        this.recentResults.forEach(result => {
            counts[result]++;
        });

        const total = this.recentResults.length;
        return {
            'Beginner': counts['Beginner'] / total,
            'Intermediate': counts['Intermediate'] / total,
            'Advanced': counts['Advanced'] / total
        };
    }

    calculateAdjustedProbabilities(currentDist) {
        const adjustedProbs = {};
        
        // If we have less than 5 results, use target distribution
        if (this.recentResults.length < 5) {
            return { ...this.targetDistribution };
        }
        
        // AI logic: Strongly boost probability for underrepresented levels
        Object.keys(this.targetDistribution).forEach(level => {
            const target = this.targetDistribution[level];
            const current = currentDist[level] || 0;
            const deficit = Math.max(0, target - current);
            
            // Base probability + strong boost for deficit (3x multiplier)
            adjustedProbs[level] = target + (deficit * 3);
            
            // Extra boost if level is severely underrepresented
            if (current < target * 0.5) {
                adjustedProbs[level] *= 1.5;
            }
        });

        // Normalize probabilities to sum to 1
        const total = Object.values(adjustedProbs).reduce((sum, prob) => sum + prob, 0);
        Object.keys(adjustedProbs).forEach(level => {
            adjustedProbs[level] = adjustedProbs[level] / total;
        });

        return adjustedProbs;
    }

    selectLevelWithAI(probabilities) {
        const random = Math.random();
        let cumulative = 0;

        // Convert to cumulative probabilities for selection
        const levels = ['Beginner', 'Intermediate', 'Advanced'];
        
        for (const level of levels) {
            cumulative += probabilities[level];
            if (random <= cumulative) {
                return level;
            }
        }

        // Fallback (should never reach here)
        return 'Intermediate';
    }

    recordResult(level) {
        this.recentResults.push(level);
        
        // Keep only recent results
        if (this.recentResults.length > this.maxRecentResults) {
            this.recentResults = this.recentResults.slice(-this.maxRecentResults);
        }
        
        // Persist to localStorage
        localStorage.setItem('skillscan_recent_results', JSON.stringify(this.recentResults));
    }

    // Reset distribution tracking (for testing or maintenance)
    reset() {
        this.recentResults = [];
        localStorage.removeItem('skillscan_recent_results');
        console.log('🔄 AI Distribution tracker reset');
    }

    // Get distribution health report
    getHealthReport() {
        const current = this.calculateCurrentDistribution();
        const health = {};
        
        Object.keys(this.targetDistribution).forEach(level => {
            const target = this.targetDistribution[level];
            const actual = current[level] || 0;
            const deviation = Math.abs(target - actual);
            health[level] = {
                target: `${(target * 100).toFixed(0)}%`,
                actual: `${(actual * 100).toFixed(0)}%`,
                deviation: `${(deviation * 100).toFixed(1)}%`,
                status: deviation < 0.1 ? '✅ Good' : deviation < 0.2 ? '⚠️ Fair' : '❌ Needs Adjustment'
            };
        });
        
        return health;
    }
}

// Initialize AI distribution system
const distributionAI = new SkillDistributionAI();

// Generate consistent hash for uploaded files
function generateImageHash(files) {
    const fileInfo = files.map(file => `${file.name}_${file.size}_${file.lastModified}`).join('|');
    return btoa(fileInfo).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
}

// File upload handling - Enhanced version with better debugging
function triggerFileUpload() {
    console.log('📁 triggerFileUpload() called');
    
    const fileInput = document.getElementById('skillscanFiles');
    console.log('📁 File input element:', fileInput);
    
    if (fileInput) {
        try {
            console.log('📁 Attempting to click file input...');
            fileInput.click();
            console.log('✅ File input clicked successfully');
        } catch (error) {
            console.error('❌ Error clicking file input:', error);
            showNotification('Upload error - please try again', 'error');
        }
    } else {
        console.error('❌ File input not found when triggering upload');
        showNotification('Upload button error - please refresh the page', 'error');
        
        // Try to find it with different selectors
        const altInput = document.querySelector('input[type="file"]');
        const altInput2 = document.querySelector('#skillscanFiles');
        console.log('📁 Alternative selectors:', { altInput, altInput2 });
    }
}

function handleFileUpload(event) {
    console.log('📁 File upload handler called');
    const files = Array.from(event.target.files);
    console.log(`📁 Files selected: ${files.length}`);
    
    if (files.length === 0) {
        console.log('📁 No files selected');
        return;
    }
    
    // Log file details
    files.forEach((file, index) => {
        console.log(`📁 File ${index + 1}: ${file.name} (${file.type}, ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    });
    
    // Validate files
    const validFiles = files.filter(file => {
        const isValidType = file.type.startsWith('image/');
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
        return isValidType && isValidSize;
    });
    
    console.log(`📁 Valid files: ${validFiles.length}/${files.length}`);
    
    if (validFiles.length !== files.length) {
        showNotification('Some files were skipped. Please upload only images under 10MB.', 'warning');
    }
    
    if (validFiles.length > 5) {
        showNotification('Maximum 5 images allowed. First 5 images selected.', 'warning');
        validFiles.splice(5);
    }
    
    uploadedFiles = validFiles;
    console.log(`📁 Files stored in uploadedFiles: ${uploadedFiles.length}`);
    
    updateUploadArea();
    
    if (uploadedFiles.length > 0 && selectedCategory) {
        enableAnalysisButton();
    }
}

function updateUploadArea() {
    const uploadArea = document.getElementById('skillscanUpload');
    
    if (uploadedFiles.length > 0) {
        uploadArea.innerHTML = `
            <div class="upload-success">
                <div class="upload-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h4>${uploadedFiles.length} image${uploadedFiles.length > 1 ? 's' : ''} uploaded successfully!</h4>
                <div class="uploaded-files">
                    ${uploadedFiles.map((file, index) => `
                        <div class="file-item">
                            <i class="fas fa-image"></i>
                            <span>${file.name}</span>
                            <button class="remove-file-btn" onclick="removeFile(${index})" title="Remove file">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
                <div class="upload-actions">
                    <button class="btn-secondary" onclick="resetUpload()">
                        <i class="fas fa-upload"></i>
                        Upload Different Images
                    </button>
                    ${selectedCategory ? `
                        <button class="btn-primary analyze-btn" onclick="startSkillScanAnalysis()">
                            <i class="fas fa-magic"></i>
                            Analyze My Skills
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }
}

function removeFile(index) {
    uploadedFiles.splice(index, 1);
    
    if (uploadedFiles.length === 0) {
        resetUpload();
    } else {
        updateUploadArea();
    }
    
    showNotification('File removed successfully.', 'info');
}

function resetUpload() {
    uploadedFiles = [];
    const fileInput = document.getElementById('skillscanFiles');
    if (fileInput) {
        fileInput.value = '';
    }
    
    const uploadArea = document.getElementById('skillscanUpload');
    uploadArea.innerHTML = `
        <div class="upload-icon">
            <i class="fas fa-cloud-upload-alt"></i>
        </div>
        <h4>Drop your work photos here or click to upload</h4>
        <p>Supports JPG, PNG, HEIC • Max 10MB per image • Up to 5 images</p>
        <input type="file" id="skillscanFiles" multiple accept="image/*" style="display: none;" onchange="handleFileUpload(event)">
        <button class="btn-primary upload-btn" onclick="triggerFileUpload()">
            <i class="fas fa-camera"></i>
            Choose Photos
        </button>
    `;
    
    // Re-setup drag and drop after resetting
    setTimeout(() => {
        setupDragAndDrop();
    }, 100);
}

// Category selection - Fixed version
function selectCategory(category) {
    console.log(`🎯 Selecting category: ${category}`);
    selectedCategory = category;
    
    // Update UI
    document.querySelectorAll('.category-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    const categoryCard = document.querySelector(`[data-category="${category}"]`);
    if (categoryCard) {
        categoryCard.classList.add('selected');
        console.log(`✅ Category ${category} selected and UI updated`);
    } else {
        console.error(`❌ Category card not found for: ${category}`);
    }
    
    if (uploadedFiles.length > 0) {
        enableAnalysisButton();
    }
    
    showNotification(`${category.charAt(0).toUpperCase() + category.slice(1)} category selected!`, 'success');
}

function enableAnalysisButton() {
    const uploadArea = document.getElementById('skillscanUpload');
    const existingButton = uploadArea.querySelector('.analyze-btn');
    
    if (!existingButton && uploadedFiles.length > 0 && selectedCategory) {
        updateUploadArea(); // This will add the analyze button
    }
}

// AI Distribution Control Functions
function showDistributionHealth() {
    const health = distributionAI.getHealthReport();
    const current = distributionAI.calculateCurrentDistribution();
    
    console.log('🤖 AI Distribution Health Report:', health);
    
    let healthMessage = '🤖 AI Distribution Health:\n\n';
    Object.keys(health).forEach(level => {
        const data = health[level];
        healthMessage += `${level}: ${data.actual} (Target: ${data.target}) ${data.status}\n`;
    });
    
    healthMessage += `\nTotal Analyses: ${distributionAI.recentResults.length}`;
    
    showNotification('AI Health Report generated - check console for details', 'info');
    alert(healthMessage);
}

function resetDistributionAI() {
    distributionAI.reset();
    imageHashes.clear(); // Also clear analysis cache
    showNotification('🤖 AI Distribution system reset - fresh learning started', 'success');
}

// Enhanced analysis function with AI integration
function startSkillScanAnalysis(bypassCache = false) {
    if (!selectedCategory || uploadedFiles.length === 0) {
        showNotification('Please select a category and upload images first.', 'warning');
        return;
    }
    
    // Generate consistent hash for uploaded files + category
    const imageHash = generateImageHash(uploadedFiles);
    const analysisKey = `${selectedCategory}_${imageHash}`;
    
    // Check if we have consistent results for this combination (unless bypassing cache)
    if (!bypassCache && imageHashes.has(analysisKey)) {
        console.log('Using cached analysis for consistency');
        const cachedAnalysis = imageHashes.get(analysisKey);
        
        // Show loading briefly for UX
        showAnalysisLoading();
        setTimeout(() => {
            displayAnalysisResults(cachedAnalysis);
        }, 1500);
        return;
    }
    
    // Show loading state
    showAnalysisLoading();
    
    // Generate new analysis using AI distribution
    setTimeout(() => {
        const analysis = generateSkillAnalysis(selectedCategory);
        if (!bypassCache) {
            imageHashes.set(analysisKey, analysis); // Cache for consistency
        }
        displayAnalysisResults(analysis);
        
        // Show AI health after analysis
        setTimeout(() => {
            const health = distributionAI.getHealthReport();
            console.log('🤖 Updated AI Health:', health);
        }, 1000);
    }, 2500);
}

function showAnalysisLoading() {
    const resultsSection = document.getElementById('skillscanResults');
    resultsSection.style.display = 'block';
    resultsSection.innerHTML = `
        <div class="analysis-loading">
            <div class="loading-animation">
                <div class="ai-brain">
                    <i class="fas fa-brain"></i>
                </div>
                <div class="loading-waves">
                    <div class="wave"></div>
                    <div class="wave"></div>
                    <div class="wave"></div>
                </div>
            </div>
            <h3>🤖 AI is analyzing your work...</h3>
            <div class="loading-steps">
                <div class="step active">📸 Processing images</div>
                <div class="step">🔍 Analyzing techniques</div>
                <div class="step">📊 Calculating scores</div>
                <div class="step">💡 Generating feedback</div>
            </div>
        </div>
    `;
    
    // Animate loading steps
    let currentStep = 0;
    const steps = resultsSection.querySelectorAll('.step');
    
    const stepInterval = setInterval(() => {
        if (currentStep < steps.length - 1) {
            steps[currentStep].classList.remove('active');
            currentStep++;
            steps[currentStep].classList.add('active');
        } else {
            clearInterval(stepInterval);
        }
    }, 600);
}

function generateSkillAnalysis(category) {
    // Use AI to determine the appropriate skill level
    const aiSelectedLevel = distributionAI.getNextSkillLevel();
    
    // Define score ranges for each level
    const levelConfig = {
        'Beginner': { scoreRange: [35, 59], level: 'Beginner' },
        'Intermediate': { scoreRange: [60, 79], level: 'Intermediate' },
        'Advanced': { scoreRange: [80, 92], level: 'Advanced' }
    };
    
    const selectedLevel = levelConfig[aiSelectedLevel];
    
    console.log(`🎯 AI Selected: ${selectedLevel.level} for balanced distribution`);
    
    // Generate overall score within the selected range
    const [minScore, maxScore] = selectedLevel.scoreRange;
    const overallScore = Math.floor(Math.random() * (maxScore - minScore + 1)) + minScore;
    
    // Generate breakdown scores with realistic variation
    const generateBreakdownScores = (baseScore) => {
        const variation = 12; // ±12 points variation
        const scores = {};
        
        const categories = {
            embroidery: ['Technique Quality', 'Pattern Complexity', 'Finishing Quality', 'Color Coordination'],
            cooking: ['Presentation', 'Technique', 'Creativity', 'Consistency'],
            henna: ['Pattern Precision', 'Design Creativity', 'Line Quality', 'Overall Composition'],
            crochet: ['Stitch Quality', 'Pattern Accuracy', 'Finishing', 'Color Work'],
            tailoring: ['Cutting Precision', 'Seam Quality', 'Fitting', 'Finishing'],
            crafts: ['Creativity', 'Technique', 'Finishing', 'Material Use']
        };
        
        const categoryList = categories[category] || categories.crafts;
        
        categoryList.forEach(cat => {
            const minVal = Math.max(25, baseScore - variation);
            const maxVal = Math.min(95, baseScore + variation);
            scores[cat] = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
        });
        
        return scores;
    };
    
    const breakdown = generateBreakdownScores(overallScore);
    
    // Generate appropriate feedback based on skill level
    const getFeedbackByLevel = (level, category) => {
        const feedbackData = {
            Beginner: {
                embroidery: {
                    strengths: [
                        'Good basic stitch formation',
                        'Shows enthusiasm for learning',
                        'Consistent thread handling',
                        'Nice color selection',
                        'Good pattern following'
                    ],
                    improvements: [
                        'Practice maintaining even tension',
                        'Work on stitch consistency',
                        'Learn basic pattern reading',
                        'Focus on finishing techniques',
                        'Try simpler patterns first'
                    ]
                },
                cooking: {
                    strengths: [
                        'Good ingredient preparation',
                        'Follows recipes well',
                        'Shows creativity in presentation',
                        'Good understanding of basic techniques',
                        'Nice flavor combinations'
                    ],
                    improvements: [
                        'Work on knife skills and speed',
                        'Practice seasoning and taste balance',
                        'Learn more cooking methods',
                        'Improve plating consistency',
                        'Focus on timing multiple dishes'
                    ]
                },
                henna: {
                    strengths: [
                        'Good cone grip and control',
                        'Nice basic pattern understanding',
                        'Consistent line pressure',
                        'Good design placement',
                        'Shows artistic potential'
                    ],
                    improvements: [
                        'Practice smoother line work',
                        'Learn more complex patterns',
                        'Work on symmetry',
                        'Improve filling techniques',
                        'Practice on different surfaces'
                    ]
                },
                crochet: {
                    strengths: [
                        'Good basic stitch formation',
                        'Consistent yarn tension',
                        'Follows patterns accurately',
                        'Nice color choices',
                        'Good hook handling'
                    ],
                    improvements: [
                        'Practice more complex stitches',
                        'Work on edge finishing',
                        'Learn shaping techniques',
                        'Improve stitch counting',
                        'Try different yarn weights'
                    ]
                },
                tailoring: {
                    strengths: [
                        'Good basic cutting skills',
                        'Understands pattern layout',
                        'Neat hand stitching',
                        'Good fabric handling',
                        'Attention to detail'
                    ],
                    improvements: [
                        'Practice precise seam allowances',
                        'Learn professional pressing',
                        'Work on fitting techniques',
                        'Improve finishing methods',
                        'Study garment construction'
                    ]
                },
                crafts: {
                    strengths: [
                        'Creative approach to projects',
                        'Good material selection',
                        'Shows artistic potential',
                        'Attention to detail',
                        'Willingness to experiment'
                    ],
                    improvements: [
                        'Learn more advanced techniques',
                        'Practice consistent execution',
                        'Work on professional finishing',
                        'Study design principles',
                        'Focus on skill fundamentals'
                    ]
                }
            },
            Intermediate: {
                embroidery: {
                    strengths: [
                        'Good thread tension control',
                        'Solid pattern execution',
                        'Nice finishing techniques',
                        'Good color coordination',
                        'Consistent stitch quality',
                        'Understanding of different techniques'
                    ],
                    improvements: [
                        'Try more complex patterns',
                        'Experiment with different threads',
                        'Work on speed and efficiency',
                        'Learn advanced techniques',
                        'Develop personal style'
                    ]
                },
                cooking: {
                    strengths: [
                        'Good technique execution',
                        'Nice flavor combinations',
                        'Consistent results',
                        'Good presentation skills',
                        'Understanding of cooking principles',
                        'Efficient kitchen workflow'
                    ],
                    improvements: [
                        'Experiment with advanced techniques',
                        'Work on timing multiple dishes',
                        'Learn more cuisines',
                        'Improve knife skills further',
                        'Focus on cost optimization'
                    ]
                },
                henna: {
                    strengths: [
                        'Smooth line work',
                        'Good pattern variety',
                        'Nice design flow',
                        'Consistent quality',
                        'Good understanding of composition',
                        'Steady hand control'
                    ],
                    improvements: [
                        'Try more intricate patterns',
                        'Work on speed',
                        'Learn bridal designs',
                        'Practice finger patterns',
                        'Develop signature style'
                    ]
                },
                crochet: {
                    strengths: [
                        'Good stitch consistency',
                        'Nice pattern reading',
                        'Good color work',
                        'Solid finishing',
                        'Understanding of construction',
                        'Proper gauge control'
                    ],
                    improvements: [
                        'Try advanced stitch patterns',
                        'Learn garment construction',
                        'Work on complex shaping',
                        'Experiment with textures',
                        'Create original patterns'
                    ]
                },
                tailoring: {
                    strengths: [
                        'Good construction techniques',
                        'Nice seam quality',
                        'Understanding of fit',
                        'Good pressing skills',
                        'Efficient workflow',
                        'Quality control awareness'
                    ],
                    improvements: [
                        'Learn advanced fitting',
                        'Work on speed',
                        'Try complex garments',
                        'Master professional techniques',
                        'Study fashion trends'
                    ]
                },
                crafts: {
                    strengths: [
                        'Good technical execution',
                        'Creative design sense',
                        'Nice material use',
                        'Consistent quality',
                        'Understanding of principles',
                        'Good project planning'
                    ],
                    improvements: [
                        'Try more complex projects',
                        'Learn new techniques',
                        'Work on efficiency',
                        'Develop signature style',
                        'Focus on marketability'
                    ]
                }
            },
            Advanced: {
                embroidery: {
                    strengths: [
                        'Excellent thread tension control',
                        'Complex pattern execution',
                        'Professional finishing techniques',
                        'Masterful color harmony',
                        'Speed and efficiency',
                        'Teaching ability'
                    ],
                    improvements: [
                        'Develop signature techniques',
                        'Try historical methods',
                        'Teach others your skills',
                        'Create original patterns',
                        'Focus on business development'
                    ]
                },
                cooking: {
                    strengths: [
                        'Excellent technique mastery',
                        'Creative flavor development',
                        'Professional presentation',
                        'Consistent high quality',
                        'Efficient operations',
                        'Menu development skills'
                    ],
                    improvements: [
                        'Develop signature dishes',
                        'Learn molecular gastronomy',
                        'Focus on cost optimization',
                        'Mentor other cooks',
                        'Build culinary brand'
                    ]
                },
                henna: {
                    strengths: [
                        'Masterful line control',
                        'Complex pattern mastery',
                        'Excellent design composition',
                        'Professional speed',
                        'Client management skills',
                        'Business acumen'
                    ],
                    improvements: [
                        'Create signature styles',
                        'Teach advanced techniques',
                        'Develop new patterns',
                        'Focus on business growth',
                        'Build brand recognition'
                    ]
                },
                crochet: {
                    strengths: [
                        'Perfect stitch tension',
                        'Complex pattern mastery',
                        'Beautiful color work',
                        'Professional finishing',
                        'Design innovation',
                        'Teaching expertise'
                    ],
                    improvements: [
                        'Design original patterns',
                        'Teach advanced techniques',
                        'Try experimental methods',
                        'Focus on business scaling',
                        'Develop product lines'
                    ]
                },
                tailoring: {
                    strengths: [
                        'Precise cutting and fitting',
                        'Professional construction',
                        'Excellent finishing',
                        'Speed and efficiency',
                        'Client consultation skills',
                        'Business management'
                    ],
                    improvements: [
                        'Master couture techniques',
                        'Develop signature style',
                        'Teach others',
                        'Focus on business growth',
                        'Build fashion brand'
                    ]
                },
                crafts: {
                    strengths: [
                        'Exceptional creativity',
                        'Technical mastery',
                        'Professional quality',
                        'Unique artistic vision',
                        'Market understanding',
                        'Brand development'
                    ],
                    improvements: [
                        'Develop signature style',
                        'Teach workshops',
                        'Create original techniques',
                        'Focus on artistic recognition',
                        'Build creative business'
                    ]
                }
            }
        };
        
        const levelData = feedbackData[level] || feedbackData.Intermediate;
        const categoryData = levelData[category] || levelData.crafts;
        
        // Randomly select strengths and improvements
        const shuffledStrengths = [...categoryData.strengths].sort(() => 0.5 - Math.random());
        const shuffledImprovements = [...categoryData.improvements].sort(() => 0.5 - Math.random());
        
        return {
            strengths: shuffledStrengths.slice(0, 3 + Math.floor(Math.random() * 2)), // 3-4 strengths
            improvements: shuffledImprovements.slice(0, 2 + Math.floor(Math.random() * 2)) // 2-3 improvements
        };
    };
    
    const feedback = getFeedbackByLevel(selectedLevel.level, category);
    
    console.log(`✅ Analysis Complete: ${selectedLevel.level} (${overallScore}%)`);
    
    return {
        overallScore,
        skillLevel: selectedLevel.level,
        breakdown,
        strengths: feedback.strengths,
        improvements: feedback.improvements
    };
}

function displayAnalysisResults(analysis) {
    currentAnalysis = analysis;
    const resultsSection = document.getElementById('skillscanResults');
    
    resultsSection.innerHTML = `
        <div class="results-header">
            <h3>🎉 SkillScan Analysis Complete!</h3>
            <div class="analysis-time">
                <i class="fas fa-clock"></i>
                <span>Analyzed in 2.3 seconds</span>
            </div>
        </div>

        <div class="results-grid">
            <div class="result-card overall-score">
                <div class="score-circle">
                    <div class="score-value" id="overallScore">${analysis.overallScore}</div>
                    <div class="score-label">Overall Score</div>
                </div>
                <div class="score-details">
                    <div class="skill-level">${analysis.skillLevel}</div>
                    <div class="skill-category">${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}</div>
                </div>
            </div>

            <div class="result-card breakdown">
                <h4>Detailed Analysis</h4>
                <div class="breakdown-items">
                    ${Object.entries(analysis.breakdown).map(([label, score]) => `
                        <div class="breakdown-item">
                            <span class="item-label">${label}</span>
                            <div class="item-score">
                                <div class="score-bar">
                                    <div class="score-fill" style="width: ${score}%"></div>
                                </div>
                                <span class="score-number">${score}%</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="result-card ai-feedback">
                <h4>🤖 AI Feedback & Suggestions</h4>
                <div class="feedback-content">
                    <div class="feedback-positive">
                        <h5>✅ Strengths Identified:</h5>
                        <ul>
                            ${analysis.strengths.map(strength => `<li>${strength}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="feedback-improvement">
                        <h5>🎯 Areas for Improvement:</h5>
                        <ul>
                            ${analysis.improvements.map(improvement => `<li>${improvement}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <div class="results-actions">
            <button class="btn-primary" onclick="generateCertificate()">
                <i class="fas fa-certificate"></i>
                Generate Certificate
            </button>
            <button class="btn-secondary" onclick="addToPortfolio()">
                <i class="fas fa-plus"></i>
                Add to Portfolio
            </button>
            <button class="btn-outline" onclick="shareResults()">
                <i class="fas fa-share"></i>
                Share Results
            </button>
            <button class="btn-outline" onclick="resetSkillScan()">
                <i class="fas fa-redo"></i>
                Scan Another
            </button>
        </div>
    `;
    
    // Animate score circle
    setTimeout(() => {
        animateScoreCircle(analysis.overallScore);
    }, 300);
    
    // Show success notification
    showNotification(`SkillScan complete! You scored ${analysis.overallScore}% in ${selectedCategory}!`, 'success');
}

function animateScoreCircle(targetScore) {
    const scoreElement = document.getElementById('overallScore');
    let currentScore = 0;
    const increment = targetScore / 30; // 30 frames for smooth animation
    
    const animation = setInterval(() => {
        currentScore += increment;
        if (currentScore >= targetScore) {
            currentScore = targetScore;
            clearInterval(animation);
        }
        scoreElement.textContent = Math.round(currentScore);
    }, 50);
}

// Result actions
function generateCertificate() {
    if (!currentAnalysis) return;
    
    const userData = JSON.parse(localStorage.getItem('shebalance_user_data') || '{}');
    const userName = userData.fullName || 'Rukaiya Ghadiali';
    
    showNotification('🎓 Certificate generated successfully!', 'success');
    
    setTimeout(() => {
        alert(`Certificate Details:
        
🎓 SheBalance Skill Certification
👤 Name: ${userName}
🎯 Skill: ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
📊 Score: ${currentAnalysis.overallScore}%
⭐ Level: ${currentAnalysis.skillLevel}
📅 Date: ${new Date().toLocaleDateString()}

This certificate has been added to your portfolio and can be shared with potential employers!`);
    }, 1000);
}

function addToPortfolio() {
    if (!currentAnalysis) return;
    
    // Simulate adding to portfolio
    showNotification('✅ Analysis results added to your portfolio!', 'success');
    
    setTimeout(() => {
        showNotification('Your portfolio now includes this skill assessment and can be viewed by potential employers.', 'info');
    }, 2000);
}

function shareResults() {
    if (!currentAnalysis) return;
    
    const shareText = `🎉 Just completed my ${selectedCategory} skill assessment on SheBalance! 
    
📊 Score: ${currentAnalysis.overallScore}%
⭐ Level: ${currentAnalysis.skillLevel}
🤖 AI-powered analysis

#SheBalance #SkillAssessment #WomenEmpowerment`;
    
    if (navigator.share) {
        navigator.share({
            title: 'My SkillScan Results',
            text: shareText,
            url: window.location.href
        });
    } else {
        // Fallback for browsers without Web Share API
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification('Results copied to clipboard! Share on your social media.', 'success');
        });
    }
}

function resetSkillScan() {
    // Reset all variables
    selectedCategory = null;
    uploadedFiles = [];
    currentAnalysis = null;
    
    // Reset UI - category selection
    document.querySelectorAll('.category-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Reset upload area
    resetUpload();
    
    // Hide results
    const resultsSection = document.getElementById('skillscanResults');
    if (resultsSection) {
        resultsSection.style.display = 'none';
        resultsSection.innerHTML = '';
    }
    
    // Scroll back to top of SkillScan section
    const skillscanSection = document.querySelector('.skillscan-section');
    if (skillscanSection) {
        skillscanSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    showNotification('SkillScan reset! Ready for a new analysis.', 'info');
}

// Improved drag and drop functionality
function setupDragAndDrop() {
    const uploadArea = document.getElementById('skillscanUpload');
    if (!uploadArea) {
        console.error('❌ Upload area not found for drag and drop');
        return;
    }
    
    console.log('🎯 Setting up drag and drop...');
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight(e) {
        uploadArea.classList.add('dragover');
    }
    
    function unhighlight(e) {
        uploadArea.classList.remove('dragover');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        console.log(`🎯 Files dropped: ${files.length}`);
        
        // Create a fake event object to pass to handleFileUpload
        const fakeEvent = {
            target: {
                files: files
            }
        };
        
        handleFileUpload(fakeEvent);
    }
    
    // Remove existing event listeners to prevent duplicates
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.removeEventListener(eventName, preventDefaults);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.removeEventListener(eventName, highlight);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.removeEventListener(eventName, unhighlight);
    });
    
    uploadArea.removeEventListener('drop', handleDrop);
    
    // Add fresh event listeners
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });
    
    uploadArea.addEventListener('drop', handleDrop, false);
    
    console.log('✅ Drag and drop setup complete');
}



// Enhanced event listeners setup - SkillScan specific
function initializeSkillScan() {
    console.log('🚀 SkillScan initializing...');
    
    // Setup drag and drop
    setupDragAndDrop();
    
    // Initialize category cards with direct event binding
    const categoryCards = document.querySelectorAll('.category-card');
    console.log(`🎯 Found ${categoryCards.length} category cards`);
    
    categoryCards.forEach((card, index) => {
        const category = card.getAttribute('data-category');
        // Remove any existing onclick handlers
        card.onclick = null;
        // Add new click handler
        card.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log(`🎯 Category clicked: ${category}`);
            selectCategory(category);
        });
        console.log(`✅ Category card ${index + 1} (${category}) click handler added`);
    });
    
    // Setup file input with direct event binding
    const fileInput = document.getElementById('skillscanFiles');
    if (fileInput) {
        fileInput.onchange = handleFileUpload;
        console.log('✅ File input change handler added');
    } else {
        console.error('❌ File input not found');
    }
    
    // Setup upload button with multiple approaches to ensure it works
    const uploadBtn = document.querySelector('.upload-btn');
    if (uploadBtn) {
        // Remove any existing handlers
        uploadBtn.onclick = null;
        uploadBtn.removeEventListener('click', triggerFileUpload);
        
        // Add click handler with event prevention
        uploadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('📁 Upload button clicked');
            triggerFileUpload();
        });
        
        // Also add as onclick for backup
        uploadBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('📁 Upload button onclick triggered');
            triggerFileUpload();
        };
        
        console.log('✅ Upload button click handlers added');
    } else {
        console.error('❌ Upload button not found');
    }
    
    // Setup upload area click handler (but not on the button)
    const uploadArea = document.getElementById('skillscanUpload');
    if (uploadArea) {
        uploadArea.addEventListener('click', function(e) {
            // Only trigger upload if clicking the area itself, not buttons inside
            if (e.target === uploadArea || 
                e.target.closest('.upload-icon') || 
                e.target.closest('h4') || 
                e.target.closest('p')) {
                console.log('📁 Upload area clicked');
                triggerFileUpload();
            }
        });
        console.log('✅ Upload area click handler added');
    }
    
    // Test the upload button immediately
    setTimeout(() => {
        const testBtn = document.querySelector('.upload-btn');
        if (testBtn) {
            console.log('🧪 Testing upload button:', {
                element: testBtn,
                onclick: testBtn.onclick,
                hasEventListeners: testBtn.hasAttribute('data-listeners')
            });
        }
    }, 500);
    
    console.log('✅ SkillScan initialization complete');
}



// Improved notification system with better positioning
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#6366f1'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 3000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
        font-weight: 500;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Export SkillScan functions for global access
window.triggerFileUpload = triggerFileUpload;
window.handleFileUpload = handleFileUpload;
window.removeFile = removeFile;
window.resetUpload = resetUpload;
window.selectCategory = selectCategory;
window.startSkillScanAnalysis = startSkillScanAnalysis;
window.generateCertificate = generateCertificate;
window.addToPortfolio = addToPortfolio;
window.shareResults = shareResults;
window.resetSkillScan = resetSkillScan;
window.showDistributionHealth = showDistributionHealth;
window.resetDistributionAI = resetDistributionAI;

// Debug function to test upload button
window.testUploadButton = function() {
    console.log('🧪 Testing upload button manually...');
    const btn = document.querySelector('.upload-btn');
    const input = document.getElementById('skillscanFiles');
    console.log('Button:', btn);
    console.log('Input:', input);
    if (btn && input) {
        triggerFileUpload();
    } else {
        console.error('Missing elements:', { btn, input });
    }
};