"""
AWS Lambda Function for SkillScan AI Analysis
Uses Llama 3 70B via AWS Bedrock + SageMaker for enhanced accuracy
"""

import json
import boto3
import base64
from datetime import datetime
import os
from decimal import Decimal

# Initialize AWS clients
bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
sagemaker_runtime = boto3.client('sagemaker-runtime', region_name='us-east-1')
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
s3_client = boto3.client('s3', region_name='us-east-1')

# Environment variables
SKILLSCAN_TABLE = os.environ.get('SKILLSCAN_TABLE', 'SheBalance-SkillScan')
S3_BUCKET = os.environ.get('S3_BUCKET', 'shebalance-skillscan-images')
LLAMA3_MODEL_ID = "meta.llama3-70b-instruct-v1:0"
SAGEMAKER_ENDPOINT = os.environ.get('SAGEMAKER_ENDPOINT', 'shebalance-skill-classifier')
USE_SAGEMAKER = os.environ.get('USE_SAGEMAKER', 'false').lower() == 'true'

def lambda_handler(event, context):
    """
    Main Lambda handler for SkillScan AI analysis
    Enhanced with SageMaker integration
    """
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        artisan_id = body.get('artisan_id')
        category = body.get('category')
        images = body.get('images', [])  # Base64 encoded images
        
        if not artisan_id or not category or not images:
            return {
                'statusCode': 400,
                'headers': cors_headers(),
                'body': json.dumps({
                    'error': 'Missing required fields: artisan_id, category, images'
                })
            }
        
        # Process images and analyze with Claude
        claude_analysis = analyze_skill_with_claude(
            artisan_id=artisan_id,
            category=category,
            images=images
        )
        
        # Enhance with SageMaker if enabled
        if USE_SAGEMAKER:
            try:
                sagemaker_prediction = predict_with_sagemaker(images[0])  # Use first image
                analysis_result = combine_predictions(claude_analysis, sagemaker_prediction)
            except Exception as e:
                print(f"SageMaker prediction failed: {str(e)}, using Claude only")
                analysis_result = claude_analysis
        else:
            analysis_result = claude_analysis
        
        # Store results in DynamoDB
        store_analysis_result(artisan_id, category, analysis_result)
        
        # Return analysis
        return {
            'statusCode': 200,
            'headers': cors_headers(),
            'body': json.dumps({
                'success': True,
                'analysis': analysis_result,
                'timestamp': datetime.utcnow().isoformat()
            }, cls=DecimalEncoder)
        }
        
    except Exception as e:
        print(f"Error in lambda_handler: {str(e)}")
        return {
            'statusCode': 500,
            'headers': cors_headers(),
            'body': json.dumps({
                'error': f'Internal server error: {str(e)}'
            })
        }


def analyze_skill_with_claude(artisan_id, category, images):
    """
    Analyze skill images using Claude 3.5 Sonnet via Bedrock
    """
    
    # Prepare image content for Claude
    image_content = []
    for idx, img_data in enumerate(images[:5]):  # Max 5 images
        # Remove data URL prefix if present
        if ',' in img_data:
            img_data = img_data.split(',')[1]
        
        image_content.append({
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": "image/jpeg",
                "data": img_data
            }
        })
    
    # Create skill assessment prompt based on category
    prompt = create_skill_assessment_prompt(category)
    
    # Prepare messages for Claude
    messages = [
        {
            "role": "user",
            "content": [
                *image_content,
                {
                    "type": "text",
                    "text": prompt
                }
            ]
        }
    ]
    
    # Call Claude via Bedrock
    try:
        response = bedrock_runtime.invoke_model(
            modelId=CLAUDE_MODEL_ID,
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 4000,
                "temperature": 0.7,
                "messages": messages
            })
        )
        
        # Parse response
        response_body = json.loads(response['body'].read())
        claude_analysis = response_body['content'][0]['text']
        
        # Parse Claude's structured response
        parsed_analysis = parse_claude_response(claude_analysis, category)
        
        # Add metadata
        parsed_analysis['artisan_id'] = artisan_id
        parsed_analysis['category'] = category
        parsed_analysis['analysis_timestamp'] = datetime.utcnow().isoformat()
        parsed_analysis['model_used'] = CLAUDE_MODEL_ID
        
        return parsed_analysis
        
    except Exception as e:
        print(f"Error calling Claude: {str(e)}")
        raise


