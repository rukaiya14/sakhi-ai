"""
Lambda Function: Scan Artisan Activity
Purpose: Periodically scan DynamoDB to identify inactive artisans
"""

import json
import boto3
from datetime import datetime, timedelta
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('ArtisanActivity')

def lambda_handler(event, context):
    """
    Scan the ArtisanActivity table and identify artisans who haven't been active
    for the specified threshold period.
    
    Args:
        event: Contains tableName and inactivityThreshold (in days)
        context: Lambda context object
        
    Returns:
        List of inactive artisans with their details
    """
    
    try:
        # Get parameters from event
        table_name = event.get('tableName', 'ArtisanActivity')
        inactivity_threshold = event.get('inactivityThreshold', 3)
        
        # Calculate threshold date
        threshold_date = datetime.now() - timedelta(days=inactivity_threshold)
        threshold_timestamp = threshold_date.isoformat()
        
        print(f"Scanning for artisans inactive since: {threshold_timestamp}")
        
        # Scan the table
        response = table.scan(
            FilterExpression='lastActivityDate < :threshold',
            ExpressionAttributeValues={
                ':threshold': threshold_timestamp
            }
        )
        
        inactive_artisans = []
        
        for item in response.get('Items', []):
            # Calculate days inactive
            last_activity = datetime.fromisoformat(item['lastActivityDate'])
            days_inactive = (datetime.now() - last_activity).days
            
            artisan_data = {
                'artisanId': item['artisanId'],
                'artisanName': item['artisanName'],
                'phoneNumber': item['phoneNumber'],
                'lastActivityDate': item['lastActivityDate'],
                'daysInactive': days_inactive,
                'skill': item.get('skill', 'Unknown'),
                'location': item.get('location', 'Unknown'),
                'interventionHistory': item.get('interventionHistory', [])
            }
            
            inactive_artisans.append(artisan_data)
        
        # Sort by days inactive (most critical first)
        inactive_artisans.sort(key=lambda x: x['daysInactive'], reverse=True)
        
        print(f"Found {len(inactive_artisans)} inactive artisans")
        
        return {
            'statusCode': 200,
            'inactiveArtisans': inactive_artisans,
            'totalCount': len(inactive_artisans),
            'scanTimestamp': datetime.now().isoformat(),
            'thresholdDays': inactivity_threshold
        }
        
    except Exception as e:
        print(f"Error scanning artisan activity: {str(e)}")
        raise e


def decimal_default(obj):
    """Helper function to handle Decimal types in JSON serialization"""
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError
