/**
 * Voice Command System with AWS Transcribe, Polly, and Translate
 * Auto-detects language and supports navigation commands
 */

class VoiceCommandAWS {
    constructor() {
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.apiEndpoint = 'http://localhost:5000/api/voice-command';
        
        // Navigation commands in multiple languages
        this.navigationCommands = {
            'en': {
                'dashboard': ['dashboard', 'home', 'main page'],
                'ai sakhi': ['ai sakhi', 'sakhi', 'assistant', 'ai assistant'],
                'skills': ['skills', 'my skills', 'skill page'],
                'opportunities': ['opportunities', 'jobs', 'work'],
                'food marketplace': ['food', 'marketplace', 'food marketplace'],
                'community': ['community', 'group', 'forum'],
                'progress': ['progress', 'growth', 'my progress'],
                'settings': ['settings', 'preferences', 'configuration']
            },
            'hi': {
                'dashboard': ['डैशबोर्ड', 'होम', 'मुख्य पृष्ठ'],
                'ai sakhi': ['एआई सखी', 'सखी', 'सहायक'],
                'skills': ['कौशल', 'मेरे कौशल'],
                'opportunities': ['अवसर', 'नौकरी', 'काम'],
                'food marketplace': ['खाद्य', 'बाज़ार', 'खाद्य बाज़ार'],
                'community': ['समुदाय', 'समूह'],
                'progress': ['प्रगति', 'विकास'],
                'settings': ['सेटिंग', 'प्राथमिकताएं']
            },
            'bn': {
                'dashboard': ['ড্যাশবোর্ড', 'হোম', 'মূল পৃষ্ঠা'],
                'ai sakhi': ['এআই সখি', 'সখি', 'সহায়ক'],
                'skills': ['দক্ষতা', 'আমার দক্ষতা'],
                'opportunities': ['সুযোগ', 'চাকরি', 'কাজ'],
                'food marketplace': ['খাদ্য', 'বাজার'],
                'community': ['সম্প্রদায়', 'গ্রুপ'],
                'progress': ['অগ্রগতি', 'উন্নয়ন'],
                'settings': ['সেটিংস', 'পছন্দ']
            },
            'ta': {
                'dashboard': ['டாஷ்போர்டு', 'ஹோம்', 'முதன்மை பக்கம்'],
                'ai sakhi': ['ஏஐ சகி', 'சகி', 'உதவியாளர்'],
                'skills': ['திறன்கள்', 'எனது திறன்கள்'],
                'opportunities': ['வாய்ப்புகள்', 'வேலை'],
                'food marketplace': ['உணவு', 'சந்தை'],
                'community': ['சமூகம்', 'குழு'],
                'progress': ['முன்னேற்றம்', 'வளர்ச்சி'],
                'settings': ['அமைப்புகள்']
            },
            'te': {
                'dashboard': ['డాష్‌బోర్డ్', 'హోమ్', 'ప్రధాన పేజీ'],
                'ai sakhi': ['ఏఐ సఖి', 'సఖి', 'సహాయకుడు'],
                'skills': ['నైపుణ్యాలు', 'నా నైపుణ్యాలు'],
                'opportunities': ['అవకాశాలు', 'ఉద్యోగం'],
                'food marketplace': ['ఆహారం', 'మార్కెట్'],
                'community': ['సంఘం', 'గ్రూప్'],
                'progress': ['పురోగతి', 'అభివృద్ధి'],
                'settings': ['సెట్టింగ్‌లు']
            },
            'mr': {
                'dashboard': ['डॅशबोर्ड', 'होम', 'मुख्य पृष्ठ'],
                'ai sakhi': ['एआय सखी', 'सखी', 'सहाय्यक'],
                'skills': ['कौशल्ये', 'माझी कौशल्ये'],
                'opportunities': ['संधी', 'नोकरी'],
                'food marketplace': ['अन्न', 'बाजार'],
                'community': ['समुदाय', 'गट'],
                'progress': ['प्रगती', 'विकास'],
                'settings': ['सेटिंग्ज']
            },
            'gu': {
                'dashboard': ['ડેશબોર્ડ', 'હોમ', 'મુખ્ય પૃષ્ઠ'],
                'ai sakhi': ['એઆઈ સખી', 'સખી', 'સહાયક'],
                'skills': ['કુશળતા', 'મારી કુશળતા'],
                'opportunities': ['તકો', 'નોકરી'],
                'food marketplace': ['ખાદ્ય', 'બજાર'],
                'community': ['સમુદાય', 'જૂથ'],
                'progress': ['પ્રગતિ', 'વિકાસ'],
                'settings': ['સેટિંગ્સ']
            }
        };
        
        // Page URLs
        this.pageUrls = {
            'dashboard': 'dashboard.html',
            'ai sakhi': '#ai-sakhi',
            'skills': 'skills.html',
            'opportunities': 'opportunities.html',
            'food marketplace': 'food-marketplace.html',
            'community': 'community.html',
            'progress': 'progress.html',
            'settings': 'dashboard.html'
        };
    }

