/**
 * Voice Command Service - Backend Integration
 * Handles voice commands with AWS Transcribe, Translate, and Polly
 */

const { 
    TranscribeClient, 
    StartTranscriptionJobCommand,
    GetTranscriptionJobCommand,
    DeleteTranscriptionJobCommand
} = require('@aws-sdk/client-transcribe');

const { 
    TranslateClient, 
    TranslateTextCommand 
} = require('@aws-sdk/client-translate');

const { 
    PollyClient, 
    SynthesizeSpeechCommand 
} = require('@aws-sdk/client-polly');

const { 
    S3Client, 
    PutObjectCommand,
    GetObjectCommand 
} = require('@aws-sdk/client-s3');

const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const https = require('https');
const { 
    createTranscribeClient, 
    createTranslateClient, 
    createPollyClient, 
    createS3Client 
} = require('./utils/aws-clients');

// Initialize AWS clients (will be set asynchronously)
let transcribeClient, translateClient, pollyClient, s3Client;

// Initialize clients on module load
(async () => {
    try {
        transcribeClient = await createTranscribeClient();
        translateClient = await createTranslateClient();
        pollyClient = await createPollyClient();
        s3Client = await createS3Client();
        console.log('✅ Voice service AWS clients initialized with Secrets Manager');
    } catch (error) {
        console.error('❌ Failed to initialize voice service AWS clients:', error.message);
    }
})();

const S3_BUCKET = process.env.VOICE_BUCKET || 'shebalance-voice-' + Date.now();

// Language configurations
const SUPPORTED_LANGUAGES = {
    'en': 'English',
    'hi': 'Hindi',
    'bn': 'Bengali',
    'ta': 'Tamil',
    'te': 'Telugu',
    'mr': 'Marathi',
    'gu': 'Gujarati',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'pa': 'Punjabi'
};

const TRANSCRIBE_LANGUAGE_CODES = {
    'en': 'en-IN',
    'hi': 'hi-IN',
    'bn': 'bn-IN',
    'ta': 'ta-IN',
    'te': 'te-IN',
    'mr': 'mr-IN',
    'gu': 'gu-IN',
    'kn': 'kn-IN',
    'ml': 'ml-IN',
    'pa': 'pa-IN'
};

const POLLY_VOICES = {
    'en': { VoiceId: 'Kajal', Engine: 'neural' },
    'hi': { VoiceId: 'Kajal', Engine: 'neural' },
    'bn': { VoiceId: 'Kajal', Engine: 'standard' },
    'ta': { VoiceId: 'Kajal', Engine: 'standard' },
    'te': { VoiceId: 'Kajal', Engine: 'standard' },
    'mr': { VoiceId: 'Kajal', Engine: 'standard' },
    'gu': { VoiceId: 'Kajal', Engine: 'standard' },
    'kn': { VoiceId: 'Kajal', Engine: 'standard' },
    'ml': { VoiceId: 'Kajal', Engine: 'standard' },
    'pa': { VoiceId: 'Kajal', Engine: 'standard' }
};

/**
 * Process voice command
 */
