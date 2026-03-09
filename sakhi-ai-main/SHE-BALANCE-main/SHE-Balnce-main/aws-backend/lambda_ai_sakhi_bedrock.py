"""
AI Sakhi with Amazon Bedrock - Llama 3 (70B Instruct) Only
"""

import json
import boto3
import os
from datetime import datetime

bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
dynamodb = boto3.resource('dynamodb')

# Llama 3 Model Only
LLAMA3_MODEL = "meta.llama3-70b-instruct-v1:0"

# Default model - Llama 3 only
DEFAULT_MODEL = os.environ.get('AI_SAKHI_MODEL', LLAMA3_MODEL)

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        action = body.get('action', 'chat')
        
        if action == 'chat':
            return handle_chat(body)
        else:
            return {
                'statusCode': 400,
                'headers': get_cors_headers(),
                'body': json.dumps({'error': 'Invalid action'})
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({'error': str(e)})
        }

def handle_chat(body):
    artisan_id = body.get('artisanId')
    message = body.get('message', '')
    conversation_history = body.get('history', [])
    model_id = body.get('model', DEFAULT_MODEL)
    
    # Build context from conversation history
    context = ""
    for msg in conversation_history[-5:]:  # Last 5 messages for context
        role = "User" if msg.get('role') == 'user' else "AI Sakhi"
        context += f"{role}: {msg.get('content', '')}\n"
    
    # System prompt
    system_prompt = """You are AI Sakhi, a compassionate AI assistant for women artisans in India.

Your role:
- Help artisans with bulk orders, payments, and work challenges
- Provide emotional support and encouragement
- Speak in a warm, friendly, and respectful tone
- Use simple language (many artisans have limited education)
- Be culturally sensitive to Indian context
- Offer practical solutions

Always be empathetic, patient, and solution-oriented."""

    # Call Llama 3 model
    try:
        response_text, model_name = invoke_llama(system_prompt, context, message, model_id)
        
        # Save conversation to DynamoDB
        save_conversation(artisan_id, message, response_text)
        
        return {
            'statusCode': 200,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'response': response_text,
                'timestamp': datetime.now().isoformat(),
                'model': model_name
            })
        }
        
    except Exception as e:
        print(f"Bedrock error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': get_cors_headers(),
            'body': json.dumps({
                'error': 'Failed to get response from AI',
                'details': str(e)
            })
        }

def invoke_llama(system_prompt, context, message, model_id):
    """Invoke Llama 3 model"""
    # Build Llama 3 prompt format
    prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>

{system_prompt}<|eot_id|>"""

    if context:
        # Add conversation history
        for line in context.strip().split('\n'):
            if line.startswith('User:'):
                prompt += f"""<|start_header_id|>user<|end_header_id|>

{line[5:].strip()}<|eot_id|>"""
            elif line.startswith('AI Sakhi:'):
                prompt += f"""<|start_header_id|>assistant<|end_header_id|>

{line[9:].strip()}<|eot_id|>"""

    # Add current message
    prompt += f"""<|start_header_id|>user<|end_header_id|>

{message}<|eot_id|><|start_header_id|>assistant<|end_header_id|>

"""

    response = bedrock_runtime.invoke_model(
        modelId=model_id,
        body=json.dumps({
            "prompt": prompt,
            "max_gen_len": 512,
            "temperature": 0.7,
            "top_p": 0.9
        })
    )
    
    response_body = json.loads(response['body'].read())
    return response_body['generation'].strip(), 'llama3-70b'

def save_conversation(artisan_id, user_message, assistant_message):
    """Save conversation to DynamoDB"""
    try:
        table = dynamodb.Table(os.environ.get('CONVERSATIONS_TABLE', 'AISakhiConversations'))
        
        conversation_id = f"{artisan_id}_{int(datetime.now().timestamp())}"
        
        table.put_item(
            Item={
                'conversationId': conversation_id,
                'artisanId': artisan_id,
                'timestamp': datetime.now().isoformat(),
                'userMessage': user_message,
                'assistantMessage': assistant_message
            }
        )
    except Exception as e:
        print(f"Error saving conversation: {str(e)}")

def get_cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    }
