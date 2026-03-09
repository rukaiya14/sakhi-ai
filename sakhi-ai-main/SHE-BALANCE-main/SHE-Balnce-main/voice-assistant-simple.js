/**
 * Enhanced Voice Assistant with AWS Integration
 * Works with browser Web Speech API and AWS Polly/Transcribe/Translate
 * Features: Multi-language, Context awareness, Better recognition, Visual feedback
 */

class SimpleVoiceAssistant {
    constructor() {
        this.isListening = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.currentLanguage = 'en-US';
        this.useAWS = false; // Set to true to use AWS services
        this.apiEndpoint = 'http://localhost:5000/api'; // Backend API endpoint
        
        // Context tracking for better understanding
        this.lastCommand = null;
        this.lastCategory = null;
        this.conversationHistory = [];
        
        // Language mapping with AWS Polly voices
        this.languages = {
            'en': { 
                code: 'en-US', 
                name: 'English', 
                voice: 'en-US',
                pollyVoice: 'Joanna',
                greetings: ['Hello', 'Hi', 'Welcome', 'Good to see you']
            },
            'hi': { 
                code: 'hi-IN', 
                name: 'हिंदी', 
                voice: 'hi-IN',
                pollyVoice: 'Aditi',
                greetings: ['नमस्ते', 'स्वागत है', 'आपका स्वागत है']
            },
            'bn': { 
                code: 'bn-IN', 
                name: 'বাংলা', 
                voice: 'bn-IN',
                pollyVoice: 'Aditi',
                greetings: ['নমস্কার', 'স্বাগতম', 'আপনাকে স্বাগতম']
            },
            'te': { 
                code: 'te-IN', 
                name: 'తెలుగు', 
                voice: 'te-IN',
                pollyVoice: 'Aditi',
                greetings: ['నమస్కారం', 'స్వాగతం', 'మీకు స్వాగతం']
            },
            'ta': { 
                code: 'ta-IN', 
                name: 'தமிழ்', 
                voice: 'ta-IN',
                pollyVoice: 'Aditi',
                greetings: ['வணக்கம்', 'வரவேற்கிறோம்', 'உங்களை வரவேற்கிறோம்']
            },
            'mr': { 
                code: 'mr-IN', 
                name: 'मराठी', 
                voice: 'mr-IN',
                pollyVoice: 'Aditi',
                greetings: ['नमस्कार', 'स्वागत आहे', 'तुमचे स्वागत आहे']
            },
            'gu': { 
                code: 'gu-IN', 
                name: 'ગુજરાતી', 
                voice: 'gu-IN',
                pollyVoice: 'Aditi',
                greetings: ['નમસ્તે', 'સ્વાગત છે', 'તમારું સ્વાગત છે']
            }
        };
        
        // Command patterns for better recognition
        this.commandPatterns = {
            navigation: ['show', 'see', 'view', 'browse', 'find', 'looking for', 'search', 'display', 'open'],
            categories: {
                embroidery: ['embroidery', 'embroidered', 'stitch', 'needlework', 'thread work'],
                weaving: ['weaving', 'weave', 'handloom', 'textile', 'fabric', 'loom'],
                pottery: ['pottery', 'potter', 'clay', 'ceramic', 'terracotta'],
                jewelry: ['jewelry', 'jewellery', 'ornament', 'accessory', 'accessories'],
                tailoring: ['tailoring', 'tailor', 'sewing', 'stitching', 'alteration'],
                food: ['food', 'catering', 'chef', 'cook', 'baker', 'bakery', 'cooking'],
                events: ['event', 'events', 'decoration', 'decorator', 'party']
            },
            actions: {
                order: ['order', 'orders', 'purchase', 'buy', 'bought'],
                favorite: ['favorite', 'favourite', 'like', 'save', 'bookmark'],
                message: ['message', 'chat', 'contact', 'talk', 'communicate'],
                profile: ['profile', 'account', 'settings', 'my profile']
            }
        };
        
        this.init();
    }
    
