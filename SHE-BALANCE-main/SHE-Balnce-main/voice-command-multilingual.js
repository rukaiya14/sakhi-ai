// Multi-lingual Voice Command System - Browser-based Speech Recognition
// Supports 12 Indian languages using Web Speech API

class MultilingualVoiceCommand {
    constructor() {
        this.isListening = false;
        this.recognition = null;
        this.currentLanguage = 'hi-IN'; // Default to Hindi
        
        this.supportedLanguages = {
            'en-IN': { name: 'English', code: 'en' },
            'hi-IN': { name: 'हिंदी', code: 'hi' },
            'bn-IN': { name: 'বাংলা', code: 'bn' },
            'mr-IN': { name: 'मराठी', code: 'mr' },
            'ta-IN': { name: 'தமிழ்', code: 'ta' },
            'te-IN': { name: 'తెలుగు', code: 'te' },
            'kn-IN': { name: 'ಕನ್ನಡ', code: 'kn' },
            'ml-IN': { name: 'മലയാളം', code: 'ml' },
            'gu-IN': { name: 'ગુજરાતી', code: 'gu' },
            'pa-IN': { name: 'ਪੰਜਾਬੀ', code: 'pa' },
            'or-IN': { name: 'ଓଡ଼ିଆ', code: 'or' },
            'as-IN': { name: 'অসমীয়া', code: 'as' }
        };
        
        // Command keywords in multiple languages
        this.commandMappings = {
            'dashboard': ['dashboard', 'home', 'डैशबोर्ड', 'முகப்பு', 'డాష్‌బోర్డ్', 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್'],
            'earnings': ['earnings', 'income', 'money', 'कमाई', 'வருமானம்', 'ఆదాయం', 'ಗಳಿಕೆ', 'വരുമാനം', 'આવક', 'ਕਮਾਈ', 'ରୋଜଗାର', 'উপার্জন', 'पैसा', 'धन'],
            'opportunities': ['opportunities', 'jobs', 'work', 'काम', 'வேலை', 'పని', 'ಕೆಲಸ', 'ജോലി', 'કામ', 'ਕੰਮ', 'କାମ', 'কাজ', 'नौकरी', 'रोजगार'],
            'food': ['food', 'marketplace', 'खाना', 'बाजार', 'உணவு', 'சந்தை', 'ఆహారం', 'మార్కెట్', 'ಆಹಾರ', 'ಮಾರುಕಟ್ಟೆ', 'ഭക്ഷണം', 'ખોરાક', 'ਭੋਜਨ', 'ଖାଦ୍ୟ', 'খাদ্য'],
            'progress': ['progress', 'growth', 'प्रगति', 'முன்னேற்றம்', 'పురోగతి', 'ಪ್ರಗತಿ', 'പുരോഗതി', 'પ્રગતિ', 'ਤਰੱਕੀ', 'ପ୍ରଗତି', 'অগ্রগতি', 'विकास'],
            'learning': ['learning', 'mentor', 'education', 'सीखना', 'கற்றல்', 'నేర్చుకోవడం', 'ಕಲಿಕೆ', 'പഠനം', 'શીખવું', 'ਸਿੱਖਣਾ', 'ଶିକ୍ଷା', 'শিক্ষা', 'शिक्षा', 'पढ़ाई'],
            'help': ['help', 'support', 'मदद', 'உதவி', 'సహాయం', 'ಸಹಾಯ', 'സഹായം', 'મદદ', 'ਮਦਦ', 'ସାହାଯ୍ୟ', 'সাহায্য', 'सहायता'],
            'skills': ['skills', 'abilities', 'कौशल', 'திறன்', 'నైపుణ్యాలు', 'ಕೌಶಲ್ಯ', 'കഴിവുകൾ', 'કૌશલ્ય', 'ਹੁਨਰ', 'କୌଶଳ', 'দক্ষতা', 'हुनर'],
            'community': ['community', 'group', 'समुदाय', 'சமூகம்', 'సమాజం', 'ಸಮುದಾಯ', 'സമൂഹം', 'સમુદાય', 'ਭਾਈਚਾਰਾ', 'ସମ୍ପ୍ରଦାୟ', 'সম্প্রদায়'],
            'artisan': ['artisan', 'marketplace', 'कारीगर', 'बाजार', 'கைவினைஞர்', 'హస్తకళాకారుడు', 'ಕುಶಲಕರ್ಮಿ', 'കരകൗശലത്തൊഴിലാളി'],
            'settings': ['settings', 'सेटिंग्स', 'அமைப்புகள்', 'సెట్టింగ్‌లు', 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು']
        };
        
        // Initialize speech recognition
        this.initRecognition();
    }
    
    initRecognition() {
        // Check if browser supports speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn('⚠️ Speech Recognition not supported in this browser');
            return;
        }
        
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 3;
    }

    async startListening() {
        if (!this.recognition) {
            this.showError('Voice recognition not supported in your browser. Please use Chrome or Edge.');
            return;
        }
        
        try {
            console.log('🎤 Starting voice command...');
            
            // Get current language from page or use default
            const currentLang = localStorage.getItem('selectedLanguage') || 'hi';
            const langMap = {
                'en': 'en-IN',
                'hi': 'hi-IN',
                'bn': 'bn-IN',
                'mr': 'mr-IN',
                'ta': 'ta-IN',
                'te': 'te-IN',
                'kn': 'kn-IN',
                'ml': 'ml-IN',
                'gu': 'gu-IN',
                'pa': 'pa-IN',
                'or': 'or-IN',
                'as': 'as-IN'
            };
            
            this.currentLanguage = langMap[currentLang] || 'hi-IN';
            this.recognition.lang = this.currentLanguage;
            
            console.log('🌐 Listening in:', this.currentLanguage);
            
            // Show listening modal
            this.showListeningModal();
            
            // Set up event handlers
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                const confidence = event.results[0][0].confidence;
                
                console.log('📝 Heard:', transcript);
                console.log('📊 Confidence:', confidence);
                
                this.handleCommand({
                    transcript,
                    confidence,
                    language: this.currentLanguage
                });
            };
            
            this.recognition.onerror = (event) => {
                console.error('❌ Recognition error:', event.error);
                this.hideListeningModal();
                
                if (event.error === 'no-speech') {
                    this.showError('No speech detected. Please try again.');
                } else if (event.error === 'not-allowed') {
                    this.showError('Microphone access denied. Please allow microphone access.');
                } else {
                    this.showError('Voice recognition error. Please try again.');
                }
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                this.hideListeningModal();
            };
            
            // Start recognition
            this.recognition.start();
            this.isListening = true;
            
            return true;
        } catch (error) {
            console.error('❌ Error starting voice command:', error);
            this.showError('Failed to start voice recognition.');
            throw error;
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            console.log('🎤 Stopping recognition...');
        }
    }

