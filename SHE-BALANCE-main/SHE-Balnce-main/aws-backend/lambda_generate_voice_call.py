"""
Lambda Function: Generate Voice Call
Purpose: Use Amazon Polly to generate voice message and initiate phone call
"""

import json
import boto3
import os
from datetime import datetime
import uuid

# AWS Services
polly = boto3.client('polly')
s3 = boto3.client('s3')
sns = boto3.client('sns')
dynamodb = boto3.resource('dynamodb')

# Configuration
S3_BUCKET = os.environ.get('AUDIO_BUCKET', 'shebalance-voice-messages')
TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER')
intervention_table = dynamodb.Table('InterventionLog')

def lambda_handler(event, context):
    """
    Generate voice message using Amazon Polly and initiate phone call
    
    Args:
        event: Contains artisan details and language preference
        context: Lambda context object
        
    Returns:
        Call ID and audio URL
    """
    
    try:
        # Extract artisan details
        artisan_id = event['artisanId']
        artisan_name = event['artisanName']
        phone_number = event['phoneNumber']
        days_inactive = event['daysInactive']
        language = event.get('language', 'hi-IN')
        order_id = event.get('orderId', '')
        order_title = event.get('orderTitle', 'your order')
        
        print(f"Generating voice call for {artisan_name} ({phone_number})")
        
        # Generate voice script
        script = generate_voice_script(artisan_name, days_inactive, language)
        
        # Synthesize speech using Amazon Polly
        audio_data = synthesize_speech(script, language)
        
        # Upload audio to S3
        audio_url = upload_to_s3(audio_data, artisan_id)
        
        # Initiate phone call (using Twilio or Amazon Connect)
        call_id = initiate_phone_call(phone_number, audio_url)
        
        # Log intervention
        log_voice_intervention(
            artisan_id=artisan_id,
            call_id=call_id,
            audio_url=audio_url,
            script=script,
            status='initiated'
        )
        
        return {
            'statusCode': 200,
            'callId': call_id,
            'audioUrl': audio_url,
            'timestamp': datetime.now().isoformat(),
            'artisanId': artisan_id,
            'language': language
        }
        
    except Exception as e:
        print(f"Error generating voice call: {str(e)}")
        
        # Log failed attempt
        log_voice_intervention(
            artisan_id=event.get('artisanId', 'unknown'),
            status='failed',
            error=str(e)
        )
        
        raise e


def generate_order_confirmation_script(artisan_name, days_inactive, order_title, language):
    """
    Generate personalized voice script for order confirmation
    
    Args:
        artisan_name: Name of the artisan
        days_inactive: Number of days since last activity
        order_title: Title of the order
        language: Language code (hi-IN, en-IN, etc.)
        
    Returns:
        Voice script text
    """
    
    scripts = {
        'hi-IN': f"""
            <speak>
                <prosody rate="medium" pitch="medium">
                    नमस्ते {artisan_name} जी।
                    <break time="500ms"/>
                    मैं शी बैलेंस की एआई सखी हूँ।
                    <break time="700ms"/>
                    हम आपसे आपके बल्क ऑर्डर के बारे में बात करना चाहते हैं।
                    <break time="500ms"/>
                    ऑर्डर का नाम है: {order_title}
                    <break time="700ms"/>
                    हमने देखा कि आपने पिछले {days_inactive} दिनों से इस ऑर्डर की प्रोग्रेस अपडेट नहीं की है।
                    <break time="700ms"/>
                    हमने आपको व्हाट्सएप पर संदेश भेजा था,
                    <break time="500ms"/>
                    लेकिन हमें कोई जवाब नहीं मिला।
                    <break time="700ms"/>
                    हम जानना चाहते हैं:
                    <break time="500ms"/>
                    क्या आप इस ऑर्डर को पूरा कर पाएंगी?
                    <break time="700ms"/>
                    अगर आपको किसी भी प्रकार की समस्या है,
                    <break time="500ms"/>
                    चाहे वह समय की कमी हो,
                    <break time="300ms"/>
                    सामग्री की समस्या हो,
                    <break time="300ms"/>
                    या कोई व्यक्तिगत कारण हो,
                    <break time="500ms"/>
                    तो कृपया हमें बताएं।
                    <break time="700ms"/>
                    हम आपकी मदद करना चाहते हैं।
                    <break time="500ms"/>
                    आप हमारे व्हाट्सएप नंबर पर संदेश भेज सकती हैं,
                    <break time="500ms"/>
                    या हमारी हेल्पलाइन पर कॉल कर सकती हैं।
                    <break time="700ms"/>
                    अगर आप ऑर्डर पूरा नहीं कर पाएंगी,
                    <break time="500ms"/>
                    तो कोई बात नहीं।
                    <break time="500ms"/>
                    हम समझते हैं कि कभी-कभी परिस्थितियां बदल जाती हैं।
                    <break time="700ms"/>
                    बस हमें जल्द से जल्द बताएं,
                    <break time="500ms"/>
                    ताकि हम बायर को सूचित कर सकें।
                    <break time="700ms"/>
                    याद रखें,
                    <break time="300ms"/>
                    आप अकेली नहीं हैं।
                    <break time="500ms"/>
                    पूरा शी बैलेंस परिवार आपके साथ है।
                    <break time="700ms"/>
                    कृपया 24 घंटे के अंदर हमसे संपर्क करें।
                    <break time="700ms"/>
                    धन्यवाद और जल्द ही आपसे बात करने की उम्मीद है।
                    <break time="500ms"/>
                    नमस्ते।
                </prosody>
            </speak>
        """,
        
        'en-IN': f"""
            <speak>
                <prosody rate="medium" pitch="medium">
                    Hello {artisan_name}.
                    <break time="500ms"/>
                    This is AI Sakhi from SheBalance.
                    <break time="700ms"/>
                    We want to talk to you about your bulk order.
                    <break time="500ms"/>
                    The order is: {order_title}
                    <break time="700ms"/>
                    We noticed that you haven't updated the progress for this order in the past {days_inactive} days.
                    <break time="700ms"/>
                    We sent you a WhatsApp message,
                    <break time="500ms"/>
                    but we didn't receive any response.
                    <break time="700ms"/>
                    We want to know:
                    <break time="500ms"/>
                    Will you be able to complete this order?
                    <break time="700ms"/>
                    If you're facing any challenges,
                    <break time="500ms"/>
                    whether it's lack of time,
                    <break time="300ms"/>
                    material issues,
                    <break time="300ms"/>
                    or any personal reasons,
                    <break time="500ms"/>
                    please let us know.
                    <break time="700ms"/>
                    We want to help you.
                    <break time="500ms"/>
                    You can send us a message on WhatsApp,
                    <break time="500ms"/>
                    or call our helpline.
                    <break time="700ms"/>
                    If you cannot complete the order,
                    <break time="500ms"/>
                    that's okay.
                    <break time="500ms"/>
                    We understand that sometimes circumstances change.
                    <break time="700ms"/>
                    Just let us know as soon as possible,
                    <break time="500ms"/>
                    so we can inform the buyer.
                    <break time="700ms"/>
                    Remember,
                    <break time="300ms"/>
                    you are not alone.
                    <break time="500ms"/>
                    The entire SheBalance family is with you.
                    <break time="700ms"/>
                    Please contact us within 24 hours.
                    <break time="700ms"/>
                    Thank you and we hope to hear from you soon.
                    <break time="500ms"/>
                    Goodbye.
                </prosody>
            </speak>
        """
    }
    
    return scripts.get(language, scripts['hi-IN'])


