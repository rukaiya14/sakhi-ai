// Dashboard JavaScript - Clean Version

// Check authentication on page load
(function checkAuth() {
    const user = localStorage.getItem('shebalance_user');
    
    if (!user) {
        // No user logged in, redirect to home page
        alert('Please login to access the dashboard');
        window.location.href = 'index.html';
        return;
    }
    
    // Parse user data
    const userData = JSON.parse(user);
    console.log('Logged in as:', userData.name, '(' + userData.role + ')');
    
    // Update UI with user info
    document.addEventListener('DOMContentLoaded', function() {
        updateDashboardForUser(userData);
    });
})();

function updateDashboardForUser(user) {
    // Update user name in header
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = user.name;
    }
    
    // Update user name in profile
    const userNameProfile = document.getElementById('userNameProfile');
    if (userNameProfile) {
        userNameProfile.textContent = user.name;
    }
    
    // Show admin-specific features if admin
    if (user.role === 'admin') {
        document.body.classList.add('admin-view');
        console.log('Admin features enabled');
        
        // You can add admin-specific UI elements here
        const headerLeft = document.querySelector('.header-left h1');
        if (headerLeft) {
            headerLeft.innerHTML = `Hello, <span id="userName">${user.name}</span>! <span style="background: #f39c12; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; margin-left: 8px;">ADMIN</span>`;
        }
    }
}

// Logout function
function logout() {
    localStorage.removeItem('shebalance_user');
    alert('You have been logged out successfully');
    window.location.href = 'index.html';
}

let currentStep = 1;
let userData = {};
let isVoiceActive = false;
let recognition = null;
let currentLanguage = 'en';
let isTranslated = false;

// AI Core Validation System - Essential for platform operation
let aiCoreStatus = false;
let aiValidationAttempts = 0;
let aiHeartbeatInterval = null;

// Initialize AI Core Validation
function initializeAICore() {
    console.log('🤖 Initializing AI Core System...');
    
    // Simulate AI service connection
    validateAIConnection()
        .then(() => {
            aiCoreStatus = true;
            console.log('✅ AI Core System Online');
            startAIHeartbeat();
            enablePlatformFeatures();
        })
        .catch(() => {
            aiCoreStatus = false;
            console.error('❌ AI Core System Failed');
            handleAIFailure();
        });
}

// Validate AI Connection (simulated)
function validateAIConnection() {
    return new Promise((resolve, reject) => {
        aiValidationAttempts++;
        
        // Simulate AI service validation - Always succeed for demo
        setTimeout(() => {
            // For demo purposes, AI is always available
            resolve('AI Core Connected');
        }, 500 + Math.random() * 1000); // 0.5-1.5 second delay
    });
}

// Start AI Heartbeat - Continuous validation
function startAIHeartbeat() {
    aiHeartbeatInterval = setInterval(() => {
        validateAIHeartbeat();
    }, 30000); // Check every 30 seconds
}

// Validate AI Heartbeat
function validateAIHeartbeat() {
    // Simulate AI service heartbeat - Always succeed for demo
    const heartbeatSuccess = true; // Always successful for demo
    
    if (!heartbeatSuccess) {
        console.warn('⚠️ AI Heartbeat Lost');
        aiCoreStatus = false;
        handleAIFailure();
    } else {
        console.log('💓 AI Heartbeat OK');
        aiCoreStatus = true;
        updateAIStatusIndicator();
    }
}

// Handle AI Failure - Less disruptive
function handleAIFailure() {
    console.warn('⚠️ AI Core System Issue Detected - Running in Basic Mode');
    
    // Don't disable features, just show a subtle notice
    showAILimitedNotice();
    
    // Attempt reconnection in background
    setTimeout(() => {
        if (aiValidationAttempts < 3) {
            console.log('🔄 Background AI Core Reconnection...');
            initializeAICore();
        }
    }, 10000); // Try again in 10 seconds
}

// Show subtle AI limited notice instead of blocking modal
function showAILimitedNotice() {
    // Remove existing notice
    const existingNotice = document.querySelector('.ai-limited-notice');
    if (existingNotice) {
        existingNotice.remove();
    }
    
    const notice = document.createElement('div');
    notice.className = 'ai-limited-notice';
    notice.innerHTML = `
        <div class="notice-content">
            <i class="fas fa-info-circle"></i>
            <span>Running in basic mode - AI features connecting...</span>
            <button class="notice-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    document.body.appendChild(notice);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notice.parentElement) {
            notice.remove();
        }
    }, 5000);
}

// Enable Platform Features (when AI is available)
function enablePlatformFeatures() {
    // Remove any AI dependency overlays
    const aiOverlay = document.querySelector('.ai-dependency-overlay');
    if (aiOverlay) {
        aiOverlay.remove();
    }
    
    // Enable all interactive elements
    const interactiveElements = document.querySelectorAll('button, input, select, textarea');
    interactiveElements.forEach(element => {
        element.disabled = false;
        element.style.opacity = '1';
        element.style.pointerEvents = 'auto';
        element.title = '';
    });
    
    console.log('✅ Platform Features Enabled - AI Core Active');
}

// Disable Platform Features (when AI is unavailable) - Less restrictive
function disablePlatformFeatures() {
    // Only disable non-essential interactive elements
    const nonEssentialElements = document.querySelectorAll('.btn-apply, .enrollment-btn');
    nonEssentialElements.forEach(element => {
        element.disabled = true;
        element.style.opacity = '0.7';
        element.title = 'AI services connecting...';
    });
    
    console.log('🔒 Some Platform Features Limited - AI Core Connecting');
}

// Show AI Dependency Notice
function showAIDependencyNotice() {
    const existingOverlay = document.querySelector('.ai-dependency-overlay');
    if (existingOverlay) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'ai-dependency-overlay';
    overlay.innerHTML = `
        <div class="ai-dependency-modal">
            <div class="ai-status-icon">
                <i class="fas fa-robot"></i>
            </div>
            <h3>AI Core System Required</h3>
            <p>SheBalance requires AI services to function properly. Attempting to reconnect...</p>
            <div class="ai-loading">
                <div class="loading-spinner"></div>
                <span>Connecting to AI services...</span>
            </div>
            <button class="btn-primary ai-reconnect" onclick="forceAIReconnection()">
                <i class="fas fa-sync-alt"></i>
                Retry Connection
            </button>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

// Show Critical AI Error
function showCriticalAIError() {
    const overlay = document.querySelector('.ai-dependency-overlay');
    if (overlay) {
        overlay.innerHTML = `
            <div class="ai-dependency-modal critical">
                <div class="ai-status-icon error">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>AI Services Unavailable</h3>
                <p>SheBalance cannot operate without AI integration. Please check your connection and try again.</p>
                <div class="error-details">
                    <p><strong>Error Code:</strong> AI_CORE_FAILURE</p>
                    <p><strong>Attempts:</strong> ${aiValidationAttempts}/5</p>
                </div>
                <div class="error-actions">
                    <button class="btn-primary ai-reconnect" onclick="forceAIReconnection()">
                        <i class="fas fa-sync-alt"></i>
                        Retry Connection
                    </button>
                    <button class="btn-secondary" onclick="contactSupport()">
                        <i class="fas fa-headset"></i>
                        Contact Support
                    </button>
                </div>
            </div>
        `;
    }
}

// Force AI Reconnection
function forceAIReconnection() {
    aiValidationAttempts = 0;
    console.log('🔄 Force AI Reconnection Initiated');
    
    // Update UI to show reconnection attempt
    const overlay = document.querySelector('.ai-dependency-overlay');
    if (overlay) {
        overlay.innerHTML = `
            <div class="ai-dependency-modal">
                <div class="ai-status-icon">
                    <i class="fas fa-robot"></i>
                </div>
                <h3>Reconnecting to AI Core</h3>
                <p>Please wait while we establish connection to AI services...</p>
                <div class="ai-loading">
                    <div class="loading-spinner"></div>
                    <span>Initializing AI connection...</span>
                </div>
            </div>
        `;
    }
    
    initializeAICore();
}

// Contact Support
function contactSupport() {
    showNotification('Redirecting to support...', 'info');
    // In a real implementation, this would open support chat or email
    setTimeout(() => {
        showNotification('Support contact feature would be implemented here', 'info');
    }, 1000);
}

// AI-Dependent Feature Wrapper
function requireAI(callback, featureName = 'feature') {
    if (!aiCoreStatus) {
        showNotification(`${featureName} is running in basic mode (AI services connecting...)`, 'info');
        // Still execute the callback but with a note
        callback();
        return true;
    }
    
    // Add AI processing indicator
    const aiIndicator = document.createElement('div');
    aiIndicator.className = 'ai-processing-indicator';
    aiIndicator.innerHTML = `
        <i class="fas fa-robot"></i>
        <span>AI Processing...</span>
    `;
    document.body.appendChild(aiIndicator);
    
    // Execute callback with AI processing simulation
    setTimeout(() => {
        callback();
        aiIndicator.remove();
    }, 300 + Math.random() * 500);
    
    return true;
}

// User Database System
class UserDatabase {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('shebalance_users_db') || '{}');
        this.currentUser = localStorage.getItem('shebalance_current_user') || null;
    }
    
    createUser(userData) {
        const userId = 'user_' + Date.now();
        this.users[userId] = {
            ...userData,
            id: userId,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
        this.saveDatabase();
        return userId;
    }
    
    getUser(userId) {
        return this.users[userId] || null;
    }
    
    updateUser(userId, updates) {
        if (this.users[userId]) {
            this.users[userId] = { ...this.users[userId], ...updates };
            this.saveDatabase();
            return true;
        }
        return false;
    }
    
    setCurrentUser(userId) {
        this.currentUser = userId;
        localStorage.setItem('shebalance_current_user', userId);
        if (this.users[userId]) {
            this.users[userId].lastLogin = new Date().toISOString();
            this.saveDatabase();
        }
    }
    
    getCurrentUser() {
        return this.currentUser ? this.getUser(this.currentUser) : null;
    }
    
    saveDatabase() {
        localStorage.setItem('shebalance_users_db', JSON.stringify(this.users));
    }
}

// Initialize database
const userDB = new UserDatabase();

// Translation Functions - Separate Hindi and English functions
// isTranslated variable already declared at the top of the file