    handleCommand(result) {
        const { transcript, confidence, language } = result;
        
        console.log('📝 Transcript:', transcript);
        console.log('🌐 Language:', language);
        console.log('📊 Confidence:', confidence);
        
        // Detect intent from transcript
        const intent = this.detectIntent(transcript);
        
        if (intent) {
            console.log('🎯 Intent detected:', intent);
            
            // Show feedback
            this.showFeedback(transcript, language, intent);
            
            // Navigate to page
            this.navigateToPage(intent);
        } else {
            this.showError('Command not recognized. Please try saying: "Show earnings", "Find jobs", "Food marketplace", etc.');
        }
    }
    
    detectIntent(transcript) {
        const lowerTranscript = transcript.toLowerCase();
        
        // Check each command mapping
        for (const [intent, keywords] of Object.entries(this.commandMappings)) {
            for (const keyword of keywords) {
                if (lowerTranscript.includes(keyword.toLowerCase())) {
                    return intent;
                }
            }
        }
        
        return null;
    }

    navigateToPage(intent) {
        const pageMap = {
            'dashboard': 'dashboard.html',
            'earnings': 'dashboard.html#earnings',
            'opportunities': 'opportunities.html',
            'food': 'food-marketplace.html',
            'progress': 'progress.html',
            'learning': 'skills.html',
            'help': 'dashboard.html#help',
            'skills': 'skills.html',
            'community': 'community.html',
            'artisan': 'artisan-marketplace.html',
            'settings': 'settings.html'
        };
        
        const page = pageMap[intent];
        if (page) {
            console.log('🔗 Navigating to:', page);
            setTimeout(() => {
                window.location.href = page;
            }, 1500);
        }
    }

