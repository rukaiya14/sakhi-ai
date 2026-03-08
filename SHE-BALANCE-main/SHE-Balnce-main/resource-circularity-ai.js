/**
 * Resource Circularity AI Integration
 * Frontend JavaScript for AI-powered waste-to-wealth matching with Amazon Bedrock
 */

const API_BASE_URL = 'http://localhost:5000/api';

// Get auth token
function getAuthToken() {
    // Try both possible token keys for compatibility
    return localStorage.getItem('shebalance_token') || localStorage.getItem('token');
}

// API headers
function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
    };
}

/**
 * Find AI-powered resource matches
 */
async function findAIMatches(wasteType, quantity, location, skill) {
    try {
        const token = getAuthToken();
        if (!token) {
            showError('Please login first to use this feature.');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }

        showLoadingState('Finding AI-powered matches...');

        const response = await fetch(`${API_BASE_URL}/resource-circularity/find-matches`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                wasteType,
                quantity,
                location,
                skill
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            
            // Handle authentication errors specifically
            if (response.status === 401 || response.status === 403) {
                hideLoadingState();
                showError('Your session has expired. Please login again.');
                setTimeout(() => {
                    localStorage.removeItem('token');
                    window.location.href = 'login.html';
                }, 2000);
                return;
            }
            
            throw new Error(errorData.error || errorData.message || 'Failed to find matches');
        }

        const data = await response.json();
        displayMatches(data.matches);
        hideLoadingState();

        return data;

    } catch (error) {
        console.error('❌ Find matches error:', error);
        showError(`Failed to find matches: ${error.message}`);
        hideLoadingState();
        throw error;
    }
}

/**
 * Get detailed match insights
 */
async function getMatchInsights(matchId) {
    try {
        showLoadingState('Analyzing match compatibility...');

        const response = await fetch(`${API_BASE_URL}/resource-circularity/match-insights`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                artisan1: getArtisan1Data(),
                artisan2: getArtisan2Data(),
                material: getMaterialData()
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get insights');
        }

        const data = await response.json();
        displayInsights(data.insights);
        hideLoadingState();

        return data;

    } catch (error) {
        console.error('❌ Get insights error:', error);
        showError('Failed to get insights. Please try again.');
        hideLoadingState();
        throw error;
    }
}

/**
 * Analyze resource compatibility
 */
async function analyzeCompatibility(wasteType, targetSkill, quality) {
    try {
        showLoadingState('Analyzing compatibility...');

        const response = await fetch(`${API_BASE_URL}/resource-circularity/analyze-compatibility`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                wasteType,
                targetSkill,
                quality
            })
        });

        if (!response.ok) {
            throw new Error('Failed to analyze compatibility');
        }

        const data = await response.json();
        displayCompatibilityAnalysis(data.analysis);
        hideLoadingState();

        return data;

    } catch (error) {
        console.error('❌ Analyze compatibility error:', error);
        showError('Failed to analyze compatibility. Please try again.');
        hideLoadingState();
        throw error;
    }
}

/**
 * Get AI recommendations
 */
async function getAIRecommendations() {
    try {
        showLoadingState('Getting AI recommendations...');

        const response = await fetch(`${API_BASE_URL}/resource-circularity/recommendations`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to get recommendations');
        }

        const data = await response.json();
        displayRecommendations(data.recommendations);
        hideLoadingState();

        return data;

    } catch (error) {
        console.error('❌ Get recommendations error:', error);
        showError('Failed to get recommendations. Please try again.');
        hideLoadingState();
        throw error;
    }
}

/**
 * Get waste-to-wealth insights
 */
