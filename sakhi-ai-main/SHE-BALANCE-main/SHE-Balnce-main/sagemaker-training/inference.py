"""
SageMaker Inference Script
Handles predictions from deployed model
"""

import tensorflow as tf
from tensorflow import keras
import numpy as np
import json
import base64
from io import BytesIO
from PIL import Image

# Skill levels
SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced']

def model_fn(model_dir):
    """
    Load the trained model
    Called once when endpoint starts
    """
    model = keras.models.load_model(f'{model_dir}/skill_classifier_model')
    return model

def input_fn(request_body, content_type='application/json'):
    """
    Preprocess input data
    """
    if content_type == 'application/json':
        data = json.loads(request_body)
        
        # Handle base64 encoded image
        if 'image' in data:
            image_data = data['image']
            
            # Remove data URL prefix if present
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            # Decode base64
            image_bytes = base64.b64decode(image_data)
            image = Image.open(BytesIO(image_bytes))
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize to model input size
            image = image.resize((224, 224))
            
            # Convert to numpy array
            image_array = np.array(image)
            
            # Add batch dimension
            image_array = np.expand_dims(image_array, axis=0)
            
            return image_array
        
        # Handle numpy array
        elif 'data' in data:
            return np.array(data['data'])
    
    raise ValueError(f"Unsupported content type: {content_type}")

def predict_fn(input_data, model):
    """
    Make predictions
    """
    # Get predictions
    predictions = model.predict(input_data)
    
    return predictions

def output_fn(predictions, accept='application/json'):
    """
    Format output
    """
    # Get predicted class
    predicted_class = int(np.argmax(predictions[0]))
    predicted_level = SKILL_LEVELS[predicted_class]
    
    # Get confidence scores
    confidences = predictions[0].tolist()
    
    # Create response
    response = {
        'predicted_class': predicted_class,
        'predicted_level': predicted_level,
        'confidence': float(confidences[predicted_class]),
        'confidences': {
            'Beginner': float(confidences[0]),
            'Intermediate': float(confidences[1]),
            'Advanced': float(confidences[2])
        },
        'all_scores': confidences
    }
    
    if accept == 'application/json':
        return json.dumps(response), accept
    
    raise ValueError(f"Unsupported accept type: {accept}")
