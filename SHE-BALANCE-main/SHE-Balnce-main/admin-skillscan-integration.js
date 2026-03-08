/**
 * Admin Dashboard - SkillScan Integration
 * View and manage all SkillScan analyses from the admin panel
 */

// SkillScan Admin Dashboard Module
const SkillScanAdmin = {
    skillscans: [],
    currentFilter: 'all',
    
    /**
     * Initialize SkillScan admin features
     */
    async init() {
        console.log('🔧 Initializing SkillScan Admin Module...');
        
        // Load all SkillScan data
        await this.loadAllSkillScans();
        
        // Set up event listeners
        this.setupEventListeners();
        
        console.log('✅ SkillScan Admin Module initialized');
    },
    
    /**
     * Load all SkillScan analyses
     */
    async loadAllSkillScans() {
        try {
            console.log('📥 Loading SkillScan data from AWS...');
            
            // Check if backend service is available
            if (typeof skillScanBackend === 'undefined') {
                console.error('❌ SkillScan backend not loaded');
                this.showError('SkillScan backend not available. Please ensure skillscan-backend-integration.js is loaded.');
                return;
            }
            
            // Fetch all skillscans
            this.skillscans = await skillScanBackend.getSkillScanHistory(null, 100);
            
            console.log(`✅ Loaded ${this.skillscans.length} SkillScan analyses`);
            
            // Render in dashboard
            this.renderSkillScanSection();
            this.updateStatistics();
            
        } catch (error) {
            console.error('❌ Error loading SkillScans:', error);
            this.showError('Failed to load SkillScan data: ' + error.message);
        }
    },
    
    /**
     * Render SkillScan section in admin dashboard
     */
    renderSkillScanSection() {
        // Find or create SkillScan section in admin dashboard
        let skillscanSection = document.getElementById('skillscan-admin-section');
        
        if (!skillscanSection) {
            // Create section if it doesn't exist
            const usersSection = document.getElementById('users');
            if (usersSection) {
                skillscanSection = document.createElement('div');
                skillscanSection.id = 'skillscan-admin-section';
                skillscanSection.className = 'skillscan-admin-container';
                usersSection.appendChild(skillscanSection);
            } else {
                console.warn('Users section not found, cannot render SkillScan section');
                return;
            }
        }
        
        // Render content
        skillscanSection.innerHTML = this.getSkillScanHTML();
        
        // Render table
        this.renderSkillScanTable();
    },
    
    /**
     * Get HTML structure for SkillScan section
     */
    getSkillScanHTML() {
        return `
            <div class="skillscan-admin-header">
                <div class="section-title">
                    <i class="fas fa-camera"></i>
                    <h2>SkillScan AI Analyses</h2>
                    <span class="ai-badge">Llama 3 70B</span>
                </div>
                <div class="skillscan-actions">
                    <button class="btn-secondary" onclick="SkillScanAdmin.refreshData()">
                        <i class="fas fa-sync"></i>
                        Refresh
                    </button>
                    <button class="btn-primary" onclick="SkillScanAdmin.exportData()">
                        <i class="fas fa-download"></i>
                        Export CSV
                    </button>
                </div>
            </div>
            
            <div class="skillscan-stats-grid">
                <div class="stat-card-skillscan">
                    <div class="stat-icon" style="background: #e3f2fd;">
                        <i class="fas fa-chart-line" style="color: #1976d2;"></i>
                    </div>
                    <div class="stat-info">
                        <h4>Total Analyses</h4>
                        <p class="stat-number" id="totalAnalyses">0</p>
                        <span class="stat-change">All time</span>
                    </div>
                </div>
                
                <div class="stat-card-skillscan">
                    <div class="stat-icon" style="background: #e8f5e9;">
                        <i class="fas fa-star" style="color: #388e3c;"></i>
                    </div>
                    <div class="stat-info">
                        <h4>Avg Score</h4>
                        <p class="stat-number" id="avgScore">0</p>
                        <span class="stat-change">Across all categories</span>
                    </div>
                </div>
                
                <div class="stat-card-skillscan">
                    <div class="stat-icon" style="background: #fff3e0;">
                        <i class="fas fa-users" style="color: #f57c00;"></i>
                    </div>
                    <div class="stat-info">
                        <h4>Unique Artisans</h4>
                        <p class="stat-number" id="uniqueArtisans">0</p>
                        <span class="stat-change">Using SkillScan</span>
                    </div>
                </div>
                
                <div class="stat-card-skillscan">
                    <div class="stat-icon" style="background: #f3e5f5;">
                        <i class="fas fa-trophy" style="color: #7b1fa2;"></i>
                    </div>
                    <div class="stat-info">
                        <h4>Advanced Skills</h4>
                        <p class="stat-number" id="advancedCount">0</p>
                        <span class="stat-change">80+ score</span>
                    </div>
                </div>
            </div>
            
            <div class="skillscan-filters">
                <button class="filter-btn active" onclick="SkillScanAdmin.filterByCategory('all')">
                    All Categories
                </button>
                <button class="filter-btn" onclick="SkillScanAdmin.filterByCategory('embroidery')">
                    Embroidery
                </button>
                <button class="filter-btn" onclick="SkillScanAdmin.filterByCategory('cooking')">
                    Cooking
                </button>
                <button class="filter-btn" onclick="SkillScanAdmin.filterByCategory('henna')">
                    Henna
                </button>
                <button class="filter-btn" onclick="SkillScanAdmin.filterByCategory('crochet')">
                    Crochet
                </button>
                <button class="filter-btn" onclick="SkillScanAdmin.filterByCategory('tailoring')">
                    Tailoring
                </button>
            </div>
            
            <div class="table-card">
                <div class="table-header">
                    <h3>SkillScan Analysis History</h3>
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" placeholder="Search by artisan ID or category..." 
                               id="skillscanSearch" onkeyup="SkillScanAdmin.searchSkillScans()">
                    </div>
                </div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Artisan ID</th>
                            <th>Category</th>
                            <th>Overall Score</th>
                            <th>Skill Level</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="skillscanTableBody">
                        <!-- Populated by renderSkillScanTable() -->
                    </tbody>
                </table>
            </div>
        `;
    },
    
    /**
     * Render SkillScan table rows
     */
    renderSkillScanTable() {
        const tbody = document.getElementById('skillscanTableBody');
        if (!tbody) return;
        
        // Filter skillscans based on current filter
        let filteredScans = this.skillscans;
        if (this.currentFilter !== 'all') {
            filteredScans = this.skillscans.filter(scan => 
                scan.category === this.currentFilter
            );
        }
        
        // Sort by timestamp (most recent first)
        filteredScans.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
        
        if (filteredScans.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px;">
                        <i class="fas fa-inbox" style="font-size: 48px; color: #ccc; margin-bottom: 10px;"></i>
                        <p>No SkillScan analyses found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Render rows
        tbody.innerHTML = filteredScans.map(scan => {
            const analysis = scan.analysis || {};
            const score = analysis.overall_score || 0;
            const level = analysis.skill_level || 'Unknown';
            const date = new Date(scan.timestamp).toLocaleDateString();
            
            // Determine skill level badge color
            let levelClass = 'intermediate';
            if (level === 'Advanced') levelClass = 'advanced';
            if (level === 'Beginner') levelClass = 'beginner';
            
            return `
                <tr>
                    <td>
                        <div class="artisan-cell">
                            <i class="fas fa-user-circle"></i>
                            <span>${scan.artisan_id}</span>
                        </div>
                    </td>
                    <td>
                        <span class="category-badge">${scan.category}</span>
                    </td>
                    <td>
                        <div class="score-cell">
                            <div class="score-bar-mini">
                                <div class="score-fill-mini" style="width: ${score}%"></div>
                            </div>
                            <span class="score-text">${score}%</span>
                        </div>
                    </td>
                    <td>
                        <span class="skill-level-badge ${levelClass}">${level}</span>
                    </td>
                    <td>${date}</td>
                    <td>
                        <button class="btn-icon" onclick="SkillScanAdmin.viewDetails('${scan.analysis_id}')" 
                                title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" onclick="SkillScanAdmin.downloadReport('${scan.analysis_id}')" 
                                title="Download Report">
                            <i class="fas fa-download"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },
    
    /**
     * Update statistics
     */
    updateStatistics() {
        // Total analyses
        document.getElementById('totalAnalyses').textContent = this.skillscans.length;
        
        // Average score
        if (this.skillscans.length > 0) {
            const avgScore = this.skillscans.reduce((sum, scan) => {
                return sum + (scan.analysis?.overall_score || 0);
            }, 0) / this.skillscans.length;
            document.getElementById('avgScore').textContent = Math.round(avgScore) + '%';
        }
        
        // Unique artisans
        const uniqueArtisans = new Set(this.skillscans.map(scan => scan.artisan_id));
        document.getElementById('uniqueArtisans').textContent = uniqueArtisans.size;
        
        // Advanced skills count
        const advancedCount = this.skillscans.filter(scan => 
            (scan.analysis?.overall_score || 0) >= 80
        ).length;
        document.getElementById('advancedCount').textContent = advancedCount;
    },
    
    /**
     * Filter by category
     */
    filterByCategory(category) {
        this.currentFilter = category;
        
        // Update active button
        document.querySelectorAll('.skillscan-filters .filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Re-render table
        this.renderSkillScanTable();
    },
    
    /**
     * Search skillscans
     */
    searchSkillScans() {
        const searchTerm = document.getElementById('skillscanSearch').value.toLowerCase();
        
        const filteredScans = this.skillscans.filter(scan => {
            return scan.artisan_id.toLowerCase().includes(searchTerm) ||
                   scan.category.toLowerCase().includes(searchTerm);
        });
        
        // Temporarily update skillscans for rendering
        const originalScans = this.skillscans;
        this.skillscans = filteredScans;
        this.renderSkillScanTable();
        this.skillscans = originalScans;
    },
    
    /**
     * View analysis details
     */
    viewDetails(analysisId) {
        const scan = this.skillscans.find(s => s.analysis_id === analysisId);
        if (!scan) return;
        
        const analysis = scan.analysis || {};
        
        // Create modal with detailed view
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="skillscan-detail-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-chart-bar"></i> SkillScan Analysis Details</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Artisan ID:</label>
                            <span>${scan.artisan_id}</span>
                        </div>
                        <div class="detail-item">
                            <label>Category:</label>
                            <span>${scan.category}</span>
                        </div>
                        <div class="detail-item">
                            <label>Overall Score:</label>
                            <span>${analysis.overall_score}%</span>
                        </div>
                        <div class="detail-item">
                            <label>Skill Level:</label>
                            <span>${analysis.skill_level}</span>
                        </div>
                        <div class="detail-item">
                            <label>Analysis Date:</label>
                            <span>${new Date(scan.timestamp).toLocaleString()}</span>
                        </div>
                        <div class="detail-item">
                            <label>Model Used:</label>
                            <span>Llama 3 70B</span>
                        </div>
                    </div>
                    
                    <div class="breakdown-section">
                        <h3>Score Breakdown</h3>
                        ${Object.entries(analysis.breakdown || {}).map(([key, value]) => `
                            <div class="breakdown-row">
                                <span>${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                <div class="score-bar-detail">
                                    <div class="score-fill-detail" style="width: ${value}%"></div>
                                    <span>${value}%</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="feedback-section">
                        <h3>AI Feedback</h3>
                        
                        <div class="feedback-group">
                            <h4>✅ Strengths</h4>
                            <ul>
                                ${(analysis.strengths || []).map(s => `<li>${s}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="feedback-group">
                            <h4>🎯 Areas for Improvement</h4>
                            <ul>
                                ${(analysis.improvements || []).map(i => `<li>${i}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="feedback-group">
                            <h4>💡 Recommendations</h4>
                            <ul>
                                ${(analysis.recommendations || []).map(r => `<li>${r}</li>`).join('')}
                            </ul>
                        </div>
                        
                        ${analysis.detailed_feedback ? `
                            <div class="feedback-group">
                                <h4>📝 Detailed Feedback</h4>
                                <p>${analysis.detailed_feedback}</p>
                            </div>
                        ` : ''}
                        
                        ${analysis.market_readiness ? `
                            <div class="feedback-group">
                                <h4>🏪 Market Readiness</h4>
                                <p>${analysis.market_readiness}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    /**
     * Download report
     */
    downloadReport(analysisId) {
        const scan = this.skillscans.find(s => s.analysis_id === analysisId);
        if (!scan) return;
        
        // Create JSON report
        const report = JSON.stringify(scan, null, 2);
        const blob = new Blob([report], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `skillscan-${analysisId}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    },
    
    /**
     * Export all data to CSV
     */
    exportData() {
        const csv = this.convertToCSV(this.skillscans);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `skillscan-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        
        URL.revokeObjectURL(url);
    },
    
    /**
     * Convert data to CSV format
     */
    convertToCSV(data) {
        const headers = ['Artisan ID', 'Category', 'Overall Score', 'Skill Level', 'Date'];
        const rows = data.map(scan => [
            scan.artisan_id,
            scan.category,
            scan.analysis?.overall_score || 0,
            scan.analysis?.skill_level || 'Unknown',
            new Date(scan.timestamp).toISOString()
        ]);
        
        return [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
    },
    
    /**
     * Refresh data
     */
    async refreshData() {
        await this.loadAllSkillScans();
    },
    
    /**
     * Show error message
     */
    showError(message) {
        console.error(message);
        // You can add UI notification here
    },
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Add any additional event listeners here
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Check if we're on admin dashboard
        if (window.location.pathname.includes('admin-dashboard')) {
            SkillScanAdmin.init();
        }
    });
} else {
    // DOM already loaded
    if (window.location.pathname.includes('admin-dashboard')) {
        SkillScanAdmin.init();
    }
}

// Export for global access
window.SkillScanAdmin = SkillScanAdmin;

console.log('✅ Admin SkillScan Integration loaded');
