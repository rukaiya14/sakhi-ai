// Simple Language Initialization - Loads on every page
(function() {
    'use strict';
    
    console.log('🌍 Language Init: Starting...');
    
    // Get current language from localStorage
    function getCurrentLanguage() {
        const stored = localStorage.getItem('shebalance_language');
        console.log('📦 Stored language:', stored);
        return stored || 'hi-IN';
    }
    
    // Set language
    function setCurrentLanguage(lang) {
        console.log('💾 Setting language to:', lang);
        localStorage.setItem('shebalance_language', lang);
        
        // Update user data if exists
        const userData = localStorage.getItem('shebalance_user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                user.preferredLanguage = lang;
                localStorage.setItem('shebalance_user', JSON.stringify(user));
            } catch (e) {
                console.error('Error updating user data:', e);
            }
        }
    }
    
    // Apply language to page
    function applyLanguage() {
        const lang = getCurrentLanguage();
        console.log('🎨 Applying language:', lang);
        
        // Wait for translations to load
        if (typeof translations === 'undefined' || typeof t === 'undefined') {
            console.log('⏳ Waiting for translations...');
            setTimeout(applyLanguage, 100);
            return;
        }
        
        // Update all elements with data-translate
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = t(key, lang);
            if (translation && translation !== key) {
                element.textContent = translation;
            }
        });
        
        // Trigger language changed event
        document.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: lang } 
        }));
        
        // Update UI if function exists
        if (typeof updateUILanguage === 'function') {
            updateUILanguage(lang);
        }
        
        console.log('✅ Language applied successfully');
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyLanguage);
    } else {
        applyLanguage();
    }
    
    // Expose functions globally
    window.getCurrentLanguage = getCurrentLanguage;
    window.setCurrentLanguage = setCurrentLanguage;
    window.applyLanguage = applyLanguage;
    
    console.log('✅ Language Init: Ready');
})();
