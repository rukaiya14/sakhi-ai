/**
 * SkillScan AI Backend Integration
 * Connects frontend to AWS Bedrock Llama 3 70B backend
 */

// Configuration - UPDATE THESE AFTER DEPLOYMENT
const SKILLSCAN_CONFIG = {
    // Replace with your actual API Gateway endpoint after deployment
    API_ENDPOINT: 'https://5tpjo9oswc.execute-api.us-east-1.amazonaws.com/prod',
    ANALYZE_ENDPOINT: '/analyze',
    GET_SKILLSCANS_ENDPOINT: '/skillscans',
    MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_IMAGES: 5,
    SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/jpg', 'image/heic']
};

/**
 * SkillScan Backend Service
 */
class SkillScanBackendService {
    constructor() {
        this.apiEndpoint = SKILLSCAN_CONFIG.API_ENDPOINT;
    }

    /**
     * Analyze skill images using Llama 3 70B via AWS Bedrock
     * @param {string} artisanId - Artisan ID
     * @param {string} category - Skill category (embroidery, cooking, henna, etc.)
     * @param {Array} imageFiles - Array of File objects
     * @returns {Promise<Object>} Analysis results
     */
    async analyzeSkills(artisanId, category, imageFiles) {
        try {
            console.log(`🚀 Starting SkillScan analysis for ${artisanId} - ${category}`);
            
            // Validate inputs
            if (!artisanId || !category || !imageFiles || imageFiles.length === 0) {
                throw new Error('Missing required parameters');
            }

            // Validate image count
            if (imageFiles.length > SKILLSCAN_CONFIG.MAX_IMAGES) {
                throw new Error(`Maximum ${SKILLSCAN_CONFIG.MAX_IMAGES} images allowed`);
            }

            // Convert images to base64
            const base64Images = await this.convertImagesToBase64(imageFiles);

            // Prepare request payload
            const payload = {
                artisan_id: artisanId,
                category: category,
                images: base64Images,
                timestamp: new Date().toISOString()
            };

            console.log(`📤 Sending ${base64Images.length} images to AWS Bedrock...`);

            // Call AWS Lambda via API Gateway
            const response = await fetch(
                `${this.apiEndpoint}${SKILLSCAN_CONFIG.ANALYZE_ENDPOINT}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('✅ Analysis complete:', result);

            return result;

        } catch (error) {
            console.error('❌ SkillScan analysis error:', error);
            throw error;
        }
    }

    /**
     * Get SkillScan history for an artisan
     * @param {string} artisanId - Artisan ID (optional, if not provided returns all)
     * @param {number} limit - Maximum number of results
     * @returns {Promise<Array>} Array of SkillScan results
     */
    async getSkillScanHistory(artisanId = null, limit = 50) {
        try {
            const params = new URLSearchParams();
            if (artisanId) {
                params.append('artisan_id', artisanId);
            }
            params.append('limit', limit);

            const response = await fetch(
                `${this.apiEndpoint}${SKILLSCAN_CONFIG.GET_SKILLSCANS_ENDPOINT}?${params}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            return result.skillscans || [];

        } catch (error) {
            console.error('Error fetching SkillScan history:', error);
            throw error;
        }
    }

    /**
     * Convert image files to base64 strings
     * @param {Array} imageFiles - Array of File objects
     * @returns {Promise<Array>} Array of base64 strings
     */
    async convertImagesToBase64(imageFiles) {
        const promises = imageFiles.map(file => {
            return new Promise((resolve, reject) => {
                // Validate file
                if (!SKILLSCAN_CONFIG.SUPPORTED_FORMATS.includes(file.type)) {
                    reject(new Error(`Unsupported format: ${file.type}`));
                    return;
                }

                if (file.size > SKILLSCAN_CONFIG.MAX_IMAGE_SIZE) {
                    reject(new Error(`File too large: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`));
                    return;
                }

                const reader = new FileReader();
                
                reader.onload = (e) => {
                    // Extract base64 data (remove data URL prefix)
                    const base64 = e.target.result.split(',')[1];
                    resolve(base64);
                };
                
                reader.onerror = () => {
                    reject(new Error(`Failed to read file: ${file.name}`));
                };
                
                reader.readAsDataURL(file);
            });
        });

        return Promise.all(promises);
    }

    /**
     * Compress image if needed (for large images)
     * @param {File} file - Image file
     * @param {number} maxWidth - Maximum width
     * @param {number} maxHeight - Maximum height
     * @returns {Promise<Blob>} Compressed image blob
     */
    async compressImage(file, maxWidth = 1920, maxHeight = 1920) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions
                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => resolve(blob),
                        'image/jpeg',
                        0.85
                    );
                };

                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }
}

// Initialize service
const skillScanBackend = new SkillScanBackendService();

/**
 * Enhanced SkillScan analysis function that uses AWS backend
 */
async function startSkillScanAnalysisWithBackend() {
    if (!selectedCategory || uploadedFiles.length === 0) {
        showNotification('Please select a category and upload images first.', 'warning');
        return;
    }

    try {
        // Show loading state
        showAnalysisLoading();

        // Get artisan ID from localStorage or session
        const userData = JSON.parse(localStorage.getItem('shebalance_user_data') || '{}');
        const artisanId = userData.userId || userData.email || 'demo-user';

        console.log(`🎯 Analyzing ${uploadedFiles.length} images for ${selectedCategory}`);

        // Call AWS backend with Claude 3.5 Sonnet
        const result = await skillScanBackend.analyzeSkills(
            artisanId,
            selectedCategory,
            uploadedFiles
        );

        // Display results
        if (result.success && result.analysis) {
            displayBackendAnalysisResults(result.analysis);
            
            // Show success notification
            showNotification('✨ AI analysis complete! Llama 3 70B has assessed your work.', 'success');
        } else {
            throw new Error('Invalid response from backend');
        }

    } catch (error) {
        console.error('❌ Analysis failed:', error);
        
        // Show error to user
        const resultsSection = document.getElementById('skillscanResults');
        resultsSection.style.display = 'block';
        resultsSection.innerHTML = `
            <div class="analysis-error">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Analysis Failed</h3>
                <p>${error.message}</p>
                <p class="error-details">Please check your internet connection and try again. If the problem persists, contact support.</p>
                <button class="btn-primary" onclick="resetSkillScan()">
                    <i class="fas fa-redo"></i>
                    Try Again
                </button>
            </div>
        `;
        
        showNotification('Analysis failed. Please try again.', 'error');
    }
}

