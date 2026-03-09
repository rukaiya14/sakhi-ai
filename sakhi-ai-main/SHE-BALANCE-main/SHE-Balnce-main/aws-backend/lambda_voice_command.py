"""
AWS Lambda Function for Voice Command Processing
Uses Transcribe (language detection), Translate, and Polly
"""

import json
import boto3
import base64
import uuid
import time
from datetime import datetime

# Initialize AWS clients
s3_client = boto3.client('s3')
transcribe_client = boto3.client('transcribe')
translate_client = boto3.client('translate')
polly_client = boto3.client('polly')

# Configuration
S3_BUCKET = 'shebalance-voice-commands'  # Change to your bucket name
SUPPORTED_LANGUAGES = {
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
}

# Language code mapping for AWS services
TRANSCRIBE_LANGUAGE_CODES = {
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
}

POLLY_VOICES = {
    'en': {'VoiceId': 'Kajal', 'Engine': 'neural'},
    'hi': {'VoiceId': 'Kajal', 'Engine': 'neural'},
    'bn': {'VoiceId': 'Kajal', 'Engine': 'standard'},
    'ta': {'VoiceId': 'Kajal', 'Engine': 'standard'},
    'te': {'VoiceId': 'Kajal', 'Engine': 'standard'},
    'mr': {'VoiceId': 'Kajal', 'Engine': 'standard'},
    'gu': {'VoiceId': 'Kajal', 'Engine': 'standard'},
    'kn': {'VoiceId': 'Kajal', 'Engine': 'standard'},
    'ml': {'VoiceId': 'Kajal', 'Engine': 'standard'},
    'pa': {'VoiceId': 'Kajal', 'Engine': 'standard'}
}

def lambda_handler(event, context):
    """
    Main Lambda handler for voice command processing
    """
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        
        if action == 'process-voice-command':
            return process_voice_command(body)
        elif action == 'text-to-speech':
            return text_to_speech(body)
        elif action == 'check-transcription':
            return check_transcription_status(body)
        else:
            return {
                'statusCode': 400,
                'headers': get_cors_headers(),
                'body': json.dumps({'error': 'Invalid action'})
            }
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({'error': str(e)})
        }

def process_voice_command(body):
    """
    Process voice command with Transcribe, Translate, and intent detection
    """
    try:
        # Get audio data
        audio_base64 = body.get('audio')
        if not audio_base64:
            raise ValueError('No audio data provided')
        
        # Decode audio
        audio_data = base64.b64decode(audio_base64)
        
        # Generate unique ID
        command_id = str(uuid.uuid4())
        audio_key = f'voice-commands/{command_id}.webm'
        
        # Upload to S3
        s3_client.put_object(
            Bucket=S3_BUCKET,
            Key=audio_key,
            Body=audio_data,
            ContentType='audio/webm'
        )
        
        audio_uri = f's3://{S3_BUCKET}/{audio_key}'
        
        # Start transcription with automatic language detection
        job_name = f'voice-command-{command_id}'
        
        transcribe_client.start_transcription_job(
            TranscriptionJobName=job_name,
            Media={'MediaFileUri': audio_uri},
            MediaFormat='webm',
            IdentifyLanguage=True,  # Auto-detect language
            LanguageOptions=[
                'en-IN', 'hi-IN', 'bn-IN', 'ta-IN', 'te-IN',
                'mr-IN', 'gu-IN', 'kn-IN', 'ml-IN'
            ]
        )
        
        # Wait for transcription to complete (with timeout)
        max_attempts = 30
        for attempt in range(max_attempts):
            time.sleep(2)
            
            status = transcribe_client.get_transcription_job(
                TranscriptionJobName=job_name
            )
            
            job_status = status['TranscriptionJob']['TranscriptionJobStatus']
            
            if job_status == 'COMPLETED':
                # Get transcription result
                transcript_uri = status['TranscriptionJob']['Transcript']['TranscriptFileUri']
                
                # Download transcript
                import urllib.request
                with urllib.request.urlopen(transcript_uri) as response:
                    transcript_data = json.loads(response.read())
                
                # Extract text and language
                transcription = transcript_data['results']['transcripts'][0]['transcript']
                detected_language = transcript_data['results'].get('language_code', 'en-IN')
                
                # Convert language code (en-IN -> en)
                lang_code = detected_language.split('-')[0]
                
                print(f"Transcription: {transcription}")
                print(f"Detected Language: {detected_language}")
                
                # Translate to English if not English
                translation = transcription
                if lang_code != 'en':
                    try:
                        translate_response = translate_client.translate_text(
                            Text=transcription,
                            SourceLanguageCode=lang_code,
                            TargetLanguageCode='en'
                        )
                        translation = translate_response['TranslatedText']
                        print(f"Translation: {translation}")
                    except Exception as e:
                        print(f"Translation error: {str(e)}")
                
                # Detect intent
                intent = detect_intent(translation, transcription, lang_code)
                
                # Clean up
                transcribe_client.delete_transcription_job(TranscriptionJobName=job_name)
                
                return {
                    'statusCode': 200,
                    'headers': get_cors_headers(),
                    'body': json.dumps({
                        'success': True,
                        'transcription': transcription,
                        'translation': translation,
                        'detectedLanguage': SUPPORTED_LANGUAGES.get(lang_code, 'English'),
                        'languageCode': lang_code,
                        'intent': intent,
                        'commandId': command_id
                    })
                }
                
            elif job_status == 'FAILED':
                raise Exception('Transcription failed')
        
        # Timeout
        raise Exception('Transcription timeout')
        
    except Exception as e:
        print(f"Error processing voice command: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({'error': str(e)})
        }