async function processVoiceCommand(audioBase64) {
    try {
        console.log('🎤 Processing voice command...');
        
        // Decode audio
        const audioBuffer = Buffer.from(audioBase64, 'base64');
        
        // Generate unique ID
        const commandId = uuidv4();
        const audioKey = `voice-commands/${commandId}.webm`;
        
        // Upload to S3
        await s3Client.send(new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: audioKey,
            Body: audioBuffer,
            ContentType: 'audio/webm'
        }));
        
        console.log('✅ Audio uploaded to S3');
        
        const audioUri = `s3://${S3_BUCKET}/${audioKey}`;
        
        // Start transcription with automatic language detection
        const jobName = `voice-command-${commandId}`;
        
        await transcribeClient.send(new StartTranscriptionJobCommand({
            TranscriptionJobName: jobName,
            Media: { MediaFileUri: audioUri },
            MediaFormat: 'webm',
            IdentifyLanguage: true,
            LanguageOptions: [
                'en-IN', 'hi-IN', 'bn-IN', 'ta-IN', 'te-IN',
                'mr-IN', 'gu-IN', 'kn-IN', 'ml-IN'
            ]
        }));
        
        console.log('✅ Transcription job started');
        
        // Wait for transcription to complete
        const transcriptionResult = await waitForTranscription(jobName);
        
        console.log('📝 Transcription:', transcriptionResult.transcription);
        console.log('🌍 Detected Language:', transcriptionResult.detectedLanguage);
        
        // Translate to English if not English
        let translation = transcriptionResult.transcription;
        if (transcriptionResult.languageCode !== 'en') {
            try {
                const translateResponse = await translateClient.send(new TranslateTextCommand({
                    Text: transcriptionResult.transcription,
                    SourceLanguageCode: transcriptionResult.languageCode,
                    TargetLanguageCode: 'en'
                }));
                translation = translateResponse.TranslatedText;
                console.log('🔄 Translation:', translation);
            } catch (error) {
                console.error('Translation error:', error);
            }
        }
        
        // Detect intent
        const intent = detectIntent(translation, transcriptionResult.transcription, transcriptionResult.languageCode);
        
        // Clean up transcription job
        try {
            await transcribeClient.send(new DeleteTranscriptionJobCommand({
                TranscriptionJobName: jobName
            }));
        } catch (error) {
            console.error('Error deleting transcription job:', error);
        }
        
        return {
            success: true,
            transcription: transcriptionResult.transcription,
            translation: translation,
            detectedLanguage: SUPPORTED_LANGUAGES[transcriptionResult.languageCode] || 'English',
            languageCode: transcriptionResult.languageCode,
            intent: intent,
            commandId: commandId
        };
        
    } catch (error) {
        console.error('❌ Error processing voice command:', error);
        throw error;
    }
}

/**
 * Wait for transcription to complete
 */
async function waitForTranscription(jobName, maxAttempts = 30) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await sleep(2000);
        
        const response = await transcribeClient.send(new GetTranscriptionJobCommand({
            TranscriptionJobName: jobName
        }));
        
        const job = response.TranscriptionJob;
        const status = job.TranscriptionJobStatus;
        
        console.log(`Transcription attempt ${attempt + 1}/${maxAttempts}, Status: ${status}`);
        
        if (status === 'COMPLETED') {
            // Download transcript
            const transcriptUri = job.Transcript.TranscriptFileUri;
            const transcriptData = await downloadJson(transcriptUri);
            
            const transcription = transcriptData.results.transcripts[0].transcript;
            
            // Get detected language with better parsing
            let detectedLanguage = 'en-IN';
            let languageCode = 'en';
            
            // Check for language identification results
            if (transcriptData.results.language_identification) {
                const langResults = transcriptData.results.language_identification;
                if (langResults.length > 0) {
                    detectedLanguage = langResults[0].code;
                    languageCode = detectedLanguage.split('-')[0];
                    console.log('✅ Language identified:', detectedLanguage, 'Confidence:', langResults[0].score);
                }
            } else if (transcriptData.results.language_code) {
                detectedLanguage = transcriptData.results.language_code;
                languageCode = detectedLanguage.split('-')[0];
                console.log('✅ Language code:', detectedLanguage);
            }
            
            // Fallback: detect from script
            if (languageCode === 'en' && transcription) {
                languageCode = detectLanguageFromScript(transcription);
                console.log('🔍 Script-based detection:', languageCode);
            }
            
            return {
                transcription,
                detectedLanguage,
                languageCode
            };
        } else if (status === 'FAILED') {
            const failureReason = job.FailureReason || 'Unknown error';
            console.error('Transcription failed:', failureReason);
            throw new Error(`Transcription failed: ${failureReason}`);
        }
    }
    
    throw new Error('Transcription timeout');
}

/**
 * Detect language from script/characters
 */
function detectLanguageFromScript(text) {
    if (!text) return 'en';
    
    // Check for Devanagari (Hindi/Marathi)
    if (/[\u0900-\u097F]/.test(text)) {
        // Check for Marathi-specific characters
        if (/[\u0950\u0972]/.test(text)) return 'mr';
        return 'hi';
    }
    
    // Check for Bengali
    if (/[\u0980-\u09FF]/.test(text)) return 'bn';
    
    // Check for Tamil
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
    
    // Check for Telugu
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
    
    // Check for Gujarati
    if (/[\u0A80-\u0AFF]/.test(text)) return 'gu';
    
    // Check for Kannada
    if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';
    
    // Check for Malayalam
    if (/[\u0D00-\u0D7F]/.test(text)) return 'ml';
    
    // Check for Punjabi
    if (/[\u0A00-\u0A7F]/.test(text)) return 'pa';
    
    return 'en';
}

