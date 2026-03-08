"""
Lambda Function: Order Reminder Orchestrator
Triggers: EventBridge (runs daily at 9 AM UTC)
Purpose: Orchestrate the complete reminder workflow:
         1. Check orders without progress for 3+ days
         2. Send WhatsApp reminder
         3. Track reminder status
         4. Trigger voice call if no response in 24 hours
"""

import json
import boto3
from datetime import datetime, timedelta
from decimal import Decimal
import uuid

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')
lambda_client = boto3.client('lambda')
stepfunctions = boto3.client('stepfunctions')

# Table names
ORDERS_TABLE = 'shebalance-orders'
USERS_TABLE = 'shebalance-users'
ARTISAN_PROFILES_TABLE = 'shebalance-artisan-profiles'
REMINDERS_TABLE = 'shebalance-reminders'
NOTIFICATIONS_TABLE = 'shebalance-notifications'

def lambda_handler(event, context):
    """
    Main orchestrator function
    Manages the complete reminder workflow
    """
    try:
        print("Starting order reminder orchestrator...")
        
        # Get all active bulk orders needing reminders
        orders_needing_reminders = get_orders_needing_reminders()
        print(f"Found {len(orders_needing_reminders)} orders needing reminders")
        
        reminders_sent = 0
        calls_scheduled = 0
        
        for order in orders_needing_reminders:
            # Check if this is first reminder or follow-up
            reminder_status = get_reminder_status(order['orderId'])
            
            if not reminder_status:
                # First reminder - send WhatsApp
                success = send_initial_whatsapp_reminder(order)
                if success:
                    reminders_sent += 1
                    # Schedule follow-up check in 24 hours
                    schedule_followup_check(order)
                    
            elif reminder_status['status'] == 'no_response':
                # No response to WhatsApp - initiate voice call
                hours_since_reminder = get_hours_since_reminder(reminder_status)
                
                if hours_since_reminder >= 24:
                    success = initiate_voice_call_followup(order, reminder_status)
                    if success:
                        calls_scheduled += 1
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Order reminder orchestration completed',
                'ordersChecked': len(orders_needing_reminders),
                'remindersSent': reminders_sent,
                'callsScheduled': calls_scheduled,
                'timestamp': datetime.utcnow().isoformat()
            })
        }
        
    except Exception as e:
        print(f"Error in orchestrator: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }


def get_orders_needing_reminders():
    """
    Get all bulk orders that need reminders
    (no progress update for 3+ days)
    """
    try:
        orders_table = dynamodb.Table(ORDERS_TABLE)
        
        # Scan for active bulk orders
        response = orders_table.scan(
            FilterExpression='#status IN (:pending, :in_progress) AND orderType = :bulk',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':pending': 'pending',
                ':in_progress': 'in_progress',
                ':bulk': 'bulk'
            }
        )
        
        orders = response.get('Items', [])
        current_time = datetime.utcnow()
        orders_needing_reminders = []
        
        for order in orders:
            # Check last progress update
            last_update = order.get('lastProgressUpdate', order.get('createdAt'))
            if last_update:
                last_update_time = datetime.fromisoformat(last_update.replace('Z', '+00:00'))
                days_since_update = (current_time - last_update_time).days
                
                if days_since_update >= 3:
                    orders_needing_reminders.append(order)
        
        return orders_needing_reminders
        
    except Exception as e:
        print(f"Error getting orders: {str(e)}")
        return []


def get_reminder_status(order_id):
    """
    Get the current reminder status for an order
    """
    try:
        table = dynamodb.Table(REMINDERS_TABLE)
        response = table.get_item(Key={'orderId': order_id})
        return response.get('Item')
    except Exception as e:
        print(f"Error getting reminder status: {str(e)}")
        return None


def send_initial_whatsapp_reminder(order):
    """
    Send initial WhatsApp reminder to artisan
    """
    try:
        # Get artisan and user details
        artisan = get_artisan_details(order['artisanId'])
        if not artisan:
            return False
            
        user = get_user_details(artisan['userId'])
        if not user or not user.get('phone'):
            return False
        
        phone_number = format_phone_number(user['phone'])
        
        # Create reminder message
        message = create_whatsapp_message(order, user)
        
        # Send via SNS
        print(f"Sending WhatsApp reminder to {phone_number} for order {order['orderId']}")
        
        response = sns.publish(
            PhoneNumber=phone_number,
            Message=message,
            MessageAttributes={
                'AWS.SNS.SMS.SMSType': {
                    'DataType': 'String',
                    'StringValue': 'Transactional'
                }
            }
        )
        
        message_id = response['MessageId']
        print(f"WhatsApp sent successfully: {message_id}")
        
        # Create reminder record
        create_reminder_record(
            order_id=order['orderId'],
            artisan_id=order['artisanId'],
            user_id=user['userId'],
            phone_number=phone_number,
            message_id=message_id,
            reminder_type='whatsapp',
            status='sent'
        )
        
        # Create notification
        create_notification(
            user_id=user['userId'],
            title='Order Progress Reminder',
            message=message,
            notification_type='reminder'
        )
        
        # Update order
        update_order_reminder_sent(order['orderId'])
        
        return True
        
    except Exception as e:
        print(f"Error sending WhatsApp reminder: {str(e)}")
        return False


