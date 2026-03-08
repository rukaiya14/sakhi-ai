"""
AWS Lambda Function for AI Sakhi Assistant
Handles all quick actions and conversational AI
"""

import json
import boto3
from datetime import datetime
from decimal import Decimal

# Initialize AWS clients
bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
sns = boto3.client('sns', region_name='us-east-1')

# Configuration
LLAMA3_MODEL_ID = "meta.llama3-70b-instruct-v1:0"
SAKHI_TABLE = 'SheBalance-Sakhi-Requests'
ADMIN_SNS_TOPIC = 'arn:aws:sns:us-east-1:065538523474:SheBalance-Admin-Alerts'

def lambda_handler(event, context):
    """
    Main handler for AI Sakhi requests
    """
    try:
        # Parse request
        body = json.loads(event.get('body', '{}'))
        
        action = body.get('action')
        artisan_id = body.get('artisan_id')
        message = body.get('message', '')
        data = body.get('data', {})
        
        if not artisan_id:
            return error_response('Missing artisan_id')
        
        # Route to appropriate handler
        if action == 'chat':
            return handle_chat(artisan_id, message)
        elif action == 'update_bulk_order':
            return handle_bulk_order_update(artisan_id, data)
        elif action == 'report_health_issue':
            return handle_health_issue(artisan_id, data)
        elif action == 'request_advance_payment':
            return handle_advance_payment(artisan_id, data)
        elif action == 'request_payment':
            return handle_payment_request(artisan_id, data)
        elif action == 'contact_support':
            return handle_support_request(artisan_id, message)
        else:
            return error_response(f'Unknown action: {action}')
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return error_response(str(e))


def handle_chat(artisan_id, message):
    """
    Handle general chat with AI Sakhi
    """
    try:
        # Get conversation context (last 5 messages)
        context = get_conversation_context(artisan_id)
        
        # Build prompt for Claude
        system_prompt = """You are Sakhi, a helpful AI assistant for women artisans in India. 
You help them with:
- Skill development advice
- Business guidance
- Order management
- Payment issues
- Health and wellbeing support
- Community connections

Be warm, supportive, and practical. Respond in simple language.
If they need urgent help, guide them to use the Quick Actions."""

        # Call Llama 3
        response = bedrock_runtime.invoke_model(
            modelId=LLAMA3_MODEL_ID,
            body=json.dumps({
                "prompt": f"{system_prompt}\n\nUser: {message}\n\nAssistant:",
                "max_gen_len": 1000,
                "temperature": 0.7,
                "top_p": 0.9
            })
        )
        
        # Parse response
        response_body = json.loads(response['body'].read())
        ai_response = response_body['generation']
        
        # Save conversation
        save_conversation(artisan_id, message, ai_response)
        
        return success_response({
            'response': ai_response,
            'type': 'chat'
        })
        
    except Exception as e:
        print(f"Chat error: {str(e)}")
        return error_response(str(e))


def handle_bulk_order_update(artisan_id, data):
    """
    Handle bulk order progress update
    """
    try:
        order_id = data.get('order_id')
        progress = data.get('progress', 0)
        notes = data.get('notes', '')
        
        if not order_id:
            return error_response('Missing order_id')
        
        # Save to DynamoDB
        table = dynamodb.Table(SAKHI_TABLE)
        
        request_id = f"{artisan_id}_order_{int(datetime.utcnow().timestamp())}"
        
        table.put_item(Item={
            'request_id': request_id,
            'artisan_id': artisan_id,
            'request_type': 'bulk_order_update',
            'timestamp': datetime.utcnow().isoformat(),
            'status': 'submitted',
            'data': {
                'order_id': order_id,
                'progress': Decimal(str(progress)),
                'notes': notes
            }
        })
        
        # Generate AI response
        ai_response = f"Thank you! I've recorded your progress update for order {order_id}. You've completed {progress}% of the work. {get_encouragement(progress)}"
        
        # Notify admin if progress is significant
        if progress >= 50:
            notify_admin(f"Order {order_id} is {progress}% complete by artisan {artisan_id}")
        
        return success_response({
            'response': ai_response,
            'request_id': request_id,
            'type': 'bulk_order_update'
        })
        
    except Exception as e:
        print(f"Bulk order error: {str(e)}")
        return error_response(str(e))


