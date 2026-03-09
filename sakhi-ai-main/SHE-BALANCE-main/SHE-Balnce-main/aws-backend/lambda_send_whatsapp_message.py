"""
Lambda Function: Send WhatsApp Message
Purpose: Send automated wellness check messages via WhatsApp Business API
"""

import json
import boto3
import requests
import os
from datetime import datetime

# WhatsApp Business API Configuration
WHATSAPP_API_URL = os.environ.get('WHATSAPP_API_URL', 'https://graph.facebook.com/v17.0')
WHATSAPP_PHONE_NUMBER_ID = os.environ.get('WHATSAPP_PHONE_NUMBER_ID')
WHATSAPP_ACCESS_TOKEN = os.environ.get('WHATSAPP_ACCESS_TOKEN')

dynamodb = boto3.resource('dynamodb')
intervention_table = dynamodb.Table('InterventionLog')

def lambda_handler(event, context):
    """
    Send a WhatsApp message to an inactive artisan
    
    Args:
        event: Contains artisan details and message type
        context: Lambda context object
        
    Returns:
        Message ID and delivery status
    """
    
    try:
        # Extract artisan details
        artisan_id = event['artisanId']
        artisan_name = event['artisanName']
        phone_number = event['phoneNumber']
        days_inactive = event['daysInactive']
        message_type = event.get('messageType', 'wellness_check')
        
        print(f"Sending WhatsApp message to {artisan_name} ({phone_number})")
        
        # Generate message based on type and language preference
        message_content = generate_message(artisan_name, days_inactive, message_type)
        
        # Send WhatsApp message
        response = send_whatsapp_message(phone_number, message_content)
        
        if response['success']:
            # Log successful message
            log_intervention(
                artisan_id=artisan_id,
                intervention_type='whatsapp_message',
                status='sent',
                message_id=response['messageId'],
                message_content=message_content
            )
            
            return {
                'statusCode': 200,
                'messageId': response['messageId'],
                'status': 'sent',
                'timestamp': datetime.now().isoformat(),
                'artisanId': artisan_id
            }
        else:
            raise Exception(f"WhatsApp API error: {response['error']}")
            
    except Exception as e:
        print(f"Error sending WhatsApp message: {str(e)}")
        
        # Log failed attempt
        log_intervention(
            artisan_id=event.get('artisanId', 'unknown'),
            intervention_type='whatsapp_message',
            status='failed',
            error=str(e)
        )
        
        raise e


def generate_message(artisan_name, days_inactive, message_type):
    """
    Generate personalized message content
    
    Args:
        artisan_name: Name of the artisan
        days_inactive: Number of days since last activity
        message_type: Type of message to send
        
    Returns:
        Message content string
    """
    
    messages = {
        'wellness_check': f"""
नमस्ते {artisan_name} जी! 🙏

हम SheBalance परिवार से हैं। हमने देखा कि आप पिछले {days_inactive} दिनों से प्लेटफॉर्म पर सक्रिय नहीं हैं।

क्या सब ठीक है? 🤔

हम आपकी मदद के लिए यहाँ हैं:
✅ कोई समस्या है?
✅ कुछ सहायता चाहिए?
✅ बस व्यस्त हैं?

कृपया हमें बताएं। आपकी भलाई हमारी प्राथमिकता है। 💚

जवाब देने के लिए बस "ठीक हूँ" या "मदद चाहिए" लिखें।

- SheBalance AI Sakhi टीम
        """,
        
        'emergency_support': f"""
{artisan_name} जी, हम चिंतित हैं! 🚨

आप {days_inactive} दिनों से संपर्क में नहीं हैं।

क्या आपको तत्काल सहायता की आवश्यकता है?

हम प्रदान कर सकते हैं:
💰 आपातकालीन वित्तीय सहायता
🏥 स्वास्थ्य सहायता
👥 समुदाय समर्थन

कृपया तुरंत जवाब दें या हमें कॉल करें: 1800-XXX-XXXX

- SheBalance आपातकालीन टीम
        """,
        
        'community_care': f"""
प्रिय {artisan_name}, 🌸

आपकी SheBalance बहनें आपके बारे में पूछ रही हैं।

हम सब आपकी परवाह करते हैं और यहाँ आपके लिए हैं।

क्या हम कुछ मदद कर सकते हैं?

आपका समुदाय आपका इंतजार कर रहा है। 💕

- SheBalance समुदाय
        """
    }
    
    return messages.get(message_type, messages['wellness_check'])


def send_whatsapp_message(phone_number, message_content):
    """
    Send message via WhatsApp Business API
    
    Args:
        phone_number: Recipient phone number
        message_content: Message text to send
        
    Returns:
        Response with messageId or error
    """
    
    try:
        # Format phone number (remove + and spaces)
        formatted_number = phone_number.replace('+', '').replace(' ', '')
        
        # Prepare API request
        url = f"{WHATSAPP_API_URL}/{WHATSAPP_PHONE_NUMBER_ID}/messages"
        
        headers = {
            'Authorization': f'Bearer {WHATSAPP_ACCESS_TOKEN}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'messaging_product': 'whatsapp',
            'recipient_type': 'individual',
            'to': formatted_number,
            'type': 'text',
            'text': {
                'preview_url': False,
                'body': message_content
            }
        }
        
        # Send request
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        response.raise_for_status()
        
        result = response.json()
        
        return {
            'success': True,
            'messageId': result['messages'][0]['id'],
            'status': result['messages'][0]['message_status']
        }
        
    except requests.exceptions.RequestException as e:
        print(f"WhatsApp API request failed: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }


def log_intervention(artisan_id, intervention_type, status, message_id=None, 
                     message_content=None, error=None):
    """
    Log intervention attempt to DynamoDB
    
    Args:
        artisan_id: ID of the artisan
        intervention_type: Type of intervention
        status: Status of the intervention
        message_id: WhatsApp message ID (if successful)
        message_content: Content of the message
        error: Error message (if failed)
    """
    
    try:
        item = {
            'interventionId': f"{artisan_id}_{datetime.now().timestamp()}",
            'artisanId': artisan_id,
            'timestamp': datetime.now().isoformat(),
            'interventionType': intervention_type,
            'status': status
        }
        
        if message_id:
            item['messageId'] = message_id
        if message_content:
            item['messageContent'] = message_content
        if error:
            item['error'] = error
            
        intervention_table.put_item(Item=item)
        print(f"Logged intervention for artisan {artisan_id}")
        
    except Exception as e:
        print(f"Error logging intervention: {str(e)}")
