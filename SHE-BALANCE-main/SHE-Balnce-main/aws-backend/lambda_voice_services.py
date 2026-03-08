"""
AWS Lambda Function: Voice Services
Handles voice-to-text, text-to-voice, and translation using AWS Polly, Transcribe, and Translate
"""

import json
import boto3
import os
import uuid
from datetime import datetime
from decimal import Decimal

# Initialize AWS clients
polly = boto3.client('polly')
transcribe = boto3.client('transcribe')
translate = boto3.client('translate')
s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

# Configuration
S3_BUCKET = os.environ.get('S3_BUCKET', 'shebalance-voice-files')
AUDIO_TABLE = os.environ.get('AUDIO_TABLE', 'shebalance-audio-files')

# Supported languages
SUPPORTED_LANGUAGES = {
    'en': {'name': 'English', 'polly_voice': 'Joanna', 'polly_engine': 'neural'},
    'hi': {'name': 'Hindi', 'polly_voice': 'Aditi', 'polly_engine': 'standard'},
    'bn': {'name': 'Bengali', 'polly_voice': 'Aditi', 'polly_engine': 'standard'},
    'te': {'name': 'Telugu', 'polly_voice': 'Aditi', 'polly_engine': 'standard'},
    'ta': {'name': 'Tamil', 'polly_voice': 'Aditi', 'polly_engine': 'standard'},
    'mr': {'name': 'Marathi', 'polly_voice': 'Aditi', 'polly_engine': 'standard'},
    'gu': {'name': 'Gujarati', 'polly_voice': 'Aditi', 'polly_engine': 'standard'},
    'kn': {'name': 'Kannada', 'polly_voice': 'Aditi', 'polly_engine': 'standard'},
    'ml': {'name': 'Malayalam', 'polly_voice': 'Aditi', 'polly_engine': 'standard'},
    'pa': {'name': 'Punjabi', 'polly_voice': 'Aditi', 'polly_engine': 'standard'},
    'ur': {'name': 'Urdu', 'polly_voice': 'Aditi', 'polly_engine': 'standard'}
}


def lambda_handler(event, context):
    """Main Lambda handler"""
    try:
        # Parse request
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        
        if action == 'text-to-speech':
            return text_to_speech(body)
        elif action == 'speech-to-text':
            return speech_to_text(body)
        elif action == 'translate':
            return translate_text(body)
        elif action == 'voice-message':
            return create_voice_message(body)
        elif action == 'transcribe-status':
            return check_transcription_status(body)
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Invalid action'})
            }
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }


def text_to_speech(body):
    """Convert text to speech using AWS Polly"""
    try:
        text = body.get('text')
        language = body.get('language', 'en')
        user_id = body.get('userId')
        
        if not text:
            return error_response('Text is required', 400)
        
        # Get language configuration
        lang_config = SUPPORTED_LANGUAGES.get(language, SUPPORTED_LANGUAGES['en'])
        
        # Generate speech using Polly
        response = polly.synthesize_speech(
            Text=text,
            OutputFormat='mp3',
            VoiceId=lang_config['polly_voice'],
            Engine=lang_config['polly_engine'],
            LanguageCode=language if language in ['en-US', 'en-GB', 'en-IN', 'hi-IN'] else 'en-US'
        )
        
        # Save audio to S3
        audio_id = str(uuid.uuid4())
        s3_key = f"audio/{user_id}/{audio_id}.mp3"
        
        s3.put_object(
            Bucket=S3_BUCKET,
            Key=s3_key,
            Body=response['AudioStream'].read(),
            ContentType='audio/mpeg'
        )
        
        # Generate presigned URL (valid for 1 hour)
        audio_url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': S3_BUCKET, 'Key': s3_key},
            ExpiresIn=3600
        )
        
        # Save metadata to DynamoDB
        table = dynamodb.Table(AUDIO_TABLE)
        table.put_item(
            Item={
                'audioId': audio_id,
                'userId': user_id,
                'type': 'text-to-speech',
                'language': language,
                'text': text,
                's3Key': s3_key,
                'createdAt': datetime.utcnow().isoformat(),
                'expiresAt': int((datetime.utcnow().timestamp() + 86400))  # 24 hours
            }
        )
        
        return success_response({
            'audioId': audio_id,
            'audioUrl': audio_url,
            'language': language,
            'duration': response.get('RequestCharacters', 0) / 15,  # Approximate duration
            'message': 'Audio generated successfully'
        })
        
    except Exception as e:
        print(f"Text-to-speech error: {str(e)}")
        return error_response(str(e))


def speech_to_text(body):
    """Convert speech to text using AWS Transcribe"""
    try:
        audio_url = body.get('audioUrl')
        language = body.get('language', 'en-US')
        user_id = body.get('userId')
        
        if not audio_url:
            return error_response('Audio URL is required', 400)
        
        # Start transcription job
        job_name = f"transcribe-{user_id}-{uuid.uuid4()}"
        
        # Map language codes for Transcribe
        transcribe_lang_map = {
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
        }
        
        transcribe_language = transcribe_lang_map.get(language, 'en-US')
        
        transcribe.start_transcription_job(
            TranscriptionJobName=job_name,
            Media={'MediaFileUri': audio_url},
            MediaFormat='mp3',
            LanguageCode=transcribe_language,
            Settings={
                'ShowSpeakerLabels': False,
                'MaxSpeakerLabels': 1
            }
        )
        
        # Save job info to DynamoDB
        table = dynamodb.Table(AUDIO_TABLE)
        table.put_item(
            Item={
                'audioId': job_name,
                'userId': user_id,
                'type': 'speech-to-text',
                'language': language,
                'jobName': job_name,
                'status': 'IN_PROGRESS',
                'audioUrl': audio_url,
                'createdAt': datetime.utcnow().isoformat()
            }
        )
        
        return success_response({
            'jobName': job_name,
            'status': 'IN_PROGRESS',
            'message': 'Transcription job started. Check status using transcribe-status action.'
        })
        
    except Exception as e:
        print(f"Speech-to-text error: {str(e)}")
        return error_response(str(e))