    init() {
        // Initialize Web Speech API
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            // Configure recognition for better accuracy
            this.recognition.continuous = false;
            this.recognition.interimResults = true; // Show interim results
            this.recognition.maxAlternatives = 5; // Get more alternatives for better accuracy
            this.recognition.lang = this.currentLanguage;
            
            this.recognition.onstart = () => {
                console.log('🎤 Recognition started');
                this.isListening = true;
                this.showVisualFeedback('listening');
            };
            
            this.recognition.onresult = (event) => this.handleResult(event);
            this.recognition.onerror = (event) => this.handleError(event);
            this.recognition.onend = () => this.handleEnd();
            
            // Load voices for speech synthesis
            if (this.synthesis.onvoiceschanged !== undefined) {
                this.synthesis.onvoiceschanged = () => {
                    console.log('✅ Voices loaded:', this.synthesis.getVoices().length);
                };
            }
            
            console.log('✅ Enhanced Voice Assistant initialized');
            this.greetUser();
        } else {
            console.warn('⚠️ Speech Recognition not supported in this browser');
            this.showNotification('Voice recognition is not supported in your browser. Please use Chrome, Edge, or Safari.', 'warning');
        }
    }
    
    // Greet user on initialization
    greetUser() {
        const langCode = this.currentLanguage.split('-')[0];
        const lang = this.languages[langCode];
        if (lang && lang.greetings) {
            const greeting = lang.greetings[Math.floor(Math.random() * lang.greetings.length)];
            console.log(`👋 ${greeting}! Voice assistant ready.`);
        }
    }
    
    // Show visual feedback with animations
    showVisualFeedback(state) {
        const voiceBtn = document.querySelector('.voice-btn, #voiceBtn');
        const voiceAnimation = document.querySelector('.voice-animation');
        
        if (voiceBtn) {
            voiceBtn.classList.remove('listening', 'processing', 'error');
            if (state !== 'idle') {
                voiceBtn.classList.add(state);
            }
        }
        
        if (voiceAnimation) {
            voiceAnimation.classList.remove('active', 'processing');
            if (state === 'listening') {
                voiceAnimation.classList.add('active');
            } else if (state === 'processing') {
                voiceAnimation.classList.add('processing');
            }
        }
    }
    
    // Show notification
    showNotification(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
    
    // Start listening
    startListening() {
        if (!this.recognition) {
            this.speak('Sorry, voice recognition is not supported in your browser');
            this.showNotification('Voice recognition not supported', 'error');
            return;
        }
        
        if (this.isListening) {
            console.log('Already listening...');
            return;
        }
        
        try {
            this.isListening = true;
            this.recognition.start();
            this.updateUI('listening');
            this.showVisualFeedback('listening');
            console.log('🎤 Listening...');
            
            // Auto-stop after 10 seconds if no speech
            this.autoStopTimer = setTimeout(() => {
                if (this.isListening) {
                    this.stopListening();
                    this.speak('I didn\'t hear anything. Please try again.');
                }
            }, 10000);
        } catch (error) {
            console.error('Error starting recognition:', error);
            this.isListening = false;
            this.showVisualFeedback('error');
            this.showNotification('Failed to start voice recognition', 'error');
        }
    }
    
    // Stop listening
    stopListening() {
        if (this.autoStopTimer) {
            clearTimeout(this.autoStopTimer);
        }
        
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            this.updateUI('idle');
            this.showVisualFeedback('idle');
        }
    }
    
    // Handle speech recognition result with better accuracy
    handleResult(event) {
        if (this.autoStopTimer) {
            clearTimeout(this.autoStopTimer);
        }
        
        let interimTranscript = '';
        let finalTranscript = '';
        let bestAlternative = '';
        let maxConfidence = 0;
        
        // Process all results and find best alternative
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            
            // Check all alternatives for best confidence
            for (let j = 0; j < result.length; j++) {
                const alternative = result[j];
                if (alternative.confidence > maxConfidence) {
                    maxConfidence = alternative.confidence;
                    bestAlternative = alternative.transcript;
                }
            }
            
            const transcript = result[0].transcript;
            
            if (result.isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }
        
        // Show interim results with visual feedback
        if (interimTranscript) {
            this.updateUI('listening', `Hearing: "${interimTranscript}"`);
            console.log(`👂 Interim: "${interimTranscript}"`);
        }
        
        // Process final result
        if (finalTranscript) {
            const confidence = maxConfidence || event.results[event.results.length - 1][0].confidence;
            const transcriptToUse = maxConfidence > 0.7 ? bestAlternative : finalTranscript;
            
            console.log(`📝 Heard: "${transcriptToUse}" (${Math.round(confidence * 100)}% confidence)`);
            
            // Add to conversation history
            this.conversationHistory.push({
                type: 'user',
                text: transcriptToUse,
                confidence: confidence,
                timestamp: new Date()
            });
            
            this.updateUI('processing', transcriptToUse);
            this.showVisualFeedback('processing');
            
            // Process with slight delay for better UX
            setTimeout(() => {
                this.processCommand(transcriptToUse, confidence);
            }, 300);
        }
    }
    
    // Handle recognition error with better feedback
    handleError(event) {
        console.error('Recognition error:', event.error);
        this.isListening = false;
        this.showVisualFeedback('error');
        
        if (this.autoStopTimer) {
            clearTimeout(this.autoStopTimer);
        }
        
        let errorMessage = '';
        let shouldRetry = false;
        
        switch(event.error) {
            case 'no-speech':
                errorMessage = 'No speech detected. Please try again and speak clearly.';
                this.speak('I didn\'t hear anything. Please try again.');
                shouldRetry = true;
                break;
                
            case 'audio-capture':
                errorMessage = 'Microphone not found. Please check your microphone.';
                this.speak('Microphone not found. Please check your microphone settings.');
                this.showNotification(errorMessage, 'error');
                break;
                
            case 'not-allowed':
                errorMessage = 'Microphone access denied. Please allow microphone access in browser settings.';
                this.speak('Please allow microphone access to use voice commands.');
                this.showNotification(errorMessage, 'error');
                break;
                
            case 'network':
                errorMessage = 'Network error. Please check your internet connection.';
                this.speak('Network error. Please check your connection.');
                this.showNotification(errorMessage, 'error');
                break;
                
            case 'aborted':
                errorMessage = 'Speech recognition aborted.';
                break;
                
            case 'service-not-allowed':
                errorMessage = 'Speech recognition service not allowed.';
                this.speak('Speech recognition is not available.');
                this.showNotification(errorMessage, 'error');
                break;
                
            case 'language-not-supported':
                errorMessage = `Language ${this.currentLanguage} not supported. Switching to English.`;
                this.setLanguage('en');
                this.speak('Language not supported. Switching to English.');
                this.showNotification(errorMessage, 'warning');
                break;
                
            default:
                errorMessage = `Recognition error: ${event.error}. Please try again.`;
                this.speak('Sorry, I had trouble understanding. Please try again.');
                this.showNotification(errorMessage, 'error');
                break;
        }
        
        this.updateUI('error', errorMessage);
        
        // Auto-retry for no-speech errors
        if (shouldRetry) {
            setTimeout(() => {
                this.updateUI('idle');
                this.showVisualFeedback('idle');
            }, 2000);
        }
    }
    
    // Handle recognition end
    handleEnd() {
        this.isListening = false;
        if (this.autoStopTimer) {
            clearTimeout(this.autoStopTimer);
        }
        
        const status = document.getElementById('voiceStatus');
        if (status && !status.textContent.includes('processing')) {
            this.updateUI('idle');
            this.showVisualFeedback('idle');
        }
    }
    
    // Process voice command
    async processCommand(command) {
        const lowerCommand = command.toLowerCase();
        
        // Category/Section navigation with smart recognition
        if (lowerCommand.includes('show') || lowerCommand.includes('see') || lowerCommand.includes('view') || 
            lowerCommand.includes('browse') || lowerCommand.includes('find') || lowerCommand.includes('looking for')) {
            
            // Embroidery
            if (lowerCommand.includes('embroidery') || lowerCommand.includes('embroidered') || 
                lowerCommand.includes('stitch') || lowerCommand.includes('needlework')) {
                this.speak('Opening embroidery artisans');
                setTimeout(() => {
                    if (typeof filterByCategory === 'function') {
                        filterByCategory('embroidery');
                    }
                }, 500);
            }
            // Weaving
            else if (lowerCommand.includes('weaving') || lowerCommand.includes('weave') || 
                     lowerCommand.includes('handloom') || lowerCommand.includes('textile')) {
                this.speak('Opening weaving artisans');
                setTimeout(() => {
                    if (typeof filterByCategory === 'function') {
                        filterByCategory('weaving');
                    }
                }, 500);
            }
            // Pottery
            else if (lowerCommand.includes('pottery') || lowerCommand.includes('potter') || 
                     lowerCommand.includes('clay') || lowerCommand.includes('ceramic')) {
                this.speak('Opening pottery artisans');
                setTimeout(() => {
                    if (typeof filterByCategory === 'function') {
                        filterByCategory('pottery');
                    }
                }, 500);
            }
            // Jewelry
            else if (lowerCommand.includes('jewelry') || lowerCommand.includes('jewellery') || 
                     lowerCommand.includes('ornament') || lowerCommand.includes('accessory')) {
                this.speak('Opening jewelry designers');
                setTimeout(() => {
                    if (typeof filterByCategory === 'function') {
                        filterByCategory('jewelry');
                    }
                }, 500);
            }
            // Food/Catering
            else if (lowerCommand.includes('food') || lowerCommand.includes('catering') || 
                     lowerCommand.includes('chef') || lowerCommand.includes('cook') || 
                     lowerCommand.includes('baker') || lowerCommand.includes('bakery')) {
                this.speak('Opening food and catering services');
                setTimeout(() => {
                    if (typeof filterByCategory === 'function') {
                        filterByCategory('food');
                    }
                }, 500);
            }
            // Orders
            else if (lowerCommand.includes('order') || lowerCommand.includes('orders')) {
                this.speak('Opening your orders');
                setTimeout(() => window.location.href = 'orders-dashboard.html', 1000);
            }
            // Skills
            else if (lowerCommand.includes('skill') || lowerCommand.includes('learning') || 
                     lowerCommand.includes('course') || lowerCommand.includes('training')) {
                this.speak('Opening skills and learning');
                setTimeout(() => window.location.href = 'skills.html', 1000);
            }
            // Progress
            else if (lowerCommand.includes('progress') || lowerCommand.includes('achievement')) {
                this.speak('Opening your progress');
                setTimeout(() => window.location.href = 'progress.html', 1000);
            }
            // Dashboard/Home
            else if (lowerCommand.includes('dashboard') || lowerCommand.includes('home') || 
                     lowerCommand.includes('main')) {
                this.speak('Going to dashboard');
                setTimeout(() => window.location.href = 'dashboard.html', 1000);
            }
            // All artisans
            else if (lowerCommand.includes('all') || lowerCommand.includes('everything')) {
                this.speak('Showing all artisans');
                setTimeout(() => {
                    if (typeof filterByCategory === 'function') {
                        filterByCategory('all');
                    }
                }, 500);
            }
            else {
                this.speak('I can show you embroidery, weaving, pottery, jewelry, or food artisans. Which would you like to see?');
            }
        }
        // Language change
        else if (lowerCommand.includes('change language') || lowerCommand.includes('switch language')) {
            this.speak('Which language would you like? Say English, Hindi, Bengali, Tamil, Telugu, Marathi, or Gujarati');
        }
        else if (lowerCommand.includes('hindi') || lowerCommand.includes('हिंदी')) {
            this.setLanguage('hi');
            this.speak('भाषा हिंदी में बदल दी गई है');
        }
        else if (lowerCommand.includes('english')) {
            this.setLanguage('en');
            this.speak('Language changed to English');
        }
        else if (lowerCommand.includes('bengali') || lowerCommand.includes('bangla')) {
            this.setLanguage('bn');
            this.speak('ভাষা বাংলায় পরিবর্তন করা হয়েছে');
        }
        else if (lowerCommand.includes('tamil')) {
            this.setLanguage('ta');
            this.speak('மொழி தமிழாக மாற்றப்பட்டது');
        }
        else if (lowerCommand.includes('telugu')) {
            this.setLanguage('te');
            this.speak('భాష తెలుగులోకి మార్చబడింది');
        }
        else if (lowerCommand.includes('marathi')) {
            this.setLanguage('mr');
            this.speak('भाषा मराठीत बदलली');
        }
        else if (lowerCommand.includes('gujarati')) {
            this.setLanguage('gu');
            this.speak('ભાષા ગુજરાતીમાં બદલાઈ ગઈ');
        }
        // Help
        else if (lowerCommand.includes('help')) {
            this.speak('You can say: Show me embroidery, Find pottery artisans, Browse jewelry, Open my orders, Change language, or What can you do');
        }
        else if (lowerCommand.includes('what can you do')) {
            this.speak('I can help you browse artisans by category like embroidery, weaving, pottery, jewelry, tailoring, food, and events. I can also navigate to your orders, skills, favorites, messages, and change languages. Just tell me what you need!');
        }
        // Greeting
        else if (lowerCommand.includes('hello') || lowerCommand.includes('hi ') || lowerCommand.includes('hey')) {
            this.speak('Hello! How can I help you today? You can ask me to show artisans, check orders, or change languages.');
        }
        // Thank you
        else if (lowerCommand.includes('thank')) {
            this.speak('You\'re welcome! Let me know if you need anything else.');
        }
        // Default
        else {
            this.speak('I\'m not sure how to help with that. Try saying "help" to see what I can do, or say "show me embroidery" to browse artisans.');
        }
        
        // Always reset UI to idle after processing
        setTimeout(() => {
            this.updateUI('idle');
        }, 500);
    }
    
    // Text to speech - Always use browser
    speak(text, language = null) {
        // Always use browser speech synthesis
        this.speakWithBrowser(text, language);
    }
    
    // Speak using browser's speech synthesis
    speakWithBrowser(text, language = null) {
        // Cancel any ongoing speech
        this.synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language || this.currentLanguage;
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        // Try to find a voice for the language
        const voices = this.synthesis.getVoices();
        const voice = voices.find(v => v.lang === utterance.lang) || voices[0];
        if (voice) {
            utterance.voice = voice;
        }
        
        utterance.onend = () => {
            console.log('🔊 Finished speaking');
        };
        
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
        };
        
        this.synthesis.speak(utterance);
        console.log(`🔊 Speaking: "${text}"`);
    }
    
    // Speak using AWS Polly
    async speakWithAWS(text, language = null) {
        try {
            const lang = language || this.currentLanguage.split('-')[0];
            
            const response = await fetch(`${this.apiEndpoint}/voice-services`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'text-to-speech',
                    text: text,
                    language: lang,
                    userId: this.getUserId()
                })
            });
            
            const data = await response.json();
            
            if (data.audioUrl) {
                const audio = new Audio(data.audioUrl);
                audio.play();
            }
        } catch (error) {
            console.error('AWS Polly error:', error);
            // Fallback to browser speech
            this.speakWithBrowser(text, language);
        }
    }
    
    // Set language
    setLanguage(langCode) {
        const lang = this.languages[langCode];
        if (lang) {
            this.currentLanguage = lang.code;
            if (this.recognition) {
                this.recognition.lang = lang.code;
            }
            console.log(`🌐 Language set to: ${lang.name}`);
            
            // Update UI if language selector exists
            if (window.updateLanguage) {
                window.updateLanguage(langCode);
            }
        }
    }
    
    // Update UI
    updateUI(state, message = '') {
        const statusEl = document.getElementById('voiceStatus');
        const btnEl = document.getElementById('voiceBtn');
        const modalEl = document.getElementById('voiceModal');
        
        if (!statusEl) return;
        
        switch (state) {
            case 'listening':
                statusEl.textContent = '🎤 Listening... Speak now';
                statusEl.style.color = '#f44336';
                if (btnEl) {
                    btnEl.innerHTML = '<i class="fas fa-stop"></i> Stop Listening';
                    btnEl.classList.add('recording');
                }
                if (modalEl) {
                    modalEl.querySelector('.voice-animation')?.classList.add('active');
                }
                break;
                
            case 'processing':
                statusEl.textContent = `Processing: "${message}"`;
                statusEl.style.color = '#ff9800';
                if (btnEl) {
                    btnEl.innerHTML = '<i class="fas fa-cog fa-spin"></i> Processing...';
                }
                break;
                
            case 'error':
                statusEl.textContent = message || 'Error occurred';
                statusEl.style.color = '#f44336';
                if (btnEl) {
                    btnEl.innerHTML = '<i class="fas fa-microphone"></i> Start Listening';
                    btnEl.classList.remove('recording');
                }
                if (modalEl) {
                    modalEl.querySelector('.voice-animation')?.classList.remove('active');
                }
                break;
                
            case 'idle':
            default:
                statusEl.textContent = 'Click to start listening';
                statusEl.style.color = '#666';
                if (btnEl) {
                    btnEl.innerHTML = '<i class="fas fa-microphone"></i> Start Listening';
                    btnEl.classList.remove('recording');
                }
                if (modalEl) {
                    modalEl.querySelector('.voice-animation')?.classList.remove('active');
                }
                break;
        }
    }
    
    // Get user ID
    getUserId() {
        const userData = localStorage.getItem('shebalance_user');
        if (userData) {
            const user = JSON.parse(userData);
            return user.userId || user.email || 'anonymous';
        }
        return 'anonymous';
    }
}

// Initialize voice assistant
let voiceAssistant;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVoiceAssistant);
} else {
    initVoiceAssistant();
}

function initVoiceAssistant() {
    voiceAssistant = new SimpleVoiceAssistant();
    console.log('🎙️ Voice Assistant ready');
}

// Global functions for UI
function startVoiceCommand() {
    const modal = document.getElementById('voiceModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeVoiceModal() {
    const modal = document.getElementById('voiceModal');
    if (modal) {
        modal.style.display = 'none';
    }
    if (voiceAssistant) {
        voiceAssistant.stopListening();
    }
}

function toggleVoice() {
    if (!voiceAssistant) {
        voiceAssistant = new SimpleVoiceAssistant();
    }
    
    if (voiceAssistant.isListening) {
        voiceAssistant.stopListening();
    } else {
        voiceAssistant.startListening();
    }
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.voiceAssistant = voiceAssistant;
    window.startVoiceCommand = startVoiceCommand;
    window.closeVoiceModal = closeVoiceModal;
    window.toggleVoice = toggleVoice;
}