def handle_health_issue(artisan_id, data):
    """
    Handle health issue report - URGENT
    """
    try:
        issue_type = data.get('issue_type', 'general')
        severity = data.get('severity', 'medium')
        description = data.get('description', '')
        
        # Save to DynamoDB
        table = dynamodb.Table(SAKHI_TABLE)
        
        request_id = f"{artisan_id}_health_{int(datetime.utcnow().timestamp())}"
        
        table.put_item(Item={
            'request_id': request_id,
            'artisan_id': artisan_id,
            'request_type': 'health_issue',
            'timestamp': datetime.utcnow().isoformat(),
            'status': 'urgent',
            'priority': 'high' if severity == 'high' else 'medium',
            'data': {
                'issue_type': issue_type,
                'severity': severity,
                'description': description
            }
        })
        
        # URGENT: Notify admin immediately
        notify_admin(f"🚨 URGENT: Health issue reported by artisan {artisan_id}. Severity: {severity}. Issue: {description}", urgent=True)
        
        # AI response with empathy
        ai_response = f"""I'm sorry to hear you're not feeling well. Your health report has been submitted with high priority.

Our support team will contact you within 1 hour.

In the meantime:
- Rest if possible
- Stay hydrated
- If it's an emergency, please call: 108 (Ambulance)

Request ID: {request_id}

Take care! 💚"""
        
        return success_response({
            'response': ai_response,
            'request_id': request_id,
            'type': 'health_issue',
            'priority': 'urgent'
        })
        
    except Exception as e:
        print(f"Health issue error: {str(e)}")
        return error_response(str(e))


def handle_advance_payment(artisan_id, data):
    """
    Handle advance payment request
    """
    try:
        amount = data.get('amount', 0)
        reason = data.get('reason', '')
        urgency = data.get('urgency', 'normal')
        
        if amount <= 0:
            return error_response('Invalid amount')
        
        # Save to DynamoDB
        table = dynamodb.Table(SAKHI_TABLE)
        
        request_id = f"{artisan_id}_advance_{int(datetime.utcnow().timestamp())}"
        
        table.put_item(Item={
            'request_id': request_id,
            'artisan_id': artisan_id,
            'request_type': 'advance_payment',
            'timestamp': datetime.utcnow().isoformat(),
            'status': 'pending_approval',
            'data': {
                'amount': Decimal(str(amount)),
                'reason': reason,
                'urgency': urgency
            }
        })
        
        # Notify admin
        notify_admin(f"Advance payment request: ₹{amount} from artisan {artisan_id}. Reason: {reason}")
        
        # AI response
        ai_response = f"""Your advance payment request has been submitted successfully!

Amount: ₹{amount}
Reason: {reason}
Request ID: {request_id}

Our team will review your request within 24 hours. You'll receive a notification once it's approved.

Expected processing time: 1-2 business days after approval."""
        
        return success_response({
            'response': ai_response,
            'request_id': request_id,
            'type': 'advance_payment',
            'estimated_time': '24-48 hours'
        })
        
    except Exception as e:
        print(f"Advance payment error: {str(e)}")
        return error_response(str(e))


def handle_payment_request(artisan_id, data):
    """
    Handle payment request for completed work
    """
    try:
        order_id = data.get('order_id')
        amount = data.get('amount', 0)
        work_description = data.get('work_description', '')
        
        if not order_id or amount <= 0:
            return error_response('Missing order_id or invalid amount')
        
        # Save to DynamoDB
        table = dynamodb.Table(SAKHI_TABLE)
        
        request_id = f"{artisan_id}_payment_{int(datetime.utcnow().timestamp())}"
        
        table.put_item(Item={
            'request_id': request_id,
            'artisan_id': artisan_id,
            'request_type': 'payment_request',
            'timestamp': datetime.utcnow().isoformat(),
            'status': 'pending_verification',
            'data': {
                'order_id': order_id,
                'amount': Decimal(str(amount)),
                'work_description': work_description
            }
        })
        
        # Notify admin
        notify_admin(f"Payment request: ₹{amount} for order {order_id} from artisan {artisan_id}")
        
        # AI response
        ai_response = f"""Great work! Your payment request has been submitted.

Order ID: {order_id}
Amount: ₹{amount}
Request ID: {request_id}

Our team will verify the completed work and process your payment within 3-5 business days.

You'll receive a notification once the payment is processed."""
        
        return success_response({
            'response': ai_response,
            'request_id': request_id,
            'type': 'payment_request',
            'estimated_time': '3-5 business days'
        })
        
    except Exception as e:
        print(f"Payment request error: {str(e)}")
        return error_response(str(e))