// Dedicated Hindi translation function
function applyHindiTranslation() {
    console.log('Applying Hindi translations...');
    
    // Header greeting
    const greeting = document.querySelector('.header h1');
    if (greeting) {
        const userName = document.getElementById('userName')?.textContent || 'Rukaiya';
        greeting.innerHTML = `नमस्ते, <span id="userName">${userName}</span>!`;
        console.log('✓ Updated greeting to Hindi');
    }
    
    // Main balance heading
    const balanceHeading = document.querySelector('.balance-card h2');
    if (balanceHeading) {
        balanceHeading.textContent = 'आज का संतुलन';
        console.log('✓ Updated balance heading to Hindi');
    }
    
    // Balance labels - target each specifically
    const householdLabel = document.querySelector('.balance-item:nth-child(1) .balance-label');
    if (householdLabel) {
        householdLabel.textContent = 'घरेलू काम';
        console.log('✓ Updated household work label');
    }
    
    const careerLabel = document.querySelector('.balance-item:nth-child(2) .balance-label');
    if (careerLabel) {
        careerLabel.textContent = 'करियर समय';
        console.log('✓ Updated career time label');
    }
    
    const selfCareLabel = document.querySelector('.balance-item:nth-child(3) .balance-label');
    if (selfCareLabel) {
        selfCareLabel.textContent = 'स्व-देखभाल';
        console.log('✓ Updated self care label');
    }
    
    const progressLabel = document.querySelector('.balance-item:nth-child(4) .balance-label');
    if (progressLabel) {
        progressLabel.textContent = 'प्रगति';
        console.log('✓ Updated progress label');
    }
    
    // Statistics labels - target each specifically
    const earningsLabel = document.querySelector('.stat-card:nth-child(1) .stat-label');
    if (earningsLabel) {
        earningsLabel.textContent = 'इस महीने की कमाई';
        console.log('✓ Updated earnings label');
    }
    
    const projectsLabel = document.querySelector('.stat-card:nth-child(2) .stat-label');
    if (projectsLabel) {
        projectsLabel.textContent = 'सक्रिय परियोजनाएं';
        console.log('✓ Updated projects label');
    }
    
    const ratingLabel = document.querySelector('.stat-card:nth-child(3) .stat-label');
    if (ratingLabel) {
        ratingLabel.textContent = 'औसत रेटिंग';
        console.log('✓ Updated rating label');
    }
    
    const connectionsLabel = document.querySelector('.stat-card:nth-child(4) .stat-label');
    if (connectionsLabel) {
        connectionsLabel.textContent = 'नेटवर्क कनेक्शन';
        console.log('✓ Updated connections label');
    }
    
    // Sidebar navigation - target each link specifically
    const dashboardNav = document.querySelector('a[href="#dashboard"] span');
    if (dashboardNav) {
        dashboardNav.textContent = 'डैशबोर्ड';
        console.log('✓ Updated dashboard nav');
    }
    
    const skillsNav = document.querySelector('a[href="skills.html"] span');
    if (skillsNav) {
        skillsNav.textContent = 'मेरे कौशल';
        console.log('✓ Updated skills nav');
    }
    
    const opportunitiesNav = document.querySelector('a[href="#opportunities"] span');
    if (opportunitiesNav) {
        opportunitiesNav.textContent = 'अवसर';
        console.log('✓ Updated opportunities nav');
    }
    
    const foodNav = document.querySelector('a[href="#food-marketplace"] span');
    if (foodNav) {
        foodNav.textContent = 'खाद्य बाज़ार';
        console.log('✓ Updated food marketplace nav');
    }
    
    const communityNav = document.querySelector('a[href="#community"] span');
    if (communityNav) {
        communityNav.textContent = 'समुदाय';
        console.log('✓ Updated community nav');
    }
    
    const progressNav = document.querySelector('a[href="progress.html"] span');
    if (progressNav) {
        progressNav.textContent = 'प्रगति';
        console.log('✓ Updated progress nav');
    }
    
    const settingsNav = document.querySelector('a[href="#settings"] span');
    if (settingsNav) {
        settingsNav.textContent = 'सेटिंग्स';
        console.log('✓ Updated settings nav');
    }
    
    const logoutNav = document.querySelector('.sidebar-footer a span');
    if (logoutNav) {
        logoutNav.textContent = 'लॉग आउट';
        console.log('✓ Updated logout nav');
    }
    
    // Voice command button
    const voiceText = document.querySelector('.voice-text');
    if (voiceText) {
        voiceText.textContent = 'आवाज़ कमांड';
        console.log('✓ Updated voice command text');
    }
    
    // Section headers - already working but let's ensure they're set
    const focusHeader = document.querySelector('.focus-card h3');
    if (focusHeader) {
        focusHeader.textContent = '🎯 आज का फोकस';
        console.log('✓ Updated focus header');
    }
    
    const opportunitiesHeader = document.querySelector('.opportunities-card h3');
    if (opportunitiesHeader) {
        opportunitiesHeader.textContent = '🔥 गर्म अवसर';
        console.log('✓ Updated opportunities header');
    }
    
    const foodHeader = document.querySelector('.food-card h3');
    if (foodHeader) {
        foodHeader.textContent = '🍳 खाद्य बाज़ार';
        console.log('✓ Updated food header');
    }
    
    const communityHeader = document.querySelector('.community-card h3');
    if (communityHeader) {
        communityHeader.textContent = '👥 समुदाय अपडेट';
        console.log('✓ Updated community header');
    }
    
    const progressHeader = document.querySelector('.progress-card h3');
    if (progressHeader) {
        progressHeader.textContent = '📈 आपकी विकास यात्रा';
        console.log('✓ Updated progress header');
    }
    
    // Buttons - target each specifically
    const addTaskBtn = document.querySelector('.focus-card .btn-primary');
    if (addTaskBtn) {
        addTaskBtn.textContent = 'नया कार्य जोड़ें';
        console.log('✓ Updated add task button');
    }
    
    const viewOpportunitiesBtn = document.querySelector('.opportunities-card .btn-secondary');
    if (viewOpportunitiesBtn) {
        viewOpportunitiesBtn.textContent = 'सभी अवसर देखें';
        console.log('✓ Updated view opportunities button');
    }
    
    const manageOrdersBtn = document.querySelector('.food-card .btn-primary');
    if (manageOrdersBtn) {
        manageOrdersBtn.textContent = 'ऑर्डर प्रबंधित करें';
        console.log('✓ Updated manage orders button');
    }
    
    const joinCommunityBtn = document.querySelector('.community-card .btn-secondary');
    if (joinCommunityBtn) {
        joinCommunityBtn.textContent = 'समुदाय में शामिल हों';
        console.log('✓ Updated join community button');
    }
    
    const viewProgressBtn = document.querySelector('.progress-actions .btn-secondary');
    if (viewProgressBtn) {
        viewProgressBtn.innerHTML = '<i class="fas fa-chart-line"></i> विस्तृत प्रगति देखें';
        console.log('✓ Updated view progress button');
    }
    
    // Translate task descriptions
    const taskLabels = document.querySelectorAll('.focus-item label');
    const hindiTasks = [
        'कढ़ाई कोर्स मॉड्यूल 3 पूरा करें',
        '2 फैशन डिज़ाइनर पदों के लिए आवेदन करें',
        'मेंटर सुनीता देवी से जुड़ें',
        'नई पोर्टफोलियो तस्वीरें अपलोड करें'
    ];
    taskLabels.forEach((label, index) => {
        if (hindiTasks[index]) {
            label.textContent = hindiTasks[index];
            console.log('✓ Updated task', index, 'to Hindi');
        }
    });
    
    // Translate job titles and descriptions
    const jobTitles = document.querySelectorAll('.opportunity-info h4');
    const hindiJobTitles = [
        'फैशन डिज़ाइनर असिस्टेंट',
        'ऑफिस के लिए होम शेफ',
        'कढ़ाई प्रशिक्षक'
    ];
    jobTitles.forEach((title, index) => {
        if (hindiJobTitles[index]) {
            title.textContent = hindiJobTitles[index];
            console.log('✓ Updated job title', index, 'to Hindi');
        }
    });
    
    const jobDescriptions = document.querySelectorAll('.opportunity-info p');
    const hindiJobDescriptions = [
        '₹18,000/महीना • रिमोट',
        '₹800/दिन • नजदीक',
        '₹1,000/क्लास • ऑनलाइन'
    ];
    jobDescriptions.forEach((desc, index) => {
        if (hindiJobDescriptions[index]) {
            desc.textContent = hindiJobDescriptions[index];
            console.log('✓ Updated job description', index, 'to Hindi');
        }
    });
    
    // Translate match scores
    const matchScores = document.querySelectorAll('.match-score');
    const hindiMatchScores = ['85% मैच', '92% मैच', '88% मैच'];
    matchScores.forEach((score, index) => {
        if (hindiMatchScores[index]) {
            score.textContent = hindiMatchScores[index];
            console.log('✓ Updated match score', index, 'to Hindi');
        }
    });
    
    // Translate Apply buttons
    const applyButtons = document.querySelectorAll('.btn-apply');
    applyButtons.forEach((btn) => {
        if (btn.textContent.trim() === 'Apply') {
            btn.textContent = 'आवेदन करें';
            console.log('✓ Updated apply button to Hindi');
        }
    });
    
    // Translate food order items
    const orderNames = document.querySelectorAll('.order-name');
    const hindiOrderNames = [
        'राजमा चावल (5 पोर्शन)',
        'घर का बना कुकीज़ (2 दर्जन)'
    ];
    orderNames.forEach((name, index) => {
        if (hindiOrderNames[index]) {
            name.textContent = hindiOrderNames[index];
            console.log('✓ Updated order name', index, 'to Hindi');
        }
    });
    
    // Translate order status
    const orderStatuses = document.querySelectorAll('.order-status');
    orderStatuses.forEach((status) => {
        if (status.textContent.trim() === 'Preparing') {
            status.textContent = 'तैयार कर रहे हैं';
        } else if (status.textContent.trim() === 'Delivered') {
            status.textContent = 'डिलीवर किया गया';
        }
        console.log('✓ Updated order status to Hindi');
    });
    
    // Translate community updates
    const communityUpdates = document.querySelectorAll('.update-content p');
    const hindiUpdates = [
        '<strong>सुनीता देवी</strong> ने एक नई कढ़ाई तकनीक साझा की',
        '<strong>मीरा पटेल</strong> ने बैलेंस बॉस अवार्ड जीता!',
        '<strong>काव्या सिंह</strong> ने एक नया कैटरिंग बिजनेस शुरू किया'
    ];
    communityUpdates.forEach((update, index) => {
        if (hindiUpdates[index]) {
            update.innerHTML = hindiUpdates[index];
            console.log('✓ Updated community update', index, 'to Hindi');
        }
    });
    
    // Translate time stamps
    const timeStamps = document.querySelectorAll('.update-time');
    const hindiTimeStamps = ['2 घंटे पहले', '5 घंटे पहले', '1 दिन पहले'];
    timeStamps.forEach((time, index) => {
        if (hindiTimeStamps[index]) {
            time.textContent = hindiTimeStamps[index];
            console.log('✓ Updated time stamp', index, 'to Hindi');
        }
    });
    
    // Translate stat change indicators
    const statChanges = document.querySelectorAll('.stat-change');
    const hindiStatChanges = [
        '+25% पिछले महीने से',
        '+3 इस सप्ताह नए',
        '+0.2 इस महीने',
        '+5 इस सप्ताह'
    ];
    statChanges.forEach((change, index) => {
        if (hindiStatChanges[index]) {
            change.textContent = hindiStatChanges[index];
            console.log('✓ Updated stat change', index, 'to Hindi');
        }
    });
    
    // Food marketplace stats labels
    const activeOrdersLabel = document.querySelector('.food-stat:nth-child(1) .food-label');
    if (activeOrdersLabel) {
        activeOrdersLabel.textContent = 'सक्रिय ऑर्डर';
        console.log('✓ Updated active orders label');
    }
    
    const thisWeekLabel = document.querySelector('.food-stat:nth-child(2) .food-label');
    if (thisWeekLabel) {
        thisWeekLabel.textContent = 'इस सप्ताह';
        console.log('✓ Updated this week label');
    }
    
    const ratingFoodLabel = document.querySelector('.food-stat:nth-child(3) .food-label');
    if (ratingFoodLabel) {
        ratingFoodLabel.textContent = 'रेटिंग';
        console.log('✓ Updated food rating label');
    }
    
    // Recent orders header
    const recentOrdersHeader = document.querySelector('.recent-orders h4');
    if (recentOrdersHeader) {
        recentOrdersHeader.textContent = 'हाल के ऑर्डर';
        console.log('✓ Updated recent orders header');
    }
    
    // Progress metrics
    const skillsImprovedLabel = document.querySelector('.metric:nth-child(1) .metric-label');
    if (skillsImprovedLabel) {
        skillsImprovedLabel.textContent = 'कौशल में सुधार';
        console.log('✓ Updated skills improved label');
    }
    
    const incomeGrowthLabel = document.querySelector('.metric:nth-child(2) .metric-label');
    if (incomeGrowthLabel) {
        incomeGrowthLabel.textContent = 'आय वृद्धि';
        console.log('✓ Updated income growth label');
    }
    
    const timeOptimizedLabel = document.querySelector('.metric:nth-child(3) .metric-label');
    if (timeOptimizedLabel) {
        timeOptimizedLabel.textContent = 'समय अनुकूलित';
        console.log('✓ Updated time optimized label');
    }
    
    console.log('Hindi translation completed!');
}