def generate_voice_script(artisan_name, days_inactive, language):
    """
    Generate personalized voice script (legacy function for general reminders)
    
    Args:
        artisan_name: Name of the artisan
        days_inactive: Number of days since last activity
        language: Language code (hi-IN, en-IN, etc.)
        
    Returns:
        Voice script text
    """
    
    scripts = {
        'hi-IN': f"""
            <speak>
                <prosody rate="medium" pitch="medium">
                    नमस्ते {artisan_name} जी।
                    <break time="500ms"/>
                    मैं शी बैलेंस की एआई सखी हूँ।
                    <break time="500ms"/>
                    हमने देखा कि आप पिछले {days_inactive} दिनों से हमारे प्लेटफॉर्म पर सक्रिय नहीं हैं।
                    <break time="700ms"/>
                    हम आपकी चिंता कर रहे हैं और जानना चाहते हैं कि क्या सब ठीक है।
                    <break time="700ms"/>
                    अगर आपको किसी भी प्रकार की सहायता चाहिए,
                    <break time="300ms"/>
                    चाहे वह वित्तीय हो,
                    <break time="300ms"/>
                    स्वास्थ्य संबंधी हो,
                    <break time="300ms"/>
                    या कोई अन्य समस्या हो,
                    <break time="500ms"/>
                    तो कृपया हमें तुरंत बताएं।
                    <break time="700ms"/>
                    आप हमारे व्हाट्सएप नंबर पर संदेश भेज सकते हैं,
                    <break time="500ms"/>
                    या हमारी हेल्पलाइन पर कॉल कर सकते हैं।
                    <break time="700ms"/>
                    याद रखें,
                    <break time="300ms"/>
                    आप अकेली नहीं हैं।
                    <break time="500ms"/>
                    पूरा शी बैलेंस परिवार आपके साथ है।
                    <break time="700ms"/>
                    धन्यवाद और जल्द ही आपसे बात करने की उम्मीद है।
                    <break time="500ms"/>
                    नमस्ते।
                </prosody>
            </speak>
        """,
        
        'en-IN': f"""
            <speak>
                <prosody rate="medium" pitch="medium">
                    Hello {artisan_name}.
                    <break time="500ms"/>
                    This is AI Sakhi from SheBalance.
                    <break time="500ms"/>
                    We noticed that you haven't been active on our platform for the past {days_inactive} days.
                    <break time="700ms"/>
                    We are concerned about you and want to know if everything is okay.
                    <break time="700ms"/>
                    If you need any kind of support,
                    <break time="300ms"/>
                    whether financial,
                    <break time="300ms"/>
                    health-related,
                    <break time="300ms"/>
                    or any other issue,
                    <break time="500ms"/>
                    please let us know immediately.
                    <break time="700ms"/>
                    You can send us a message on WhatsApp,
                    <break time="500ms"/>
                    or call our helpline.
                    <break time="700ms"/>
                    Remember,
                    <break time="300ms"/>
                    you are not alone.
                    <break time="500ms"/>
                    The entire SheBalance family is with you.
                    <break time="700ms"/>
                    Thank you and we hope to hear from you soon.
                    <break time="500ms"/>
                    Goodbye.
                </prosody>
            </speak>
        """
    }
    
    return scripts.get(language, scripts['hi-IN'])