def create_skill_assessment_prompt(category):
    """
    Create detailed skill assessment prompt for Claude based on category
    """
    
    category_prompts = {
        'embroidery': """
You are an expert embroidery instructor and assessor. Analyze the embroidery work shown in these images and provide a comprehensive skill assessment.

Please evaluate the following aspects:
1. **Technique Quality** (0-100): Stitch consistency, tension control, thread handling
2. **Pattern Complexity** (0-100): Design intricacy, pattern execution, creativity
3. **Finishing Quality** (0-100): Edge finishing, backing quality, overall neatness
4. **Color Coordination** (0-100): Color harmony, thread selection, aesthetic appeal

Based on your analysis, provide:
- **Overall Score** (0-100): Weighted average of all aspects
- **Skill Level**: Beginner (0-59), Intermediate (60-79), or Advanced (80-100)
- **Strengths**: List 3-5 specific strengths you observe
- **Areas for Improvement**: List 3-5 specific areas to work on
- **Recommendations**: Suggest 2-3 actionable next steps for skill development
- **Market Readiness**: Assess if the work is ready for commercial sale

Respond in JSON format with this structure:
{
  "overall_score": <number>,
  "skill_level": "<level>",
  "breakdown": {
    "technique_quality": <number>,
    "pattern_complexity": <number>,
    "finishing_quality": <number>,
    "color_coordination": <number>
  },
  "strengths": ["<strength1>", "<strength2>", ...],
  "improvements": ["<improvement1>", "<improvement2>", ...],
  "recommendations": ["<rec1>", "<rec2>", ...],
  "market_readiness": "<assessment>",
  "detailed_feedback": "<paragraph of detailed feedback>"
}
""",
        
        'cooking': """
You are a professional chef and culinary instructor. Analyze the cooking/food presentation shown in these images and provide a comprehensive skill assessment.

Please evaluate the following aspects:
1. **Presentation** (0-100): Plating, visual appeal, garnishing
2. **Technique** (0-100): Cooking methods, texture, doneness
3. **Creativity** (0-100): Innovation, flavor combinations, uniqueness
4. **Consistency** (0-100): Portion control, repeatability, professional standards

Based on your analysis, provide:
- **Overall Score** (0-100): Weighted average of all aspects
- **Skill Level**: Beginner (0-59), Intermediate (60-79), or Advanced (80-100)
- **Strengths**: List 3-5 specific strengths you observe
- **Areas for Improvement**: List 3-5 specific areas to work on
- **Recommendations**: Suggest 2-3 actionable next steps for skill development
- **Market Readiness**: Assess if the work is ready for commercial catering/sale

Respond in JSON format with this structure:
{
  "overall_score": <number>,
  "skill_level": "<level>",
  "breakdown": {
    "presentation": <number>,
    "technique": <number>,
    "creativity": <number>,
    "consistency": <number>
  },
  "strengths": ["<strength1>", "<strength2>", ...],
  "improvements": ["<improvement1>", "<improvement2>", ...],
  "recommendations": ["<rec1>", "<rec2>", ...],
  "market_readiness": "<assessment>",
  "detailed_feedback": "<paragraph of detailed feedback>"
}
""",
        
        'henna': """
You are a master henna artist and instructor. Analyze the henna/mehndi work shown in these images and provide a comprehensive skill assessment.

Please evaluate the following aspects:
1. **Pattern Precision** (0-100): Line quality, symmetry, detail accuracy
2. **Design Creativity** (0-100): Pattern complexity, originality, artistic vision
3. **Line Quality** (0-100): Consistency, thickness control, smoothness
4. **Overall Composition** (0-100): Balance, flow, aesthetic appeal

Based on your analysis, provide:
- **Overall Score** (0-100): Weighted average of all aspects
- **Skill Level**: Beginner (0-59), Intermediate (60-79), or Advanced (80-100)
- **Strengths**: List 3-5 specific strengths you observe
- **Areas for Improvement**: List 3-5 specific areas to work on
- **Recommendations**: Suggest 2-3 actionable next steps for skill development
- **Market Readiness**: Assess if the work is ready for professional bookings

Respond in JSON format with this structure:
{
  "overall_score": <number>,
  "skill_level": "<level>",
  "breakdown": {
    "pattern_precision": <number>,
    "design_creativity": <number>,
    "line_quality": <number>,
    "overall_composition": <number>
  },
  "strengths": ["<strength1>", "<strength2>", ...],
  "improvements": ["<improvement1>", "<improvement2>", ...],
  "recommendations": ["<rec1>", "<rec2>", ...],
  "market_readiness": "<assessment>",
  "detailed_feedback": "<paragraph of detailed feedback>"
}
"""
    }
    
    # Default prompt for other categories
    default_prompt = f"""
You are an expert {category} instructor and assessor. Analyze the {category} work shown in these images and provide a comprehensive skill assessment.

Please evaluate the following aspects (each 0-100):
1. **Technique Quality**: Technical execution and skill
2. **Creativity**: Innovation and artistic vision
3. **Finishing Quality**: Overall polish and professionalism
4. **Presentation**: Visual appeal and presentation

Based on your analysis, provide:
- **Overall Score** (0-100): Weighted average of all aspects
- **Skill Level**: Beginner (0-59), Intermediate (60-79), or Advanced (80-100)
- **Strengths**: List 3-5 specific strengths you observe
- **Areas for Improvement**: List 3-5 specific areas to work on
- **Recommendations**: Suggest 2-3 actionable next steps for skill development
- **Market Readiness**: Assess if the work is ready for commercial sale

Respond in JSON format with this structure:
{{
  "overall_score": <number>,
  "skill_level": "<level>",
  "breakdown": {{
    "technique_quality": <number>,
    "creativity": <number>,
    "finishing_quality": <number>,
    "presentation": <number>
  }},
  "strengths": ["<strength1>", "<strength2>", ...],
  "improvements": ["<improvement1>", "<improvement2>", ...],
  "recommendations": ["<rec1>", "<rec2>", ...],
  "market_readiness": "<assessment>",
  "detailed_feedback": "<paragraph of detailed feedback>"
}}
"""
    
    return category_prompts.get(category, default_prompt)


