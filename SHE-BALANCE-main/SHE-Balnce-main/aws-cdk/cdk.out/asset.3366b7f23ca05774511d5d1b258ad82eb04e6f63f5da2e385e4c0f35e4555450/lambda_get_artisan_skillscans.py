"""
AWS Lambda Function to retrieve SkillScan history for artisans
Used by admin dashboard to view all skill assessments
"""

import json
import boto3
from datetime import datetime
from decimal import Decimal
import os

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

# Environment variables
SKILLSCAN_TABLE = os.environ.get('SKILLSCAN_TABLE', 'SheBalance-SkillScan')

def lambda_handler(event, context):
    """
    Retrieve SkillScan history for an artisan or all artisans
    """
    try:
        # Get query parameters
        params = event.get('queryStringParameters', {}) or {}
        artisan_id = params.get('artisan_id')
        limit = int(params.get('limit', 50))
        
        table = dynamodb.Table(SKILLSCAN_TABLE)
        
        if artisan_id:
            # Get specific artisan's scans
            response = table.query(
                KeyConditionExpression='artisan_id = :aid',
                ExpressionAttributeValues={
                    ':aid': artisan_id
                },
                Limit=limit,
                ScanIndexForward=False  # Most recent first
            )
        else:
            # Get all scans (for admin dashboard)
            response = table.scan(
                Limit=limit
            )
        
        items = response.get('Items', [])
        
        # Sort by timestamp descending
        items.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        return {
            'statusCode': 200,
            'headers': cors_headers(),
            'body': json.dumps({
                'success': True,
                'count': len(items),
                'skillscans': items
            }, cls=DecimalEncoder)
        }
        
    except Exception as e:
        print(f"Error retrieving skillscans: {str(e)}")
        return {
            'statusCode': 500,
            'headers': cors_headers(),
            'body': json.dumps({
                'error': f'Internal server error: {str(e)}'
            })
        }


def cors_headers():
    """
    Return CORS headers for API Gateway
    """
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Content-Type': 'application/json'
    }


class DecimalEncoder(json.JSONEncoder):
    """
    Helper class to convert Decimal to float for JSON serialization
    """
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)