def detect_intent(english_text, original_text, language):
    """
    Detect user intent from transcribed text
    """
    text_lower = english_text.lower()
    
    # Navigation intents
    navigation_keywords = {
        'dashboard': ['dashboard', 'home', 'main'],
        'ai_sakhi': ['sakhi', 'assistant', 'ai', 'help'],
        'skills': ['skill', 'talent', 'ability'],
        'opportunities': ['opportunity', 'job', 'work'],
        'food': ['food', 'marketplace', 'kitchen'],
        'community': ['community', 'group', 'forum'],
        'progress': ['progress', 'growth', 'development'],
        'settings': ['setting', 'preference', 'configuration']
    }
    
    for page, keywords in navigation_keywords.items():
        if any(keyword in text_lower for keyword in keywords):
            return {
                'type': 'navigation',
                'action': 'navigate',
                'target': page,
                'confidence': 'high'
            }
    
    # Order update intent
    if any(word in text_lower for word in ['update', 'progress', 'complete', 'finish']):
        if any(word in text_lower for word in ['order', 'work', 'project']):
            return {
                'type': 'order_action',
                'action': 'update_order',
                'confidence': 'medium'
            }
    
    # Payment request intent
    if any(word in text_lower for word in ['payment', 'money', 'pay', 'advance']):
        return {
            'type': 'payment_action',
            'action': 'request_payment',
            'confidence': 'medium'
        }
    
    # Balance check intent
    if any(word in text_lower for word in ['balance', 'time', 'hours']):
        return {
            'type': 'info_request',
            'action': 'check_balance',
            'confidence': 'low'
        }
    
    # No specific intent detected
    return {
        'type': 'unknown',
        'action': None,
        'confidence': 'low'
    }

def text_to_speech(body):
    """
    Convert text to speech using Amazon Polly
    """
    try:
        text = body.get('text')
        language = body.get('language', 'English')
        
        if not text:
            raise ValueError('No text provided')
        
        # Get language code
        lang_code = None
        for code, name in SUPPORTED_LANGUAGES.items():
            if name.lower() == language.lower():
                lang_code = code
                break
        
        if not lang_code:
            lang_code = 'en'
        
        # Get Polly voice settings
        voice_settings = POLLY_VOICES.get(lang_code, POLLY_VOICES['en'])
        
        # Generate speech
        response = polly_client.synthesize_speech(
            Text=text,
            OutputFormat='mp3',
            VoiceId=voice_settings['VoiceId'],
            Engine=voice_settings['Engine'],
            LanguageCode=TRANSCRIBE_LANGUAGE_CODES.get(lang_code, 'en-IN')
        )
        
        # Upload to S3
        audio_key = f'tts/{uuid.uuid4()}.mp3'
        s3_client.put_object(
            Bucket=S3_BUCKET,
            Key=audio_key,
            Body=response['AudioStream'].read(),
            ContentType='audio/mpeg'
        )
        
        # Generate presigned URL
        audio_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': S3_BUCKET, 'Key': audio_key},
            ExpiresIn=3600
        )
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'success': True,
                'audioUrl': audio_url
            })
        }
        
    except Exception as e:
        print(f"Error in text-to-speech: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({'error': str(e)})
        }

def check_transcription_status(body):
    """
    Check status of transcription job
    """
    try:
        job_name = body.get('jobName')
        
        status = transcribe_client.get_transcription_job(
            TranscriptionJobName=job_name
        )
        
        job_status = status['TranscriptionJob']['TranscriptionJobStatus']
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'status': job_status,
                'jobName': job_name
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({'error': str(e)})
        }

def get_cors_headers():
    """
    Get CORS headers for response
    """
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    }