def parse_claude_response(claude_text, category):
    """
    Parse Claude's JSON response and structure it for the frontend
    """
    try:
        # Extract JSON from Claude's response (it might have markdown formatting)
        json_start = claude_text.find('{')
        json_end = claude_text.rfind('}') + 1
        
        if json_start != -1 and json_end > json_start:
            json_str = claude_text[json_start:json_end]
            analysis = json.loads(json_str)
        else:
            # Fallback if JSON parsing fails
            analysis = {
                "overall_score": 75,
                "skill_level": "Intermediate",
                "breakdown": {},
                "strengths": ["Good work quality"],
                "improvements": ["Continue practicing"],
                "recommendations": ["Keep developing your skills"],
                "market_readiness": "Shows promise",
                "detailed_feedback": claude_text
            }
        
        return analysis
        
    except json.JSONDecodeError as e:
        print(f"Error parsing Claude response: {str(e)}")
        print(f"Claude response: {claude_text}")
        
        # Return a structured fallback
        return {
            "overall_score": 70,
            "skill_level": "Intermediate",
            "breakdown": {
                "technique_quality": 70,
                "creativity": 70,
                "finishing_quality": 70,
                "presentation": 70
            },
            "strengths": ["Shows dedication to craft"],
            "improvements": ["Continue practicing regularly"],
            "recommendations": ["Keep developing your skills"],
            "market_readiness": "Developing well",
            "detailed_feedback": claude_text,
            "parse_error": True
        }