async function getWasteToWealthInsights() {
    try {
        const response = await fetch(`${API_BASE_URL}/resource-circularity/insights`, {
            method: 'GET',
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to get insights');
        }

        const data = await response.json();
        updateInsightsSection(data.insights);

        return data;

    } catch (error) {
        console.error('❌ Get insights error:', error);
        return null;
    }
}

/**
 * Display matches in the UI
 */
function displayMatches(matches) {
    const matchesGrid = document.querySelector('.matches-grid');
    if (!matchesGrid) return;

    matchesGrid.innerHTML = '';

    matches.forEach((match, index) => {
        const matchCard = createMatchCard(match, index);
        matchesGrid.appendChild(matchCard);
    });
}

/**
 * Create match card element
 */
function createMatchCard(match, index) {
    const card = document.createElement('div');
    card.className = 'match-card';
    card.innerHTML = `
        <div class="match-header">
            <span>Match Score: ${match.matchScore}%</span>
            <span class="match-badge">${getMatchBadge(match.matchScore)}</span>
        </div>
        <div class="match-body">
            <div class="artisan-pair">
                <div class="artisan-info">
                    <div class="artisan-avatar" style="background: ${getRandomGradient()};">
                        ${getInitials(match.providerName || 'Provider')}
                    </div>
                    <div class="artisan-name">${match.providerName || 'Provider'}</div>
                    <div class="artisan-skill">${match.providerSkill || 'Artisan'}</div>
                </div>
                <div class="exchange-icon">
                    <i class="fas fa-exchange-alt"></i>
                </div>
                <div class="artisan-info">
                    <div class="artisan-avatar" style="background: ${getRandomGradient()};">
                        ${getInitials(match.artisanName || match.targetSkill)}
                    </div>
                    <div class="artisan-name">${match.artisanName || match.receiverName || 'Receiver'}</div>
                    <div class="artisan-skill">${match.targetSkill}</div>
                </div>
            </div>
            
            ${match.artisanLocation ? `
            <div class="artisan-details" style="background: #f0fdf4; padding: 15px; border-radius: 10px; margin: 15px 0;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; font-size: 0.9rem;">
                    <div>
                        <i class="fas fa-map-marker-alt" style="color: #10b981;"></i>
                        <strong>Location:</strong> ${match.artisanLocation}
                    </div>
                    ${match.artisanPhone ? `
                    <div>
                        <i class="fas fa-phone" style="color: #10b981;"></i>
                        <strong>Contact:</strong> ${match.artisanPhone}
                    </div>
                    ` : ''}
                    ${match.artisanRating ? `
                    <div>
                        <i class="fas fa-star" style="color: #fbbf24;"></i>
                        <strong>Rating:</strong> ${match.artisanRating}/5.0
                    </div>
                    ` : ''}
                    ${match.quantityNeeded ? `
                    <div>
                        <i class="fas fa-box" style="color: #10b981;"></i>
                        <strong>Needs:</strong> ${match.quantityNeeded}
                    </div>
                    ` : ''}
                    ${match.urgency ? `
                    <div style="grid-column: 1 / -1;">
                        <i class="fas fa-clock" style="color: #f59e0b;"></i>
                        <strong>Urgency:</strong> ${match.urgency}
                    </div>
                    ` : ''}
                    ${match.preferredQuality ? `
                    <div style="grid-column: 1 / -1;">
                        <i class="fas fa-check-circle" style="color: #10b981;"></i>
                        <strong>Preferred:</strong> ${match.preferredQuality}
                    </div>
                    ` : ''}
                </div>
            </div>
            ` : ''}
            
            <div class="resource-exchange">
                <div class="resource-item">
                    <span class="resource-label">Material:</span>
                    <span class="resource-value">${match.material || 'Various'}</span>
                </div>
                <div class="resource-item">
                    <span class="resource-label">Usage:</span>
                    <span class="resource-value">${match.usage}</span>
                </div>
                <div class="resource-item">
                    <span class="resource-label">Distance:</span>
                    <span class="resource-value">${match.distance}</span>
                </div>
                <div class="resource-item">
                    <span class="resource-label">Quality:</span>
                    <span class="resource-value">${match.quality}</span>
                </div>
            </div>
            
            <div class="savings-badge">
                💰 Potential Savings: ₹${match.savings.toLocaleString()} (${Math.round(match.savings / 10000 * 100)}% cost reduction)
            </div>
            
            <div class="action-buttons">
                <button class="btn btn-primary" onclick="connectMatch(${index})">
                    <i class="fas fa-link"></i> Connect
                </button>
                <button class="btn btn-secondary" onclick="viewMatchDetails(${index})">
                    <i class="fas fa-info-circle"></i> Details
                </button>
            </div>
        </div>
    `;
    return card;
}

/**
 * Display insights in modal or section
 */
function displayInsights(insights) {
    const modal = createInsightsModal(insights);
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

/**
 * Create insights modal
 */
function createInsightsModal(insights) {
    const modal = document.createElement('div');
    modal.className = 'insights-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 20px; max-width: 800px; max-height: 80vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                <h2 style="color: #333; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-brain" style="color: #8b5cf6;"></i>
                    AI Match Insights
                </h2>
                <button onclick="this.closest('.insights-modal').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div style="white-space: pre-wrap; line-height: 1.8; color: #555;">
                ${formatInsights(insights)}
            </div>
            <div style="margin-top: 30px; text-align: center;">
                <button onclick="this.closest('.insights-modal').remove()" class="btn btn-primary" style="padding: 12px 40px;">
                    Close
                </button>
            </div>
        </div>
    `;
    
    return modal;
}

/**
 * Format insights text
 */
function formatInsights(insights) {
    return insights
        .replace(/\n\n/g, '</p><p style="margin: 15px 0;">')
        .replace(/\n/g, '<br>')
        .replace(/(\d+\.)/g, '<strong>$1</strong>')
        .replace(/([A-Z][a-z]+ [A-Z][a-z]+:)/g, '<strong style="color: #10b981;">$1</strong>');
}

/**
 * Display compatibility analysis
 */
function displayCompatibilityAnalysis(analysis) {
    displayInsights(analysis);
}

/**
 * Display recommendations
 */
function displayRecommendations(recommendations) {
    displayInsights(recommendations);
}

/**
 * Update insights section
 */
function updateInsightsSection(insights) {
    const insightsGrid = document.querySelector('.insights-grid');
    if (!insightsGrid) return;

    // Parse insights and update cards
    const insightItems = insightsGrid.querySelectorAll('.insight-item');
    if (insightItems.length > 0) {
        // Update with real AI insights
        const lines = insights.split('\n').filter(line => line.trim());
        insightItems.forEach((item, index) => {
            if (lines[index]) {
                const p = item.querySelector('p');
                if (p) p.textContent = lines[index];
            }
        });
    }
}

/**
 * Helper functions
 */
function getCurrentArtisanId() {
    return localStorage.getItem('userId') || 'demo-artisan-1';
}

function getArtisan1Data() {
    return {
        id: 'artisan-1',
        name: 'Current User',
        skill: 'Tailoring'
    };
}

function getArtisan2Data() {
    return {
        id: 'artisan-2',
        name: 'Match User',
        skill: 'Jewelry Making'
    };
}

function getMaterialData() {
    return 'Silk Scraps';
}

function getMatchBadge(score) {
    if (score >= 95) return 'EXCELLENT';
    if (score >= 90) return 'HOT';
    if (score >= 85) return 'TRENDING';
    return 'GOOD';
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getRandomGradient() {
    const gradients = [
        'linear-gradient(135deg, #667eea, #764ba2)',
        'linear-gradient(135deg, #f093fb, #f5576c)',
        'linear-gradient(135deg, #4facfe, #00f2fe)',
        'linear-gradient(135deg, #43e97b, #38f9d7)',
        'linear-gradient(135deg, #fa709a, #fee140)'
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
}

function showLoadingState(message) {
    const loader = document.createElement('div');
    loader.id = 'ai-loader';
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    loader.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 20px; text-align: center;">
            <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #10b981; margin-bottom: 20px;"></i>
            <p style="font-size: 1.2rem; color: #333; font-weight: 600;">${message}</p>
            <p style="color: #666; margin-top: 10px;">Powered by Amazon Bedrock Llama 3</p>
        </div>
    `;
    document.body.appendChild(loader);
}

function hideLoadingState() {
    const loader = document.getElementById('ai-loader');
    if (loader) loader.remove();
}

function showError(message) {
    alert('❌ ' + message);
}

function showSuccess(message) {
    alert('✅ ' + message);
}

/**
 * Global functions for button clicks
 */
window.connectMatch = function(matchIndex) {
    showSuccess('Connection request sent! Both artisans will be notified.');
};

window.viewMatchDetails = async function(matchIndex) {
    await getMatchInsights(matchIndex);
};

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Resource Circularity AI initialized');
    
    // Load initial insights
    getWasteToWealthInsights();
    
    // Set up event listeners
    const findMatchesBtn = document.getElementById('findMatchesBtn');
    if (findMatchesBtn) {
        findMatchesBtn.onclick = async function() {
            await findAIMatches('Fabric Scraps', '2.5kg', 'Mumbai', 'Tailoring');
        };
    }
});