/**
 * Convert text to speech
 */
async function textToSpeech(text, language = 'English') {
    try {
        console.log(`🔊 Converting text to speech: "${text}" in ${language}`);
        
        // Get language code
        let langCode = 'en';
        for (const [code, name] of Object.entries(SUPPORTED_LANGUAGES)) {
            if (name.toLowerCase() === language.toLowerCase()) {
                langCode = code;
                break;
            }
        }
        
        // Get Polly voice settings
        const voiceSettings = POLLY_VOICES[langCode] || POLLY_VOICES['en'];
        
        // Generate speech
        const response = await pollyClient.send(new SynthesizeSpeechCommand({
            Text: text,
            OutputFormat: 'mp3',
            VoiceId: voiceSettings.VoiceId,
            Engine: voiceSettings.Engine,
            LanguageCode: TRANSCRIBE_LANGUAGE_CODES[langCode] || 'en-IN'
        }));
        
        // Convert stream to buffer
        const audioBuffer = await streamToBuffer(response.AudioStream);
        
        // Upload to S3
        const audioKey = `tts/${uuidv4()}.mp3`;
        await s3Client.send(new PutObjectCommand({
            Bucket: S3_BUCKET,
            Key: audioKey,
            Body: audioBuffer,
            ContentType: 'audio/mpeg'
        }));
        
        // Generate presigned URL
        const audioUrl = await getSignedUrl(
            s3Client,
            new GetObjectCommand({
                Bucket: S3_BUCKET,
                Key: audioKey
            }),
            { expiresIn: 3600 }
        );
        
        console.log('✅ Text-to-speech completed');
        
        return {
            success: true,
            audioUrl: audioUrl
        };
        
    } catch (error) {
        console.error('❌ Error in text-to-speech:', error);
        throw error;
    }
}

/**
 * Detect user intent from text
 */