def predict_with_sagemaker(image_data):
    """
    Get skill level prediction from SageMaker endpoint
    
    Args:
        image_data: Base64 encoded image
        
    Returns:
        dict: SageMaker prediction with confidence scores
    """
    try:
        # Prepare payload
        payload = json.dumps({
            'image': image_data
        })
        
        # Call SageMaker endpoint
        response = sagemaker_runtime.invoke_endpoint(
            EndpointName=SAGEMAKER_ENDPOINT,
            ContentType='application/json',
            Body=payload
        )
        
        # Parse response
        result = json.loads(response['Body'].read().decode())
        
        print(f"SageMaker prediction: {result['predicted_level']} ({result['confidence']:.2%})")
        
        return result
        
    except Exception as e:
        print(f"Error calling SageMaker: {str(e)}")
        raise


def combine_predictions(claude_analysis, sagemaker_prediction):
    """
    Combine Claude and SageMaker predictions for enhanced accuracy
    
    Strategy:
    - If SageMaker confidence > 85%, use it to validate Claude
    - If predictions match, increase confidence
    - If predictions differ, use weighted average
    """
    
    claude_level = claude_analysis.get('skill_level', 'Intermediate')
    sagemaker_level = sagemaker_prediction['predicted_level']
    sagemaker_confidence = sagemaker_prediction['confidence']
    
    # Add SageMaker data to analysis
    claude_analysis['sagemaker_prediction'] = {
        'predicted_level': sagemaker_level,
        'confidence': sagemaker_confidence,
        'confidences': sagemaker_prediction['confidences']
    }
    
    # If predictions match
    if claude_level == sagemaker_level:
        claude_analysis['validation_status'] = 'CONFIRMED'
        claude_analysis['confidence_boost'] = True
        claude_analysis['combined_confidence'] = min(0.95, sagemaker_confidence + 0.1)
        print(f"✅ Predictions match: {claude_level}")
    
    # If SageMaker has high confidence but differs
    elif sagemaker_confidence > 0.85:
        claude_analysis['validation_status'] = 'SAGEMAKER_OVERRIDE'
        claude_analysis['original_claude_level'] = claude_level
        claude_analysis['skill_level'] = sagemaker_level
        claude_analysis['combined_confidence'] = sagemaker_confidence
        print(f"⚠️  SageMaker override: {claude_level} → {sagemaker_level}")
    
    # If predictions differ with moderate confidence
    else:
        claude_analysis['validation_status'] = 'DIVERGENT'
        claude_analysis['combined_confidence'] = 0.7
        claude_analysis['note'] = f"Claude: {claude_level}, SageMaker: {sagemaker_level}"
        print(f"⚠️  Divergent predictions: Claude={claude_level}, SageMaker={sagemaker_level}")
    
    claude_analysis['enhanced_by_sagemaker'] = True
    
    return claude_analysis


def store_analysis_result(artisan_id, category, analysis):
    """
    Store analysis result in DynamoDB
    """
    try:
        table = dynamodb.Table(SKILLSCAN_TABLE)
        
        # Convert floats to Decimal for DynamoDB
        analysis_decimal = json.loads(
            json.dumps(analysis), 
            parse_float=Decimal
        )
        
        item = {
            'artisan_id': artisan_id,
            'analysis_id': f"{artisan_id}_{category}_{int(datetime.utcnow().timestamp())}",
            'category': category,
            'timestamp': datetime.utcnow().isoformat(),
            'analysis': analysis_decimal,
            'ttl': int(datetime.utcnow().timestamp()) + (365 * 24 * 60 * 60)  # 1 year TTL
        }
        
        table.put_item(Item=item)
        print(f"Stored analysis for artisan {artisan_id}")
        
    except Exception as e:
        print(f"Error storing analysis: {str(e)}")
        # Don't fail the request if storage fails


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
