/**
 * Voice Services Routes for Backend Server
 * Integrates AWS Polly, Transcribe, and Translate
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { initializeAWSv2 } = require('./utils/aws-clients');

// AWS clients (will be initialized asynchronously)
let polly, transcribe, translate, s3, dynamodb;

// Initialize AWS clients on module load
(async () => {
    try {
        const clients = await initializeAWSv2();
        polly = clients.Polly;
        transcribe = clients.TranscribeService;
        translate = clients.Translate;
        s3 = clients.S3;
        dynamodb = clients.DynamoDB;
        console.log('✅ Voice services AWS clients initialized with Secrets Manager');
    } catch (error) {
        console.error('❌ Failed to initialize voice services AWS clients:', error.message);
    }
})();

// Configuration
const S3_BUCKET = process.env.S3_BUCKET || 'shebalance-voice-files';
const AUDIO_TABLE = process.env.AUDIO_TABLE || 'shebalance-audio-files';

// Multer configuration for audio uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /mp3|wav|ogg|webm|m4a/;
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed!'));
        }
    }
});

// Supported languages
const SUPPORTED_LANGUAGES = {
    'en': { name: 'English', pollyVoice: 'Joanna', pollyEngine: 'neural' },
    'hi': { name: 'Hindi', pollyVoice: 'Aditi', pollyEngine: 'standard' },
    'bn': { name: 'Bengali', pollyVoice: 'Aditi', pollyEngine: 'standard' },
    'te': { name: 'Telugu', pollyVoice: 'Aditi', pollyEngine: 'standard' },
    'ta': { name: 'Tamil', pollyVoice: 'Aditi', pollyEngine: 'standard' },
    'mr': { name: 'Marathi', pollyVoice: 'Aditi', pollyEngine: 'standard' },
    'gu': { name: 'Gujarati', pollyVoice: 'Aditi', pollyEngine: 'standard' },
    'kn': { name: 'Kannada', pollyVoice: 'Aditi', pollyEngine: 'standard' },
    'ml': { name: 'Malayalam', pollyVoice: 'Aditi', pollyEngine: 'standard' },
    'pa': { name: 'Punjabi', pollyVoice: 'Aditi', pollyEngine: 'standard' },
    'ur': { name: 'Urdu', pollyVoice: 'Aditi', pollyEngine: 'standard' }
};

// ==================== TEXT TO SPEECH ====================

router.post('/text-to-speech', async (req, res) => {
    try {
        const { text, language = 'en' } = req.body;
        const userId = req.user?.userId || 'anonymous';

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // Get language configuration
        const langConfig = SUPPORTED_LANGUAGES[language] || SUPPORTED_LANGUAGES['en'];

        // Generate speech using Polly
        const pollyParams = {
            Text: text,
            OutputFormat: 'mp3',
            VoiceId: langConfig.pollyVoice,
            Engine: langConfig.pollyEngine
        };

        const pollyResponse = await polly.synthesizeSpeech(pollyParams).promise();

        // Save audio to S3
        const audioId = uuidv4();
        const s3Key = `audio/${userId}/${audioId}.mp3`;

        await s3.putObject({
            Bucket: S3_BUCKET,
            Key: s3Key,
            Body: pollyResponse.AudioStream,
            ContentType: 'audio/mpeg'
        }).promise();

        // Generate presigned URL (valid for 1 hour)
        const audioUrl = s3.getSignedUrl('getObject', {
            Bucket: S3_BUCKET,
            Key: s3Key,
            Expires: 3600
        });

        // Save metadata to DynamoDB
        await dynamodb.put({
            TableName: AUDIO_TABLE,
            Item: {
                audioId,
                userId,
                type: 'text-to-speech',
                language,
                text,
                s3Key,
                createdAt: new Date().toISOString(),
                expiresAt: Math.floor(Date.now() / 1000) + 86400 // 24 hours
            }
        }).promise();

        res.json({
            audioId,
            audioUrl,
            language,
            message: 'Audio generated successfully'
        });

    } catch (error) {
        console.error('Text-to-speech error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== UPLOAD AUDIO ====================

router.post('/upload-audio', upload.single('audio'), async (req, res) => {
    try {
        const userId = req.user?.userId || req.body.userId || 'anonymous';

        if (!req.file) {
            return res.status(400).json({ error: 'Audio file is required' });
        }

        // Upload to S3
        const audioId = uuidv4();
        const s3Key = `recordings/${userId}/${audioId}.mp3`;

        await s3.putObject({
            Bucket: S3_BUCKET,
            Key: s3Key,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        }).promise();

        // Generate presigned URL
        const audioUrl = s3.getSignedUrl('getObject', {
            Bucket: S3_BUCKET,
            Key: s3Key,
            Expires: 3600
        });

        // Save metadata
        await dynamodb.put({
            TableName: AUDIO_TABLE,
            Item: {
                audioId,
                userId,
                type: 'recording',
                s3Key,
                createdAt: new Date().toISOString()
            }
        }).promise();

        res.json({
            audioId,
            audioUrl,
            message: 'Audio uploaded successfully'
        });

    } catch (error) {
        console.error('Upload audio error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== SPEECH TO TEXT ====================

router.post('/speech-to-text', async (req, res) => {
    try {
        const { audioUrl, language = 'en' } = req.body;
        const userId = req.user?.userId || 'anonymous';

        if (!audioUrl) {
            return res.status(400).json({ error: 'Audio URL is required' });
        }

        // Map language codes for Transcribe
        const transcribeLanguageMap = {
            'en': 'en-US',
            'hi': 'hi-IN',
            'bn': 'bn-IN',
            'te': 'te-IN',
            'ta': 'ta-IN',
            'mr': 'mr-IN',
            'gu': 'gu-IN',
            'kn': 'kn-IN',
            'ml': 'ml-IN',
            'pa': 'pa-IN',
            'ur': 'ur-IN'
        };

        const transcribeLanguage = transcribeLanguageMap[language] || 'en-US';
        const jobName = `transcribe-${userId}-${uuidv4()}`;

        // Start transcription job
        await transcribe.startTranscriptionJob({
            TranscriptionJobName: jobName,
            Media: { MediaFileUri: audioUrl },
            MediaFormat: 'mp3',
            LanguageCode: transcribeLanguage
        }).promise();

        // Save job info
        await dynamodb.put({
            TableName: AUDIO_TABLE,
            Item: {
                audioId: jobName,
                userId,
                type: 'speech-to-text',
                language,
                jobName,
                status: 'IN_PROGRESS',
                audioUrl,
                createdAt: new Date().toISOString()
            }
        }).promise();

        res.json({
            jobName,
            status: 'IN_PROGRESS',
            message: 'Transcription job started'
        });

    } catch (error) {
        console.error('Speech-to-text error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== CHECK TRANSCRIPTION STATUS ====================

router.get('/transcription-status/:jobName', async (req, res) => {
    try {
        const { jobName } = req.params;

        // Get job status
        const response = await transcribe.getTranscriptionJob({
            TranscriptionJobName: jobName
        }).promise();

        const job = response.TranscriptionJob;
        const status = job.TranscriptionJobStatus;

        const result = {
            jobName,
            status
        };

        if (status === 'COMPLETED') {
            // Get transcript
            const transcriptUri = job.Transcript.TranscriptFileUri;
            const https = require('https');

            const transcriptData = await new Promise((resolve, reject) => {
                https.get(transcriptUri, (response) => {
                    let data = '';
                    response.on('data', chunk => data += chunk);
                    response.on('end', () => resolve(JSON.parse(data)));
                    response.on('error', reject);
                });
            });

            const text = transcriptData.results.transcripts[0].transcript;
            const confidence = transcriptData.results.items[0]?.alternatives[0]?.confidence || 0;

            result.text = text;
            result.confidence = confidence;

            // Update DynamoDB
            await dynamodb.update({
                TableName: AUDIO_TABLE,
                Key: { audioId: jobName },
                UpdateExpression: 'SET #status = :status, transcribedText = :text',
                ExpressionAttributeNames: { '#status': 'status' },
                ExpressionAttributeValues: {
                    ':status': 'COMPLETED',
                    ':text': text
                }
            }).promise();

        } else if (status === 'FAILED') {
            result.error = job.FailureReason || 'Unknown error';
        }

        res.json(result);

    } catch (error) {
        console.error('Check transcription status error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== TRANSLATE TEXT ====================

router.post('/translate', async (req, res) => {
    try {
        const { text, sourceLanguage = 'auto', targetLanguage = 'en' } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // Translate text
        const response = await translate.translateText({
            Text: text,
            SourceLanguageCode: sourceLanguage,
            TargetLanguageCode: targetLanguage
        }).promise();

        res.json({
            originalText: text,
            translatedText: response.TranslatedText,
            sourceLanguage: response.SourceLanguageCode,
            targetLanguage: response.TargetLanguageCode
        });

    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== CREATE VOICE MESSAGE ====================

router.post('/voice-message', async (req, res) => {
    try {
        const { text, sourceLanguage = 'en', targetLanguage = 'hi' } = req.body;
        const userId = req.user?.userId || 'anonymous';

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // Step 1: Translate if needed
        let translatedText = text;
        if (sourceLanguage !== targetLanguage) {
            const translateResponse = await translate.translateText({
                Text: text,
                SourceLanguageCode: sourceLanguage,
                TargetLanguageCode: targetLanguage
            }).promise();
            translatedText = translateResponse.TranslatedText;
        }

        // Step 2: Convert to speech
        const langConfig = SUPPORTED_LANGUAGES[targetLanguage] || SUPPORTED_LANGUAGES['en'];

        const pollyResponse = await polly.synthesizeSpeech({
            Text: translatedText,
            OutputFormat: 'mp3',
            VoiceId: langConfig.pollyVoice,
            Engine: langConfig.pollyEngine
        }).promise();

        // Step 3: Save to S3
        const audioId = uuidv4();
        const s3Key = `voice-messages/${userId}/${audioId}.mp3`;

        await s3.putObject({
            Bucket: S3_BUCKET,
            Key: s3Key,
            Body: pollyResponse.AudioStream,
            ContentType: 'audio/mpeg'
        }).promise();

        // Generate presigned URL
        const audioUrl = s3.getSignedUrl('getObject', {
            Bucket: S3_BUCKET,
            Key: s3Key,
            Expires: 3600
        });

        // Save to DynamoDB
        await dynamodb.put({
            TableName: AUDIO_TABLE,
            Item: {
                audioId,
                userId,
                type: 'voice-message',
                originalText: text,
                translatedText,
                sourceLanguage,
                targetLanguage,
                s3Key,
                createdAt: new Date().toISOString()
            }
        }).promise();

        res.json({
            audioId,
            audioUrl,
            originalText: text,
            translatedText,
            sourceLanguage,
            targetLanguage,
            message: 'Voice message created successfully'
        });

    } catch (error) {
        console.error('Create voice message error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==================== GET SUPPORTED LANGUAGES ====================

router.get('/languages', (req, res) => {
    res.json({
        languages: SUPPORTED_LANGUAGES
    });
});

module.exports = router;
