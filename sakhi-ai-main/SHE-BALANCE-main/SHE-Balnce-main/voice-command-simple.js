/**
 * Simple Voice Command System using Web Speech API
 * Works immediately without AWS setup
 */

class SimpleVoiceCommand {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.currentLanguage = 'en-IN';
        
        // Supported languages
        this.languages = {
            'en-IN': 'English',
            'hi-IN': 'Hindi',
            'bn-IN': 'Bengali',
            'ta-IN': 'Tamil',
            'te-IN': 'Telugu',
            'mr-IN': 'Marathi',
            'gu-IN': 'Gujarati',
            'kn-IN': 'Kannada',
            'ml-IN': 'Malayalam',
            'pa-IN': 'Punjabi'
        };
        
        // Navigation commands in multiple languages
        this.commands = {
            'dashboard': {
                'en-IN': ['dashboard', 'home', 'main page', 'go home'],
                'hi-IN': ['डैशबोर्ड', 'होम', 'मुख्य पृष्ठ', 'घर जाओ'],
                'bn-IN': ['ড্যাশবোর্ড', 'হোম', 'মূল পৃষ্ঠা'],
                'ta-IN': ['டாஷ்போர்டு', 'ஹோம்', 'முதன்மை பக்கம்'],
                'te-IN': ['డాష్‌బోర్డ్', 'హోమ్', 'ప్రధాన పేజీ'],
                'mr-IN': ['डॅशबोर्ड', 'होम', 'मुख्य पृष्ठ'],
                'gu-IN': ['ડેશબોર્ડ', 'હોમ', 'મુખ્ય પૃષ્ઠ']
            },
            'ai-sakhi': {
                'en-IN': ['ai sakhi', 'sakhi', 'assistant', 'ai assistant', 'help'],
                'hi-IN': ['एआई सखी', 'सखी', 'सहायक', 'मदद'],
                'bn-IN': ['এআই সখি', 'সখি', 'সহায়ক'],
                'ta-IN': ['ஏஐ சகி', 'சகி', 'உதவியாளர்'],
                'te-IN': ['ఏఐ సఖి', 'సఖి', 'సహాయకుడు'],
                'mr-IN': ['एआय सखी', 'सखी', 'सहाय्यक'],
                'gu-IN': ['એઆઈ સખી', 'સખી', 'સહાયક']
            },
            'skills': {
                'en-IN': ['skills', 'my skills', 'skill page', 'show skills'],
                'hi-IN': ['कौशल', 'मेरे कौशल', 'स्किल'],
                'bn-IN': ['দক্ষতা', 'আমার দক্ষতা'],
                'ta-IN': ['திறன்கள்', 'எனது திறன்கள்'],
                'te-IN': ['నైపుణ్యాలు', 'నా నైపుణ్యాలు'],
                'mr-IN': ['कौशल्ये', 'माझी कौशल्ये'],
                'gu-IN': ['કુશળતા', 'મારી કુશળતા']
            },
            'opportunities': {
                'en-IN': ['opportunities', 'jobs', 'work', 'find work'],
                'hi-IN': ['अवसर', 'नौकरी', 'काम'],
                'bn-IN': ['সুযোগ', 'চাকরি', 'কাজ'],
                'ta-IN': ['வாய்ப்புகள்', 'வேலை'],
                'te-IN': ['అవకాశాలు', 'ఉద్యోగం'],
                'mr-IN': ['संधी', 'नोकरी'],
                'gu-IN': ['તકો', 'નોકરી']
            },
            'food': {
                'en-IN': ['food', 'marketplace', 'food marketplace', 'kitchen'],
                'hi-IN': ['खाद्य', 'बाज़ार', 'खाद्य बाज़ार'],
                'bn-IN': ['খাদ্য', 'বাজার'],
                'ta-IN': ['உணவு', 'சந்தை'],
                'te-IN': ['ఆహారం', 'మార్కెట్'],
                'mr-IN': ['अन्न', 'बाजार'],
                'gu-IN': ['ખાદ્ય', 'બજાર']
            },
            'community': {
                'en-IN': ['community', 'group', 'forum', 'social'],
                'hi-IN': ['समुदाय', 'समूह'],
                'bn-IN': ['সম্প্রদায়', 'গ্রুপ'],
                'ta-IN': ['சமூகம்', 'குழு'],
                'te-IN': ['సంఘం', 'గ్రూప్'],
                'mr-IN': ['समुदाय', 'गट'],
                'gu-IN': ['સમુદાય', 'જૂથ']
            },
            'progress': {
                'en-IN': ['progress', 'growth', 'my progress', 'development'],
                'hi-IN': ['प्रगति', 'विकास'],
                'bn-IN': ['অগ্রগতি', 'উন্নয়ন'],
                'ta-IN': ['முன்னேற்றம்', 'வளர்ச்சி'],
                'te-IN': ['పురోగతి', 'అభివృద్ధి'],
                'mr-IN': ['प्रगती', 'विकास'],
                'gu-IN': ['પ્રગતિ', 'વિકાસ']
            }
        };
        
