/**
 * Multi-Language Voice Interface for Artisan Dashboard
 * Integrates AWS Polly, Transcribe, and Translate
 */

class MultiLanguageVoiceService {
    constructor() {
        this.apiBaseUrl = 'http://localhost:5000/api/voice'; // Backend API URL
        this.currentLanguage = localStorage.getItem('preferredLanguage') || 'en';
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.supportedLanguages = {
            'en': { name: 'English', flag: '🇬🇧', voice: 'Joanna' },
            'hi': { name: 'हिंदी (Hindi)', flag: '🇮🇳', voice: 'Aditi' },
            'bn': { name: 'বাংলা (Bengali)', flag: '🇮🇳', voice: 'Aditi' },
            'te': { name: 'తెలుగు (Telugu)', flag: '🇮🇳', voice: 'Aditi' },
            'ta': { name: 'தமிழ் (Tamil)', flag: '🇮🇳', voice: 'Aditi' },
            'mr': { name: 'मराठी (Marathi)', flag: '🇮🇳', voice: 'Aditi' },
            'gu': { name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳', voice: 'Aditi' },
            'kn': { name: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳', voice: 'Aditi' },
            'ml': { name: 'മലയാളം (Malayalam)', flag: '🇮🇳', voice: 'Aditi' },
            'pa': { name: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳', voice: 'Aditi' },
            'ur': { name: 'اردو (Urdu)', flag: '🇵🇰', voice: 'Aditi' }
        };
    }

    // Initialize the voice interface
    init() {
        this.createVoiceWidget();
        this.setupEventListeners();
        this.loadUserPreferences();
    }

    // Create the voice widget UI
    createVoiceWidget() {
        const widget = document.createElement('div');
        widget.id = 'multiLanguageVoiceWidget';
        widget.className = 'voice-widget';
        widget.innerHTML = `
            <div class="voice-widget-header">
                <button class="voice-widget-toggle" id="voiceWidgetToggle">
                    <i class="fas fa-language"></i>
                    <span>Voice Assistant</span>
                </button>
            </div>
            
            <div class="voice-widget-panel" id="voiceWidgetPanel" style="display: none;">
                <!-- Language Selector -->
                <div class="voice-section">
                    <h4><i class="fas fa-globe"></i> Select Language</h4>
                    <select id="languageSelector" class="voice-select">
                        ${Object.entries(this.supportedLanguages).map(([code, lang]) => `
                            <option value="${code}" ${code === this.currentLanguage ? 'selected' : ''}>
                                ${lang.flag} ${lang.name}
                            </option>
                        `).join('')}
                    </select>
                </div>

                <!-- Text to Speech -->
                <div class="voice-section">
                    <h4><i class="fas fa-volume-up"></i> Text to Speech</h4>
                    <textarea id="textToSpeechInput" class="voice-textarea" 
                        placeholder="Enter text to convert to speech..."></textarea>
                    <button id="speakTextBtn" class="voice-btn voice-btn-primary">
                        <i class="fas fa-play"></i> Speak
                    </button>
                    <audio id="audioPlayer" controls style="width: 100%; margin-top: 10px; display: none;"></audio>
                </div>

                <!-- Speech to Text -->
                <div class="voice-section">
                    <h4><i class="fas fa-microphone"></i> Speech to Text</h4>
                    <div class="recording-controls">
                        <button id="startRecordingBtn" class="voice-btn voice-btn-record">
                            <i class="fas fa-microphone"></i> Start Recording
                        </button>
                        <button id="stopRecordingBtn" class="voice-btn voice-btn-stop" style="display: none;">
                            <i class="fas fa-stop"></i> Stop Recording
                        </button>
                    </div>
                    <div id="recordingStatus" class="recording-status"></div>
                    <textarea id="transcribedText" class="voice-textarea" 
                        placeholder="Transcribed text will appear here..." readonly></textarea>
                </div>

                <!-- Translation -->
                <div class="voice-section">
                    <h4><i class="fas fa-exchange-alt"></i> Translate Text</h4>
                    <div class="translation-controls">
                        <select id="sourceLanguage" class="voice-select-small">
                            <option value="auto">Auto Detect</option>
                            ${Object.entries(this.supportedLanguages).map(([code, lang]) => `
                                <option value="${code}">${lang.name}</option>
                            `).join('')}
                        </select>
                        <i class="fas fa-arrow-right"></i>
                        <select id="targetLanguage" class="voice-select-small">
                            ${Object.entries(this.supportedLanguages).map(([code, lang]) => `
                                <option value="${code}" ${code === 'hi' ? 'selected' : ''}>${lang.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    <textarea id="translateInput" class="voice-textarea" 
                        placeholder="Enter text to translate..."></textarea>
                    <button id="translateBtn" class="voice-btn voice-btn-primary">
                        <i class="fas fa-language"></i> Translate
                    </button>
                    <textarea id="translatedOutput" class="voice-textarea" 
                        placeholder="Translation will appear here..." readonly></textarea>
                </div>

                <!-- Quick Actions -->
                <div class="voice-section">
                    <h4><i class="fas fa-bolt"></i> Quick Actions</h4>
                    <div class="quick-actions">
                        <button class="voice-btn-quick" onclick="voiceService.speakQuickMessage('greeting')">
                            <i class="fas fa-hand-wave"></i> Greeting
                        </button>
                        <button class="voice-btn-quick" onclick="voiceService.speakQuickMessage('help')">
                            <i class="fas fa-question-circle"></i> Help
                        </button>
                        <button class="voice-btn-quick" onclick="voiceService.speakQuickMessage('orders')">
                            <i class="fas fa-shopping-cart"></i> Orders
                        </button>
                        <button class="voice-btn-quick" onclick="voiceService.speakQuickMessage('earnings')">
                            <i class="fas fa-rupee-sign"></i> Earnings
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(widget);
        this.addStyles();
    }

    // Setup event listeners
    setupEventListeners() {
        // Toggle widget
        document.getElementById('voiceWidgetToggle').addEventListener('click', () => {
            this.toggleWidget();
        });

        // Language selector
        document.getElementById('languageSelector').addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });

        // Text to speech
        document.getElementById('speakTextBtn').addEventListener('click', () => {
            this.textToSpeech();
        });

        // Recording controls
        document.getElementById('startRecordingBtn').addEventListener('click', () => {
            this.startRecording();
        });

        document.getElementById('stopRecordingBtn').addEventListener('click', () => {
            this.stopRecording();
        });

        // Translation
        document.getElementById('translateBtn').addEventListener('click', () => {
            this.translateText();
        });
    }

    // Toggle widget visibility
    toggleWidget() {
        const panel = document.getElementById('voiceWidgetPanel');
        const isVisible = panel.style.display !== 'none';
        panel.style.display = isVisible ? 'none' : 'block';
    }

    // Change language
    changeLanguage(languageCode) {
        this.currentLanguage = languageCode;
        localStorage.setItem('preferredLanguage', languageCode);
        this.showNotification(`Language changed to ${this.supportedLanguages[languageCode].name}`, 'success');
    }

    // Text to Speech
    async textToSpeech() {
        const text = document.getElementById('textToSpeechInput').value.trim();
        
        if (!text) {
            this.showNotification('Please enter text to speak', 'error');
            return;
        }

        const btn = document.getElementById('speakTextBtn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

        try {
            const response = await fetch(`${this.apiBaseUrl}/text-to-speech`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text,
                    language: this.currentLanguage,
                    userId: this.getUserId()
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Play audio
                const audioPlayer = document.getElementById('audioPlayer');
                audioPlayer.src = data.audioUrl;
                audioPlayer.style.display = 'block';
                audioPlayer.play();
                
                this.showNotification('Audio generated successfully!', 'success');
            } else {
                throw new Error(data.error || 'Failed to generate audio');
            }

        } catch (error) {
            console.error('Text-to-speech error:', error);
            this.showNotification('Error generating audio: ' + error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-play"></i> Speak';
        }
    }

    // Start recording
    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.onstop = () => {
                this.processRecording();
            };

            this.mediaRecorder.start();
            this.isRecording = true;

            // Update UI
            document.getElementById('startRecordingBtn').style.display = 'none';
            document.getElementById('stopRecordingBtn').style.display = 'block';
            document.getElementById('recordingStatus').innerHTML = 
                '<i class="fas fa-circle recording-indicator"></i> Recording...';

            this.showNotification('Recording started', 'info');

        } catch (error) {
            console.error('Recording error:', error);
            this.showNotification('Error accessing microphone: ' + error.message, 'error');
        }
    }

    // Stop recording
    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            this.isRecording = false;

            // Update UI
            document.getElementById('startRecordingBtn').style.display = 'block';
            document.getElementById('stopRecordingBtn').style.display = 'none';
            document.getElementById('recordingStatus').innerHTML = 
                '<i class="fas fa-spinner fa-spin"></i> Processing...';
        }
    }

