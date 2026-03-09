"""
AWS Lambda: Artisan Growth Path Generator
Uses Amazon Bedrock with Llama 3 70B to create personalized growth roadmaps
"""

import json
import boto3
import os
from datetime import datetime
from decimal import Decimal

# Initialize AWS clients
bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

# DynamoDB tables
ARTISAN_PROFILES_TABLE = os.environ.get('ARTISAN_PROFILES_TABLE', 'shebalance-artisan-profiles')
GROWTH_PATHS_TABLE = os.environ.get('GROWTH_PATHS_TABLE', 'shebalance-growth-paths')

# Llama 3 70B model ID
LLAMA3_MODEL_ID = "meta.llama3-70b-instruct-v1:0"

# Marketplace demand clusters
MARKETPLACE_DEMANDS = [
    {
        "cluster": "Advanced Silk Weaving",
        "demand_level": "high",
        "avg_order_value": 50000,
        "required_skill_level": "Advanced"
    },
    {
        "cluster": "Bulk Corporate Gifting",
        "demand_level": "very_high",
        "avg_order_value": 150000,
        "required_skill_level": "Intermediate"
    },
    {
        "cluster": "Premium Embroidery",
        "demand_level": "high",
        "avg_order_value": 75000,
        "required_skill_level": "Advanced"
    },
    {
        "cluster": "Traditional Zardozi Work",
        "demand_level": "medium",
        "avg_order_value": 100000,
        "required_skill_level": "Advanced"
    },
    {
        "cluster": "Contemporary Crochet",
        "demand_level": "high",
        "avg_order_value": 30000,
        "required_skill_level": "Intermediate"
    },
    {
        "cluster": "Heritage Textile Restoration",
        "demand_level": "medium",
        "avg_order_value": 200000,
        "required_skill_level": "Expert"
    }
]


def lambda_handler(event, context):
    """
    Main Lambda handler for generating artisan growth paths
    """
    try:
        print(f"Event: {json.dumps(event)}")
        
        # Extract artisan ID from event
        artisan_id = event.get('artisanId')
        if not artisan_id:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'artisanId is required'})
            }
        
        # Fetch artisan profile from DynamoDB
        artisan_profile = get_artisan_profile(artisan_id)
        if not artisan_profile:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'Artisan profile not found'})
            }
        
        # Generate growth path using Claude 3.5 Sonnet
        growth_path = generate_growth_path(artisan_profile)
        
        # Save growth path to DynamoDB
        save_growth_path(artisan_id, growth_path)
        
        # Update artisan profile with personalized path
        update_artisan_profile(artisan_id, growth_path)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'artisanId': artisan_id,
                'growthPath': growth_path
            }, default=decimal_default)
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }


def get_artisan_profile(artisan_id):
    """
    Fetch artisan profile from DynamoDB
    """
    try:
        table = dynamodb.Table(ARTISAN_PROFILES_TABLE)
        response = table.get_item(Key={'artisanId': artisan_id})
        
        if 'Item' in response:
            return response['Item']
        return None
        
    except Exception as e:
        print(f"Error fetching artisan profile: {str(e)}")
        raise


