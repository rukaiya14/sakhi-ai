// Universal 12-Language Selector for SheBalance
// This script provides comprehensive multi-language support across all pages

const SUPPORTED_LANGUAGES = {
    'en-IN': { name: 'English', native: 'English' },
    'hi-IN': { name: 'Hindi', native: 'हिंदी' },
    'bn-IN': { name: 'Bengali', native: 'বাংলা' },
    'te-IN': { name: 'Telugu', native: 'తెలుగు' },
    'mr-IN': { name: 'Marathi', native: 'मराठी' },
    'ta-IN': { name: 'Tamil', native: 'தமிழ்' },
    'gu-IN': { name: 'Gujarati', native: 'ગુજરાતી' },
    'kn-IN': { name: 'Kannada', native: 'ಕನ್ನಡ' },
    'ml-IN': { name: 'Malayalam', native: 'മലയാളം' },
    'pa-IN': { name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    'or-IN': { name: 'Odia', native: 'ଓଡ଼ିଆ' },
    'as-IN': { name: 'Assamese', native: 'অসমীয়া' }
};

// Initialize language selector on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeLanguageSelector();
    applyStoredLanguage();
});

function initializeLanguageSelector() {
    const selector = document.getElementById('languageSelector');
    if (!selector) return;
    
    // Clear existing options
    selector.innerHTML = '';
    
    // Add all 12 languages
    Object.keys(SUPPORTED_LANGUAGES).forEach(code => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = SUPPORTED_LANGUAGES[code].native;
        selector.appendChild(option);
    });
    
    // Set current language
    const currentLang = localStorage.getItem('shebalance_language') || 'en-IN';
    selector.value = currentLang;
    
    // Add change event listener
    selector.addEventListener('change', function() {
        const selectedLang = this.value;
        changeLanguage(selectedLang);
    });
    
    // Add focus/blur effects
    selector.addEventListener('focus', function() {
        this.style.borderColor = '#667eea';
        this.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
    });
    
    selector.addEventListener('blur', function() {
        this.style.borderColor = '#e0e0e0';
        this.style.boxShadow = 'none';
    });
}

function changeLanguage(langCode) {
    // Store language preference
    localStorage.setItem('shebalance_language', langCode);
    
    // Show notification
    const langName = SUPPORTED_LANGUAGES[langCode].native;
    showLanguageNotification(`Language changed to ${langName}`);
    
    // Apply translations if translations.js is loaded
    if (typeof setLanguage === 'function') {
        setLanguage(langCode);
    }
    
    // Reload page to apply translations
    setTimeout(() => {
        location.reload();
    }, 800);
}

function applyStoredLanguage() {
    const storedLang = localStorage.getItem('shebalance_language');
    if (storedLang && typeof setLanguage === 'function') {
        setLanguage(storedLang);
    }
}

function showLanguageNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        font-weight: 600;
        animation: slideInRight 0.3s ease-out;
    `;
    notification.textContent = message;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
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
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SUPPORTED_LANGUAGES,
        changeLanguage,
        initializeLanguageSelector
    };
}
