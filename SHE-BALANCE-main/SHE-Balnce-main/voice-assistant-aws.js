/**
 * AWS-Powered Voice Assistant
 * Uses Transcribe, Translate, and Polly for multi-language support
 */

class AWSVoiceAssistant {
    constructor() {
        this.isListening = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.currentLanguage = localStorage.getItem('selectedLanguage') || 'en';
        this.apiBaseUrl = 'http://localhost:5000/api';
        
        console.log('🎙️ AWS Voice Assistant initializing...');
        console.log('📍 Language:', this.currentLanguage);
    }
    
    async startListening() {
        if (this.isListening) return;
        
        try {
            console.log('🎤 Requesting microphone access...');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = async () => {
                console.log('🛑 Recording stopped, processing...');
                await this.processAudio();
                stream.getTracks().forEach(track => track.stop());
            };
            
            this.mediaRecorder.start();
            this.isListening = true;
            this.updateUI('listening');
            
            console.log('✅ Recording started');
            
            // Auto-stop after 10 seconds
            setTimeout(() => {
                if (this.isListening) {
                    this.stopListening();
                }
            }, 10000);
            
        } catch (error) {
            console.error('❌ Microphone error:', error);
            alert('Please allow microphone access to use voice commands');
            this.updateUI('idle');
        }
    }
    
    stopListening() {
        if (this.mediaRecorder && this.isListening) {
            this.mediaRecorder.stop();
            this.isListening = false;
        }
    }
    
    async processAudio() {
        try {
            this.updateUI('processing', 'Processing your voice...');
            
            // Create audio blob
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
            
            // Send to backend for AWS Transcribe
            const formData = new FormData();
            formData.append('audio', audioBlob);
            formData.append('language', this.getLanguageCode());
            
            console.log('📤 Sending audio to AWS Transcribe...');
            
            const response = await fetch(`${this.apiBaseUrl}/voice/transcribe`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Transcription failed');
            }
            
            const data = await response.json();
            console.log('✅ Transcription:', data.transcript);
            
            this.updateUI('processing', data.transcript);
            
            // Process the command
            await this.processCommand(data.transcript);
            
        } catch (error) {
            console.error('❌ Processing error:', error);
            this.updateUI('error', 'Sorry, I could not understand that');
            this.speak('Sorry, I could not understand that');
        }
    }
    
    async processCommand(transcript) {
        const cmd = transcript.toLowerCase().trim();
        console.log('🤖 Processing command:', cmd);
        
        // Translate to English if needed
        let englishCommand = cmd;
        if (this.currentLanguage !== 'en') {
            englishCommand = await this.translateToEnglish(cmd);
        }
        
        // Match commands
        let response = '';
        let action = null;
        
        if (englishCommand.includes('earning') || englishCommand.includes('income') || englishCommand.includes('money')) {
            response = 'Showing your earnings';
            action = () => this.navigateTo('#earnings');
        }
        else if (englishCommand.includes('job') || englishCommand.includes('opportunity') || englishCommand.includes('work')) {
            response = 'Finding new opportunities for you';
            action = () => this.navigateTo('opportunities.html');
        }
        else if (englishCommand.includes('food') || englishCommand.includes('order') || englishCommand.includes('marketplace')) {
            response = 'Opening food marketplace';
            action = () => this.navigateTo('food-marketplace.html');
        }
        else if (englishCommand.includes('progress') || englishCommand.includes('growth') || englishCommand.includes('skill')) {
            response = 'Showing your progress';
            action = () => this.navigateTo('progress.html');
        }
        else if (englishCommand.includes('learning') || englishCommand.includes('learn') || englishCommand.includes('mentor')) {
            response = 'Opening AI Learning Mentor';
            action = () => this.navigateTo('ai-learning-mentor.html');
        }
        else if (englishCommand.includes('help') || englishCommand.includes('assistant') || englishCommand.includes('sakhi')) {
            response = 'Opening AI Sakhi Assistant';
            action = () => this.navigateTo('ai-sakhi-simple.html');
        }
        else {
            response = 'I can help you with earnings, jobs, food orders, progress, learning, or AI assistant';
        }
        
        // Translate response back to user's language
        if (this.currentLanguage !== 'en') {
            response = await this.translateFromEnglish(response);
        }
        
        // Speak the response
        await this.speak(response);
        
        // Execute action
        if (action) {
            setTimeout(action, 1500);
        }
        
        this.updateUI('success', transcript);
        setTimeout(() => this.closeModal(), 2000);
    }
    