def generate_growth_path(artisan_profile):
    """
    Generate personalized growth path using Claude 3.5 Sonnet
    """
    try:
        # Extract artisan data
        skill_level = artisan_profile.get('skillLevel', 'Beginner')
        heritage_score = artisan_profile.get('heritageScore', 0)
        primary_skill = artisan_profile.get('primarySkill', 'General Craft')
        skills = artisan_profile.get('skills', [])
        experience_years = artisan_profile.get('experienceYears', 0)
        
        # Build the prompt for Claude
        prompt = f"""You are an expert career advisor for traditional artisans in India. Generate a personalized growth roadmap.

Artisan Profile:
- Current Skill Level: {skill_level}
- Primary Craft: {primary_skill}
- Skills: {', '.join(skills) if skills else 'Not specified'}
- Experience: {experience_years} years
- Heritage Score: {heritage_score}/100
- Current Tier: {skill_level}

Marketplace Demand Clusters:
{json.dumps(MARKETPLACE_DEMANDS, indent=2)}

Task: Generate a detailed 3-step growth roadmap to help this artisan advance from {skill_level} to the next tier and qualify for high-value bulk orders.

Requirements:
1. Identify the most suitable marketplace demand cluster based on their skills
2. Create 3 progressive milestones with specific, actionable steps
3. Include craft techniques to master at each step
4. Estimate "Invisible Labor" hours (household + craft preparation time)
5. Provide realistic timelines
6. Consider their heritage score and traditional knowledge

Output Format (JSON):
{{
  "current_milestone": {{
    "tier": "{skill_level}",
    "description": "Current status description",
    "strengths": ["strength1", "strength2"]
  }},
  "target_tier": "Next tier name",
  "target_cluster": "Most suitable marketplace cluster",
  "estimated_timeline": "X months",
  "total_invisible_labor_hours": 0,
  "actionable_steps": [
    {{
      "step_number": 1,
      "milestone_name": "Step name",
      "description": "What to achieve",
      "techniques_to_master": ["technique1", "technique2"],
      "invisible_labor_hours": 0,
      "craft_hours": 0,
      "household_hours": 0,
      "timeline": "X weeks",
      "success_criteria": ["criteria1", "criteria2"],
      "resources_needed": ["resource1", "resource2"]
    }}
  ],
  "potential_earnings_increase": "Percentage or amount",
  "recommended_training": ["training1", "training2"],
  "mentorship_opportunities": ["opportunity1", "opportunity2"]
}}

Generate a comprehensive, culturally sensitive, and practical roadmap."""

        # Call Claude 3.5 Sonnet via Bedrock
        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 4000,
            "temperature": 0.7,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }
        
        response = bedrock_runtime.invoke_model(
            modelId=CLAUDE_MODEL_ID,
            body=json.dumps(request_body)
        )
        
        response_body = json.loads(response['body'].read())
        claude_response = response_body['content'][0]['text']
        
        # Extract JSON from Claude's response
        growth_path = extract_json_from_response(claude_response)
        
        # Add metadata
        growth_path['generated_at'] = datetime.utcnow().isoformat()
        growth_path['model'] = 'claude-3.5-sonnet'
        growth_path['artisan_skill_level'] = skill_level
        growth_path['artisan_heritage_score'] = heritage_score
        
        return growth_path
        
    except Exception as e:
        print(f"Error generating growth path: {str(e)}")
        raise


def extract_json_from_response(response_text):
    """
    Extract JSON object from Claude's response
    """
    try:
        # Try to find JSON in the response
        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}') + 1
        
        if start_idx != -1 and end_idx > start_idx:
            json_str = response_text[start_idx:end_idx]
            return json.loads(json_str)
        else:
            # If no JSON found, return a structured error
            return {
                "error": "Could not extract JSON from response",
                "raw_response": response_text
            }
            
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {str(e)}")
        return {
            "error": "Invalid JSON in response",
            "raw_response": response_text
        }


def save_growth_path(artisan_id, growth_path):
    """
    Save growth path to DynamoDB
    """
    try:
        table = dynamodb.Table(GROWTH_PATHS_TABLE)
        
        item = {
            'pathId': f"{artisan_id}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            'artisanId': artisan_id,
            'growthPath': json.dumps(growth_path, default=decimal_default),
            'createdAt': datetime.utcnow().isoformat(),
            'status': 'active'
        }
        
        table.put_item(Item=item)
        print(f"Growth path saved for artisan: {artisan_id}")
        
    except Exception as e:
        print(f"Error saving growth path: {str(e)}")
        # Don't raise - this is not critical


def update_artisan_profile(artisan_id, growth_path):
    """
    Update artisan profile with personalized path
    """
    try:
        table = dynamodb.Table(ARTISAN_PROFILES_TABLE)
        
        table.update_item(
            Key={'artisanId': artisan_id},
            UpdateExpression='SET personalizedPath = :path, pathGeneratedAt = :timestamp',
            ExpressionAttributeValues={
                ':path': json.dumps(growth_path, default=decimal_default),
                ':timestamp': datetime.utcnow().isoformat()
            }
        )
        
        print(f"Artisan profile updated with growth path: {artisan_id}")
        
    except Exception as e:
        print(f"Error updating artisan profile: {str(e)}")
        # Don't raise - this is not critical


def decimal_default(obj):
    """
    Helper function to serialize Decimal objects
    """
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError


# For local testing
if __name__ == "__main__":
    test_event = {
        'artisanId': 'test-artisan-123'
    }
    
    result = lambda_handler(test_event, None)
    print(json.dumps(result, indent=2))
