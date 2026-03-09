// Language Selector Component for SheBalance Dashboard

class LanguageSelector {
    constructor() {
        this.languages = [
            { code: 'hi-IN', name: 'हिंदी', english: 'Hindi', flag: '🇮🇳' },
            { code: 'ta-IN', name: 'தமிழ்', english: 'Tamil', flag: '🇮🇳' },
            { code: 'te-IN', name: 'తెలుగు', english: 'Telugu', flag: '🇮🇳' },
            { code: 'bn-IN', name: 'বাংলা', english: 'Bengali', flag: '🇮🇳' },
            { code: 'mr-IN', name: 'मराठी', english: 'Marathi', flag: '🇮🇳' },
            { code: 'gu-IN', name: 'ગુજરાતી', english: 'Gujarati', flag: '🇮🇳' },
            { code: 'kn-IN', name: 'ಕನ್ನಡ', english: 'Kannada', flag: '🇮🇳' },
            { code: 'ml-IN', name: 'മലയാളം', english: 'Malayalam', flag: '🇮🇳' },
            { code: 'pa-IN', name: 'ਪੰਜਾਬੀ', english: 'Punjabi', flag: '🇮🇳' },
            { code: 'or-IN', name: 'ଓଡ଼ିଆ', english: 'Odia', flag: '🇮🇳' },
            { code: 'as-IN', name: 'অসমীয়া', english: 'Assamese', flag: '🇮🇳' },
            { code: 'en-IN', name: 'English', english: 'English', flag: '🇬🇧' }
        ];
        
        this.currentLanguage = this.getCurrentLanguage();
        this.init();
    }
    
    getCurrentLanguage() {
        // Try to get from localStorage first
        const stored = localStorage.getItem('shebalance_language');
        if (stored) return stored;
        
        // Try to get from user data
        const userData = localStorage.getItem('shebalance_user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                if (user.preferredLanguage) {
                    return user.preferredLanguage;
                }
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
        
        // Default to Hindi
        return 'hi-IN';
    }
    
    init() {
        this.createLanguageButton();
        this.createLanguageModal();
        this.attachEventListeners();
        this.updateGreeting();
    }
    
    createLanguageButton() {
        // Find the header-right section
        const headerRight = document.querySelector('.header-right');
        if (!headerRight) return;
        
        // Create language button
        const langBtn = document.createElement('button');
        langBtn.className = 'language-btn';
        langBtn.id = 'languageBtn';
        langBtn.innerHTML = `
            <i class="fas fa-language"></i>
            <span class="lang-text" id="currentLangText">${this.getLanguageName(this.currentLanguage)}</span>
        `;
        
        // Insert before notifications
        const notifications = headerRight.querySelector('.notifications');
        if (notifications) {
            headerRight.insertBefore(langBtn, notifications);
        } else {
            headerRight.appendChild(langBtn);
        }
        
        // Add styles
        this.addStyles();
    }
    
    createLanguageModal() {
        const modal = document.createElement('div');
        modal.className = 'language-modal';
        modal.id = 'languageModal';
        modal.innerHTML = `
            <div class="language-modal-content">
                <div class="language-modal-header">
                    <h3>
                        <i class="fas fa-language"></i>
                        <span data-translate="selectLanguage">Select Language</span>
                    </h3>
                    <button class="close-modal" id="closeLanguageModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="language-modal-body">
                    <p style="color: #666; margin-bottom: 20px;">
                        <span data-translate="languagePreference">Choose your preferred language for the dashboard</span>
                    </p>
                    <div class="language-grid">
                        ${this.languages.map(lang => `
                            <button class="language-option ${lang.code === this.currentLanguage ? 'selected' : ''}" 
                                    data-lang="${lang.code}">
                                <span class="lang-flag">${lang.flag}</span>
                                <div class="lang-info">
                                    <span class="lang-native">${lang.name}</span>
                                    <span class="lang-english">${lang.english}</span>
                                </div>
                                ${lang.code === this.currentLanguage ? '<i class="fas fa-check-circle"></i>' : ''}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    attachEventListeners() {
        // Open modal
        const langBtn = document.getElementById('languageBtn');
        if (langBtn) {
            langBtn.addEventListener('click', () => this.openModal());
        }
        
        // Close modal
        const closeBtn = document.getElementById('closeLanguageModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
        
        // Click outside to close
        const modal = document.getElementById('languageModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
        
        // Language selection
        document.querySelectorAll('.language-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                this.selectLanguage(lang);
            });
        });
    }
    