    // Process recording
    async processRecording() {
        try {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/mp3' });
            
            // Upload audio
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.mp3');
            formData.append('userId', this.getUserId());

            const uploadResponse = await fetch(`${this.apiBaseUrl}/upload-audio`, {
                method: 'POST',
                body: formData
            });

            const uploadData = await uploadResponse.json();

            if (!uploadResponse.ok) {
                throw new Error(uploadData.error || 'Failed to upload audio');
            }

            // Start transcription
            const transcribeResponse = await fetch(`${this.apiBaseUrl}/speech-to-text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    audioUrl: uploadData.audioUrl,
                    language: this.currentLanguage,
                    userId: this.getUserId()
                })
            });

            const transcribeData = await transcribeResponse.json();

            if (!transcribeResponse.ok) {
                throw new Error(transcribeData.error || 'Failed to start transcription');
            }

            // Poll for transcription status
            this.pollTranscriptionStatus(transcribeData.jobName);

        } catch (error) {
            console.error('Processing error:', error);
            document.getElementById('recordingStatus').innerHTML = '';
            this.showNotification('Error processing recording: ' + error.message, 'error');
        }
    }

    // Poll transcription status
    async pollTranscriptionStatus(jobName) {
        const maxAttempts = 30;
        let attempts = 0;

        const checkStatus = async () => {
            try {
                const response = await fetch(`${this.apiBaseUrl}/transcription-status/${jobName}`);
                const data = await response.json();

                if (data.status === 'COMPLETED') {
                    document.getElementById('transcribedText').value = data.text;
                    document.getElementById('recordingStatus').innerHTML = 
                        '<i class="fas fa-check-circle" style="color: #10b981;"></i> Transcription complete!';
                    this.showNotification('Transcription completed!', 'success');
                    
                    // Auto-fill translation input
                    document.getElementById('translateInput').value = data.text;
                    
                } else if (data.status === 'FAILED') {
                    throw new Error(data.error || 'Transcription failed');
                    
                } else if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(checkStatus, 2000); // Check every 2 seconds
                } else {
                    throw new Error('Transcription timeout');
                }

            } catch (error) {
                console.error('Status check error:', error);
                document.getElementById('recordingStatus').innerHTML = '';
                this.showNotification('Error checking transcription status: ' + error.message, 'error');
            }
        };

        checkStatus();
    }

    // Translate text
    async translateText() {
        const text = document.getElementById('translateInput').value.trim();
        const sourceLang = document.getElementById('sourceLanguage').value;
        const targetLang = document.getElementById('targetLanguage').value;

        if (!text) {
            this.showNotification('Please enter text to translate', 'error');
            return;
        }

        const btn = document.getElementById('translateBtn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Translating...';

        try {
            const response = await fetch(`${this.apiBaseUrl}/translate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text,
                    sourceLanguage: sourceLang,
                    targetLanguage: targetLang
                })
            });

            const data = await response.json();

            if (response.ok) {
                document.getElementById('translatedOutput').value = data.translatedText;
                this.showNotification('Translation completed!', 'success');
            } else {
                throw new Error(data.error || 'Translation failed');
            }

        } catch (error) {
            console.error('Translation error:', error);
            this.showNotification('Error translating text: ' + error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-language"></i> Translate';
        }
    }

    // Speak quick messages
    async speakQuickMessage(type) {
        const messages = {
            greeting: {
                en: 'Hello! Welcome to SheBalance. How can I help you today?',
                hi: 'नमस्ते! शीबैलेंस में आपका स्वागत है। मैं आज आपकी कैसे मदद कर सकती हूं?'
            },
            help: {
                en: 'You can use voice commands to navigate the dashboard, check your orders, and manage your profile.',
                hi: 'आप डैशबोर्ड नेविगेट करने, अपने ऑर्डर चेक करने और अपनी प्रोफ़ाइल प्रबंधित करने के लिए वॉइस कमांड का उपयोग कर सकते हैं।'
            },
            orders: {
                en: 'You have 3 active orders. 2 are in progress and 1 is ready for delivery.',
                hi: 'आपके पास 3 सक्रिय ऑर्डर हैं। 2 प्रगति में हैं और 1 डिलीवरी के लिए तैयार है।'
            },
            earnings: {
                en: 'Your total earnings this month are 15,000 rupees. Great work!',
                hi: 'इस महीने आपकी कुल कमाई 15,000 रुपये है। बहुत बढ़िया काम!'
            }
        };

        const message = messages[type][this.currentLanguage] || messages[type]['en'];
        document.getElementById('textToSpeechInput').value = message;
        await this.textToSpeech();
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

    // Load user preferences
    loadUserPreferences() {
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage && this.supportedLanguages[savedLanguage]) {
            this.currentLanguage = savedLanguage;
            document.getElementById('languageSelector').value = savedLanguage;
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `voice-notification voice-notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
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

    // Add styles
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .voice-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                font-family: 'Inter', sans-serif;
            }

            .voice-widget-toggle {
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                color: white;
                border: none;
                padding: 15px 25px;
                border-radius: 50px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
                display: flex;
                align-items: center;
                gap: 10px;
                transition: all 0.3s ease;
            }

            .voice-widget-toggle:hover {
                transform: translateY(-2px);
                box-shadow: 0 15px 30px rgba(99, 102, 241, 0.4);
            }

            .voice-widget-toggle i {
                font-size: 20px;
            }

            .voice-widget-panel {
                position: absolute;
                bottom: 70px;
                right: 0;
                width: 400px;
                max-height: 600px;
                overflow-y: auto;
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
                padding: 20px;
            }

            .voice-section {
                margin-bottom: 25px;
                padding-bottom: 20px;
                border-bottom: 1px solid #e5e7eb;
            }

            .voice-section:last-child {
                border-bottom: none;
            }

            .voice-section h4 {
                margin: 0 0 15px 0;
                color: #1f2937;
                font-size: 16px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .voice-select, .voice-select-small {
                width: 100%;
                padding: 10px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                background: white;
                cursor: pointer;
                transition: border-color 0.3s ease;
            }

            .voice-select-small {
                width: 45%;
            }

            .voice-select:focus, .voice-select-small:focus {
                outline: none;
                border-color: #6366f1;
            }

            .voice-textarea {
                width: 100%;
                min-height: 80px;
                padding: 10px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                font-family: inherit;
                resize: vertical;
                margin-bottom: 10px;
                transition: border-color 0.3s ease;
            }

            .voice-textarea:focus {
                outline: none;
                border-color: #6366f1;
            }

            .voice-btn {
                width: 100%;
                padding: 12px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }

            .voice-btn-primary {
                background: #6366f1;
                color: white;
            }

            .voice-btn-primary:hover {
                background: #4f46e5;
                transform: translateY(-1px);
            }

            .voice-btn-record {
                background: #ef4444;
                color: white;
            }

            .voice-btn-record:hover {
                background: #dc2626;
            }

            .voice-btn-stop {
                background: #f59e0b;
                color: white;
            }

            .voice-btn-stop:hover {
                background: #d97706;
            }

            .voice-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }

            .recording-controls {
                margin-bottom: 10px;
            }

            .recording-status {
                padding: 10px;
                background: #f3f4f6;
                border-radius: 8px;
                margin-bottom: 10px;
                font-size: 14px;
                color: #6b7280;
                min-height: 20px;
            }

            .recording-indicator {
                color: #ef4444;
                animation: pulse 1.5s ease-in-out infinite;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            .translation-controls {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 15px;
                gap: 10px;
            }

            .translation-controls i {
                color: #6366f1;
                font-size: 18px;
            }

            .quick-actions {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
            }

            .voice-btn-quick {
                padding: 12px;
                background: #f3f4f6;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
            }

            .voice-btn-quick:hover {
                background: #6366f1;
                color: white;
                border-color: #6366f1;
                transform: translateY(-2px);
            }

            .voice-btn-quick i {
                font-size: 20px;
            }

            .voice-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 10000;
                transform: translateX(400px);
                transition: transform 0.3s ease;
            }

            .voice-notification.show {
                transform: translateX(0);
            }

            .voice-notification-success {
                border-left: 4px solid #10b981;
            }

            .voice-notification-error {
                border-left: 4px solid #ef4444;
            }

            .voice-notification-info {
                border-left: 4px solid #6366f1;
            }

            .voice-notification i {
                font-size: 20px;
            }

            .voice-notification-success i {
                color: #10b981;
            }

            .voice-notification-error i {
                color: #ef4444;
            }

            .voice-notification-info i {
                color: #6366f1;
            }

            @media (max-width: 768px) {
                .voice-widget-panel {
                    width: calc(100vw - 40px);
                    right: -10px;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize the voice service
let voiceService;
document.addEventListener('DOMContentLoaded', () => {
    voiceService = new MultiLanguageVoiceService();
    voiceService.init();
});
