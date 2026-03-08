// Universal Auto-Translation Script for SheBalance
// This script automatically translates common text across all pages

(function() {
    'use strict';
    
    // Wait for translations.js to load
    if (typeof translations === 'undefined' || typeof getCurrentLanguage === 'undefined') {
        console.warn('Translations not loaded yet, retrying...');
        setTimeout(arguments.callee, 100);
        return;
    }
    
    // Extended content mapping for all pages
    const universalContentMap = {
        // Brand & Common
        'SheBalance': 'sheBalance',
        'NEW': 'newBadge',
        
        // Navigation
        'Dashboard': 'dashboard',
        'AI Sakhi Assistant': 'aiSakhi',
        'AI Learning Mentor': 'aiLearningMentor',
        'My Skills': 'mySkills',
        'Opportunities': 'opportunities',
        'Food Marketplace': 'foodMarketplace',
        'Community': 'community',
        'Resource Circularity': 'resourceCircularity',
        'Invisible Labor': 'invisibleLabor',
        'Virtual Factory': 'virtualFactory',
        'Progress': 'progress',
        'Settings': 'settings',
        'Logout': 'logout',
        
        // Skills Page
        'My Skills Portfolio': 'mySkillsPortfolio',
        'Voice Command': 'voiceCommand',
        'AI Mentor': 'aiMentor',
        'Active Skills': 'activeSkills',
        'Certifications': 'certifications',
        'Avg Skill Level': 'avgSkillLevel',
        'Learning Hours': 'learningHours',
        'SkillScan AI - Visual Skill Assessment': 'skillScanAI',
        '📸 SkillScan AI - Visual Skill Assessment': 'skillScanAI',
        'AI Powered': 'aiPoweredCaps',
        'Get Instant Skill Assessment from Your Work Photos': 'getInstantSkillAssessment',
        'Upload photos of your work and let our AI analyze your skill level, provide detailed feedback, and suggest improvements. Perfect for embroidery, cooking, henna art, and crafts!': 'uploadPhotosDesc',
        'Photo Analysis': 'photoAnalysis',
        'Skill Scoring': 'skillScoring',
        'AI Feedback': 'aiFeedback',
        'Instant Certification': 'instantCertification',
        'Upload Your Work': 'uploadYourWork',
        'AI Assessment': 'aiAssessment',
        'Drop your work photos here or click to upload': 'dropPhotosHere',
        'Supports JPG, PNG, HEIC • Max 10MB per image • Up to 5 images': 'supportsFormats',
        'Choose Photos': 'choosePhotos',
        'Select Your Skill Category': 'selectSkillCategory',
        'Embroidery': 'embroidery',
        'Henna Art': 'hennaArt',
        'Crochet': 'crochet',
        'Tailoring': 'tailoring',
        'Crafts': 'crafts',
        'AI Distribution System': 'aiDistributionSystem',
        'Check AI Health': 'checkAIHealth',
        'Reset AI Learning': 'resetAILearning',
        'AI automatically balances skill levels: 30% Beginner, 50% Intermediate, 20% Advanced': 'aiAutoBalances',
        'Your Current Skills': 'yourCurrentSkills',
        'Add New Skill': 'addNewSkill',
        'Advanced': 'advanced',
        'Intermediate': 'intermediate',
        'Beginner': 'beginner',
        'Specializes in traditional Indian embroidery techniques': 'specializesIn',
        'Hand Embroidery': 'handEmbroidery',
        'Zardozi': 'zardozi',
        'Chikankari': 'chikankari',
        'View Portfolio': 'viewPortfolio',
        'Find Jobs': 'findJobs',
        'Cooking': 'cooking',
        'Home-style Indian cuisine and healthy meal prep': 'homeStyleIndianCuisine',
        'Indian Cuisine': 'indianCuisine',
        'Meal Prep': 'mealPrep',
        'Healthy Cooking': 'healthyCooking',
        'Traditional and modern henna designs': 'traditionalModernHenna',
        'Bridal Henna': 'bridalHenna',
        'Arabic Designs': 'arabicDesigns',
        'Practice More': 'practiceMore',
        'Learn Advanced': 'learnAdvanced',
        'Recommended Learning Paths': 'recommendedLearningPaths',
        'Get AI Roadmap': 'getAIRoadmap',
        'Popular': 'popular',
        'Advanced Crochet Mastery': 'advancedCrochetMastery',
        'Master complex crochet patterns and start your own business': 'masterComplexCrochet',
        'weeks': 'weeks',
        'rating': 'rating',
        'students': 'students',
        'or': 'orPerMonth',
        '/month for': 'months',
        '0% Interest EMI': 'zeroInterestEMI',
        'Pay Full': 'payFull',
        'EMI': 'emi',
        'Professional Tailoring': 'professionalTailoring',
        'Learn professional tailoring techniques for custom clothing': 'learnProfessionalTailoring',
        'Cross Stitch Artistry': 'crossStitchArtistry',
        'Create beautiful cross stitch patterns and decorative pieces': 'createBeautifulCrossStitch',
        'Advanced Henna Techniques': 'advancedHennaTechniques',
        'Master intricate henna patterns and build a client base': 'masterIntricateHenna',
        'Your AI Learning Mentor': 'yourAILearningMentor',
        'Get personalized learning roadmaps and career guidance': 'getPersonalizedLearning',
        'Personalized Learning Paths': 'personalizedLearningPaths',
        'Flexible Scheduling': 'flexibleScheduling',
        'Progress Tracking': 'progressTracking',
        'Career Opportunities': 'careerOpportunities',
        'Chat with AI Mentor': 'chatWithAIMentor'
    };
    
    // Function to translate all text nodes
    function translateAllText(lang) {
        console.log('🌍 Auto-translating page to:', lang);
        
        // First, handle elements with data-translate (standard method)
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = t(key, lang);
            if (translation !== key) {
                element.textContent = translation;
            }
        });
        
        // Handle specific elements by class or structure
        translateSpecificElements(lang);
        
        // Then, auto-translate text nodes without data-translate
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // Skip script and style tags
                    if (node.parentElement.tagName === 'SCRIPT' || 
                        node.parentElement.tagName === 'STYLE') {
                        return NodeFilter.FILTER_REJECT;
                    }
                    // Skip empty text nodes
                    if (!node.textContent.trim()) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            },
            false
        );
        
        const nodesToTranslate = [];
        let node;
        
        while (node = walker.nextNode()) {
            const text = node.textContent.trim();
            
            // Direct match
            if (text && universalContentMap[text]) {
                nodesToTranslate.push({
                    node: node,
                    key: universalContentMap[text],
                    fullReplace: true
                });
            }
            // Check for emoji-prefixed text
            else if (text.includes('📸') && text.includes('SkillScan')) {
                nodesToTranslate.push({
                    node: node,
                    key: 'skillScanAI',
                    prefix: '📸 ',
                    fullReplace: false
                });
            }
            else if (text.includes('🤖') && text.includes('AI Distribution')) {
                nodesToTranslate.push({
                    node: node,
                    key: 'aiDistributionSystem',
                    prefix: '🤖 ',
                    fullReplace: false
                });
            }
            else if (text.includes('🔥') && text.includes('Popular')) {
                nodesToTranslate.push({
                    node: node,
                    key: 'popular',
                    prefix: '🔥 ',
                    fullReplace: false
                });
            }
        }
        
        // Apply translations
        nodesToTranslate.forEach(({ node, key, prefix, fullReplace }) => {
            const translation = t(key, lang);
            if (translation && translation !== key) {
                if (fullReplace) {
                    node.textContent = translation;
                } else if (prefix) {
                    node.textContent = prefix + translation;
                }
            }
        });
        
        console.log(`✅ Auto-translated ${nodesToTranslate.length} text nodes`);
    }
    
    // Translate specific elements by structure
    function translateSpecificElements(lang) {
        // Translate overview cards
        document.querySelectorAll('.overview-card p').forEach(p => {
            const text = p.textContent.trim();
            if (universalContentMap[text]) {
                p.textContent = t(universalContentMap[text], lang);
            }
        });
        
        // Translate section headers with emojis
        document.querySelectorAll('.section-header h2').forEach(h2 => {
            const text = h2.textContent.trim();
            if (text.includes('📸') && text.includes('SkillScan')) {
                h2.textContent = '📸 ' + t('skillScanAI', lang);
            }
        });
        
        // Translate badges
        document.querySelectorAll('.skillscan-badge').forEach(badge => {
            const icon = badge.querySelector('i');
            if (icon) {
                badge.innerHTML = icon.outerHTML + ' ' + t('aiPoweredCaps', lang);
            }
        });
        
        // Translate buttons
        document.querySelectorAll('button').forEach(button => {
            const text = button.textContent.trim();
            if (universalContentMap[text]) {
                const icon = button.querySelector('i');
                if (icon) {
                    button.innerHTML = icon.outerHTML + ' ' + t(universalContentMap[text], lang);
                } else {
                    button.textContent = t(universalContentMap[text], lang);
                }
            }
        });
        
        // Translate skill level badges
        document.querySelectorAll('.skill-level').forEach(badge => {
            const text = badge.textContent.trim();
            if (text === 'Advanced') badge.textContent = t('advanced', lang);
            else if (text === 'Intermediate') badge.textContent = t('intermediate', lang);
            else if (text === 'Beginner') badge.textContent = t('beginner', lang);
        });
        
        // Translate category cards
        document.querySelectorAll('.category-card span').forEach(span => {
            const text = span.textContent.trim();
            if (universalContentMap[text]) {
                span.textContent = t(universalContentMap[text], lang);
            }
        });
    }
    
    // Listen for language changes
    document.addEventListener('languageChanged', function(e) {
        translateAllText(e.detail.language);
    });
    
    // Initial translation on page load
    document.addEventListener('DOMContentLoaded', function() {
        const currentLang = getCurrentLanguage();
        translateAllText(currentLang);
    });
    
    // If page already loaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        const currentLang = getCurrentLanguage();
        translateAllText(currentLang);
    }
    
})();
