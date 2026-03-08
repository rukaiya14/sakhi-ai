"""
Lambda Function: Update Resilience Metric
Purpose: Calculate and update Heritage Score and Resilience Metric based on interventions
"""

import json
import boto3
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
artisan_table = dynamodb.Table('ArtisanActivity')
metrics_table = dynamodb.Table('ResilienceMetrics')

def lambda_handler(event, context):
    """
    Update resilience metrics based on intervention outcomes
    
    Args:
        event: Contains artisan_id, intervention details, and outcome
        context: Lambda context object
        
    Returns:
        Updated metrics
    """
    
    try:
        artisan_id = event['artisanId']
        intervention_type = event.get('interventionType', 'unknown')
        response_time = event.get('responseTime', 0)
        outcome = event.get('outcome', 'pending')
        
        print(f"Updating resilience metric for artisan {artisan_id}")
        
        # Get current metrics
        current_metrics = get_current_metrics(artisan_id)
        
        # Calculate new scores
        new_metrics = calculate_resilience_score(
            current_metrics,
            intervention_type,
            response_time,
            outcome
        )
        
        # Update DynamoDB
        update_metrics_in_db(artisan_id, new_metrics)
        
        return {
            'statusCode': 200,
            'artisanId': artisan_id,
            'resilienceScore': float(new_metrics['resilienceScore']),
            'heritageScore': float(new_metrics['heritageScore']),
            'interventionCount': new_metrics['interventionCount'],
            'lastUpdated': datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Error updating resilience metric: {str(e)}")
        raise e


def get_current_metrics(artisan_id):
    """Get current metrics for artisan"""
    
    try:
        response = metrics_table.get_item(Key={'artisanId': artisan_id})
        
        if 'Item' in response:
            return response['Item']
        else:
            # Initialize new metrics
            return {
                'artisanId': artisan_id,
                'resilienceScore': Decimal('50.0'),
                'heritageScore': Decimal('50.0'),
                'interventionCount': 0,
                'successfulInterventions': 0,
                'responseTimeAvg': Decimal('0'),
                'lastInterventionDate': None
            }
            
    except Exception as e:
        print(f"Error getting current metrics: {str(e)}")
        raise e


def calculate_resilience_score(current_metrics, intervention_type, 
                               response_time, outcome):
    """
    Calculate updated resilience and heritage scores
    
    Resilience Score Factors:
    - Response time to interventions (faster = higher score)
    - Frequency of interventions needed (fewer = higher score)
    - Recovery pattern (quick recovery = higher score)
    
    Heritage Score Factors:
    - Consistency of activity
    - Quality of work maintained during stress
    - Community engagement during difficult times
    """
    
    # Get current values
    resilience_score = float(current_metrics.get('resilienceScore', 50.0))
    heritage_score = float(current_metrics.get('heritageScore', 50.0))
    intervention_count = current_metrics.get('interventionCount', 0)
    successful_interventions = current_metrics.get('successfulInterventions', 0)
    
    # Update intervention count
    intervention_count += 1
    
    # Calculate resilience score adjustment
    if outcome == 'responded':
        # Positive outcome
        successful_interventions += 1
        
        # Faster response = higher score increase
        if response_time < 3600:  # Less than 1 hour
            resilience_adjustment = 5.0
        elif response_time < 86400:  # Less than 1 day
            resilience_adjustment = 3.0
        else:
            resilience_adjustment = 1.0
            
        resilience_score = min(100.0, resilience_score + resilience_adjustment)
        
    elif outcome == 'no_response':
        # Negative outcome
        resilience_adjustment = -3.0
        resilience_score = max(0.0, resilience_score + resilience_adjustment)
        
    elif outcome == 'escalated':
        # Neutral to slightly negative
        resilience_adjustment = -1.0
        resilience_score = max(0.0, resilience_score + resilience_adjustment)
    
    # Calculate heritage score
    # Heritage score considers long-term patterns
    success_rate = successful_interventions / intervention_count if intervention_count > 0 else 0.5
    
    if success_rate > 0.8:
        heritage_adjustment = 2.0
    elif success_rate > 0.6:
        heritage_adjustment = 1.0
    elif success_rate > 0.4:
        heritage_adjustment = 0.0
    else:
        heritage_adjustment = -1.0
    
    heritage_score = max(0.0, min(100.0, heritage_score + heritage_adjustment))
    
    # Calculate average response time
    current_avg = float(current_metrics.get('responseTimeAvg', 0))
    new_avg = ((current_avg * (intervention_count - 1)) + response_time) / intervention_count
    
    return {
        'resilienceScore': Decimal(str(round(resilience_score, 2))),
        'heritageScore': Decimal(str(round(heritage_score, 2))),
        'interventionCount': intervention_count,
        'successfulInterventions': successful_interventions,
        'responseTimeAvg': Decimal(str(round(new_avg, 2))),
        'lastInterventionDate': datetime.now().isoformat(),
        'successRate': Decimal(str(round(success_rate * 100, 2)))
    }


def update_metrics_in_db(artisan_id, metrics):
    """Update metrics in DynamoDB"""
    
    try:
        metrics_table.put_item(
            Item={
                'artisanId': artisan_id,
                **metrics,
                'updatedAt': datetime.now().isoformat()
            }
        )
        
        # Also update the main artisan table
        artisan_table.update_item(
            Key={'artisanId': artisan_id},
            UpdateExpression="""
                SET resilienceScore = :rs,
                    heritageScore = :hs,
                    lastMetricUpdate = :lmu
            """,
            ExpressionAttributeValues={
                ':rs': metrics['resilienceScore'],
                ':hs': metrics['heritageScore'],
                ':lmu': datetime.now().isoformat()
            }
        )
        
        print(f"Updated metrics for artisan {artisan_id}")
        
    except Exception as e:
        print(f"Error updating metrics in DB: {str(e)}")
        raise e