    showListeningModal() {
        const modal = document.createElement('div');
        modal.id = 'voiceListeningModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        const languageName = this.supportedLanguages[this.currentLanguage]?.name || 'Language';
        
        modal.innerHTML = `
            <div style="background: white; padding: 40px; border-radius: 20px; text-align: center; max-width: 400px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);">
                <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; animation: pulse 1.5s infinite;">
                    <i class="fas fa-microphone" style="font-size: 36px; color: white;"></i>
                </div>
                <h3 style="margin: 0 0 10px 0; color: #333;">Listening...</h3>
                <p style="color: #666; margin: 10px 0;">Speak now in ${languageName}</p>
                <p style="color: #999; font-size: 14px; margin-top: 20px;">Try: "Show earnings", "Find jobs", "Food marketplace"</p>
                <button onclick="voiceCommand.stopListening()" style="margin-top: 20px; background: #f44336; color: white; border: none; padding: 10px 30px; border-radius: 25px; cursor: pointer; font-size: 16px;">
                    <i class="fas fa-stop"></i> Stop
                </button>
            </div>
            <style>
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
            </style>
        `;
        
        document.body.appendChild(modal);
    }
    
    hideListeningModal() {
        const modal = document.getElementById('voiceListeningModal');
        if (modal) {
            modal.remove();
        }
    }

    showFeedback(transcript, language, intent) {
        const languageName = this.supportedLanguages[language]?.name || language;
        
        const intentNames = {
            'dashboard': 'Dashboard',
            'earnings': 'Earnings',
            'opportunities': 'Opportunities',
            'food': 'Food Marketplace',
            'progress': 'Progress',
            'learning': 'Skills & Learning',
            'help': 'Help',
            'skills': 'My Skills',
            'community': 'Community',
            'artisan': 'Artisan Marketplace',
            'settings': 'Settings'
        };
        
        const message = `
            <div style="text-align: center;">
                <i class="fas fa-check-circle" style="font-size: 48px; color: #4CAF50; margin-bottom: 15px;"></i>
                <h3 style="margin: 10px 0; color: #333;">Command Recognized!</h3>
                <p style="color: #666; margin: 10px 0;">
                    <strong>You said:</strong> "${transcript}"<br>
                    <strong>Language:</strong> ${languageName}<br>
                    <strong>Going to:</strong> ${intentNames[intent] || intent}
                </p>
                <p style="color: #999; font-size: 14px;">Redirecting...</p>
            </div>
        `;
        
        this.showModal(message);
    }

    showError(message) {
        const errorHTML = `
            <div style="text-align: center;">
                <i class="fas fa-exclamation-circle" style="font-size: 48px; color: #f44336; margin-bottom: 15px;"></i>
                <h3 style="margin: 10px 0; color: #333;">Error</h3>
                <p style="color: #666;">${message}</p>
                <button onclick="document.getElementById('voiceCommandModal').remove()" style="margin-top: 20px; background: #667eea; color: white; border: none; padding: 10px 30px; border-radius: 25px; cursor: pointer;">
                    OK
                </button>
            </div>
        `;
        
        this.showModal(errorHTML);
    }

    showModal(content) {
        // Remove existing modal
        const existing = document.getElementById('voiceCommandModal');
        if (existing) existing.remove();
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'voiceCommandModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 15px;
            max-width: 500px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        `;
        modalContent.innerHTML = content;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Auto-close after 3 seconds (only for success messages)
        if (content.includes('check-circle')) {
            setTimeout(() => {
                modal.remove();
            }, 3000);
        }
    }
}

// Initialize voice command system
const voiceCommand = new MultilingualVoiceCommand();

// Global function to start voice command
async function startVoiceCommand() {
    try {
        await voiceCommand.startListening();
    } catch (error) {
        console.error('Voice command error:', error);
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultilingualVoiceCommand;
}