    openModal() {
        const modal = document.getElementById('languageModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    closeModal() {
        const modal = document.getElementById('languageModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }
    
    async selectLanguage(langCode) {
        console.log('🌍 Selecting language:', langCode);
        
        try {
            // Update UI immediately
            this.currentLanguage = langCode;
            localStorage.setItem('shebalance_language', langCode);
            
            // Update button text
            const langText = document.getElementById('currentLangText');
            if (langText) {
                langText.textContent = this.getLanguageName(langCode);
            }
            
            // Update selected state
            document.querySelectorAll('.language-option').forEach(btn => {
                if (btn.dataset.lang === langCode) {
                    btn.classList.add('selected');
                    if (!btn.querySelector('.fa-check-circle')) {
                        btn.innerHTML += '<i class="fas fa-check-circle"></i>';
                    }
                } else {
                    btn.classList.remove('selected');
                    const checkIcon = btn.querySelector('.fa-check-circle');
                    if (checkIcon) {
                        checkIcon.remove();
                    }
                }
            });
            
            // Update all UI text
            console.log('📝 Updating UI language...');
            if (typeof updateUILanguage === 'function') {
                updateUILanguage(langCode);
            } else {
                console.warn('updateUILanguage function not found');
            }
            
            // Trigger language changed event for auto-translate
            document.dispatchEvent(new CustomEvent('languageChanged', { 
                detail: { language: langCode } 
            }));
            
            // Update greeting
            this.updateGreeting();
            
            // Update user data in localStorage
            const userData = localStorage.getItem('shebalance_user');
            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    user.preferredLanguage = langCode;
                    localStorage.setItem('shebalance_user', JSON.stringify(user));
                } catch (e) {
                    console.error('Error updating user data:', e);
                }
            }
            
            // Show success message in selected language
            this.showNotification('languageUpdated', 'success');
            
            // Try to save to backend (optional, don't block on failure)
            const token = localStorage.getItem('shebalance_token');
            if (token) {
                try {
                    const response = await fetch('http://localhost:5000/api/users/language', {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ language: langCode })
                    });
                    
                    if (response.ok) {
                        console.log('✅ Language preference saved to backend');
                    } else {
                        console.warn('Backend language save failed, but continuing with local storage');
                    }
                } catch (error) {
                    console.warn('Backend not available, using local storage only:', error.message);
                }
            }
            
            // Close modal
            this.closeModal();
            
            // Reload dynamic content
            if (typeof loadBulkOrders === 'function') {
                loadBulkOrders();
            }
            
            console.log('✅ Language changed successfully to:', langCode);
            
        } catch (error) {
            console.error('❌ Error selecting language:', error);
            this.showNotification('languageUpdateFailed', 'error');
        }
    }
    
    getLanguageName(code) {
        const lang = this.languages.find(l => l.code === code);
        return lang ? lang.name : 'English';
    }
    
    updateGreeting() {
        const userName = document.getElementById('userName');
        if (userName && typeof t === 'function') {
            const name = userName.textContent;
            const greeting = t('greeting', this.currentLanguage);
            
            // Update header greeting
            const headerLeft = document.querySelector('.header-left h1');
            if (headerLeft) {
                headerLeft.innerHTML = `${greeting}, <span id="userName">${name}</span>!`;
            }
        }
    }
    
    showNotification(messageKey, type = 'success') {
        // Get translated message
        const message = typeof t === 'function' ? t(messageKey, this.currentLanguage) : messageKey;
        
        const notification = document.createElement('div');
        notification.className = `language-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    addStyles() {
        if (document.getElementById('language-selector-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'language-selector-styles';
        style.textContent = `
            .language-btn {
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
            
            .language-btn:hover {
                border-color: #8D6E63;
                background: #F5F5DC;
            }
            
            .language-btn i {
                font-size: 18px;
                color: #8D6E63;
            }
            
            .language-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 10000;
                align-items: center;
                justify-content: center;
            }
            
            .language-modal.active {
                display: flex;
            }
            
            .language-modal-content {
                background: white;
                border-radius: 15px;
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            }
            
            .language-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 25px;
                border-bottom: 2px solid #f0f0f0;
            }
            
            .language-modal-header h3 {
                color: #5D4037;
                display: flex;
                align-items: center;
                gap: 10px;
                margin: 0;
            }
            
            .close-modal {
                background: none;
                border: none;
                font-size: 24px;
                color: #999;
                cursor: pointer;
                padding: 5px;
                transition: color 0.3s;
            }
            
            .close-modal:hover {
                color: #5D4037;
            }
            
            .language-modal-body {
                padding: 25px;
            }
            
            .language-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 15px;
            }
            
            .language-option {
                background: white;
                border: 2px solid #e0e0e0;
                border-radius: 10px;
                padding: 15px;
                display: flex;
                align-items: center;
                gap: 12px;
                cursor: pointer;
                transition: all 0.3s;
                position: relative;
            }
            
            .language-option:hover {
                border-color: #8D6E63;
                background: #F5F5DC;
                transform: translateY(-2px);
            }
            
            .language-option.selected {
                border-color: #5D4037;
                background: #8D6E63;
                color: white;
            }
            
            .language-option.selected .lang-english {
                color: #F5F5DC;
            }
            
            .lang-flag {
                font-size: 24px;
            }
            
            .lang-info {
                display: flex;
                flex-direction: column;
                flex: 1;
            }
            
            .lang-native {
                font-size: 16px;
                font-weight: 600;
            }
            
            .lang-english {
                font-size: 12px;
                color: #666;
            }
            
            .language-option i.fa-check-circle {
                position: absolute;
                top: 10px;
                right: 10px;
                color: white;
                font-size: 18px;
            }
            
            .language-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 10001;
                transform: translateX(400px);
                transition: transform 0.3s;
            }
            
            .language-notification.show {
                transform: translateX(0);
            }
            
            .language-notification.success {
                border-left: 4px solid #4CAF50;
            }
            
            .language-notification.error {
                border-left: 4px solid #f44336;
            }
            
            .language-notification i {
                font-size: 20px;
            }
            
            .language-notification.success i {
                color: #4CAF50;
            }
            
            .language-notification.error i {
                color: #f44336;
            }
            
            @media (max-width: 768px) {
                .language-grid {
                    grid-template-columns: 1fr;
                }
                
                .lang-text {
                    display: none;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Initialize language selector when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new LanguageSelector();
});