function applyEnglishTranslation() {
    console.log('Applying English translations...');
    
    // Header greeting
    const greeting = document.querySelector('.header h1');
    if (greeting) {
        const userName = document.getElementById('userName')?.textContent || 'Rukaiya';
        greeting.innerHTML = `Hello, <span id="userName">${userName}</span>!`;
        console.log('✓ Updated greeting to English');
    }
    
    // Main balance heading
    const balanceHeading = document.querySelector('.balance-card h2');
    if (balanceHeading) {
        balanceHeading.textContent = "Today's Balance";
        console.log('✓ Updated balance heading to English');
    }
    
    // Balance labels - target each specifically
    const householdLabel = document.querySelector('.balance-item:nth-child(1) .balance-label');
    if (householdLabel) {
        householdLabel.textContent = 'Household Work';
    }
    
    const careerLabel = document.querySelector('.balance-item:nth-child(2) .balance-label');
    if (careerLabel) {
        careerLabel.textContent = 'Career Time';
    }
    
    const selfCareLabel = document.querySelector('.balance-item:nth-child(3) .balance-label');
    if (selfCareLabel) {
        selfCareLabel.textContent = 'Self Care';
    }
    
    const progressLabel = document.querySelector('.balance-item:nth-child(4) .balance-label');
    if (progressLabel) {
        progressLabel.textContent = 'Progress';
    }
    
    // Statistics labels - target each specifically
    const earningsLabel = document.querySelector('.stat-card:nth-child(1) .stat-label');
    if (earningsLabel) {
        earningsLabel.textContent = "This Month's Earnings";
    }
    
    const projectsLabel = document.querySelector('.stat-card:nth-child(2) .stat-label');
    if (projectsLabel) {
        projectsLabel.textContent = 'Active Projects';
    }
    
    const ratingLabel = document.querySelector('.stat-card:nth-child(3) .stat-label');
    if (ratingLabel) {
        ratingLabel.textContent = 'Average Rating';
    }
    
    const connectionsLabel = document.querySelector('.stat-card:nth-child(4) .stat-label');
    if (connectionsLabel) {
        connectionsLabel.textContent = 'Network Connections';
    }
    
    // Sidebar navigation - target each link specifically
    const dashboardNav = document.querySelector('a[href="#dashboard"] span');
    if (dashboardNav) {
        dashboardNav.textContent = 'Dashboard';
    }
    
    const skillsNav = document.querySelector('a[href="skills.html"] span');
    if (skillsNav) {
        skillsNav.textContent = 'My Skills';
    }
    
    const opportunitiesNav = document.querySelector('a[href="#opportunities"] span');
    if (opportunitiesNav) {
        opportunitiesNav.textContent = 'Opportunities';
    }
    
    const foodNav = document.querySelector('a[href="#food-marketplace"] span');
    if (foodNav) {
        foodNav.textContent = 'Food Marketplace';
    }
    
    const communityNav = document.querySelector('a[href="#community"] span');
    if (communityNav) {
        communityNav.textContent = 'Community';
    }
    
    const progressNav = document.querySelector('a[href="progress.html"] span');
    if (progressNav) {
        progressNav.textContent = 'Progress';
    }
    
    const settingsNav = document.querySelector('a[href="#settings"] span');
    if (settingsNav) {
        settingsNav.textContent = 'Settings';
    }
    
    const logoutNav = document.querySelector('.sidebar-footer a span');
    if (logoutNav) {
        logoutNav.textContent = 'Logout';
    }
    
    // Voice command button
    const voiceText = document.querySelector('.voice-text');
    if (voiceText) {
        voiceText.textContent = 'Voice Command';
    }
    
    // Section headers
    const focusHeader = document.querySelector('.focus-card h3');
    if (focusHeader) {
        focusHeader.textContent = "🎯 Today's Focus";
    }
    
    const opportunitiesHeader = document.querySelector('.opportunities-card h3');
    if (opportunitiesHeader) {
        opportunitiesHeader.textContent = '🔥 Hot Opportunities';
    }
    
    const foodHeader = document.querySelector('.food-card h3');
    if (foodHeader) {
        foodHeader.textContent = '🍳 Food Marketplace';
    }
    
    const communityHeader = document.querySelector('.community-card h3');
    if (communityHeader) {
        communityHeader.textContent = '👥 Community Updates';
    }
    
    const progressHeader = document.querySelector('.progress-card h3');
    if (progressHeader) {
        progressHeader.textContent = '📈 Your Growth Journey';
    }
    
    // Buttons - target each specifically
    const addTaskBtn = document.querySelector('.focus-card .btn-primary');
    if (addTaskBtn) {
        addTaskBtn.textContent = 'Add New Task';
    }
    
    const viewOpportunitiesBtn = document.querySelector('.opportunities-card .btn-secondary');
    if (viewOpportunitiesBtn) {
        viewOpportunitiesBtn.textContent = 'View All Opportunities';
    }
    
    const manageOrdersBtn = document.querySelector('.food-card .btn-primary');
    if (manageOrdersBtn) {
        manageOrdersBtn.textContent = 'Manage Orders';
    }
    
    const joinCommunityBtn = document.querySelector('.community-card .btn-secondary');
    if (joinCommunityBtn) {
        joinCommunityBtn.textContent = 'Join Community';
    }
    
    const viewProgressBtn = document.querySelector('.progress-actions .btn-secondary');
    if (viewProgressBtn) {
        viewProgressBtn.innerHTML = '<i class="fas fa-chart-line"></i> View Detailed Progress';
    }
    
    // Restore task descriptions
    const taskLabels = document.querySelectorAll('.focus-item label');
    const englishTasks = [
        'Complete embroidery course module 3',
        'Apply to 2 fashion designer positions',
        'Connect with mentor Sunita Devi',
        'Upload new portfolio photos'
    ];
    taskLabels.forEach((label, index) => {
        if (englishTasks[index]) {
            label.textContent = englishTasks[index];
        }
    });
    
    // Restore job titles and descriptions
    const jobTitles = document.querySelectorAll('.opportunity-info h4');
    const englishJobTitles = [
        'Fashion Designer Assistant',
        'Home Chef for Office',
        'Embroidery Trainer'
    ];
    jobTitles.forEach((title, index) => {
        if (englishJobTitles[index]) {
            title.textContent = englishJobTitles[index];
        }
    });
    
    const jobDescriptions = document.querySelectorAll('.opportunity-info p');
    const englishJobDescriptions = [
        '₹18,000/month • Remote',
        '₹800/day • Nearby',
        '₹1,000/class • Online'
    ];
    jobDescriptions.forEach((desc, index) => {
        if (englishJobDescriptions[index]) {
            desc.textContent = englishJobDescriptions[index];
        }
    });
    
    // Restore match scores
    const matchScores = document.querySelectorAll('.match-score');
    const englishMatchScores = ['85% Match', '92% Match', '88% Match'];
    matchScores.forEach((score, index) => {
        if (englishMatchScores[index]) {
            score.textContent = englishMatchScores[index];
        }
    });
    
    // Restore Apply buttons
    const applyButtons = document.querySelectorAll('.btn-apply');
    applyButtons.forEach((btn) => {
        if (btn.textContent.trim() === 'आवेदन करें') {
            btn.textContent = 'Apply';
        }
    });
    
    // Restore food order items
    const orderNames = document.querySelectorAll('.order-name');
    const englishOrderNames = [
        'Rajma Chawal (5 portions)',
        'Homemade Cookies (2 dozen)'
    ];
    orderNames.forEach((name, index) => {
        if (englishOrderNames[index]) {
            name.textContent = englishOrderNames[index];
        }
    });
    
    // Restore order status
    const orderStatuses = document.querySelectorAll('.order-status');
    orderStatuses.forEach((status) => {
        if (status.textContent.trim() === 'तैयार कर रहे हैं') {
            status.textContent = 'Preparing';
        } else if (status.textContent.trim() === 'डिलीवर किया गया') {
            status.textContent = 'Delivered';
        }
    });
    
    // Restore community updates
    const communityUpdates = document.querySelectorAll('.update-content p');
    const englishUpdates = [
        '<strong>Sunita Devi</strong> shared a new embroidery technique',
        '<strong>Meera Patel</strong> won Balance Boss award!',
        '<strong>Kavya Singh</strong> started a new catering business'
    ];
    communityUpdates.forEach((update, index) => {
        if (englishUpdates[index]) {
            update.innerHTML = englishUpdates[index];
        }
    });
    
    // Restore time stamps
    const timeStamps = document.querySelectorAll('.update-time');
    const englishTimeStamps = ['2 hours ago', '5 hours ago', '1 day ago'];
    timeStamps.forEach((time, index) => {
        if (englishTimeStamps[index]) {
            time.textContent = englishTimeStamps[index];
        }
    });
    
    // Restore stat change indicators
    const statChanges = document.querySelectorAll('.stat-change');
    const englishStatChanges = [
        '+25% from last month',
        '+3 new this week',
        '+0.2 this month',
        '+5 this week'
    ];
    statChanges.forEach((change, index) => {
        if (englishStatChanges[index]) {
            change.textContent = englishStatChanges[index];
        }
    });
    
    // Food marketplace stats labels
    const activeOrdersLabel = document.querySelector('.food-stat:nth-child(1) .food-label');
    if (activeOrdersLabel) {
        activeOrdersLabel.textContent = 'Active Orders';
    }
    
    const thisWeekLabel = document.querySelector('.food-stat:nth-child(2) .food-label');
    if (thisWeekLabel) {
        thisWeekLabel.textContent = 'This Week';
    }
    
    const ratingFoodLabel = document.querySelector('.food-stat:nth-child(3) .food-label');
    if (ratingFoodLabel) {
        ratingFoodLabel.textContent = 'Rating';
    }
    
    // Recent orders header
    const recentOrdersHeader = document.querySelector('.recent-orders h4');
    if (recentOrdersHeader) {
        recentOrdersHeader.textContent = 'Recent Orders';
    }
    
    // Progress metrics
    const skillsImprovedLabel = document.querySelector('.metric:nth-child(1) .metric-label');
    if (skillsImprovedLabel) {
        skillsImprovedLabel.textContent = 'Skills Improved';
    }
    
    const incomeGrowthLabel = document.querySelector('.metric:nth-child(2) .metric-label');
    if (incomeGrowthLabel) {
        incomeGrowthLabel.textContent = 'Income Growth';
    }
    
    const timeOptimizedLabel = document.querySelector('.metric:nth-child(3) .metric-label');
    if (timeOptimizedLabel) {
        timeOptimizedLabel.textContent = 'Time Optimized';
    }
    
    console.log('English translation completed!');
}