def schedule_followup_check(order):
    """
    Schedule a follow-up check in 24 hours to see if artisan responded
    """
    try:
        # Use EventBridge to schedule a one-time event in 24 hours
        events = boto3.client('events')
        
        rule_name = f"followup-check-{order['orderId']}"
        
        # Create rule for 24 hours from now
        target_time = datetime.utcnow() + timedelta(hours=24)
        
        # Create EventBridge rule
        events.put_rule(
            Name=rule_name,
            ScheduleExpression=f"at({target_time.strftime('%Y-%m-%dT%H:%M:%S')})",
            State='ENABLED',
            Description=f"Follow-up check for order {order['orderId']}"
        )
        
        # Add Lambda as target
        events.put_targets(
            Rule=rule_name,
            Targets=[{
                'Id': '1',
                'Arn': context.invoked_function_arn,
                'Input': json.dumps({
                    'action': 'followup_check',
                    'orderId': order['orderId']
                })
            }]
        )
        
        print(f"Scheduled follow-up check for order {order['orderId']} at {target_time}")
        
    except Exception as e:
        print(f"Error scheduling follow-up: {str(e)}")


def get_hours_since_reminder(reminder_status):
    """
    Calculate hours since reminder was sent
    """
    try:
        sent_time = datetime.fromisoformat(reminder_status['sentAt'].replace('Z', '+00:00'))
        current_time = datetime.utcnow()
        hours = (current_time - sent_time).total_seconds() / 3600
        return hours
    except Exception as e:
        print(f"Error calculating hours: {str(e)}")
        return 0


def initiate_voice_call_followup(order, reminder_status):
    """
    Initiate voice call when no response to WhatsApp
    """
    try:
        # Get artisan and user details
        artisan = get_artisan_details(order['artisanId'])
        if not artisan:
            return False
            
        user = get_user_details(artisan['userId'])
        if not user or not user.get('phone'):
            return False
        
        phone_number = format_phone_number(user['phone'])
        
        # Calculate days without update
        current_time = datetime.utcnow()
        last_update = order.get('lastProgressUpdate', order.get('createdAt'))
        last_update_time = datetime.fromisoformat(last_update.replace('Z', '+00:00'))
        days_without_update = (current_time - last_update_time).days
        
        # Prepare voice call payload
        voice_call_payload = {
            'artisanId': order['artisanId'],
            'artisanName': user['fullName'],
            'phoneNumber': phone_number,
            'orderId': order['orderId'],
            'orderTitle': order.get('title', 'Your bulk order'),
            'daysInactive': days_without_update,
            'language': user.get('preferredLanguage', 'hi-IN')
        }
        
        # Invoke voice call Lambda
        print(f"Initiating voice call to {phone_number} for order {order['orderId']}")
        
        response = lambda_client.invoke(
            FunctionName='shebalance-generate-voice-call',
            InvocationType='Event',  # Async invocation
            Payload=json.dumps(voice_call_payload)
        )
        
        print(f"Voice call Lambda invoked: {response['StatusCode']}")
        
        # Update reminder record
        update_reminder_status(
            order_id=order['orderId'],
            status='voice_call_initiated',
            call_initiated_at=datetime.utcnow().isoformat() + 'Z'
        )
        
        # Create notification
        create_notification(
            user_id=user['userId'],
            title='Important: Order Confirmation Call',
            message=f"We will be calling you shortly regarding your order progress. Please answer the call.",
            notification_type='urgent'
        )
        
        return True
        
    except Exception as e:
        print(f"Error initiating voice call: {str(e)}")
        return False