    async translateToEnglish(text) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/voice/translate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text,
                    sourceLanguage: this.currentLanguage,
                    targetLanguage: 'en'
                })
            });
            
            const data = await response.json();
            return data.translatedText;
        } catch (error) {
            console.error('Translation error:', error);
            return text;
        }
    }
    
    async translateFromEnglish(text) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/voice/translate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text,
                    sourceLanguage: 'en',
                    targetLanguage: this.currentLanguage
                })
            });
            
            const data = await response.json();
            return data.translatedText;
        } catch (error) {
            console.error('Translation error:', error);
            return text;
        }
    }
    
    async speak(text) {
        try {
            console.log('🔊 Speaking:', text);
            
            const response = await fetch(`${this.apiBaseUrl}/voice/speak`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text,
                    language: this.currentLanguage
                })
            });
            
            if (!response.ok) {
                throw new Error('Speech synthesis failed');
            }
            
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            
            audio.play();
            
            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
            };
            
        } catch (error) {
            console.error('❌ Speech error:', error);
            // Fallback to browser speech
            this.speakFallback(text);
        }
    }
    
    speakFallback(text) {
        const synthesis = window.speechSynthesis;
        synthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.getLanguageCode();
        utterance.rate = 0.9;
        synthesis.speak(utterance);
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
    
    navigateTo(url) {
        if (url.startsWith('#')) {
            const element = document.querySelector(url);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            window.location.href = url;
        }
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
            statusEl.textContent = message || 'Processing...';
            statusEl.style.background = '#fff3e0';
            statusEl.style.color = '#ff9800';
            btnEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Processing</span>';
            if (animationEl) animationEl.classList.remove('active');
        }
        else if (state === 'success') {
            statusEl.textContent = `✅ "${message}"`;
            statusEl.style.background = '#e8f5e9';
            statusEl.style.color = '#4caf50';
            btnEl.innerHTML = '<i class="fas fa-check"></i><span>Got it!</span>';
            if (animationEl) animationEl.classList.remove('active');
        }
        else if (state === 'error') {
            statusEl.textContent = message;
            statusEl.style.background = '#ffebee';
            statusEl.style.color = '#f44336';
            btnEl.innerHTML = '<i class="fas fa-times"></i><span>Error</span>';
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
let awsVoiceAssistant = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Initializing AWS voice assistant...');
    awsVoiceAssistant = new AWSVoiceAssistant();
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
    if (awsVoiceAssistant) {
        awsVoiceAssistant.stopListening();
    }
}

function toggleVoice() {
    console.log('🔄 toggleVoice called');
    
    if (!awsVoiceAssistant) {
        console.log('Creating new AWS voice assistant...');
        awsVoiceAssistant = new AWSVoiceAssistant();
        setTimeout(toggleVoice, 500);
        return;
    }
    
    if (awsVoiceAssistant.isListening) {
        console.log('Stopping listening...');
        awsVoiceAssistant.stopListening();
    } else {
        console.log('Starting listening...');
        awsVoiceAssistant.startListening();
    }
}

// Export
window.awsVoiceAssistant = awsVoiceAssistant;
window.startVoiceCommand = startVoiceCommand;
window.closeVoiceModal = closeVoiceModal;
window.toggleVoice = toggleVoice;

console.log('✅ AWS Voice assistant script loaded');