// Main translation function that decides which direction to translate - AI Dependent
function translateToHindi() {
    // Check if AI is ready, if not, proceed anyway for translation (fallback)
    if (aiCoreStatus) {
        // Use AI-enhanced translation
        if (!requireAI(() => {
            performTranslation();
        }, 'Language Translation')) {
            return;
        }
    } else {
        // Fallback to basic translation without AI
        console.log('Using fallback translation (AI not available)');
        performTranslation();
    }
}

function performTranslation() {
    console.log('translateToHindi function called! Current state:', isTranslated);
    
    if (!isTranslated) {
        applyHindiTranslation();
        
        // Update translate button
        const translateBtn = document.getElementById('translateText');
        if (translateBtn) {
            translateBtn.textContent = 'English';
        }
        
        isTranslated = true;
        showNotification('पेज हिंदी में अनुवादित किया गया', 'success');
    } else {
        applyEnglishTranslation();
        
        // Update translate button
        const translateBtn = document.getElementById('translateText');
        if (translateBtn) {
            translateBtn.textContent = 'हिंदी में';
        }
        
        isTranslated = false;
        showNotification('Page translated back to English', 'success');
    }
}

// Notification system - COMPLETELY DISABLED
function showNotification(message, type = 'info') {
    // All notifications disabled - only log to console
    console.log(`[Notification ${type}] ${message}`);
    return; // Exit early - no UI notifications
    
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
        font-family: 'Poppins', sans-serif;
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

// Course enrollment function - AI Dependent
function enrollCourse(courseId, paymentType) {
    // Require AI for course enrollment
    if (!requireAI(() => {
        enrollCourseWithAI(courseId, paymentType);
    }, 'Course Enrollment')) {
        return;
    }
}

function enrollCourseWithAI(courseId, paymentType) {
    const courses = {
        crochet: {
            name: 'Advanced Crochet Mastery',
            fullPrice: 2999,
            emiAmount: 500,
            emiMonths: 6
        },
        tailoring: {
            name: 'Professional Tailoring',
            fullPrice: 3499,
            emiAmount: 437,
            emiMonths: 8
        },
        crossstitch: {
            name: 'Cross Stitch Artistry',
            fullPrice: 1999,
            emiAmount: 500,
            emiMonths: 4
        },
        henna: {
            name: 'Advanced Henna Techniques',
            fullPrice: 2499,
            emiAmount: 500,
            emiMonths: 5
        }
    };
    
    const course = courses[courseId];
    if (!course) return;
    
    // Redirect to payment gateway
    redirectToPaymentGateway(course, paymentType);
}

function redirectToPaymentGateway(course, paymentType) {
    // Calculate amount based on payment type
    const amount = paymentType === 'full' ? course.fullPrice : course.emiAmount;
    const description = paymentType === 'full' 
        ? `${course.name} - Full Payment`
        : `${course.name} - EMI (${course.emiMonths} months)`;
    
    // Show loading message
    const loadingMsg = document.createElement('div');
    loadingMsg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px 50px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        z-index: 10000;
        text-align: center;
    `;
    loadingMsg.innerHTML = `
        <div style="font-size: 3rem; color: #6366f1; margin-bottom: 15px;">
            <i class="fas fa-spinner fa-spin"></i>
        </div>
        <h3 style="margin: 0 0 10px 0; color: #1f2937;">Redirecting to Payment Gateway...</h3>
        <p style="margin: 0; color: #6b7280;">Please wait while we process your request</p>
    `;
    document.body.appendChild(loadingMsg);
    
    // Store payment details in localStorage
    const paymentData = {
        courseName: course.name,
        amount: amount,
        paymentType: paymentType,
        emiMonths: paymentType === 'emi' ? course.emiMonths : null,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('pendingPayment', JSON.stringify(paymentData));
    
    // Simulate redirect after 2 seconds
    setTimeout(() => {
        // Option 1: Razorpay Integration (Recommended for India)
        initiateRazorpayPayment(course, paymentType, amount);
        
        // Option 2: Redirect to custom payment page
        // window.location.href = `payment.html?course=${encodeURIComponent(course.name)}&amount=${amount}&type=${paymentType}`;
        
        // Option 3: Redirect to external payment gateway
        // window.location.href = `https://payment-gateway.com/pay?amount=${amount}&description=${encodeURIComponent(description)}`;
        
        document.body.removeChild(loadingMsg);
    }, 2000);
}

function initiateRazorpayPayment(course, paymentType, amount) {
    // Check if Razorpay is loaded
    if (typeof Razorpay === 'undefined') {
        // Fallback: Show payment confirmation modal
        showPaymentConfirmationModal(course, paymentType, amount);
        return;
    }
    
    const options = {
        key: 'YOUR_RAZORPAY_KEY_ID', // Replace with your Razorpay key
        amount: amount * 100, // Amount in paise
        currency: 'INR',
        name: 'SheBalance',
        description: `${course.name} - ${paymentType === 'full' ? 'Full Payment' : 'EMI Payment'}`,
        image: 'logo She balance.png',
        handler: function (response) {
            // Payment successful
            handlePaymentSuccess(response, course, paymentType);
        },
        prefill: {
            name: localStorage.getItem('userName') || '',
            email: localStorage.getItem('userEmail') || '',
            contact: localStorage.getItem('userPhone') || ''
        },
        notes: {
            course_name: course.name,
            payment_type: paymentType
        },
        theme: {
            color: '#6366f1'
        },
        modal: {
            ondismiss: function() {
                alert('Payment cancelled. You can try again anytime!');
            }
        }
    };
    
    const rzp = new Razorpay(options);
    rzp.open();
}

function showPaymentConfirmationModal(course, paymentType, amount) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 16px; padding: 40px; max-width: 500px; width: 90%; text-align: center;">
            <div style="font-size: 4rem; color: #6366f1; margin-bottom: 20px;">
                <i class="fas fa-credit-card"></i>
            </div>
            <h2 style="margin: 0 0 15px 0; color: #1f2937;">Payment Gateway</h2>
            <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #374151;">${course.name}</h3>
                <p style="margin: 0 0 15px 0; color: #6b7280;">
                    ${paymentType === 'full' ? 'Full Payment' : `EMI - ${course.emiMonths} months`}
                </p>
                <div style="font-size: 2rem; font-weight: 700; color: #6366f1;">₹${amount}</div>
            </div>
            <p style="color: #6b7280; margin-bottom: 25px;">
                In production, this will redirect to Razorpay/Stripe payment gateway
            </p>
            <div style="display: flex; gap: 10px;">
                <button onclick="this.closest('div').parentElement.remove()" 
                    style="flex: 1; padding: 12px; background: #e5e7eb; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    Cancel
                </button>
                <button onclick="simulatePaymentSuccess('${course.name}', '${paymentType}', ${amount}); this.closest('div').parentElement.remove();" 
                    style="flex: 1; padding: 12px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    Simulate Payment
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function simulatePaymentSuccess(courseName, paymentType, amount) {
    const response = {
        razorpay_payment_id: 'pay_' + Math.random().toString(36).substr(2, 9),
        razorpay_order_id: 'order_' + Math.random().toString(36).substr(2, 9),
        razorpay_signature: 'sig_' + Math.random().toString(36).substr(2, 9)
    };
    
    handlePaymentSuccess(response, { name: courseName }, paymentType);
}