def create_whatsapp_message(order, user):
    """
    Create personalized WhatsApp reminder message
    """
    order_id = order['orderId'][:8]
    order_title = order.get('title', 'Your order')
    
    current_time = datetime.utcnow()
    last_update = order.get('lastProgressUpdate', order['createdAt'])
    last_update_time = datetime.fromisoformat(last_update.replace('Z', '+00:00'))
    days_without_update = (current_time - last_update_time).days
    
    message = f"""
🔔 SHE-BALANCE Order Reminder

Hello {user['fullName']}! 👋

We noticed you haven't updated the progress for your bulk order in {days_without_update} days.

📦 Order: {order_title}
🆔 Order ID: {order_id}
📅 Last Update: {days_without_update} days ago

⚠️ IMPORTANT: Please update your order progress within 24 hours. If we don't hear from you, we will call you to confirm if you can complete this order.

✅ Reply with:
• "DONE" - Order completed
• "PROGRESS" - Still working on it
• "HELP" - Need assistance
• "CANCEL" - Cannot complete

Update now: https://shebalance.com/dashboard

Need help? Reply to this message or contact support at 1800-XXX-XXXX

- Team SHE-BALANCE 🌸
""".strip()
    
    return message


def create_reminder_record(order_id, artisan_id, user_id, phone_number, 
                          message_id, reminder_type, status):
    """
    Create reminder tracking record in DynamoDB
    """
    try:
        table = dynamodb.Table(REMINDERS_TABLE)
        
        reminder_id = str(uuid.uuid4())
        
        table.put_item(
            Item={
                'orderId': order_id,
                'reminderId': reminder_id,
                'artisanId': artisan_id,
                'userId': user_id,
                'phoneNumber': phone_number,
                'messageId': message_id,
                'reminderType': reminder_type,
                'status': status,
                'sentAt': datetime.utcnow().isoformat() + 'Z',
                'responseReceived': False,
                'createdAt': datetime.utcnow().isoformat() + 'Z'
            }
        )
        
        print(f"Created reminder record: {reminder_id}")
        
    except Exception as e:
        print(f"Error creating reminder record: {str(e)}")


def update_reminder_status(order_id, status, **kwargs):
    """
    Update reminder status in DynamoDB
    """
    try:
        table = dynamodb.Table(REMINDERS_TABLE)
        
        update_expr = 'SET #status = :status, updatedAt = :updated'
        expr_values = {
            ':status': status,
            ':updated': datetime.utcnow().isoformat() + 'Z'
        }
        expr_names = {'#status': 'status'}
        
        # Add any additional fields
        for key, value in kwargs.items():
            update_expr += f', {key} = :{key}'
            expr_values[f':{key}'] = value
        
        table.update_item(
            Key={'orderId': order_id},
            UpdateExpression=update_expr,
            ExpressionAttributeValues=expr_values,
            ExpressionAttributeNames=expr_names
        )
        
        print(f"Updated reminder status for order {order_id}: {status}")
        
    except Exception as e:
        print(f"Error updating reminder status: {str(e)}")


def get_artisan_details(artisan_id):
    """Get artisan profile from DynamoDB"""
    try:
        table = dynamodb.Table(ARTISAN_PROFILES_TABLE)
        response = table.get_item(Key={'artisanId': artisan_id})
        return response.get('Item')
    except Exception as e:
        print(f"Error getting artisan: {str(e)}")
        return None


def get_user_details(user_id):
    """Get user details from DynamoDB"""
    try:
        table = dynamodb.Table(USERS_TABLE)
        response = table.get_item(Key={'userId': user_id})
        return response.get('Item')
    except Exception as e:
        print(f"Error getting user: {str(e)}")
        return None


def format_phone_number(phone):
    """Format phone number to E.164 format"""
    phone = phone.replace('-', '').replace(' ', '').replace('(', '').replace(')', '')
    if not phone.startswith('+'):
        phone = '+91' + phone  # Assume India
    return phone


def update_order_reminder_sent(order_id):
    """Update order with reminder timestamp"""
    try:
        table = dynamodb.Table(ORDERS_TABLE)
        table.update_item(
            Key={'orderId': order_id},
            UpdateExpression='SET lastReminderSent = :timestamp',
            ExpressionAttributeValues={
                ':timestamp': datetime.utcnow().isoformat() + 'Z'
            }
        )
    except Exception as e:
        print(f"Error updating order: {str(e)}")


def create_notification(user_id, title, message, notification_type):
    """Create notification record"""
    try:
        table = dynamodb.Table(NOTIFICATIONS_TABLE)
        notification_id = str(uuid.uuid4())
        
        table.put_item(
            Item={
                'notificationId': notification_id,
                'userId': user_id,
                'title': title,
                'message': message,
                'type': notification_type,
                'readStatus': False,
                'createdAt': datetime.utcnow().isoformat() + 'Z'
            }
        )
    except Exception as e:
        print(f"Error creating notification: {str(e)}")
