"""
Lambda Function: Check WhatsApp Reply
Purpose: Check if artisan has replied to the WhatsApp message
"""

import json
import boto3
from datetime import datetime, timedelta

dynamodb = boto3.resource('dynamodb')
replies_table = dynamodb.Table('WhatsAppReplies')

def lambda_handler(event, context):
    """
    Check if artisan has replied to WhatsApp message
    
    Args:
        event: Contains artisanId and messageId
        context: Lambda context object
        
    Returns:
        Reply status and details
    """
    
    try:
        artisan_id = event['artisanId']
        message_id = event['messageId']
        
        print(f"Checking reply status for artisan {artisan_id}, message {message_id}")
        
        # Query replies table
        response = replies_table.query(
            KeyConditionExpression='artisanId = :aid AND messageId = :mid',
            ExpressionAttributeValues={
                ':aid': artisan_id,
                ':mid': message_id
            }
        )
        
        items = response.get('Items', [])
        
        if items:
            # Reply found
            reply = items[0]
            return {
                'statusCode': 200,
                'hasReplied': True,
                'replyTimestamp': reply['timestamp'],
                'replyContent': reply.get('content', ''),
                'sentiment': reply.get('sentiment', 'neutral')
            }
        else:
            # No reply found
            return {
                'statusCode': 200,
                'hasReplied': False,
                'checkTimestamp': datetime.now().isoformat()
            }
            
    except Exception as e:
        print(f"Error checking reply status: {str(e)}")
        raise e