def synthesize_speech(text, language):
    """
    Use Amazon Polly to synthesize speech
    
    Args:
        text: SSML text to synthesize
        language: Language code
        
    Returns:
        Audio data stream
    """
    
    try:
        # Select appropriate voice based on language
        voice_map = {
            'hi-IN': 'Aditi',  # Hindi female voice
            'en-IN': 'Raveena',  # English (Indian) female voice
            'ta-IN': 'Kajal',  # Tamil female voice
            'te-IN': 'Kajal'  # Telugu female voice
        }
        
        voice_id = voice_map.get(language, 'Aditi')
        
        # Synthesize speech
        response = polly.synthesize_speech(
            Text=text,
            TextType='ssml',
            OutputFormat='mp3',
            VoiceId=voice_id,
            Engine='neural',  # Use neural engine for better quality
            LanguageCode=language
        )
        
        # Read audio stream
        audio_data = response['AudioStream'].read()
        
        print(f"Successfully synthesized speech using voice {voice_id}")
        return audio_data
        
    except Exception as e:
        print(f"Error synthesizing speech: {str(e)}")
        raise e


def upload_to_s3(audio_data, artisan_id):
    """
    Upload audio file to S3
    
    Args:
        audio_data: Audio binary data
        artisan_id: ID of the artisan
        
    Returns:
        S3 URL of the uploaded file
    """
    
    try:
        # Generate unique filename
        filename = f"voice-calls/{artisan_id}/{uuid.uuid4()}.mp3"
        
        # Upload to S3
        s3.put_object(
            Bucket=S3_BUCKET,
            Key=filename,
            Body=audio_data,
            ContentType='audio/mpeg',
            ACL='private'
        )
        
        # Generate presigned URL (valid for 7 days)
        url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': S3_BUCKET, 'Key': filename},
            ExpiresIn=604800  # 7 days
        )
        
        print(f"Uploaded audio to S3: {filename}")
        return url
        
    except Exception as e:
        print(f"Error uploading to S3: {str(e)}")
        raise e


def initiate_phone_call(phone_number, audio_url):
    """
    Initiate phone call using Twilio or Amazon Connect
    
    Args:
        phone_number: Recipient phone number
        audio_url: URL of the audio file to play
        
    Returns:
        Call ID
    """
    
    try:
        # This is a placeholder for actual call initiation
        # In production, integrate with Twilio or Amazon Connect
        
        # Example using Twilio (requires twilio library):
        # from twilio.rest import Client
        # client = Client(account_sid, auth_token)
        # call = client.calls.create(
        #     url=f'http://your-twiml-endpoint?audio={audio_url}',
        #     to=phone_number,
        #     from_=TWILIO_PHONE_NUMBER
        # )
        # return call.sid
        
        # For now, return a mock call ID
        call_id = f"call_{uuid.uuid4()}"
        
        print(f"Initiated call {call_id} to {phone_number}")
        print(f"Audio URL: {audio_url}")
        
        # Send SNS notification to monitoring system
        sns.publish(
            TopicArn=os.environ.get('MONITORING_TOPIC_ARN'),
            Subject='Voice Call Initiated',
            Message=json.dumps({
                'callId': call_id,
                'phoneNumber': phone_number,
                'audioUrl': audio_url,
                'timestamp': datetime.now().isoformat()
            })
        )
        
        return call_id
        
    except Exception as e:
        print(f"Error initiating phone call: {str(e)}")
        raise e


def log_voice_intervention(artisan_id, call_id=None, audio_url=None, 
                          script=None, status='initiated', error=None):
    """
    Log voice call intervention to DynamoDB
    
    Args:
        artisan_id: ID of the artisan
        call_id: Call ID
        audio_url: URL of the audio file
        script: Voice script text
        status: Status of the intervention
        error: Error message (if failed)
    """
    
    try:
        item = {
            'interventionId': f"{artisan_id}_{datetime.now().timestamp()}",
            'artisanId': artisan_id,
            'timestamp': datetime.now().isoformat(),
            'interventionType': 'voice_call',
            'status': status
        }
        
        if call_id:
            item['callId'] = call_id
        if audio_url:
            item['audioUrl'] = audio_url
        if script:
            item['script'] = script
        if error:
            item['error'] = error
            
        intervention_table.put_item(Item=item)
        print(f"Logged voice intervention for artisan {artisan_id}")
        
    except Exception as e:
        print(f"Error logging voice intervention: {str(e)}")