def check_transcription_status(body):
    """Check status of transcription job"""
    try:
        job_name = body.get('jobName')
        
        if not job_name:
            return error_response('Job name is required', 400)
        
        # Get job status
        response = transcribe.get_transcription_job(
            TranscriptionJobName=job_name
        )
        
        job = response['TranscriptionJob']
        status = job['TranscriptionJobStatus']
        
        result = {
            'jobName': job_name,
            'status': status
        }
        
        if status == 'COMPLETED':
            # Get transcript
            transcript_uri = job['Transcript']['TranscriptFileUri']
            
            # Download transcript
            import urllib.request
            with urllib.request.urlopen(transcript_uri) as response:
                transcript_data = json.loads(response.read())
            
            text = transcript_data['results']['transcripts'][0]['transcript']
            
            result['text'] = text
            result['confidence'] = transcript_data['results']['items'][0].get('alternatives', [{}])[0].get('confidence', 0)
            
            # Update DynamoDB
            table = dynamodb.Table(AUDIO_TABLE)
            table.update_item(
                Key={'audioId': job_name},
                UpdateExpression='SET #status = :status, transcribedText = :text',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={
                    ':status': 'COMPLETED',
                    ':text': text
                }
            )
            
        elif status == 'FAILED':
            result['error'] = job.get('FailureReason', 'Unknown error')
        
        return success_response(result)
        
    except Exception as e:
        print(f"Check transcription status error: {str(e)}")
        return error_response(str(e))


def translate_text(body):
    """Translate text using AWS Translate"""
    try:
        text = body.get('text')
        source_language = body.get('sourceLanguage', 'auto')
        target_language = body.get('targetLanguage', 'en')
        
        if not text:
            return error_response('Text is required', 400)
        
        # Translate text
        response = translate.translate_text(
            Text=text,
            SourceLanguageCode=source_language,
            TargetLanguageCode=target_language
        )
        
        return success_response({
            'originalText': text,
            'translatedText': response['TranslatedText'],
            'sourceLanguage': response['SourceLanguageCode'],
            'targetLanguage': response['TargetLanguageCode']
        })
        
    except Exception as e:
        print(f"Translation error: {str(e)}")
        return error_response(str(e))


def create_voice_message(body):
    """Create a voice message with translation and speech synthesis"""
    try:
        text = body.get('text')
        source_language = body.get('sourceLanguage', 'en')
        target_language = body.get('targetLanguage', 'hi')
        user_id = body.get('userId')
        
        if not text:
            return error_response('Text is required', 400)
        
        # Step 1: Translate if needed
        if source_language != target_language:
            translate_response = translate.translate_text(
                Text=text,
                SourceLanguageCode=source_language,
                TargetLanguageCode=target_language
            )
            translated_text = translate_response['TranslatedText']
        else:
            translated_text = text
        
        # Step 2: Convert to speech
        lang_config = SUPPORTED_LANGUAGES.get(target_language, SUPPORTED_LANGUAGES['en'])
        
        polly_response = polly.synthesize_speech(
            Text=translated_text,
            OutputFormat='mp3',
            VoiceId=lang_config['polly_voice'],
            Engine=lang_config['polly_engine']
        )
        
        # Step 3: Save to S3
        audio_id = str(uuid.uuid4())
        s3_key = f"voice-messages/{user_id}/{audio_id}.mp3"
        
        s3.put_object(
            Bucket=S3_BUCKET,
            Key=s3_key,
            Body=polly_response['AudioStream'].read(),
            ContentType='audio/mpeg'
        )
        
        # Generate presigned URL
        audio_url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': S3_BUCKET, 'Key': s3_key},
            ExpiresIn=3600
        )
        
        # Save to DynamoDB
        table = dynamodb.Table(AUDIO_TABLE)
        table.put_item(
            Item={
                'audioId': audio_id,
                'userId': user_id,
                'type': 'voice-message',
                'originalText': text,
                'translatedText': translated_text,
                'sourceLanguage': source_language,
                'targetLanguage': target_language,
                's3Key': s3_key,
                'createdAt': datetime.utcnow().isoformat()
            }
        )
        
        return success_response({
            'audioId': audio_id,
            'audioUrl': audio_url,
            'originalText': text,
            'translatedText': translated_text,
            'sourceLanguage': source_language,
            'targetLanguage': target_language,
            'message': 'Voice message created successfully'
        })
        
    except Exception as e:
        print(f"Create voice message error: {str(e)}")
        return error_response(str(e))


def success_response(data):
    """Return success response"""
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(data)
    }


def error_response(message, status_code=500):
    """Return error response"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': message})
    }
