/**
 * Fixed Voice Assistant with Web Speech API
 * Uses browser's built-in speech recognition + AWS Polly for responses
 */

class VoiceAssistant {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
        this.apiBaseUrl = 'http://localhost:5000/api';
        
        this.initSpeechRecognition();
        console.log('🎙️ Voice Assistant initialized');
    }
    
    initSpeechRecognition() {
        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.error('❌ Speech recognition not supported');
            return;
        }
        
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;
        
        // Set language based on user preference
        this.recognition.lang = this.getLanguageCode();
        
        this.recognition.onstart = () => {
            console.log('🎤 Listening...');
            this.updateUI('listening');
        };
        
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const confidence = event.results[0][0].confidence;
            
            console.log('✅ Heard:', transcript);
            console.log('📊 Confidence:', confidence);
            
            this.processCommand(transcript);
        };
        
        this.recognition.onerror = (event) => {
            console.error('❌ Recognition error:', event.error);
            
            let errorMessage = 'Sorry, I could not understand that';
            
            if (event.error === 'no-speech') {
                errorMessage = 'No speech detected. Please try again.';
            } else if (event.error === 'not-allowed') {
                errorMessage = 'Microphone access denied. Please allow microphone access.';
            } else if (event.error === 'network') {
                errorMessage = 'Network error. Please check your connection.';
            }
            
            this.updateUI('error', errorMessage);
            this.speak(errorMessage);
            this.isListening = false;
        };
        
        this.recognition.onend = () => {
            console.log('🛑 Recognition ended');
            this.isListening = false;
        };
    }
    
    startListening() {
        if (!this.recognition) {
            alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
            return;
        }
        
        if (this.isListening) {
            this.stopListening();
            return;
        }
        
        try {
            this.recognition.lang = this.getLanguageCode();
            this.recognition.start();
            this.isListening = true;
        } catch (error) {
            console.error('❌ Start error:', error);
            this.updateUI('error', 'Could not start listening');
        }
    }
    
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            this.updateUI('idle');
        }
    }
    
    async processCommand(transcript) {
        const cmd = transcript.toLowerCase().trim();
        console.log('🤖 Processing:', cmd);
        
        this.updateUI('processing', transcript);
        
        let response = '';
        let action = null;
        let executeImmediately = true; // Execute action right away
        
        // Earnings/Income/Money commands
        if (cmd.includes('earning') || cmd.includes('income') || cmd.includes('money') || cmd.includes('balance') ||
            // Hindi
            cmd.includes('कमाई') || cmd.includes('आय') || cmd.includes('पैसा') || cmd.includes('रुपया') ||
            // Bengali
            cmd.includes('আয়') || cmd.includes('টাকা') || cmd.includes('পৈসা') ||
            // Marathi
            cmd.includes('उत्पन्न') || cmd.includes('पैसे') ||
            // Tamil
            cmd.includes('வருமானம்') || cmd.includes('பணம்') || cmd.includes('சம்பாதிப்பு') ||
            // Telugu
            cmd.includes('ఆదాయం') || cmd.includes('డబ్బు') || cmd.includes('సంపాదన') ||
            // Kannada
            cmd.includes('ಆದಾಯ') || cmd.includes('ಹಣ') || cmd.includes('ಸಂಪಾದನೆ') ||
            // Malayalam
            cmd.includes('വരുമാനം') || cmd.includes('പണം') || cmd.includes('സമ്പാദ്യം') ||
            // Gujarati
            cmd.includes('આવક') || cmd.includes('પૈસા') || cmd.includes('કમાણી') ||
            // Punjabi
            cmd.includes('ਆਮਦਨ') || cmd.includes('ਪੈਸਾ') || cmd.includes('ਕਮਾਈ') ||
            // Odia
            cmd.includes('ଆୟ') || cmd.includes('ଟଙ୍କା') || cmd.includes('ରୋଜଗାର') ||
            // Assamese
            cmd.includes('উপাৰ্জন') || cmd.includes('টকা') || cmd.includes('আয়')) {
            response = this.currentLanguage === 'hi' ? 'आपकी कमाई दिखा रहे हैं' :
                       this.currentLanguage === 'bn' ? 'আপনার আয় দেখাচ্ছি' :
                       this.currentLanguage === 'mr' ? 'तुमची कमाई दाखवत आहे' :
                       this.currentLanguage === 'ta' ? 'உங்கள் வருமானத்தைக் காட்டுகிறது' :
                       this.currentLanguage === 'te' ? 'మీ ఆదాయాన్ని చూపిస్తోంది' :
                       this.currentLanguage === 'kn' ? 'ನಿಮ್ಮ ಆದಾಯವನ್ನು ತೋರಿಸುತ್ತಿದೆ' :
                       this.currentLanguage === 'ml' ? 'നിങ്ങളുടെ വരുമാനം കാണിക്കുന്നു' :
                       this.currentLanguage === 'gu' ? 'તમારી આવક બતાવી રહ્યા છીએ' :
                       this.currentLanguage === 'pa' ? 'ਤੁਹਾਡੀ ਆਮਦਨ ਦਿਖਾ ਰਹੇ ਹਾਂ' :
                       this.currentLanguage === 'or' ? 'ଆପଣଙ୍କ ଆୟ ଦେଖାଉଛି' :
                       this.currentLanguage === 'as' ? 'আপোনাৰ উপাৰ্জন দেখুৱাইছো' :
                       'Showing your earnings';
            action = () => {
                const earningsSection = document.getElementById('earnings');
                if (earningsSection) {
                    earningsSection.scrollIntoView({ behavior: 'smooth' });
                }
            };
        }
        // Jobs/Work/Opportunities commands
        else if (cmd.includes('job') || cmd.includes('work') || cmd.includes('opportunity') || cmd.includes('opportunities') ||
                 cmd.includes('नौकरी') || cmd.includes('काम') || cmd.includes('अवसर') || cmd.includes('रोजगार') ||
                 cmd.includes('চাকরি') || cmd.includes('কাজ') || cmd.includes('সুযোগ') ||
                 cmd.includes('नोकरी') || cmd.includes('संधी') ||
                 cmd.includes('வேலை') || cmd.includes('வாய்ப்பு') || cmd.includes('தொழில்') ||
                 cmd.includes('ఉద్యోగం') || cmd.includes('పని') || cmd.includes('అవకాశం')) {
            response = this.currentLanguage === 'hi' ? 'नए अवसर खोज रहे हैं' :
                       this.currentLanguage === 'bn' ? 'নতুন সুযোগ খুঁজছি' :
                       this.currentLanguage === 'mr' ? 'नवीन संधी शोधत आहे' :
                       this.currentLanguage === 'ta' ? 'புதிய வாய்ப்புகளைக் கண்டுபிடிக்கிறது' :
                       this.currentLanguage === 'te' ? 'కొత్త అవకాశాలను కనుగొంటోంది' :
                       'Finding new opportunities';
            action = () => window.location.href = 'opportunities.html';
        }
        // Food/Marketplace commands
        else if (cmd.includes('food') || cmd.includes('marketplace') || cmd.includes('market') || cmd.includes('chef') || cmd.includes('order') ||
                 cmd.includes('खाना') || cmd.includes('भोजन') || cmd.includes('बाजार') || cmd.includes('मार्केट') ||
                 cmd.includes('খাবার') || cmd.includes('খাদ্য') || cmd.includes('বাজার') ||
                 cmd.includes('अन्न') || cmd.includes('खाद्य') ||
                 cmd.includes('உணவு') || cmd.includes('சந்தை') || cmd.includes('சமையல்') ||
                 cmd.includes('ఆహారం') || cmd.includes('మార్కెట్') || cmd.includes('వంట')) {
            response = this.currentLanguage === 'hi' ? 'फूड मार्केटप्लेस खोल रहे हैं' :
                       this.currentLanguage === 'bn' ? 'খাদ্য বাজার খুলছি' :
                       this.currentLanguage === 'mr' ? 'अन्न बाजार उघडत आहे' :
                       this.currentLanguage === 'ta' ? 'உணவு சந்தையைத் திறக்கிறது' :
                       this.currentLanguage === 'te' ? 'ఆహార మార్కెట్‌ను తెరుస్తోంది' :
                       'Opening food marketplace';
            action = () => window.location.href = 'food-marketplace.html';
        }
        // Progress/Growth/Skills commands
        else if (cmd.includes('progress') || cmd.includes('growth') || cmd.includes('skill') || cmd.includes('development') ||
                 cmd.includes('प्रगति') || cmd.includes('विकास') || cmd.includes('कौशल') ||
                 cmd.includes('অগ্রগতি') || cmd.includes('উন্নয়ন') || cmd.includes('দক্ষতা') ||
                 cmd.includes('प्रगती') || cmd.includes('विकास') ||
                 cmd.includes('முன்னேற்றம்') || cmd.includes('வளர்ச்சி') || cmd.includes('திறன்') ||
                 cmd.includes('పురోగతి') || cmd.includes('అభివృద్ధి') || cmd.includes('నైపుణ్యం')) {
            response = this.currentLanguage === 'hi' ? 'आपकी प्रगति दिखा रहे हैं' :
                       this.currentLanguage === 'bn' ? 'আপনার অগ্রগতি দেখাচ্ছি' :
                       this.currentLanguage === 'mr' ? 'तुमची प्रगती दाखवत आहे' :
                       this.currentLanguage === 'ta' ? 'உங்கள் முன்னேற்றத்தைக் காட்டுகிறது' :
                       this.currentLanguage === 'te' ? 'మీ పురోగతిని చూపిస్తోంది' :
                       'Showing your progress';
            action = () => window.location.href = 'progress.html';
        }
        // Learning/Education/Training commands
        else if (cmd.includes('learning') || cmd.includes('learn') || cmd.includes('mentor') || cmd.includes('training') || cmd.includes('course') ||
                 cmd.includes('सीखना') || cmd.includes('सीखें') || cmd.includes('शिक्षा') || cmd.includes('प्रशिक्षण') ||
                 cmd.includes('শেখা') || cmd.includes('শিক্ষা') || cmd.includes('প্রশিক্ষণ') ||
                 cmd.includes('शिकणे') || cmd.includes('शिक्षण') ||
                 cmd.includes('கற்றல்') || cmd.includes('கல்வி') || cmd.includes('பயிற்சி') ||
                 cmd.includes('నేర్చుకోవడం') || cmd.includes('విద్య') || cmd.includes('శిక్షణ')) {
            response = this.currentLanguage === 'hi' ? 'एआई लर्निंग मेंटर खोल रहे हैं' :
                       this.currentLanguage === 'bn' ? 'এআই লার্নিং মেন্টর খুলছি' :
                       this.currentLanguage === 'mr' ? 'एआय लर्निंग मेंटर उघडत आहे' :
                       this.currentLanguage === 'ta' ? 'AI கற்றல் வழிகாட்டியைத் திறக்கிறது' :
                       this.currentLanguage === 'te' ? 'AI లెర్నింగ్ మెంటార్‌ను తెరుస్తోంది' :
                       'Opening AI Learning Mentor';
            action = () => window.location.href = 'ai-learning-mentor.html';
        }
        // Help/Assistant/Support commands
        else if (cmd.includes('help') || cmd.includes('assistant') || cmd.includes('support') || cmd.includes('sakhi') ||
                 cmd.includes('मदद') || cmd.includes('सहायता') || cmd.includes('सखी') ||
                 cmd.includes('সাহায্য') || cmd.includes('সহায়তা') || cmd.includes('সখী') ||
                 cmd.includes('मदत') || cmd.includes('साहाय्य') ||
                 cmd.includes('உதவி') || cmd.includes('ஆதரவு') || cmd.includes('சகி') ||
                 cmd.includes('సహాయం') || cmd.includes('మద్దతు') || cmd.includes('సఖి')) {
            response = this.currentLanguage === 'hi' ? 'एआई सखी सहायक खोल रहे हैं' :
                       this.currentLanguage === 'bn' ? 'এআই সখী সহায়ক খুলছি' :
                       this.currentLanguage === 'mr' ? 'एआय सखी साहाय्यक उघडत आहे' :
                       this.currentLanguage === 'ta' ? 'AI சகி உதவியாளரைத் திறக்கிறது' :
                       this.currentLanguage === 'te' ? 'AI సఖి సహాయకుడిని తెరుస్తోంది' :
                       'Opening AI Sakhi Assistant';
            action = () => window.location.href = 'ai-sakhi-simple.html';
        }
        else {
            response = this.currentLanguage === 'hi' ? 'मैं आपकी कमाई, नौकरी, खाना, प्रगति, सीखने या सहायता में मदद कर सकती हूं' :
                       this.currentLanguage === 'bn' ? 'আমি আপনার আয়, চাকরি, খাবার, অগ্রগতি, শেখা বা সাহায্যে সহায়তা করতে পারি' :
                       this.currentLanguage === 'mr' ? 'मी तुमची कमाई, नोकरी, अन्न, प्रगती, शिकणे किंवा मदतीसाठी मदत करू शकते' :
                       this.currentLanguage === 'ta' ? 'நான் உங்கள் வருமானம், வேலை, உணவு, முன்னேற்றம், கற்றல் அல்லது உதவியில் உதவ முடியும்' :
                       this.currentLanguage === 'te' ? 'నేను మీ ఆదాయం, ఉద్యోగం, ఆహారం, పురోగతి, నేర్చుకోవడం లేదా సహాయంలో సహాయం చేయగలను' :
                       'I can help you with earnings, jobs, food orders, progress, learning, or AI assistant';
        }
        
        // Execute action IMMEDIATELY if found
        if (action && executeImmediately) {
            console.log('⚡ Executing action immediately...');
            this.updateUI('success', `✅ ${transcript}`);
            this.closeModal();
            action(); // Execute right away
            
            // Speak response in background (non-blocking)
            this.speak(response).catch(err => console.log('Speech error:', err));
            return;
        }
        
        // Fallback: speak first, then execute
        await this.speak(response);
        
        if (action) {
            setTimeout(() => {
                action();
                this.closeModal();
            }, 1000);
        } else {
            setTimeout(() => this.closeModal(), 2000);
        }
        
        this.updateUI('success', transcript);
    }
    
    async speak(text) {
        try {
            console.log('🔊 Speaking:', text);
            
            // Try AWS Polly first
            const response = await fetch(`${this.apiBaseUrl}/voice/speak`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text,
                    language: this.currentLanguage
                })
            });
            
            if (response.ok) {
                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                
                audio.play();
                
                audio.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                };
                
                return;
            }
        } catch (error) {
            console.log('⚠️ AWS Polly not available, using browser speech');
        }
        
        // Fallback to browser speech
        this.speakBrowser(text);
    }
    
    speakBrowser(text) {
        this.synthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.getLanguageCode();
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        this.synthesis.speak(utterance);
    }
    
    getLanguageCode() {
        const languageMap = {
            'en': 'en-US',
            'hi': 'hi-IN',
            'bn': 'bn-IN',
            'mr': 'mr-IN',
            'ta': 'ta-IN',
            'te': 'te-IN'
        };
        return languageMap[this.currentLanguage] || 'en-US';
    }
    
    closeModal() {
        const modal = document.getElementById('voiceModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.stopListening();
    }
    
    updateUI(state, message = '') {
        const statusEl = document.getElementById('voiceStatus');
        const btnEl = document.getElementById('voiceBtn');
        const animationEl = document.querySelector('.voice-animation');
        
        if (!statusEl || !btnEl) return;
        
        if (state === 'listening') {
            statusEl.textContent = '🎤 Listening... Speak now';
            statusEl.style.background = '#ffebee';
            statusEl.style.color = '#f44336';
            btnEl.innerHTML = '<i class="fas fa-stop"></i><span>Stop</span>';
            btnEl.classList.add('recording');
            if (animationEl) animationEl.classList.add('active');
        }
        else if (state === 'processing') {
            statusEl.textContent = `Processing: "${message}"`;
            statusEl.style.background = '#fff3e0';
            statusEl.style.color = '#ff9800';
            btnEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Processing</span>';
            btnEl.classList.remove('recording');
            if (animationEl) animationEl.classList.remove('active');
        }
        else if (state === 'success') {
            statusEl.textContent = `✅ Heard: "${message}"`;
            statusEl.style.background = '#e8f5e9';
            statusEl.style.color = '#4caf50';
            btnEl.innerHTML = '<i class="fas fa-check"></i><span>Got it!</span>';
            if (animationEl) animationEl.classList.remove('active');
        }
        else if (state === 'error') {
            statusEl.textContent = `❌ ${message}`;
            statusEl.style.background = '#ffebee';
            statusEl.style.color = '#f44336';
            btnEl.innerHTML = '<i class="fas fa-microphone"></i><span>Try Again</span>';
            btnEl.classList.remove('recording');
            if (animationEl) animationEl.classList.remove('active');
        }
        else {
            statusEl.textContent = 'Click "Start Listening" and speak your command';
            statusEl.style.background = '#f5f5f5';
            statusEl.style.color = '#666';
            btnEl.innerHTML = '<i class="fas fa-microphone"></i><span>Start Listening</span>';
            btnEl.classList.remove('recording');
            if (animationEl) animationEl.classList.remove('active');
        }
    }
}

// Global instance
let voiceAssistant = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Initializing Voice Assistant...');
    voiceAssistant = new VoiceAssistant();
});

// Global functions
function startVoiceCommand() {
    console.log('🎤 Opening voice modal');
    const modal = document.getElementById('voiceModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeVoiceModal() {
    console.log('❌ Closing voice modal');
    if (voiceAssistant) {
        voiceAssistant.closeModal();
    }
}

function toggleVoice() {
    console.log('🔄 Toggle voice');
    
    if (!voiceAssistant) {
        console.log('Creating voice assistant...');
        voiceAssistant = new VoiceAssistant();
        setTimeout(toggleVoice, 500);
        return;
    }
    
    if (voiceAssistant.isListening) {
        voiceAssistant.stopListening();
    } else {
        voiceAssistant.startListening();
    }
}

// Export
window.voiceAssistant = voiceAssistant;
window.startVoiceCommand = startVoiceCommand;
window.closeVoiceModal = closeVoiceModal;
window.toggleVoice = toggleVoice;

console.log('✅ Voice Assistant script loaded');