function detectIntent(englishText, originalText, language) {
    const textLower = englishText.toLowerCase().trim();
    const originalLower = originalText.toLowerCase().trim();
    
    console.log('🎯 Detecting intent from:', textLower);
    console.log('📝 Original text:', originalLower);
    
    // Navigation intents with better keyword matching
    const navigationKeywords = {
        'dashboard': {
            en: ['dashboard', 'home', 'main', 'main page', 'go home', 'back home'],
            hi: ['डैशबोर्ड', 'होम', 'मुख्य', 'घर'],
            bn: ['ড্যাশবোর্ড', 'হোম', 'মূল'],
            ta: ['டாஷ்போர்டு', 'ஹோம்', 'முதன்மை'],
            te: ['డాష్‌బోర్డ్', 'హోమ్', 'ప్రధాన'],
            mr: ['डॅशबोर्ड', 'होम', 'मुख्य'],
            gu: ['ડેશબોર્ડ', 'હોમ', 'મુખ્ય']
        },
        'ai_sakhi': {
            en: ['sakhi', 'assistant', 'ai', 'help', 'ai sakhi', 'ai assistant'],
            hi: ['सखी', 'सहायक', 'मदद', 'एआई'],
            bn: ['সখি', 'সহায়ক'],
            ta: ['சகி', 'உதவியாளர்'],
            te: ['సఖి', 'సహాయకుడు'],
            mr: ['सखी', 'सहाय्यक'],
            gu: ['સખી', 'સહાયક']
        },
        'skills': {
            en: ['skill', 'skills', 'talent', 'ability', 'my skills'],
            hi: ['कौशल', 'स्किल'],
            bn: ['দক্ষতা'],
            ta: ['திறன்கள்'],
            te: ['నైపుణ్యాలు'],
            mr: ['कौशल्ये'],
            gu: ['કુશળતા']
        },
        'opportunities': {
            en: ['opportunity', 'opportunities', 'job', 'jobs', 'work', 'find work'],
            hi: ['अवसर', 'नौकरी', 'काम'],
            bn: ['সুযোগ', 'চাকরি', 'কাজ'],
            ta: ['வாய்ப்புகள்', 'வேலை'],
            te: ['అవకాశాలు', 'ఉద్యోగం'],
            mr: ['संधी', 'नोकरी'],
            gu: ['તકો', 'નોકરી']
        },
        'food': {
            en: ['food', 'marketplace', 'kitchen', 'food marketplace'],
            hi: ['खाद्य', 'बाज़ार', 'खाना'],
            bn: ['খাদ্য', 'বাজার'],
            ta: ['உணவு', 'சந்தை'],
            te: ['ఆహారం', 'మార్కెట్'],
            mr: ['अन्न', 'बाजार'],
            gu: ['ખાદ્ય', 'બજાર']
        },
        'community': {
            en: ['community', 'group', 'forum', 'social'],
            hi: ['समुदाय', 'समूह'],
            bn: ['সম্প্রদায়', 'গ্রুপ'],
            ta: ['சமூகம்', 'குழு'],
            te: ['సంఘం', 'గ్రూప్'],
            mr: ['समुदाय', 'गट'],
            gu: ['સમુદાય', 'જૂથ']
        },
        'progress': {
            en: ['progress', 'growth', 'development', 'my progress'],
            hi: ['प्रगति', 'विकास'],
            bn: ['অগ্রগতি', 'উন্নয়ন'],
            ta: ['முன்னேற்றம்', 'வளர்ச்சி'],
            te: ['పురోగతి', 'అభివృద్ధి'],
            mr: ['प्रगती', 'विकास'],
            gu: ['પ્રગતિ', 'વિકાસ']
        },
        'settings': {
            en: ['setting', 'settings', 'preference', 'preferences', 'configuration'],
            hi: ['सेटिंग', 'प्राथमिकताएं'],
            bn: ['সেটিংস', 'পছন্দ'],
            ta: ['அமைப்புகள்'],
            te: ['సెట్టింగ్‌లు'],
            mr: ['सेटिंग्ज'],
            gu: ['સેટિંગ્સ']
        }
    };
    
    // Score-based matching
    let bestMatch = null;
    let bestScore = 0;
    
    for (const [page, langKeywords] of Object.entries(navigationKeywords)) {
        const keywords = [
            ...(langKeywords.en || []),
            ...(langKeywords[language] || [])
        ];
        
        for (const keyword of keywords) {
            const keywordLower = keyword.toLowerCase();
            
            // Check both English translation and original text
            const texts = [textLower, originalLower];
            
            for (const text of texts) {
                // Exact match
                if (text === keywordLower) {
                    console.log('✅ Exact match:', page);
                    return {
                        type: 'navigation',
                        action: 'navigate',
                        target: page,
                        confidence: 'high'
                    };
                }
                
                // Contains match
                if (text.includes(keywordLower)) {
                    const score = keywordLower.length / text.length;
                    if (score > bestScore) {
                        bestScore = score;
                        bestMatch = page;
                    }
                }
                
                // Reverse contains
                if (keywordLower.includes(text) && text.length > 2) {
                    const score = text.length / keywordLower.length;
                    if (score > bestScore) {
                        bestScore = score;
                        bestMatch = page;
                    }
                }
            }
        }
    }
    
    if (bestMatch && bestScore > 0.3) {
        console.log('✅ Best navigation match:', bestMatch, 'Score:', bestScore);
        return {
            type: 'navigation',
            action: 'navigate',
            target: bestMatch,
            confidence: bestScore > 0.7 ? 'high' : 'medium'
        };
    }
    
    // Order update intent
    if (['update', 'progress', 'complete', 'finish'].some(word => textLower.includes(word))) {
        if (['order', 'work', 'project'].some(word => textLower.includes(word))) {
            return {
                type: 'order_action',
                action: 'update_order',
                confidence: 'medium'
            };
        }
    }
    
    // Payment request intent
    if (['payment', 'money', 'pay', 'advance'].some(word => textLower.includes(word))) {
        return {
            type: 'payment_action',
            action: 'request_payment',
            confidence: 'medium'
        };
    }
    
    // Balance check intent
    if (['balance', 'time', 'hours'].some(word => textLower.includes(word))) {
        return {
            type: 'info_request',
            action: 'check_balance',
            confidence: 'low'
        };
    }
    
    // No specific intent detected
    console.log('❌ No intent matched');
    return {
        type: 'unknown',
        action: null,
        confidence: 'low'
    };
}

/**
 * Download JSON from URL
 */
function downloadJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });
            response.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', reject);
    });
}

/**
 * Convert stream to buffer
 */
async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
}

/**
 * Sleep utility
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    processVoiceCommand,
    textToSpeech
};
