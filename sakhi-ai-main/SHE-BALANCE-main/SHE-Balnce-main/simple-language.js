// ============================================
// SIMPLE LANGUAGE SYSTEM - Works on ALL Pages
// ============================================

(function() {
    'use strict';
    
    console.log('🌍 Simple Language System Loading...');
    
    // ============================================
    // 1. GET/SET LANGUAGE (localStorage only)
    // ============================================
    
    function getLanguage() {
        return localStorage.getItem('shebalance_language') || 'hi-IN';
    }
    
    function setLanguage(lang) {
        console.log('💾 Setting language:', lang);
        localStorage.setItem('shebalance_language', lang);
        applyLanguage(lang);
        showSuccess();
    }
    
    // ============================================
    // 2. APPLY TRANSLATIONS
    // ============================================
    
    function applyLanguage(lang) {
        console.log('🎨 Applying language:', lang);
        
        // Wait for translations to load
        if (typeof window.translations === 'undefined' || !window.translations[lang]) {
            console.log('⏳ Waiting for translations...');
            setTimeout(() => applyLanguage(lang), 100);
            return;
        }
        
        const trans = window.translations[lang];
        
        // Translate all elements with data-translate
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (trans[key]) {
                // Preserve icons
                const icon = el.querySelector('i');
                if (icon) {
                    const iconHTML = icon.outerHTML;
                    el.innerHTML = iconHTML + ' ' + trans[key];
                } else {
                    el.textContent = trans[key];
                }
            }
        });
        
        // Translate common text without data-translate
        translateCommonText(lang, trans);
        
        console.log('✅ Language applied');
    }
    
    // ============================================
    // 3. TRANSLATE COMMON TEXT
    // ============================================
    
    function translateCommonText(lang, trans) {
        // Map of English text to translation keys
        const textMap = {
            'Active Skills': 'activeSkills',
            'Certifications': 'certifications',
            'Avg Skill Level': 'avgSkillLevel',
            'Learning Hours': 'learningHours',
            'My Skills Portfolio': 'mySkillsPortfolio',
            'Voice Command': 'voiceCommand',
            'AI Mentor': 'aiMentor',
            'Get Instant Skill Assessment from Your Work Photos': 'getInstantSkillAssessment',
            'Photo Analysis': 'photoAnalysis',
            'Skill Scoring': 'skillScoring',
            'AI Feedback': 'aiFeedback',
            'Instant Certification': 'instantCertification',
            'Upload Your Work': 'uploadYourWork',
            'AI Assessment': 'aiAssessment',
            'Choose Photos': 'choosePhotos',
            'Select Your Skill Category': 'selectSkillCategory',
            'Embroidery': 'embroidery',
            'Henna Art': 'hennaArt',
            'Crochet': 'crochet',
            'Tailoring': 'tailoring',
            'Crafts': 'crafts',
            'Your Current Skills': 'yourCurrentSkills',
            'Add New Skill': 'addNewSkill',
            'Advanced': 'advanced',
            'Intermediate': 'intermediate',
            'Beginner': 'beginner',
            'View Portfolio': 'viewPortfolio',
            'Find Jobs': 'findJobs',
            'Cooking': 'cooking',
            'Practice More': 'practiceMore',
            'Learn Advanced': 'learnAdvanced',
            'Recommended Learning Paths': 'recommendedLearningPaths',
            'Get AI Roadmap': 'getAIRoadmap',
            'Popular': 'popular',
            'Chat with AI Mentor': 'chatWithAIMentor',
            'Dashboard': 'dashboard',
            'My Skills': 'mySkills',
            'Opportunities': 'opportunities',
            'Food Marketplace': 'foodMarketplace',
            'Community': 'community',
            'Progress': 'progress',
            'Settings': 'settings',
            'Logout': 'logout'
        };
        
        // Walk through all text nodes
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    if (node.parentElement.tagName === 'SCRIPT' || 
                        node.parentElement.tagName === 'STYLE') {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );
        
        const nodesToUpdate = [];
        let node;
        
        while (node = walker.nextNode()) {
            const text = node.textContent.trim();
            if (textMap[text] && trans[textMap[text]]) {
                nodesToUpdate.push({
                    node: node,
                    translation: trans[textMap[text]]
                });
            }
        }
        
        // Apply translations
        nodesToUpdate.forEach(({ node, translation }) => {
            node.textContent = translation;
        });
        
        // Translate specific elements
        translateSpecificElements(lang, trans);
    }
    
    // ============================================
    // 4. TRANSLATE SPECIFIC ELEMENTS
    // ============================================
    
    function translateSpecificElements(lang, trans) {
        // Overview cards (p tags inside overview-card)
        document.querySelectorAll('.overview-card p').forEach(p => {
            const text = p.textContent.trim();
            if (text === 'Active Skills' && trans.activeSkills) p.textContent = trans.activeSkills;
            if (text === 'Certifications' && trans.certifications) p.textContent = trans.certifications;
            if (text === 'Avg Skill Level' && trans.avgSkillLevel) p.textContent = trans.avgSkillLevel;
            if (text === 'Learning Hours' && trans.learningHours) p.textContent = trans.learningHours;
        });
        
        // Section headers with emojis
        document.querySelectorAll('.section-header h2').forEach(h2 => {
            if (h2.textContent.includes('SkillScan') && trans.skillScanAI) {
                h2.textContent = '📸 ' + trans.skillScanAI;
            }
        });
        
        // Badges
        document.querySelectorAll('.skillscan-badge').forEach(badge => {
            if (trans.aiPoweredCaps) {
                const icon = badge.querySelector('i');
                if (icon) {
                    badge.innerHTML = icon.outerHTML + ' ' + trans.aiPoweredCaps;
                } else {
                    badge.textContent = trans.aiPoweredCaps;
                }
            }
        });
        
        // Category cards
        document.querySelectorAll('.category-card span').forEach(span => {
            const text = span.textContent.trim();
            if (text === 'Embroidery' && trans.embroidery) span.textContent = trans.embroidery;
            if (text === 'Henna Art' && trans.hennaArt) span.textContent = trans.hennaArt;
            if (text === 'Crochet' && trans.crochet) span.textContent = trans.crochet;
            if (text === 'Tailoring' && trans.tailoring) span.textContent = trans.tailoring;
            if (text === 'Crafts' && trans.crafts) span.textContent = trans.crafts;
        });
        
        // Skill level badges
        document.querySelectorAll('.skill-level').forEach(badge => {
            const text = badge.textContent.trim();
            if (text === 'Advanced' && trans.advanced) badge.textContent = trans.advanced;
            if (text === 'Intermediate' && trans.intermediate) badge.textContent = trans.intermediate;
            if (text === 'Beginner' && trans.beginner) badge.textContent = trans.beginner;
        });
        
        // Buttons
        document.querySelectorAll('button').forEach(btn => {
            const text = btn.textContent.trim();
            const icon = btn.querySelector('i');
            
            if (text.includes('Voice Command') && trans.voiceCommand) {
                btn.innerHTML = (icon ? icon.outerHTML + ' ' : '') + trans.voiceCommand;
            }
            if (text.includes('AI Mentor') && trans.aiMentor) {
                btn.innerHTML = (icon ? icon.outerHTML + ' ' : '') + trans.aiMentor;
            }
            if (text.includes('Choose Photos') && trans.choosePhotos) {
                btn.innerHTML = (icon ? icon.outerHTML + ' ' : '') + trans.choosePhotos;
            }
            if (text.includes('Add New Skill') && trans.addNewSkill) {
                btn.innerHTML = (icon ? icon.outerHTML + ' ' : '') + trans.addNewSkill;
            }
            if (text.includes('View Portfolio') && trans.viewPortfolio) {
                btn.innerHTML = (icon ? icon.outerHTML + ' ' : '') + trans.viewPortfolio;
            }
            if (text.includes('Find Jobs') && trans.findJobs) {
                btn.innerHTML = (icon ? icon.outerHTML + ' ' : '') + trans.findJobs;
            }
        });
    }
    
    // ============================================
    // 5. SHOW SUCCESS MESSAGE
    // ============================================
    
    function showSuccess() {
        const msg = document.createElement('div');
        msg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 99999;
            font-weight: 600;
            animation: slideIn 0.3s ease;
        `;
        msg.innerHTML = '<i class="fas fa-check-circle"></i> Language Updated!';
        document.body.appendChild(msg);
        
        setTimeout(() => {
            msg.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => msg.remove(), 300);
        }, 2000);
    }
    
    // ============================================
    // 6. CREATE LANGUAGE SELECTOR
    // ============================================
    
    function createLanguageSelector() {
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
            .simple-lang-btn {
                background: white;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                padding: 8px 16px;
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                transition: all 0.3s;
                font-size: 14px;
                color: #5D4037;
                font-weight: 500;
            }
            .simple-lang-btn:hover {
                border-color: #8D6E63;
                background: #F5F5DC;
            }
            .simple-lang-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 99998;
                align-items: center;
                justify-content: center;
            }
            .simple-lang-modal.active {
                display: flex;
            }
            .simple-lang-content {
                background: white;
                border-radius: 15px;
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                padding: 30px;
            }
            .simple-lang-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 15px;
                margin-top: 20px;
            }
            .simple-lang-option {
                background: white;
                border: 2px solid #e0e0e0;
                border-radius: 10px;
                padding: 15px;
                cursor: pointer;
                transition: all 0.3s;
                text-align: center;
            }
            .simple-lang-option:hover {
                border-color: #8D6E63;
                background: #F5F5DC;
                transform: translateY(-2px);
            }
            .simple-lang-option.active {
                border-color: #5D4037;
                background: #8D6E63;
                color: white;
            }
        `;
        document.head.appendChild(style);
        
        // Find header-right
        const headerRight = document.querySelector('.header-right');
        if (!headerRight) return;
        
        // Create button
        const btn = document.createElement('button');
        btn.className = 'simple-lang-btn';
        btn.innerHTML = '<i class="fas fa-language"></i> <span id="currentLang">हिंदी</span>';
        btn.onclick = openModal;
        
        const notifications = headerRight.querySelector('.notifications');
        if (notifications) {
            headerRight.insertBefore(btn, notifications);
        } else {
            headerRight.appendChild(btn);
        }
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'simple-lang-modal';
        modal.id = 'simpleLangModal';
        modal.innerHTML = `
            <div class="simple-lang-content">
                <h2 style="color: #5D4037; margin-bottom: 20px;">
                    <i class="fas fa-language"></i> Select Language
                </h2>
                <div class="simple-lang-grid">
                    <div class="simple-lang-option" onclick="window.selectLang('hi-IN')">
                        🇮🇳<br><strong>हिंदी</strong><br><small>Hindi</small>
                    </div>
                    <div class="simple-lang-option" onclick="window.selectLang('ta-IN')">
                        🇮🇳<br><strong>தமிழ்</strong><br><small>Tamil</small>
                    </div>
                    <div class="simple-lang-option" onclick="window.selectLang('te-IN')">
                        🇮🇳<br><strong>తెలుగు</strong><br><small>Telugu</small>
                    </div>
                    <div class="simple-lang-option" onclick="window.selectLang('bn-IN')">
                        🇮🇳<br><strong>বাংলা</strong><br><small>Bengali</small>
                    </div>
                    <div class="simple-lang-option" onclick="window.selectLang('mr-IN')">
                        🇮🇳<br><strong>मराठी</strong><br><small>Marathi</small>
                    </div>
                    <div class="simple-lang-option" onclick="window.selectLang('gu-IN')">
                        🇮🇳<br><strong>ગુજરાતી</strong><br><small>Gujarati</small>
                    </div>
                    <div class="simple-lang-option" onclick="window.selectLang('kn-IN')">
                        🇮🇳<br><strong>ಕನ್ನಡ</strong><br><small>Kannada</small>
                    </div>
                    <div class="simple-lang-option" onclick="window.selectLang('ml-IN')">
                        🇮🇳<br><strong>മലയാളം</strong><br><small>Malayalam</small>
                    </div>
                    <div class="simple-lang-option" onclick="window.selectLang('pa-IN')">
                        🇮🇳<br><strong>ਪੰਜਾਬੀ</strong><br><small>Punjabi</small>
                    </div>
                    <div class="simple-lang-option" onclick="window.selectLang('or-IN')">
                        🇮🇳<br><strong>ଓଡ଼ିଆ</strong><br><small>Odia</small>
                    </div>
                    <div class="simple-lang-option" onclick="window.selectLang('as-IN')">
                        🇮🇳<br><strong>অসমীয়া</strong><br><small>Assamese</small>
                    </div>
                    <div class="simple-lang-option" onclick="window.selectLang('en-IN')">
                        🇬🇧<br><strong>English</strong><br><small>English</small>
                    </div>
                </div>
            </div>
        `;
        modal.onclick = (e) => {
            if (e.target === modal) closeModal();
        };
        document.body.appendChild(modal);
        
        // Update current language display
        updateCurrentLangDisplay();
    }
    
    function openModal() {
        document.getElementById('simpleLangModal').classList.add('active');
    }
    
    function closeModal() {
        document.getElementById('simpleLangModal').classList.remove('active');
    }
    
    function updateCurrentLangDisplay() {
        const lang = getLanguage();
        const names = {
            'hi-IN': 'हिंदी',
            'ta-IN': 'தமிழ்',
            'te-IN': 'తెలుగు',
            'bn-IN': 'বাংলা',
            'mr-IN': 'मराठी',
            'gu-IN': 'ગુજરાતી',
            'kn-IN': 'ಕನ್ನಡ',
            'ml-IN': 'മലയാളം',
            'pa-IN': 'ਪੰਜਾਬੀ',
            'or-IN': 'ଓଡ଼ିଆ',
            'as-IN': 'অসমীয়া',
            'en-IN': 'English'
        };
        const el = document.getElementById('currentLang');
        if (el) el.textContent = names[lang] || 'हिंदी';
        
        // Highlight active option
        document.querySelectorAll('.simple-lang-option').forEach(opt => {
            opt.classList.remove('active');
        });
    }
    
    // ============================================
    // 7. GLOBAL FUNCTIONS
    // ============================================
    
    window.selectLang = function(lang) {
        setLanguage(lang);
        updateCurrentLangDisplay();
        closeModal();
    };
    
    // ============================================
    // 8. INITIALIZE
    // ============================================
    
    function init() {
        console.log('🚀 Initializing Simple Language System...');
        
        // Apply current language
        const currentLang = getLanguage();
        applyLanguage(currentLang);
        
        // Create selector if header exists
        if (document.querySelector('.header-right')) {
            createLanguageSelector();
        }
        
        console.log('✅ Simple Language System Ready');
    }
    
    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