/**
 * Display analysis results from AWS backend
 */
function displayBackendAnalysisResults(analysis) {
    const resultsSection = document.getElementById('skillscanResults');
    resultsSection.style.display = 'block';

    // Extract data from analysis
    const overallScore = analysis.overall_score || 0;
    const skillLevel = analysis.skill_level || 'Intermediate';
    const breakdown = analysis.breakdown || {};
    const strengths = analysis.strengths || [];
    const improvements = analysis.improvements || [];
    const recommendations = analysis.recommendations || [];
    const marketReadiness = analysis.market_readiness || 'Developing well';
    const detailedFeedback = analysis.detailed_feedback || '';

    // Build breakdown HTML
    let breakdownHTML = '';
    Object.entries(breakdown).forEach(([key, value]) => {
        const label = key.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        breakdownHTML += `
            <div class="breakdown-item">
                <span class="item-label">${label}</span>
                <div class="item-score">
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${value}%"></div>
                    </div>
                    <span class="score-number">${value}%</span>
                </div>
            </div>
        `;
    });

    // Build strengths HTML
    const strengthsHTML = strengths.map(s => `<li>${s}</li>`).join('');

    // Build improvements HTML
    const improvementsHTML = improvements.map(i => `<li>${i}</li>`).join('');

    // Build recommendations HTML
    const recommendationsHTML = recommendations.map(r => `<li>${r}</li>`).join('');

    // Render results
    resultsSection.innerHTML = `
        <div class="results-header">
            <h3>🎉 SkillScan Analysis Complete!</h3>
            <div class="analysis-badge">
                <i class="fas fa-robot"></i>
                <span>Powered by Llama 3 70B</span>
            </div>
        </div>

        <div class="results-grid">
            <div class="result-card overall-score">
                <div class="score-circle">
                    <div class="score-value">${overallScore}</div>
                    <div class="score-label">Overall Score</div>
                </div>
                <div class="score-details">
                    <div class="skill-level ${skillLevel.toLowerCase()}">${skillLevel}</div>
                    <div class="skill-category">${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}</div>
                </div>
            </div>

            <div class="result-card breakdown">
                <h4>📊 Detailed Analysis</h4>
                <div class="breakdown-items">
                    ${breakdownHTML}
                </div>
            </div>

            <div class="result-card ai-feedback">
                <h4>🤖 AI Feedback from Llama 3 70B</h4>
                <div class="feedback-content">
                    ${strengths.length > 0 ? `
                        <div class="feedback-positive">
                            <h5>✅ Strengths Identified:</h5>
                            <ul>${strengthsHTML}</ul>
                        </div>
                    ` : ''}
                    
                    ${improvements.length > 0 ? `
                        <div class="feedback-improvement">
                            <h5>🎯 Areas for Improvement:</h5>
                            <ul>${improvementsHTML}</ul>
                        </div>
                    ` : ''}
                    
                    ${recommendations.length > 0 ? `
                        <div class="feedback-recommendations">
                            <h5>💡 Recommendations:</h5>
                            <ul>${recommendationsHTML}</ul>
                        </div>
                    ` : ''}
                    
                    ${detailedFeedback ? `
                        <div class="feedback-detailed">
                            <h5>📝 Detailed Feedback:</h5>
                            <p>${detailedFeedback}</p>
                        </div>
                    ` : ''}
                    
                    <div class="market-readiness">
                        <h5>🏪 Market Readiness:</h5>
                        <p>${marketReadiness}</p>
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

        <div class="analysis-metadata">
            <p><i class="fas fa-info-circle"></i> Analysis performed by AWS Bedrock Llama 3 70B</p>
            <p><i class="fas fa-clock"></i> ${new Date().toLocaleString()}</p>
        </div>
    `;

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Load SkillScan history for admin dashboard
 */
async function loadSkillScanHistoryForAdmin() {
    try {
        const skillscans = await skillScanBackend.getSkillScanHistory(null, 100);
        
        // Display in admin dashboard
        displaySkillScanHistoryInAdmin(skillscans);
        
    } catch (error) {
        console.error('Error loading SkillScan history:', error);
        showNotification('Failed to load SkillScan history', 'error');
    }
}

/**
 * Display SkillScan history in admin dashboard
 */
function displaySkillScanHistoryInAdmin(skillscans) {
    // This function would be called from admin-dashboard.js
    console.log(`Loaded ${skillscans.length} SkillScan analyses`);
    
    // You can add UI rendering logic here for the admin dashboard
    // For example, showing a table or cards with all analyses
}

// Export functions for global access
window.skillScanBackend = skillScanBackend;
window.startSkillScanAnalysisWithBackend = startSkillScanAnalysisWithBackend;
window.loadSkillScanHistoryForAdmin = loadSkillScanHistoryForAdmin;

console.log('✅ SkillScan Backend Integration loaded');
console.log('📡 API Endpoint:', SKILLSCAN_CONFIG.API_ENDPOINT);