function handlePaymentSuccess(response, course, paymentType) {
    // Store enrollment data
    const enrollmentData = {
        courseName: course.name,
        paymentType: paymentType,
        paymentId: response.razorpay_payment_id,
        enrolledDate: new Date().toISOString(),
        status: 'active'
    };
    
    // Save to localStorage
    let enrollments = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
    enrollments.push(enrollmentData);
    localStorage.setItem('enrolledCourses', JSON.stringify(enrollments));
    
    // Clear pending payment
    localStorage.removeItem('pendingPayment');
    
    // Show success message
    const successModal = document.createElement('div');
    successModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
    `;
    
    successModal.innerHTML = `
        <div style="background: white; border-radius: 16px; padding: 40px; max-width: 500px; width: 90%; text-align: center;">
            <div style="font-size: 5rem; color: #10b981; margin-bottom: 20px;">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2 style="margin: 0 0 15px 0; color: #1f2937;">Payment Successful!</h2>
            <p style="color: #6b7280; margin-bottom: 10px;">
                You have successfully enrolled in
            </p>
            <h3 style="margin: 0 0 20px 0; color: #6366f1;">${course.name}</h3>
            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
                <p style="margin: 0; color: #065f46;">
                    <strong>Payment ID:</strong> ${response.razorpay_payment_id}
                </p>
            </div>
            <button onclick="this.closest('div').parentElement.remove(); window.location.reload();" 
                style="width: 100%; padding: 14px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem;">
                Start Learning
            </button>
        </div>
    `;
    
    document.body.appendChild(successModal);
}

function showEnrollmentModal(course, paymentType) {
    let modalContent = '';
    
    if (paymentType === 'full') {
        modalContent = `
            <div class="enrollment-modal">
                <div class="modal-header">
                    <h3>Enroll in ${course.name}</h3>
                    <span class="close" onclick="closeEnrollmentModal()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="payment-summary">
                        <h4>Payment Summary</h4>
                        <div class="summary-item">
                            <span>Course Fee:</span>
                            <span>₹${course.fullPrice}</span>
                        </div>
                        <div class="summary-item total">
                            <span><strong>Total Amount:</strong></span>
                            <span><strong>₹${course.fullPrice}</strong></span>
                        </div>
                    </div>
                    <div class="payment-benefits">
                        <h4>✨ Full Payment Benefits:</h4>
                        <ul>
                            <li>✅ Immediate access to all course materials</li>
                            <li>✅ Lifetime access to course content</li>
                            <li>✅ Priority support from instructors</li>
                            <li>✅ Certificate upon completion</li>
                        </ul>
                    </div>
                    <button class="btn-primary btn-large" onclick="processPayment('${course.name}', ${course.fullPrice}, 'full')">
                        <i class="fas fa-credit-card"></i>
                        Pay ₹${course.fullPrice} Now
                    </button>
                </div>
            </div>
        `;
    } else {
        modalContent = `
            <div class="enrollment-modal">
                <div class="modal-header">
                    <h3>Enroll in ${course.name}</h3>
                    <span class="close" onclick="closeEnrollmentModal()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="payment-summary">
                        <h4>EMI Payment Plan</h4>
                        <div class="summary-item">
                            <span>Course Fee:</span>
                            <span>₹${course.fullPrice}</span>
                        </div>
                        <div class="summary-item">
                            <span>EMI Amount:</span>
                            <span>₹${course.emiAmount}/month</span>
                        </div>
                        <div class="summary-item">
                            <span>Duration:</span>
                            <span>${course.emiMonths} months</span>
                        </div>
                        <div class="summary-item">
                            <span>Interest Rate:</span>
                            <span class="highlight">0% (No Interest!)</span>
                        </div>
                        <div class="summary-item total">
                            <span><strong>First EMI:</strong></span>
                            <span><strong>₹${course.emiAmount}</strong></span>
                        </div>
                    </div>
                    <div class="emi-schedule">
                        <h4>📅 EMI Schedule:</h4>
                        <div class="schedule-grid">
                            ${generateEMISchedule(course.emiAmount, course.emiMonths)}
                        </div>
                    </div>
                    <div class="payment-benefits">
                        <h4>💡 EMI Benefits:</h4>
                        <ul>
                            <li>✅ Start learning immediately with first EMI</li>
                            <li>✅ 0% interest - No extra charges</li>
                            <li>✅ Flexible payment schedule</li>
                            <li>✅ Same course benefits as full payment</li>
                        </ul>
                    </div>
                    <button class="btn-primary btn-large" onclick="processPayment('${course.name}', ${course.emiAmount}, 'emi')">
                        <i class="fas fa-calendar-check"></i>
                        Start with ₹${course.emiAmount} EMI
                    </button>
                </div>
            </div>
        `;
    }
    
    // Create and show modal
    const modal = document.createElement('div');
    modal.className = 'modal enrollment-modal-container';
    modal.innerHTML = `<div class="modal-content">${modalContent}</div>`;
    document.body.appendChild(modal);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function generateEMISchedule(emiAmount, months) {
    let schedule = '';
    const currentDate = new Date();
    
    for (let i = 1; i <= months; i++) {
        const emiDate = new Date(currentDate);
        emiDate.setMonth(currentDate.getMonth() + i);
        const dateStr = emiDate.toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
        
        schedule += `
            <div class="schedule-item">
                <span class="emi-number">EMI ${i}</span>
                <span class="emi-date">${dateStr}</span>
                <span class="emi-amount">₹${emiAmount}</span>
            </div>
        `;
    }
    
    return schedule;
}

function processPayment(courseName, amount, type) {
    // Simulate payment processing
    showNotification('Processing payment...', 'info');
    
    setTimeout(() => {
        closeEnrollmentModal();
        
        if (type === 'full') {
            showNotification(`🎉 Successfully enrolled in ${courseName}! Full payment of ₹${amount} processed.`, 'success');
        } else {
            showNotification(`🎉 Successfully enrolled in ${courseName}! First EMI of ₹${amount} processed.`, 'success');
        }
        
        // Redirect to course or show course access
        setTimeout(() => {
            showNotification('Course materials are now available in your dashboard!', 'info');
        }, 2000);
    }, 2000);
}

function closeEnrollmentModal() {
    const modal = document.querySelector('.enrollment-modal-container');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

function updateUserName(name) {
    const firstName = name.split(' ')[0];
    const userNameElement = document.getElementById('userName');
    const userNameProfileElement = document.getElementById('userNameProfile');
    
    if (userNameElement) {
        userNameElement.textContent = firstName;
    }
    if (userNameProfileElement) {
        userNameProfileElement.textContent = name;
    }
}

// Add AI Status Indicator
function addAIStatusIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'ai-status-indicator';
    indicator.id = 'aiStatusIndicator';
    indicator.innerHTML = `
        <i class="fas fa-robot"></i>
        <span>AI Core Online</span>
    `;
    document.body.appendChild(indicator);
    
    // Update indicator based on AI status
    updateAIStatusIndicator();
}

// Update AI Status Indicator
function updateAIStatusIndicator() {
    const indicator = document.getElementById('aiStatusIndicator');
    const badge = document.getElementById('aiStatusBadge');
    
    if (indicator) {
        if (aiCoreStatus) {
            indicator.className = 'ai-status-indicator';
            indicator.innerHTML = `
                <i class="fas fa-robot"></i>
                <span>AI Core Online</span>
            `;
        } else {
            indicator.className = 'ai-status-indicator offline';
            indicator.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <span>AI Core Offline</span>
            `;
        }
    }
    
    if (badge) {
        if (aiCoreStatus) {
            badge.className = 'ai-status-badge';
            badge.innerHTML = `
                <i class="fas fa-robot"></i>
                <span>AI Core Online</span>
            `;
        } else {
            badge.className = 'ai-status-badge offline';
            badge.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <span>AI Core Offline</span>
            `;
        }
    }
}

// Initialize dashboard with AI dependency
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 SheBalance Platform Initializing...');
    
    // Initialize AI Core System FIRST - Platform depends on this
    initializeAICore();
    
    // Check for existing user
    let currentUser = userDB.getCurrentUser();
    
    if (!currentUser) {
        // Create default user - Rukaiya Khan
        const defaultUserData = {
            fullName: "Rukaiya Khan",
            location: "Mumbai, Maharashtra",
            age: "26-35",
            householdHours: "4",
            selfCareHours: "2",
            responsibilities: ["cooking", "cleaning", "childcare"],
            skills: ["embroidery", "cooking", "henna"],
            hobbies: ["reading", "gardening", "music"],
            freeTimeHours: "3",
            workingHours: ["morning", "evening"],
            incomeGoal: "15000"
        };
        
        const userId = userDB.createUser(defaultUserData);
        userDB.setCurrentUser(userId);
        currentUser = userDB.getCurrentUser();
    }
    
    if (currentUser) {
        updateUserName(currentUser.fullName);
    }
    
    // Add AI status indicator
    setTimeout(() => {
        addAIStatusIndicator();
    }, 1000);
    
    console.log('✅ Platform Initialization Complete');
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;
document.head.appendChild(style);

// ===== AI FEATURES INTEGRATION =====

// Initialize AI Features after dashboard loads
async function initializeAIFeatures() {
    try {
        console.log('🤖 Initializing AI Features...');
        
        // Initialize AI Features Manager
        await window.aiFeatures.initialize();
        
        // Load AI feature widgets into the dashboard
        loadAIFeatureWidgets();
        
        // Start AI activity monitoring
        startAIActivityMonitoring();
        
        console.log('✅ AI Features initialized successfully');
        // showAINotification('🤖 AI Features are now active! Explore your new capabilities.', 'ai');
    } catch (error) {
        console.error('❌ Failed to initialize AI features:', error);
        // showNotification('AI features are currently unavailable', 'warning');
    }
}

// Load AI Feature Widgets
function loadAIFeatureWidgets() {
    const container = document.getElementById('aiFeaturesContainer');
    if (!container) {
        console.warn('AI features container not found');
        return;
    }
    
    // Show loading state
    container.innerHTML = `
        <div class="ai-loading-placeholder">
            <div class="loading-spinner"></div>
            <p>Loading AI Features...</p>
        </div>
    `;
    
    // Create AI feature widgets
    const widgets = [
        window.aiFeatureUI.createResourceCircularityWidget(),
        window.aiFeatureUI.createDigitalTwinWidget(),
        window.aiFeatureUI.createStockPoolingWidget(),
        window.aiFeatureUI.createMicroInsuranceWidget()
    ];
    
    // Clear loading state
    setTimeout(() => {
        container.innerHTML = '';
        
        // Add widgets to container with staggered animation
        widgets.forEach((widget, index) => {
            setTimeout(() => {
                const widgetDiv = document.createElement('div');
                widgetDiv.innerHTML = widget;
                const widgetElement = widgetDiv.firstElementChild;
                widgetElement.style.opacity = '0';
                widgetElement.style.transform = 'translateY(20px)';
                container.appendChild(widgetElement);
                
                // Animate in
                setTimeout(() => {
                    widgetElement.style.transition = 'all 0.6s ease';
                    widgetElement.style.opacity = '1';
                    widgetElement.style.transform = 'translateY(0)';
                }, 50);
            }, index * 300); // Stagger by 300ms
        });
    }, 1000);
    
    // Add AI features section styling
    if (!document.querySelector('#ai-features-styles')) {
        const style = document.createElement('style');
        style.id = 'ai-features-styles';
        style.textContent = `
            .ai-features-section {
                margin-top: 32px;
                padding-top: 32px;
                border-top: 2px solid #e2e8f0;
            }
            
            .ai-features-section .section-header {
                text-align: center;
                margin-bottom: 32px;
            }
            
            .ai-features-section .section-header h2 {
                margin: 0 0 8px 0;
                font-size: 24px;
                font-weight: 700;
                color: #1e293b;
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .ai-features-section .section-header p {
                margin: 0;
                font-size: 16px;
                color: #64748b;
            }
            
            .ai-features-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 24px;
            }
            
            .ai-loading-placeholder {
                grid-column: 1 / -1;
                text-align: center;
                padding: 60px 20px;
                color: #64748b;
            }
            
            .ai-loading-placeholder .loading-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid #e2e8f0;
                border-top: 3px solid #6366f1;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 16px;
            }
            
            @media (max-width: 768px) {
                .ai-features-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Simulate AI activity monitoring
function startAIActivityMonitoring() {
    // Record login activity
    if (window.aiFeatures && window.aiFeatures.recordArtisanActivity) {
        window.aiFeatures.recordArtisanActivity('artisan_001', 'login', {
            timestamp: new Date(),
            platform: 'web'
        });
        
        // Simulate periodic voice interactions
        setInterval(() => {
            if (Math.random() > 0.8) { // 20% chance every interval
                window.aiFeatures.recordArtisanActivity('artisan_001', 'voice_interaction', {
                    speechRate: 140 + Math.random() * 20,
                    pauseFrequency: 0.08 + Math.random() * 0.04,
                    toneVariation: 0.4 + Math.random() * 0.2,
                    confidenceLevel: 0.7 + Math.random() * 0.2,
                    timestamp: new Date()
                });
            }
        }, 45000); // Every 45 seconds
        
        // Simulate productivity updates
        setInterval(() => {
            const productivityScore = 70 + Math.random() * 25; // 70-95 range
            window.aiFeatures.recordArtisanActivity('artisan_001', 'productivity_update', {
                score: productivityScore,
                timestamp: new Date()
            });
        }, 300000); // Every 5 minutes
    }
}

// Enhanced notification system for AI features
function showAINotification(message, type = 'info', duration = 6000) {
    const notification = document.createElement('div');
    notification.className = `ai-notification ai-notification-${type}`;
    
    const icons = {
        info: 'fas fa-info-circle',
        success: 'fas fa-check-circle',
        warning: 'fas fa-exclamation-triangle',
        error: 'fas fa-times-circle',
        ai: 'fas fa-robot'
    };
    
    notification.innerHTML = `
        <div class="ai-notification-content">
            <i class="${icons[type] || icons.info}"></i>
            <span>${message}</span>
            <button class="ai-notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles if not already present
    if (!document.querySelector('#ai-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'ai-notification-styles';
        style.textContent = `
            .ai-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 12px;
                padding: 16px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                border-left: 4px solid #6366f1;
                z-index: 3000;
                animation: slideInRight 0.3s ease;
                max-width: 400px;
                font-family: 'Poppins', sans-serif;
            }
            
            .ai-notification-success { border-left-color: #10b981; }
            .ai-notification-warning { border-left-color: #f59e0b; }
            .ai-notification-error { border-left-color: #ef4444; }
            .ai-notification-ai { 
                border-left-color: #8b5cf6;
                background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
            }
            
            .ai-notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .ai-notification-content i {
                color: #6366f1;
                font-size: 18px;
            }
            
            .ai-notification-success .ai-notification-content i { color: #10b981; }
            .ai-notification-warning .ai-notification-content i { color: #f59e0b; }
            .ai-notification-error .ai-notification-content i { color: #ef4444; }
            .ai-notification-ai .ai-notification-content i { color: #8b5cf6; }
            
            .ai-notification-content span {
                flex: 1;
                font-size: 14px;
                color: #1e293b;
                line-height: 1.4;
            }
            
            .ai-notification-close {
                background: none;
                border: none;
                font-size: 18px;
                color: #64748b;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s ease;
            }
            
            .ai-notification-close:hover {
                background: #f1f5f9;
                color: #1e293b;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
}

// Initialize AI features when AI core is ready
function enablePlatformFeatures() {
    // Remove any AI dependency overlays
    const aiOverlay = document.querySelector('.ai-dependency-overlay');
    if (aiOverlay) {
        aiOverlay.remove();
    }
    
    // Enable all interactive elements
    const interactiveElements = document.querySelectorAll('button, input, select, textarea');
    interactiveElements.forEach(element => {
        element.disabled = false;
        element.style.opacity = '1';
        element.style.pointerEvents = 'auto';
        element.title = '';
    });
    
    // Initialize AI features after a short delay
    setTimeout(() => {
        initializeAIFeatures();
    }, 1000);
    
    console.log('✅ Platform Features Enabled - AI Core Active');
}

// Demo functions for AI features - ALL DISABLED
function demonstrateResourceCircularity() {
    console.log('Resource Circularity demo disabled');
    // showAINotification('🌱 Resource Circularity Engine found 3 new waste-to-wealth matches in your area!', 'ai');
    // setTimeout(() => {
    //     showAINotification('💰 Potential savings: ₹2,100 | Waste reduced: 630kg', 'success');
    // }, 2000);
}

function demonstrateDigitalTwin() {
    console.log('Digital Twin demo disabled');
    // showAINotification('✨ Digital Twin analyzing your invisible labor patterns...', 'ai');
    // setTimeout(() => {
    //     showAINotification('💝 Labor Aura updated! Your story shows 16h total life investment per product.', 'success');
    // }, 2500);
}

function demonstrateStockPooling() {
    console.log('Stock Pooling demo disabled');
    // showAINotification('🏭 Virtual Factory opportunity detected! Fashion export order worth ₹1.5L available.', 'ai');
    // setTimeout(() => {
    //     showAINotification('🤝 15 artisans needed. Your skill match: 92%. Potential earning: ₹8,500', 'success');
    // }, 2000);
}

function demonstrateMicroInsurance() {
    console.log('Micro Insurance demo disabled');
    // showAINotification('🛡️ Behavioral monitoring active. All health indicators normal.', 'ai');
    // setTimeout(() => {
    //     showAINotification('💚 AI-Sakhi wellness check completed. Community support network online.', 'success');
    // }, 2000);
}

// Add demo triggers (can be called from console or buttons)
window.demoAIFeatures = {
    resourceCircularity: demonstrateResourceCircularity,
    digitalTwin: demonstrateDigitalTwin,
    stockPooling: demonstrateStockPooling,
    microInsurance: demonstrateMicroInsurance
};

// Auto-demo AI features after initialization (for showcase)
setTimeout(() => {
    if (window.aiFeatures && window.aiFeatures.initialized) {
        // Demonstrate features one by one with delays
        setTimeout(demonstrateResourceCircularity, 3000);
        setTimeout(demonstrateDigitalTwin, 8000);
        setTimeout(demonstrateStockPooling, 13000);
        setTimeout(demonstrateMicroInsurance, 18000);
    }
}, 5000);

console.log('🚀 AI Features Integration Complete');

// ===== FOOD MARKETPLACE FUNCTIONALITY =====

// Open Food Marketplace Management
function openFoodMarketplace() {
    requireAI(() => {
        showFoodMarketplaceModal();
    }, 'Food Marketplace');
}

function showFoodMarketplaceModal() {
    const modal = document.createElement('div');
    modal.className = 'modal food-marketplace-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🍳 Food Marketplace Management</h3>
                <span class="close" onclick="closeFoodModal(this)">&times;</span>
            </div>
            <div class="modal-body">
                <div class="food-dashboard">
                    <div class="food-metrics">
                        <div class="metric-card">
                            <div class="metric-icon">
                                <i class="fas fa-shopping-cart"></i>
                            </div>
                            <div class="metric-info">
                                <span class="metric-number">12</span>
                                <span class="metric-label">Active Orders</span>
                            </div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-icon">
                                <i class="fas fa-rupee-sign"></i>
                            </div>
                            <div class="metric-info">
                                <span class="metric-number">₹3,200</span>
                                <span class="metric-label">This Week</span>
                            </div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-icon">
                                <i class="fas fa-star"></i>
                            </div>
                            <div class="metric-info">
                                <span class="metric-number">4.9</span>
                                <span class="metric-label">Rating</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="orders-section">
                        <h4>📋 Current Orders</h4>
                        <div class="orders-list">
                            <div class="order-card active">
                                <div class="order-header">
                                    <h5>Rajma Chawal (5 portions)</h5>
                                    <span class="order-price">₹400</span>
                                </div>
                                <div class="order-details">
                                    <p><strong>Customer:</strong> Priya Sharma</p>
                                    <p><strong>Delivery:</strong> Today, 2:00 PM</p>
                                    <p><strong>Address:</strong> Sector 15, Noida</p>
                                </div>
                                <div class="order-status">
                                    <span class="status-badge preparing">Preparing</span>
                                    <button class="btn-small" onclick="updateOrderStatus('order1', 'ready')">Mark Ready</button>
                                </div>
                            </div>
                            
                            <div class="order-card">
                                <div class="order-header">
                                    <h5>Homemade Cookies (2 dozen)</h5>
                                    <span class="order-price">₹600</span>
                                </div>
                                <div class="order-details">
                                    <p><strong>Customer:</strong> Amit Kumar</p>
                                    <p><strong>Delivery:</strong> Tomorrow, 10:00 AM</p>
                                    <p><strong>Address:</strong> CP, New Delhi</p>
                                </div>
                                <div class="order-status">
                                    <span class="status-badge completed">Delivered</span>
                                    <button class="btn-small" onclick="viewOrderFeedback('order2')">View Feedback</button>
                                </div>
                            </div>
                            
                            <div class="order-card">
                                <div class="order-header">
                                    <h5>Tiffin Service (Weekly)</h5>
                                    <span class="order-price">₹1,200</span>
                                </div>
                                <div class="order-details">
                                    <p><strong>Customer:</strong> Ravi Patel</p>
                                    <p><strong>Delivery:</strong> Daily, 12:30 PM</p>
                                    <p><strong>Address:</strong> Gurgaon Office</p>
                                </div>
                                <div class="order-status">
                                    <span class="status-badge ongoing">Ongoing</span>
                                    <button class="btn-small" onclick="manageTiffinService('order3')">Manage</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="food-actions">
                        <button class="btn-secondary" onclick="addNewDish()">
                            <i class="fas fa-plus"></i>
                            Add New Dish
                        </button>
                        <button class="btn-primary" onclick="viewFoodAnalytics()">
                            <i class="fas fa-chart-bar"></i>
                            View Analytics
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    showNotification('🍳 Food Marketplace opened successfully!', 'success');
}

// Update Order Status
function updateOrderStatus(orderId, newStatus) {
    showNotification('📦 Updating order status...', 'info');
    
    setTimeout(() => {
        const statusMap = {
            'ready': { text: 'Ready for Pickup', class: 'ready', color: '#f59e0b' },
            'delivered': { text: 'Delivered', class: 'completed', color: '#10b981' },
            'preparing': { text: 'Preparing', class: 'preparing', color: '#6366f1' }
        };
        
        const status = statusMap[newStatus];
        showNotification(`✅ Order marked as ${status.text}!`, 'success');
        
        // Update the UI
        const orderCard = document.querySelector(`[data-order="${orderId}"]`);
        if (orderCard) {
            const statusBadge = orderCard.querySelector('.status-badge');
            statusBadge.textContent = status.text;
            statusBadge.className = `status-badge ${status.class}`;
        }
    }, 1000);
}

// View Order Feedback
function viewOrderFeedback(orderId) {
    showNotification('📝 Loading customer feedback...', 'info');
    
    setTimeout(() => {
        const feedbackModal = document.createElement('div');
        feedbackModal.className = 'modal feedback-modal';
        feedbackModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>⭐ Customer Feedback</h3>
                    <span class="close" onclick="closeFoodModal(this)">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="feedback-content">
                        <div class="customer-info">
                            <h4>Amit Kumar</h4>
                            <div class="rating">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <span>5.0/5</span>
                            </div>
                        </div>
                        <div class="feedback-text">
                            <p>"Absolutely delicious homemade cookies! The taste was amazing and packaging was perfect. Will definitely order again. Rukaiya's cooking is exceptional!"</p>
                        </div>
                        <div class="feedback-actions">
                            <button class="btn-primary" onclick="respondToFeedback()">
                                <i class="fas fa-reply"></i>
                                Respond to Customer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(feedbackModal);
        feedbackModal.style.display = 'block';
    }, 800);
}

// Manage Tiffin Service
function manageTiffinService(orderId) {
    showNotification('🍱 Opening tiffin service management...', 'info');
    
    setTimeout(() => {
        showNotification('📅 Tiffin service: 5 days completed, 2 days remaining this week', 'success');
        setTimeout(() => {
            showNotification('💰 Weekly earnings: ₹1,200 | Next payment: Friday', 'info');
        }, 1500);
    }, 1000);
}

// Add New Dish
function addNewDish() {
    showNotification('🍽️ Opening dish creation wizard...', 'info');
    
    setTimeout(() => {
        const dishModal = document.createElement('div');
        dishModal.className = 'modal add-dish-modal';
        dishModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🍽️ Add New Dish</h3>
                    <span class="close" onclick="closeFoodModal(this)">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="dish-form">
                        <div class="form-group">
                            <label>Dish Name</label>
                            <input type="text" placeholder="e.g., Butter Chicken" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Category</label>
                            <select class="form-input">
                                <option>Main Course</option>
                                <option>Snacks</option>
                                <option>Desserts</option>
                                <option>Beverages</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Price per Portion</label>
                            <input type="number" placeholder="₹150" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Preparation Time</label>
                            <input type="text" placeholder="45 minutes" class="form-input">
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea placeholder="Describe your dish..." class="form-input" rows="3"></textarea>
                        </div>
                        <div class="form-actions">
                            <button class="btn-secondary" onclick="closeFoodModal(this)">Cancel</button>
                            <button class="btn-primary" onclick="saveDish()">
                                <i class="fas fa-save"></i>
                                Save Dish
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dishModal);
        dishModal.style.display = 'block';
    }, 800);
}

// Save New Dish
function saveDish() {
    showNotification('💾 Saving your new dish...', 'info');
    
    setTimeout(() => {
        showNotification('✅ Dish added successfully! It will appear in your menu.', 'success');
        closeFoodModal(document.querySelector('.add-dish-modal .close'));
    }, 1500);
}

// View Food Analytics
function viewFoodAnalytics() {
    showNotification('📊 Loading food analytics dashboard...', 'info');
    
    setTimeout(() => {
        const analyticsModal = document.createElement('div');
        analyticsModal.className = 'modal analytics-modal';
        analyticsModal.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h3>📊 Food Business Analytics</h3>
                    <span class="close" onclick="closeFoodModal(this)">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="analytics-dashboard">
                        <div class="analytics-metrics">
                            <div class="metric-card">
                                <h4>This Month</h4>
                                <div class="metric-value">₹12,800</div>
                                <div class="metric-change positive">+25% from last month</div>
                            </div>
                            <div class="metric-card">
                                <h4>Total Orders</h4>
                                <div class="metric-value">47</div>
                                <div class="metric-change positive">+12 this week</div>
                            </div>
                            <div class="metric-card">
                                <h4>Avg Rating</h4>
                                <div class="metric-value">4.8</div>
                                <div class="metric-change positive">+0.3 this month</div>
                            </div>
                        </div>
                        
                        <div class="popular-dishes">
                            <h4>🏆 Most Popular Dishes</h4>
                            <div class="dish-list">
                                <div class="dish-item">
                                    <span class="dish-name">Rajma Chawal</span>
                                    <span class="dish-orders">23 orders</span>
                                </div>
                                <div class="dish-item">
                                    <span class="dish-name">Homemade Cookies</span>
                                    <span class="dish-orders">18 orders</span>
                                </div>
                                <div class="dish-item">
                                    <span class="dish-name">Tiffin Service</span>
                                    <span class="dish-orders">12 orders</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="recommendations">
                            <h4>💡 AI Recommendations</h4>
                            <ul>
                                <li>Consider adding South Indian dishes - high demand in your area</li>
                                <li>Offer weekend special combos - 40% higher profit margins</li>
                                <li>Expand tiffin service - most profitable offering</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(analyticsModal);
        analyticsModal.style.display = 'block';
    }, 1000);
}

// Respond to Feedback
function respondToFeedback() {
    showNotification('💬 Opening response composer...', 'info');
    
    setTimeout(() => {
        showNotification('📝 Thank you message sent to customer!', 'success');
    }, 1500);
}

// Close Food Modal
function closeFoodModal(element) {
    const modal = element.closest('.modal');
    modal.remove();
    document.body.style.overflow = 'auto';
}

// Add Food Marketplace Styles
const foodStyles = document.createElement('style');
foodStyles.textContent = `
    .food-marketplace-modal .modal-content {
        max-width: 900px;
        width: 95%;
    }
    
    .food-dashboard {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }
    
    .food-metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
    }
    
    .metric-card {
        background: #f8fafc;
        padding: 20px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        gap: 16px;
    }
    
    .metric-icon {
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 20px;
    }
    
    .metric-info {
        display: flex;
        flex-direction: column;
    }
    
    .metric-number {
        font-size: 24px;
        font-weight: 700;
        color: #1e293b;
    }
    
    .metric-label {
        font-size: 14px;
        color: #64748b;
    }
    
    .orders-section h4 {
        margin: 0 0 16px 0;
        color: #1e293b;
        font-size: 18px;
    }
    
    .orders-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
    
    .order-card {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 20px;
        transition: all 0.2s ease;
    }
    
    .order-card:hover {
        border-color: #6366f1;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
    }
    
    .order-card.active {
        border-color: #10b981;
        background: #f0fdf4;
    }
    
    .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    }
    
    .order-header h5 {
        margin: 0;
        color: #1e293b;
        font-size: 16px;
    }
    
    .order-price {
        font-size: 18px;
        font-weight: 600;
        color: #059669;
    }
    
    .order-details {
        margin-bottom: 16px;
    }
    
    .order-details p {
        margin: 4px 0;
        font-size: 14px;
        color: #64748b;
    }
    
    .order-status {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .status-badge {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .status-badge.preparing {
        background: #dbeafe;
        color: #1e40af;
    }
    
    .status-badge.ready {
        background: #fef3c7;
        color: #92400e;
    }
    
    .status-badge.completed {
        background: #dcfce7;
        color: #166534;
    }
    
    .status-badge.ongoing {
        background: #f3e8ff;
        color: #7c3aed;
    }
    
    .btn-small {
        padding: 6px 12px;
        font-size: 12px;
        border: none;
        border-radius: 6px;
        background: #6366f1;
        color: white;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .btn-small:hover {
        background: #4f46e5;
        transform: translateY(-1px);
    }
    
    .food-actions {
        display: flex;
        gap: 12px;
        padding-top: 20px;
        border-top: 1px solid #e2e8f0;
    }
    
    .feedback-content {
        text-align: center;
        padding: 20px;
    }
    
    .customer-info h4 {
        margin: 0 0 8px 0;
        color: #1e293b;
    }
    
    .rating {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        margin-bottom: 20px;
    }
    
    .rating i {
        color: #fbbf24;
    }
    
    .rating span {
        margin-left: 8px;
        font-weight: 600;
        color: #1e293b;
    }
    
    .feedback-text {
        background: #f8fafc;
        padding: 20px;
        border-radius: 12px;
        margin-bottom: 20px;
    }
    
    .feedback-text p {
        margin: 0;
        font-style: italic;
        color: #374151;
        line-height: 1.6;
    }
    
    .dish-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
    
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    
    .form-group label {
        font-weight: 600;
        color: #374151;
        font-size: 14px;
    }
    
    .form-input {
        padding: 12px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;
        transition: border-color 0.2s ease;
    }
    
    .form-input:focus {
        outline: none;
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
    
    .form-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;
    }
    
    .analytics-dashboard {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }
    
    .analytics-metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
    }
    
    .analytics-metrics .metric-card {
        text-align: center;
        flex-direction: column;
        gap: 8px;
    }
    
    .analytics-metrics .metric-card h4 {
        margin: 0;
        font-size: 14px;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .metric-value {
        font-size: 32px;
        font-weight: 700;
        color: #1e293b;
    }
    
    .metric-change {
        font-size: 12px;
        font-weight: 600;
    }
    
    .metric-change.positive {
        color: #059669;
    }
    
    .popular-dishes h4 {
        margin: 0 0 16px 0;
        color: #1e293b;
    }
    
    .dish-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .dish-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: #f8fafc;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
    }
    
    .dish-name {
        font-weight: 600;
        color: #1e293b;
    }
    
    .dish-orders {
        color: #6366f1;
        font-weight: 600;
        font-size: 14px;
    }
    
    .recommendations h4 {
        margin: 0 0 16px 0;
        color: #1e293b;
    }
    
    .recommendations ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    
    .recommendations li {
        padding: 12px 16px;
        background: #fef3c7;
        border: 1px solid #fbbf24;
        border-radius: 8px;
        margin-bottom: 8px;
        color: #92400e;
        font-size: 14px;
    }
    
    .recommendations li:before {
        content: "💡 ";
        margin-right: 8px;
    }
    
    @media (max-width: 768px) {
        .food-metrics {
            grid-template-columns: 1fr;
        }
        
        .food-actions {
            flex-direction: column;
        }
        
        .order-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
        }
        
        .order-status {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
        }
    }
`;
document.head.appendChild(foodStyles);


// My Orders with Labour Tracking
const myOrders = [
    {
        id: 1,
        orderId: 'ORD-2024-001',
        product: 'Embroidered Saree',
        client: 'Priya Fashion Boutique',
        craftHours: 12,
        householdHours: 40,
        estimatedRemaining: 3,
        status: 'In Progress',
        notes: 'Intricate embroidery work progressing well'
    },
    {
        id: 2,
        orderId: 'ORD-2024-002',
        product: 'Cushion Covers Set (4 pieces)',
        client: 'Urban Home Decor',
        craftHours: 8,
        householdHours: 35,
        estimatedRemaining: 0,
        status: 'Completed',
        notes: 'Completed ahead of schedule'
    },
    {
        id: 3,
        orderId: 'ORD-2024-003',
        product: 'Traditional Thali Meals',
        client: 'Tech Corp Office',
        craftHours: 5,
        householdHours: 38,
        estimatedRemaining: 2,
        status: 'In Progress',
        notes: 'Daily meal preparation service'
    }
];

// Load my orders
function loadMyOrders() {
    const ordersList = document.getElementById('myOrdersList');
    if (!ordersList) return;
    
    ordersList.innerHTML = '';
    
    myOrders.forEach(order => {
        const totalHours = order.craftHours + order.householdHours;
        const progress = order.estimatedRemaining === 0 ? 100 : 
                        Math.round((order.craftHours / (order.craftHours + order.estimatedRemaining)) * 100);
        
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="order-header">
                <div class="order-info">
                    <h4>${order.product}</h4>
                    <p><i class="fas fa-hashtag"></i> ${order.orderId} • <i class="fas fa-user"></i> ${order.client}</p>
                </div>
                <span class="order-status-badge ${order.status === 'Completed' ? 'completed' : 'in-progress'}">
                    ${order.status}
                </span>
            </div>
            
            <div class="labour-summary">
                <div class="labour-stat">
                    <span class="label"><i class="fas fa-hands-helping"></i> Craft Hours</span>
                    <span class="value">${order.craftHours}h</span>
                </div>
                <div class="labour-stat">
                    <span class="label"><i class="fas fa-home"></i> Household Context</span>
                    <span class="value">${order.householdHours}h</span>
                </div>
                <div class="labour-stat">
                    <span class="label"><i class="fas fa-hourglass-half"></i> Total Investment</span>
                    <span class="value">${totalHours}h</span>
                </div>
            </div>
            
            <div class="labour-progress-bar">
                <div class="label">
                    <span>Work Progress</span>
                    <span>${progress}%</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: ${progress}%"></div>
                </div>
            </div>
            
            <div class="order-actions">
                <button class="btn-update-labour" onclick="openLabourModal(${order.id})">
                    <i class="fas fa-clock"></i> Update Labour Hours
                </button>
            </div>
        `;
        ordersList.appendChild(orderCard);
    });
}

// Open labour tracking modal
function openLabourModal(orderId) {
    const order = myOrders.find(o => o.id === orderId);
    if (!order) return;
    
    const totalHours = order.craftHours + order.householdHours;
    
    const modalContent = document.getElementById('labourModalContent');
    modalContent.innerHTML = `
        <div style="background: #F5F5DC; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="color: #5D4037; margin-bottom: 5px;">${order.product}</h4>
            <p style="color: #666; font-size: 14px;">${order.orderId} • ${order.client}</p>
        </div>
        
        <div class="labour-form-group">
            <label for="hoursToday"><i class="fas fa-calendar-day"></i> Hours Worked Today</label>
            <input type="number" id="hoursToday" min="0" step="0.5" placeholder="e.g., 2.5">
            <span class="helper-text">Enter the hours you worked on this order today</span>
        </div>
        
        <div class="labour-form-group">
            <label for="totalHours"><i class="fas fa-clock"></i> Total Craft Hours So Far</label>
            <input type="number" id="totalHours" value="${order.craftHours}" min="0" step="0.5">
            <span class="helper-text">Total hours you've spent on craft work for this order</span>
        </div>
        
        <div class="labour-form-group">
            <label for="estimatedRemaining"><i class="fas fa-hourglass-end"></i> Estimated Hours Remaining</label>
            <input type="number" id="estimatedRemaining" value="${order.estimatedRemaining}" min="0" step="0.5">
            <span class="helper-text">How many more hours do you think you'll need?</span>
        </div>
        
        <div class="labour-form-group">
            <label for="householdHours"><i class="fas fa-home"></i> Household Hours (This Week)</label>
            <input type="number" id="householdHours" value="${order.householdHours}" min="0" step="0.5">
            <span class="helper-text">Optional: Track your household work context</span>
        </div>
        
        <div class="labour-form-group">
            <label for="workNotes"><i class="fas fa-sticky-note"></i> Work Progress Notes</label>
            <textarea id="workNotes" placeholder="Share your progress, challenges, or achievements...">${order.notes}</textarea>
        </div>
        
        <div class="labour-aura-preview">
            <h4><i class="fas fa-heart"></i> Your Labour Aura</h4>
            <div class="time-display" id="labourAuraDisplay">
                ${order.householdHours}h household + ${order.craftHours}h craft = ${totalHours}h total investment
            </div>
            <p class="encouragement">
                <i class="fas fa-star"></i> Your dedication is valued! Every hour you track helps buyers understand 
                the true value of your craftsmanship.
            </p>
        </div>
        
        <div class="modal-actions">
            <button class="btn-cancel" onclick="closeLabourModal()">Cancel</button>
            <button class="btn-save-labour" onclick="saveLabourHours(${orderId})">
                <i class="fas fa-save"></i> Save Labour Hours
            </button>
        </div>
    `;
    
    document.getElementById('labourModal').style.display = 'block';
    
    // Update labour aura preview when inputs change
    ['totalHours', 'householdHours'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', updateLabourAuraPreview);
        }
    });
}

// Update labour aura preview
function updateLabourAuraPreview() {
    const craftHours = parseFloat(document.getElementById('totalHours').value) || 0;
    const householdHours = parseFloat(document.getElementById('householdHours').value) || 0;
    const totalHours = craftHours + householdHours;
    
    const display = document.getElementById('labourAuraDisplay');
    if (display) {
        display.textContent = `${householdHours}h household + ${craftHours}h craft = ${totalHours}h total investment`;
    }
}

// Save labour hours
function saveLabourHours(orderId) {
    const order = myOrders.find(o => o.id === orderId);
    if (!order) return;
    
    const hoursToday = parseFloat(document.getElementById('hoursToday').value) || 0;
    const totalHours = parseFloat(document.getElementById('totalHours').value) || 0;
    const estimatedRemaining = parseFloat(document.getElementById('estimatedRemaining').value) || 0;
    const householdHours = parseFloat(document.getElementById('householdHours').value) || 0;
    const notes = document.getElementById('workNotes').value;
    
    // Update order data
    order.craftHours = totalHours;
    order.estimatedRemaining = estimatedRemaining;
    order.householdHours = householdHours;
    order.notes = notes;
    
    // Check if order is completed
    if (estimatedRemaining === 0 && order.status !== 'Completed') {
        order.status = 'Completed';
    }
    
    // Show success message
    showSuccessNotification('Labour hours updated successfully! Your dedication is valued. 💖');
    
    // Close modal and reload orders
    closeLabourModal();
    loadMyOrders();
}

// Close labour modal
function closeLabourModal() {
    document.getElementById('labourModal').style.display = 'none';
}

// Show success notification
function showSuccessNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: linear-gradient(135deg, #2E7D32 0%, #388e3c 100%);
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 3000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadMyOrders();
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('labourModal');
    if (event.target === modal) {
        closeLabourModal();
    }
});