        // Page URLs
        this.pageUrls = {
            'dashboard': 'dashboard.html',
            'ai-sakhi': '#ai-sakhi',
            'skills': 'skills.html',
            'opportunities': 'opportunities.html',
            'food': 'food-marketplace.html',
            'community': 'community.html',
            'progress': 'progress.html'
        };
    }

    /**
     * Initialize speech recognition
     */
    initialize() {
        try {
            // Check browser support
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            
            if (!SpeechRecognition) {
                throw new Error('Speech recognition not supported in this browser');
            }

            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 3;
            
            // Get user's preferred language
            const userLang = localStorage.getItem('shebalance_language') || 'hi-IN';
            this.currentLanguage = userLang;
            this.recognition.lang = userLang;

            // Set up event handlers
            this.recognition.onstart = () => {
                console.log('🎤 Voice recognition started');
                this.isListening = true;
                this.updateUI('recording');
            };

            this.recognition.onresult = (event) => {
                const results = event.results[0];
                const transcript = results[0].transcript;
                const confidence = results[0].confidence;
                
                console.log('📝 Heard:', transcript);
                console.log('🎯 Confidence:', confidence);
                
                this.handleCommand(transcript);
            };

            this.recognition.onerror = (event) => {
                console.error('❌ Recognition error:', event.error);
                this.isListening = false;
                this.updateUI('idle');
                
                if (event.error === 'no-speech') {
                    this.showMessage('No speech detected. Please try again.');
                } else if (event.error === 'not-allowed') {
                    this.showMessage('Microphone access denied. Please enable it in browser settings.');
                } else {
                    this.showMessage('Voice recognition error. Please try again.');
                }
            };

            this.recognition.onend = () => {
                console.log('🎤 Voice recognition ended');
                this.isListening = false;
                this.updateUI('idle');
            };

            console.log('✅ Voice command system initialized');
            console.log('🌍 Language:', this.languages[this.currentLanguage]);
            return true;

        } catch (error) {
            console.error('❌ Failed to initialize voice recognition:', error);
            this.showMessage('Voice recognition not supported in this browser. Please use Chrome or Edge.');
            return false;
        }
    }

    /**
     * Start listening
     */
    start() {
        if (!this.recognition) {
            this.initialize();
        }

        if (this.isListening) {
            // Stop if already listening
            this.recognition.stop();
            return;
        }

        try {
            // Update language before starting
            const userLang = localStorage.getItem('shebalance_language') || 'hi-IN';
            this.currentLanguage = userLang;
            this.recognition.lang = userLang;
            
            this.recognition.start();
            console.log('🎤 Listening in', this.languages[this.currentLanguage]);
        } catch (error) {
            console.error('❌ Failed to start recognition:', error);
            this.showMessage('Failed to start voice recognition. Please try again.');
        }
    }

    /**
     * Handle voice command
     */
    handleCommand(transcript) {
        const lowerTranscript = transcript.toLowerCase();
        
        // Show what was heard
        this.showFeedback(transcript);
        
        // Try to match command
        let matchedCommand = null;
        
        for (const [page, keywords] of Object.entries(this.commands)) {
            const langKeywords = keywords[this.currentLanguage] || keywords['en-IN'];
            
            for (const keyword of langKeywords) {
                if (lowerTranscript.includes(keyword.toLowerCase())) {
                    matchedCommand = page;
                    break;
                }
            }
            
            if (matchedCommand) break;
        }

        if (matchedCommand) {
            console.log('✅ Command matched:', matchedCommand);
            this.speakConfirmation(matchedCommand);
            
            setTimeout(() => {
                this.navigateToPage(matchedCommand);
            }, 1000);
        } else {
            console.log('❌ No command matched');
            this.showMessage('Command not recognized. Try: "Dashboard", "Skills", "AI Sakhi"');
        }
    }

    /**
     * Navigate to page
     */
    navigateToPage(command) {
        const url = this.pageUrls[command];
        
        if (url) {
            if (url.startsWith('#')) {
                // Handle special cases
                if (url === '#ai-sakhi') {
                    if (typeof openAISakhi === 'function') {
                        openAISakhi();
                    } else {
                        // Fallback: trigger the button click
                        const aiSakhiBtn = document.getElementById('aiSakhiButton');
                        if (aiSakhiBtn) {
                            aiSakhiBtn.click();
                        }
                    }
                }
            } else {
                // Navigate to page
                window.location.href = url;
            }
        }
    }

    /**
     * Speak confirmation using Web Speech API
     */
    speakConfirmation(command) {
        if ('speechSynthesis' in window) {
            const confirmations = {
                'dashboard': {
                    'en-IN': 'Opening dashboard',
                    'hi-IN': 'डैशबोर्ड खोल रहे हैं',
                    'bn-IN': 'ড্যাশবোর্ড খুলছি',
                    'ta-IN': 'டாஷ்போர்டு திறக்கிறது',
                    'te-IN': 'డాష్‌బోర్డ్ తెరుస్తోంది',
                    'mr-IN': 'डॅशबोर्ड उघडत आहे',
                    'gu-IN': 'ડેશબોર્ડ ખોલી રહ્યા છીએ'
                },
                'ai-sakhi': {
                    'en-IN': 'Opening AI Sakhi',
                    'hi-IN': 'एआई सखी खोल रहे हैं',
                    'bn-IN': 'এআই সখি খুলছি',
                    'ta-IN': 'ஏஐ சகி திறக்கிறது',
                    'te-IN': 'ఏఐ సఖి తెరుస్తోంది',
                    'mr-IN': 'एआय सखी उघडत आहे',
                    'gu-IN': 'એઆઈ સખી ખોલી રહ્યા છીએ'
                },
                'skills': {
                    'en-IN': 'Opening skills',
                    'hi-IN': 'कौशल खोल रहे हैं',
                    'bn-IN': 'দক্ষতা খুলছি',
                    'ta-IN': 'திறன்கள் திறக்கிறது',
                    'te-IN': 'నైపుణ్యాలు తెరుస్తోంది',
                    'mr-IN': 'कौशल्ये उघडत आहे',
                    'gu-IN': 'કુશળતા ખોલી રહ્યા છીએ'
                },
                'opportunities': {
                    'en-IN': 'Opening opportunities',
                    'hi-IN': 'अवसर खोल रहे हैं',
                    'bn-IN': 'সুযোগ খুলছি',
                    'ta-IN': 'வாய்ப்புகள் திறக்கிறது',
                    'te-IN': 'అవకాశాలు తెరుస్తోంది',
                    'mr-IN': 'संधी उघडत आहे',
                    'gu-IN': 'તકો ખોલી રહ્યા છીએ'
                },
                'food': {
                    'en-IN': 'Opening food marketplace',
                    'hi-IN': 'खाद्य बाज़ार खोल रहे हैं',
                    'bn-IN': 'খাদ্য বাজার খুলছি',
                    'ta-IN': 'உணவு சந்தை திறக்கிறது',
                    'te-IN': 'ఆహార మార్కెట్ తెరుస్తోంది',
                    'mr-IN': 'अन्न बाजार उघडत आहे',
                    'gu-IN': 'ખાદ્ય બજાર ખોલી રહ્યા છીએ'
                },
                'community': {
                    'en-IN': 'Opening community',
                    'hi-IN': 'समुदाय खोल रहे हैं',
                    'bn-IN': 'সম্প্রদায় খুলছি',
                    'ta-IN': 'சமூகம் திறக்கிறது',
                    'te-IN': 'సంఘం తెరుస్తోంది',
                    'mr-IN': 'समुदाय उघडत आहे',
                    'gu-IN': 'સમુદાય ખોલી રહ્યા છીએ'
                },
                'progress': {
                    'en-IN': 'Opening progress',
                    'hi-IN': 'प्रगति खोल रहे हैं',
                    'bn-IN': 'অগ্রগতি খুলছি',
                    'ta-IN': 'முன்னேற்றம் திறக்கிறது',
                    'te-IN': 'పురోగతి తెరుస్తోంది',
                    'mr-IN': 'प्रगती उघडत आहे',
                    'gu-IN': 'પ્રગતિ ખોલી રહ્યા છીએ'
                }
            };
            
            const text = confirmations[command]?.[this.currentLanguage] || confirmations[command]?.['en-IN'] || 'Opening';
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = this.currentLanguage;
            utterance.rate = 0.9;
            utterance.pitch = 1;
            
            window.speechSynthesis.speak(utterance);
        }
    }

    /**
     * Update UI
     */
    updateUI(state) {
        const voiceBtn = document.querySelector('.voice-btn');
        const voiceIcon = voiceBtn?.querySelector('i');
        const voiceText = voiceBtn?.querySelector('.voice-text');
        
        if (!voiceBtn) return;
        
        switch (state) {
            case 'recording':
                voiceBtn.classList.add('recording');
                if (voiceIcon) voiceIcon.className = 'fas fa-stop';
                if (voiceText) voiceText.textContent = 'Listening...';
                break;
            case 'idle':
            default:
                voiceBtn.classList.remove('recording');
                if (voiceIcon) voiceIcon.className = 'fas fa-microphone';
                if (voiceText) voiceText.textContent = 'Voice Command';
                break;
        }
    }

    /**
     * Show feedback
     */
    showFeedback(text) {
        const feedback = document.createElement('div');
        feedback.className = 'voice-feedback';
        feedback.innerHTML = `
            <div class="voice-feedback-content">
                <i class="fas fa-check-circle"></i>
                <div>
                    <strong>Heard:</strong> "${text}"
                    <br>
                    <small>Language: ${this.languages[this.currentLanguage]}</small>
                </div>
            </div>
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => feedback.classList.add('show'), 100);
        setTimeout(() => {
            feedback.classList.remove('show');
            setTimeout(() => feedback.remove(), 300);
        }, 3000);
    }

    /**
     * Show message
     */
    showMessage(message) {
        const msg = document.createElement('div');
        msg.className = 'voice-error';
        msg.innerHTML = `
            <div class="voice-error-content">
                <i class="fas fa-info-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(msg);
        
        setTimeout(() => msg.classList.add('show'), 100);
        setTimeout(() => {
            msg.classList.remove('show');
            setTimeout(() => msg.remove(), 300);
        }, 4000);
    }
}

// Initialize voice command system
let simpleVoiceCommand = null;

function initSimpleVoiceCommand() {
    simpleVoiceCommand = new SimpleVoiceCommand();
    simpleVoiceCommand.initialize();
    console.log('✅ Simple Voice Command ready');
}

/**
 * Start voice command (called from button)
 */
function startVoiceCommand() {
    if (!simpleVoiceCommand) {
        initSimpleVoiceCommand();
    }
    
    simpleVoiceCommand.start();
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSimpleVoiceCommand);
} else {
    initSimpleVoiceCommand();
}

// Export
if (typeof window !== 'undefined') {
    window.startVoiceCommand = startVoiceCommand;
    window.simpleVoiceCommand = simpleVoiceCommand;
}
