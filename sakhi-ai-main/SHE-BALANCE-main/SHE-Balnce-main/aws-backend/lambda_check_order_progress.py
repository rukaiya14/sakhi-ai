"""
Lambda Function: Check Order Progress and Send WhatsApp Reminders
Triggers: EventBridge (runs daily)
Purpose: Check if artisans haven't updated bulk order progress for 3+ days
         and send automated WhatsApp reminders via AWS SNS
"""

import json
import boto3
from datetime import datetime, timedelta
from decimal import Decimal

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')

# Table names
ORDERS_TABLE = 'shebalance-orders'
USERS_TABLE = 'shebalance-users'
ARTISAN_PROFILES_TABLE = 'shebalance-artisan-profiles'
NOTIFICATIONS_TABLE = 'shebalance-notifications'

def lambda_handler(event, context):
    """
    Main handler function
    Checks all active bulk orders and sends reminders if needed
    """
    try:
        print("Starting order progress check...")
        
        # Get all active bulk orders
        orders_table = dynamodb.Table(ORDERS_TABLE)
        response = orders_table.scan(
            FilterExpression='#status IN (:pending, :in_progress) AND orderType = :bulk',
            ExpressionAttributeNames={
                '#status': 'status'
            },
            ExpressionAttributeValues={
                ':pending': 'pending',
                ':in_progress': 'in_progress',
                ':bulk': 'bulk'
            }
        )
        
        orders = response.get('Items', [])
        print(f"Found {len(orders)} active bulk orders")
        
        reminders_sent = 0
        
        for order in orders:
            # Check if reminder is needed
            if should_send_reminder(order):
                # Send WhatsApp reminder
                success = send_whatsapp_reminder(order)
                if success:
                    reminders_sent += 1
                    # Update order with reminder timestamp
                    update_order_reminder_sent(order['orderId'])
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Order progress check completed',
                'ordersChecked': len(orders),
                'remindersSent': reminders_sent
            })
        }
        
    except Exception as e:
        print(f"Error in lambda_handler: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e)
            })
        }


def should_send_reminder(order):
    """
    Check if a reminder should be sent for this order
    Returns True if:
    - No progress update in last 3 days
    - No reminder sent in last 24 hours (to avoid spam)
    """
    try:
        current_time = datetime.utcnow()
        
        # Check last progress update
        last_update = order.get('lastProgressUpdate')
        if last_update:
            last_update_time = datetime.fromisoformat(last_update.replace('Z', '+00:00'))
            days_since_update = (current_time - last_update_time).days
        else:
            # If no progress update, check order creation date
            created_at = datetime.fromisoformat(order['createdAt'].replace('Z', '+00:00'))
            days_since_update = (current_time - created_at).days
        
        # Check if 3+ days without update
        if days_since_update < 3:
            return False
        
        # Check last reminder sent
        last_reminder = order.get('lastReminderSent')
        if last_reminder:
            last_reminder_time = datetime.fromisoformat(last_reminder.replace('Z', '+00:00'))
            hours_since_reminder = (current_time - last_reminder_time).total_seconds() / 3600
            
            # Don't send if reminder was sent in last 24 hours
            if hours_since_reminder < 24:
                return False
        
        print(f"Reminder needed for order {order['orderId']} - {days_since_update} days without update")
        return True
        
    except Exception as e:
        print(f"Error in should_send_reminder: {str(e)}")
        return False


def send_whatsapp_reminder(order):
    """
    Send WhatsApp reminder to artisan via AWS SNS
    """
    try:
        # Get artisan details
        artisan_id = order['artisanId']
        artisan = get_artisan_details(artisan_id)
        
        if not artisan:
            print(f"Artisan not found: {artisan_id}")
            return False
        
        # Get user details for phone number
        user = get_user_details(artisan['userId'])
        
        if not user or not user.get('phone'):
            print(f"User phone not found for artisan: {artisan_id}")
            return False
        
        phone_number = user['phone']
        
        # Format phone number for SNS (E.164 format)
        if not phone_number.startswith('+'):
            # Assume Indian number if no country code
            phone_number = '+91' + phone_number.replace('-', '').replace(' ', '')
        
        # Create WhatsApp message
        message = create_reminder_message(order, user)
        
        # Send via SNS
        print(f"Sending WhatsApp reminder to {phone_number}")
        
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
        
        print(f"SNS Response: {response['MessageId']}")
        
        # Create notification record
        create_notification(
            user_id=user['userId'],
            title='Order Progress Reminder',
            message=message,
            notification_type='reminder'
        )
        
        return True
        
    except Exception as e:
        print(f"Error sending WhatsApp reminder: {str(e)}")
        return False


def create_reminder_message(order, user):
    """
    Create personalized reminder message
    """
    order_id = order['orderId'][:8]  # Short order ID
    order_title = order.get('title', 'Your order')
    
    # Calculate days without update
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

Please update your order progress to keep your buyer informed and maintain your excellent reputation! 💪

Update now: https://shebalance.com/dashboard

Need help? Reply to this message or contact support.

- Team SHE-BALANCE 🌸
""".strip()
    
    return message


def get_artisan_details(artisan_id):
    """
    Get artisan profile from DynamoDB
    """
    try:
        table = dynamodb.Table(ARTISAN_PROFILES_TABLE)
        response = table.get_item(Key={'artisanId': artisan_id})
        return response.get('Item')
    except Exception as e:
        print(f"Error getting artisan details: {str(e)}")
        return None


def get_user_details(user_id):
    """
    Get user details from DynamoDB
    """
    try:
        table = dynamodb.Table(USERS_TABLE)
        response = table.get_item(Key={'userId': user_id})
        return response.get('Item')
    except Exception as e:
        print(f"Error getting user details: {str(e)}")
        return None


def update_order_reminder_sent(order_id):
    """
    Update order with reminder sent timestamp
    """
    try:
        table = dynamodb.Table(ORDERS_TABLE)
        table.update_item(
            Key={'orderId': order_id},
            UpdateExpression='SET lastReminderSent = :timestamp',
            ExpressionAttributeValues={
                ':timestamp': datetime.utcnow().isoformat() + 'Z'
            }
        )
        print(f"Updated reminder timestamp for order {order_id}")
    except Exception as e:
        print(f"Error updating order reminder: {str(e)}")


def create_notification(user_id, title, message, notification_type):
    """
    Create notification record in DynamoDB
    """
    try:
        import uuid
        
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
        
        print(f"Created notification {notification_id}")
        
    except Exception as e:
        print(f"Error creating notification: {str(e)}")


# For testing locally
if __name__ == '__main__':
    # Test event
    test_event = {}
    test_context = {}
    
    result = lambda_handler(test_event, test_context)
    print(json.dumps(result, indent=2))