def handle_support_request(artisan_id, message):
    """
    Handle general support request
    """
    try:
        # Save to DynamoDB
        table = dynamodb.Table(SAKHI_TABLE)
        
        request_id = f"{artisan_id}_support_{int(datetime.utcnow().timestamp())}"
        
        table.put_item(Item={
            'request_id': request_id,
            'artisan_id': artisan_id,
            'request_type': 'support',
            'timestamp': datetime.utcnow().isoformat(),
            'status': 'open',
            'data': {
                'message': message
            }
        })
        
        # Notify support team
        notify_admin(f"Support request from artisan {artisan_id}: {message}")
        
        # AI response
        ai_response = f"""I've forwarded your message to our support team.

Request ID: {request_id}

A support representative will contact you within 2-4 hours.

Is there anything else I can help you with right now?"""
        
        return success_response({
            'response': ai_response,
            'request_id': request_id,
            'type': 'support',
            'estimated_response_time': '2-4 hours'
        })
        
    except Exception as e:
        print(f"Support request error: {str(e)}")
        return error_response(str(e))


# Helper Functions

def get_conversation_context(artisan_id, limit=5):
    """Get recent conversation history"""
    # TODO: Implement conversation history retrieval
    return []


def save_conversation(artisan_id, user_message, ai_response):
    """Save conversation to DynamoDB"""
    try:
        table = dynamodb.Table(SAKHI_TABLE)
        table.put_item(Item={
            'request_id': f"{artisan_id}_chat_{int(datetime.utcnow().timestamp())}",
            'artisan_id': artisan_id,
            'request_type': 'chat',
            'timestamp': datetime.utcnow().isoformat(),
            'data': {
                'user_message': user_message,
                'ai_response': ai_response
            }
        })
    except Exception as e:
        print(f"Error saving conversation: {str(e)}")


def get_encouragement(progress):
    """Get encouraging message based on progress"""
    if progress >= 90:
        return "You're almost done! Excellent work! 🎉"
    elif progress >= 75:
        return "Great progress! Keep it up! 💪"
    elif progress >= 50:
        return "You're halfway there! You're doing great! ⭐"
    elif progress >= 25:
        return "Good start! Keep going! 👍"
    else:
        return "Every step counts! You've got this! 🌟"


def notify_admin(message, urgent=False):
    """Send notification to admin via SNS"""
    try:
        subject = "🚨 URGENT: " + message if urgent else "SheBalance Alert: " + message
        
        sns.publish(
            TopicArn=ADMIN_SNS_TOPIC,
            Subject=subject[:100],  # SNS subject limit
            Message=message
        )
    except Exception as e:
        print(f"Error sending notification: {str(e)}")


def success_response(data):
    """Return success response"""
    return {
        'statusCode': 200,
        'headers': cors_headers(),
        'body': json.dumps({
            'success': True,
            **data,
            'timestamp': datetime.utcnow().isoformat()
        }, cls=DecimalEncoder)
    }


def error_response(message):
    """Return error response"""
    return {
        'statusCode': 400,
        'headers': cors_headers(),
        'body': json.dumps({
            'success': False,
            'error': message
        })
    }


def cors_headers():
    """Return CORS headers"""
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Content-Type': 'application/json'
    }


class DecimalEncoder(json.JSONEncoder):
    """Helper class to convert Decimal to float"""
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)
