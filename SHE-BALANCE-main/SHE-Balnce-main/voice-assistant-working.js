/**
 * Working Voice Assistant - Fully Functional
 */

class VoiceAssistant {
    constructor() {
        this.isListening = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.currentLanguage = 'en-US';
        
        console.log('🎙️ Voice Assistant initializing...');
        this.init();
    }
    
    init() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error('❌ Speech Recognition not supported');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = this.currentLanguage;
        
        this.recognition.onstart = () => {
            console.log('🎤 Listening started');
            this.isListening = true;
            this.updateUI('listening');
        };
        
        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                }
            }
            
            if (finalTranscript) {
                console.log('✅ Heard:', finalTranscript);
                this.updateUI('processing', finalTranscript);
                this.processCommand(finalTranscript);
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('❌ Error:', event.error);
            this.isListening = false;
            
            if (event.error === 'not-allowed') {
                alert('Please allow microphone access');
            }
            
            this.updateUI('idle');
        };
        
        this.recognition.onend = () => {
            console.log('🛑 Listening ended');
            this.isListening = false;
            setTimeout(() => this.updateUI('idle'), 500);
        };
        
        console.log('✅ Voice Assistant ready!');
    }
    
    startListening() {
        if (!this.recognition) return;
        if (this.isListening) return;
        
        try {
            this.recognition.start();
        } catch (error) {
            console.error('Start error:', error);
        }
    }
    
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }
    
    processCommand(command) {
        const cmd = command.toLowerCase().trim();
        console.log('🤖 Processing:', cmd);
        
        // Categories
        if (cmd.includes('embroidery')) {
            this.executeCommand('embroidery', 'Opening embroidery artisans');
        }
        else if (cmd.includes('weaving')) {
            this.executeCommand('weaving', 'Opening weaving artisans');
        }
        else if (cmd.includes('pottery')) {
            this.executeCommand('pottery', 'Opening pottery artisans');
        }
        else if (cmd.includes('jewelry') || cmd.includes('jewellery')) {
            this.executeCommand('jewelry', 'Opening jewelry designers');
        }
        else if (cmd.includes('tailoring') || cmd.includes('tailor')) {
            this.executeCommand('tailoring', 'Opening tailoring services');
        }
        else if (cmd.includes('food') || cmd.includes('catering')) {
            this.executeCommand('food', 'Opening food services');
        }
        else if (cmd.includes('event')) {
            this.executeCommand('events', 'Opening event services');
        }
        else if (cmd.includes('all')) {
            this.executeCommand('all', 'Showing all artisans');
        }
        else {
            this.speak('Try saying: show me embroidery, tailoring, or pottery');
        }
    }
    
    executeCommand(category, message) {
        this.speak(message);
        setTimeout(() => {
            if (typeof filterByCategory === 'function') {
                filterByCategory(category);
            }
            this.closeModal();
        }, 800);
    }
    
    closeModal() {
        const modal = document.getElementById('voiceModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.stopListening();
    }
    
    speak(text) {
        this.synthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.currentLanguage;
        utterance.rate = 0.9;
        this.synthesis.speak(utterance);
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
            statusEl.textContent = `✅ "${message}"`;
            statusEl.style.background = '#e8f5e9';
            statusEl.style.color = '#4caf50';
            btnEl.innerHTML = '<i class="fas fa-check"></i><span>Got it!</span>';
            if (animationEl) animationEl.classList.remove('active');
        }
        else {
            statusEl.textContent = 'Ready to listen';
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

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Initializing voice assistant...');
    voiceAssistant = new VoiceAssistant();
});

// Global functions
function startVoiceCommand() {
    console.log('🎤 startVoiceCommand called');
    const modal = document.getElementById('voiceModal');
    if (modal) {
        modal.style.display = 'block';
        console.log('✅ Modal opened');
    } else {
        console.error('❌ Modal not found!');
    }
}

function closeVoiceModal() {
    console.log('❌ closeVoiceModal called');
    const modal = document.getElementById('voiceModal');
    if (modal) {
        modal.style.display = 'none';
    }
    if (voiceAssistant) {
        voiceAssistant.stopListening();
    }
}

function toggleVoice() {
    console.log('🔄 toggleVoice called');
    console.log('voiceAssistant exists:', !!voiceAssistant);
    
    if (!voiceAssistant) {
        console.log('Creating new voice assistant...');
        voiceAssistant = new VoiceAssistant();
        setTimeout(toggleVoice, 500);
        return;
    }
    
    console.log('isListening:', voiceAssistant.isListening);
    
    if (voiceAssistant.isListening) {
        console.log('Stopping listening...');
        voiceAssistant.stopListening();
    } else {
        console.log('Starting listening...');
        voiceAssistant.startListening();
    }
}

// Export
window.voiceAssistant = voiceAssistant;
window.startVoiceCommand = startVoiceCommand;
window.closeVoiceModal = closeVoiceModal;
window.toggleVoice = toggleVoice;

console.log('✅ Voice assistant script loaded');
