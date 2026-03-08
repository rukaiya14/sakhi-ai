/**
 * Voice Services Frontend Integration
 * Handles voice recording, playback, translation, and multi-language support
 */

class VoiceServices {
    constructor(apiEndpoint, authToken) {
        this.apiEndpoint = apiEndpoint || 'https://your-api-gateway-url.amazonaws.com/prod';
        this.authToken = authToken;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.currentLanguage = 'en';
        this.supportedLanguages = {
            'en': 'English',
            'hi': 'हिंदी (Hindi)',
            'bn': 'বাংলা (Bengali)',
            'te': 'తెలుగు (Telugu)',
            'ta': 'தமிழ் (Tamil)',
            'mr': 'मराठी (Marathi)',
            'gu': 'ગુજરાતી (Gujarati)',
            'kn': 'ಕನ್ನಡ (Kannada)',
            'ml': 'മലയാളം (Malayalam)',
            'pa': 'ਪੰਜਾਬੀ (Punjabi)',
            'ur': 'اردو (Urdu)'
        };
    }

    /**
     * Initialize voice services
     */
    async initialize() {
        try {
            // Check browser support
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Your browser does not support audio recording');
            }

            // Request microphone permission
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop()); // Stop immediately after permission

            console.log('Voice services initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize voice services:', error);
            throw error;
        }
    }

    /**
     * Start recording audio
     */
    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.start();
            console.log('Recording started');

            return true;
        } catch (error) {
            console.error('Failed to start recording:', error);
            throw error;
        }
    }

    /**
     * Stop recording audio
     */
    async stopRecording() {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder) {
                reject(new Error('No active recording'));
                return;
            }

            this.mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/mp3' });
                
                // Stop all tracks
                this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
                
                console.log('Recording stopped');
                resolve(audioBlob);
            };

            this.mediaRecorder.stop();
        });
    }

    /**
     * Convert text to speech
     */
    async textToSpeech(text, language = null) {
        try {
            const lang = language || this.currentLanguage;

            const response = await fetch(`${this.apiEndpoint}/voice-services`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: JSON.stringify({
                    action: 'text-to-speech',
                    text: text,
                    language: lang,
                    userId: this.getUserId()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to convert text to speech');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Text-to-speech error:', error);
            throw error;
        }
    }

    /**
     * Convert speech to text
     */
    async speechToText(audioBlob, language = null) {
        try {
            const lang = language || this.currentLanguage;

            // Upload audio to S3 first (you'll need to implement this)
            const audioUrl = await this.uploadAudio(audioBlob);

            const response = await fetch(`${this.apiEndpoint}/voice-services`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: JSON.stringify({
                    action: 'speech-to-text',
                    audioUrl: audioUrl,
                    language: lang,
                    userId: this.getUserId()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to convert speech to text');
            }

            const data = await response.json();
            
            // Poll for transcription completion
            if (data.jobName) {
                return await this.pollTranscriptionStatus(data.jobName);
            }

            return data;
        } catch (error) {
            console.error('Speech-to-text error:', error);
            throw error;
        }
    }

    /**
     * Poll transcription status
     */
    async pollTranscriptionStatus(jobName, maxAttempts = 30) {
        for (let i = 0; i < maxAttempts; i++) {
            await this.sleep(2000); // Wait 2 seconds

            const response = await fetch(`${this.apiEndpoint}/voice-services`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: JSON.stringify({
                    action: 'transcribe-status',
                    jobName: jobName
                })
            });

            const data = await response.json();

            if (data.status === 'COMPLETED') {
                return data;
            } else if (data.status === 'FAILED') {
                throw new Error(data.error || 'Transcription failed');
            }
        }

        throw new Error('Transcription timeout');
    }

    /**
     * Translate text
     */
    async translateText(text, targetLanguage, sourceLanguage = 'auto') {
        try {
            const response = await fetch(`${this.apiEndpoint}/voice-services`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: JSON.stringify({
                    action: 'translate',
                    text: text,
                    sourceLanguage: sourceLanguage,
                    targetLanguage: targetLanguage
                })
            });

            if (!response.ok) {
                throw new Error('Failed to translate text');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Translation error:', error);
            throw error;
        }
    }

    /**
     * Create voice message with translation
     */
    async createVoiceMessage(text, targetLanguage, sourceLanguage = null) {
        try {
            const srcLang = sourceLanguage || this.currentLanguage;

            const response = await fetch(`${this.apiEndpoint}/voice-services`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: JSON.stringify({
                    action: 'voice-message',
                    text: text,
                    sourceLanguage: srcLang,
                    targetLanguage: targetLanguage,
                    userId: this.getUserId()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create voice message');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Create voice message error:', error);
            throw error;
        }
    }

    /**
     * Play audio from URL
     */
    async playAudio(audioUrl) {
        return new Promise((resolve, reject) => {
            const audio = new Audio(audioUrl);
            
            audio.onended = () => resolve();
            audio.onerror = (error) => reject(error);
            
            audio.play().catch(reject);
        });
    }

    /**
     * Upload audio to S3 (via backend)
     */
    async uploadAudio(audioBlob) {
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.mp3');
            formData.append('userId', this.getUserId());

            const response = await fetch(`${this.apiEndpoint}/upload-audio`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to upload audio');
            }

            const data = await response.json();
            return data.audioUrl;
        } catch (error) {
            console.error('Upload audio error:', error);
            throw error;
        }
    }

    /**
     * Set current language
     */
    setLanguage(language) {
        if (this.supportedLanguages[language]) {
            this.currentLanguage = language;
            console.log(`Language set to: ${this.supportedLanguages[language]}`);
        } else {
            console.warn(`Unsupported language: ${language}`);
        }
    }

    /**
     * Get current language
     */
    getLanguage() {
        return this.currentLanguage;
    }

    /**
     * Get supported languages
     */
    getSupportedLanguages() {
        return this.supportedLanguages;
    }

    /**
     * Get user ID from localStorage
     */
    getUserId() {
        const userData = localStorage.getItem('shebalance_user');
        if (userData) {
            const user = JSON.parse(userData);
            return user.userId;
        }
        return 'anonymous';
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoiceServices;
}