    /**
     * Initialize voice command system
     */
    async initialize() {
        try {
            // Check browser support
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Your browser does not support audio recording');
            }

            console.log('✅ Voice Command System initialized');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize voice command:', error);
            throw error;
        }
    }

    /**
     * Start voice recording
     */
    async startRecording() {
        try {
            if (this.isRecording) {
                console.log('Already recording');
                return;
            }

            // Request microphone permission
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    channelCount: 1,
                    sampleRate: 16000
                } 
            });
            
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm'
            });
            
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.start();
            this.isRecording = true;
            
            console.log('🎤 Recording started...');
            this.updateUI('recording');

            return true;
        } catch (error) {
            console.error('❌ Failed to start recording:', error);
            this.showError('Failed to access microphone. Please check permissions.');
            throw error;
        }
    }

    /**
     * Stop voice recording and process
     */
    async stopRecording() {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder || !this.isRecording) {
                reject(new Error('No active recording'));
                return;
            }

            this.mediaRecorder.onstop = async () => {
                try {
                    // Stop all tracks
                    this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
                    
                    // Create audio blob
                    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                    
                    this.isRecording = false;
                    console.log('🎤 Recording stopped');
                    
                    this.updateUI('processing');
                    
                    // Process the audio
                    const result = await this.processAudio(audioBlob);
                    resolve(result);
                    
                } catch (error) {
                    console.error('❌ Error processing audio:', error);
                    this.updateUI('idle');
                    reject(error);
                }
            };

            this.mediaRecorder.stop();
        });
    }

    /**
     * Process audio with AWS Transcribe, Translate, and Polly
     */
    async processAudio(audioBlob) {
        try {
            // Convert blob to base64
            const base64Audio = await this.blobToBase64(audioBlob);
            
            // Get auth token
            const token = localStorage.getItem('shebalance_token');
            if (!token) {
                throw new Error('Not authenticated');
            }

            // Send to backend for processing
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    audio: base64Audio,
                    action: 'process-voice-command'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to process voice command');
            }

            const data = await response.json();
            
            console.log('📝 Transcription:', data.transcription);
            console.log('🌍 Detected Language:', data.detectedLanguage);
            console.log('🔄 Translation:', data.translation);
            
            // Handle the command
            await this.handleCommand(data);
            
            this.updateUI('idle');
            return data;
            
        } catch (error) {
            console.error('❌ Error processing audio:', error);
            this.updateUI('idle');
            this.showError('Failed to process voice command. Please try again.');
            throw error;
        }
    }

    /**
     * Handle voice command
     */
    async handleCommand(data) {
        const { transcription, translation, detectedLanguage, intent } = data;
        
        // Show feedback
        this.showFeedback(transcription, detectedLanguage);
        
        // Check for navigation command
        const command = this.detectNavigationCommand(translation || transcription, detectedLanguage);
        
        if (command) {
            console.log('🎯 Navigation command detected:', command);
            
            // Speak confirmation in user's language
            await this.speakConfirmation(command, detectedLanguage);
            
            // Navigate after a short delay
            setTimeout(() => {
                this.navigateToPage(command);
            }, 1500);
        } else if (intent && intent.action) {
            // Handle other intents (order update, payment request, etc.)
            console.log('🎯 Intent detected:', intent.action);
            await this.handleIntent(intent, detectedLanguage);
        } else {
            // No specific command detected
            this.showMessage('Command not recognized. Please try again.', detectedLanguage);
        }
    }

    /**
     * Detect navigation command from text
     */
    detectNavigationCommand(text, language) {
        const lowerText = text.toLowerCase().trim();
        const langCode = this.getLanguageCode(language);
        
        console.log('🔍 Detecting command from:', lowerText);
        console.log('🌍 Language:', language, '(' + langCode + ')');
        
        // Try all language commands for better matching
        const allCommands = [
            this.navigationCommands[langCode] || {},
            this.navigationCommands['en'] || {}
        ];
        
        // Score-based matching for better accuracy
        let bestMatch = null;
        let bestScore = 0;
        
        for (const commands of allCommands) {
            for (const [page, keywords] of Object.entries(commands)) {
                for (const keyword of keywords) {
                    const keywordLower = keyword.toLowerCase();
                    
                    // Exact match gets highest score
                    if (lowerText === keywordLower) {
                        console.log('✅ Exact match found:', page);
                        return page;
                    }
                    
                    // Contains match
                    if (lowerText.includes(keywordLower)) {
                        const score = keywordLower.length / lowerText.length;
                        if (score > bestScore) {
                            bestScore = score;
                            bestMatch = page;
                        }
                    }
                    
                    // Reverse contains (keyword contains text)
                    if (keywordLower.includes(lowerText) && lowerText.length > 3) {
                        const score = lowerText.length / keywordLower.length;
                        if (score > bestScore) {
                            bestScore = score;
                            bestMatch = page;
                        }
                    }
                }
            }
        }
        
        if (bestMatch && bestScore > 0.3) {
            console.log('✅ Best match found:', bestMatch, 'Score:', bestScore);
            return bestMatch;
        }
        
        console.log('❌ No command matched');
        return null;
    }

    /**
     * Navigate to page
     */
    navigateToPage(command) {
        const url = this.pageUrls[command];
        
        if (url) {
            if (url.startsWith('#')) {
                // Handle special cases like AI Sakhi panel
                if (url === '#ai-sakhi') {
                    if (typeof openAISakhi === 'function') {
                        openAISakhi();
                    }
                }
            } else {
                // Navigate to page
                window.location.href = url;
            }
        }
    }

    /**
     * Speak confirmation in user's language
     */
    async speakConfirmation(command, language) {
        try {
            const confirmations = {
                'en': `Opening ${command}`,
                'hi': `${command} खोल रहे हैं`,
                'bn': `${command} খুলছি`,
                'ta': `${command} திறக்கிறது`,
                'te': `${command} తెరుస్తోంది`,
                'mr': `${command} उघडत आहे`,
                'gu': `${command} ખોલી રહ્યા છીએ`
            };
            
            const langCode = this.getLanguageCode(language);
            const text = confirmations[langCode] || confirmations['en'];
            
            // Request TTS from backend
            const token = localStorage.getItem('shebalance_token');
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    action: 'text-to-speech',
                    text: text,
                    language: language
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.audioUrl) {
                    await this.playAudio(data.audioUrl);
                }
            }
        } catch (error) {
            console.error('Error speaking confirmation:', error);
        }
    }

    /**
     * Handle other intents
     */
    async handleIntent(intent, language) {
        // Handle different intent types
        switch (intent.action) {
            case 'update_order':
                // Open order update modal
                if (typeof showOrderUpdateModal === 'function') {
                    showOrderUpdateModal(intent.orderId);
                }
                break;
            case 'request_payment':
                // Open payment request modal
                if (typeof showPaymentRequestModal === 'function') {
                    showPaymentRequestModal();
                }
                break;
            case 'check_balance':
                // Show balance information
                this.showBalanceInfo();
                break;
            default:
                console.log('Unknown intent:', intent.action);
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
     * Convert blob to base64
     */
    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Get language code from full language name
     */
    getLanguageCode(language) {
        if (!language) return 'en';
        
        const lowerLang = language.toLowerCase();
        
        const mapping = {
            'english': 'en',
            'en-in': 'en',
            'en-us': 'en',
            'hindi': 'hi',
            'hi-in': 'hi',
            'bengali': 'bn',
            'bn-in': 'bn',
            'tamil': 'ta',
            'ta-in': 'ta',
            'telugu': 'te',
            'te-in': 'te',
            'marathi': 'mr',
            'mr-in': 'mr',
            'gujarati': 'gu',
            'gu-in': 'gu',
            'kannada': 'kn',
            'kn-in': 'kn',
            'malayalam': 'ml',
            'ml-in': 'ml',
            'punjabi': 'pa',
            'pa-in': 'pa'
        };
        
        return mapping[lowerLang] || 'en';
    }

    /**
     * Update UI based on state
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
                if (voiceText) voiceText.textContent = 'Recording...';
                break;
            case 'processing':
                voiceBtn.classList.remove('recording');
                voiceBtn.classList.add('processing');
                if (voiceIcon) voiceIcon.className = 'fas fa-spinner fa-spin';
                if (voiceText) voiceText.textContent = 'Processing...';
                break;
            case 'idle':
            default:
                voiceBtn.classList.remove('recording', 'processing');
                if (voiceIcon) voiceIcon.className = 'fas fa-microphone';
                if (voiceText) voiceText.textContent = 'Voice Command';
                break;
        }
    }

    /**
     * Show feedback message
     */
    showFeedback(text, language) {
        const feedback = document.createElement('div');
        feedback.className = 'voice-feedback';
        feedback.innerHTML = `
            <div class="voice-feedback-content">
                <i class="fas fa-check-circle"></i>
                <div>
                    <strong>Heard:</strong> "${text}"
                    <br>
                    <small>Language: ${language}</small>
                </div>
            </div>
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            feedback.classList.remove('show');
            setTimeout(() => feedback.remove(), 300);
        }, 3000);
    }

    /**
     * Show error message
     */
    showError(message) {
        const error = document.createElement('div');
        error.className = 'voice-error';
        error.innerHTML = `
            <div class="voice-error-content">
                <i class="fas fa-exclamation-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(error);
        
        setTimeout(() => {
            error.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            error.classList.remove('show');
            setTimeout(() => error.remove(), 300);
        }, 3000);
    }

    /**
     * Show message
     */
    showMessage(message, language) {
        alert(message);
    }
}

// Initialize voice command system
let voiceCommandSystem = null;

async function initVoiceCommand() {
    try {
        voiceCommandSystem = new VoiceCommandAWS();
        await voiceCommandSystem.initialize();
        console.log('✅ Voice Command System ready');
    } catch (error) {
        console.error('❌ Failed to initialize voice command:', error);
    }
}

/**
 * Start voice command (called from button)
 */
async function startVoiceCommand() {
    try {
        if (!voiceCommandSystem) {
            await initVoiceCommand();
        }
        
        if (voiceCommandSystem.isRecording) {
            // Stop recording
            await voiceCommandSystem.stopRecording();
        } else {
            // Start recording
            await voiceCommandSystem.startRecording();
        }
    } catch (error) {
        console.error('❌ Voice command error:', error);
        alert('Voice command failed. Please try again.');
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVoiceCommand);
} else {
    initVoiceCommand();
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.startVoiceCommand = startVoiceCommand;
    window.voiceCommandSystem = voiceCommandSystem;
}
