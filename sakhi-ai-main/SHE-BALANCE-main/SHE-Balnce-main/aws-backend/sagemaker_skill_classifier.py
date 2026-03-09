"""
SageMaker Custom Skill Classifier
Trains a model to classify skill levels (Beginner/Intermediate/Advanced)
Works alongside Claude for enhanced accuracy
"""

import boto3
import json
import sagemaker
from sagemaker.tensorflow import TensorFlow
from sagemaker.predictor import Predictor

# Initialize clients
sagemaker_client = boto3.client('sagemaker')
s3_client = boto3.client('s3')

class SkillClassifier:
    """
    Custom skill level classifier using SageMaker
    """
    
    def __init__(self, endpoint_name='shebalance-skill-classifier'):
        self.endpoint_name = endpoint_name
        self.predictor = None
        
    def train_model(self, training_data_s3_path, output_path):
        """
        Train custom skill classification model
        
        Args:
            training_data_s3_path: S3 path to training data
            output_path: S3 path for model artifacts
        """
        
        # Define training job
        estimator = TensorFlow(
            entry_point='train_skill_classifier.py',
            role='arn:aws:iam::065538523474:role/SageMakerRole',
            instance_count=1,
            instance_type='ml.p3.2xlarge',  # GPU instance for training
            framework_version='2.12',
            py_version='py310',
            hyperparameters={
                'epochs': 50,
                'batch_size': 32,
                'learning_rate': 0.001,
                'num_classes': 3  # Beginner, Intermediate, Advanced
            }
        )
        
        # Start training
        estimator.fit({
            'training': training_data_s3_path,
            'validation': training_data_s3_path.replace('train', 'val')
        })
        
        return estimator
    
    def deploy_model(self, model_data):
        """
        Deploy trained model to SageMaker endpoint
        """
        
        # Create model
        model = sagemaker.model.Model(
            model_data=model_data,
            role='arn:aws:iam::065538523474:role/SageMakerRole',
            framework_version='2.12',
            py_version='py310'
        )
        
        # Deploy to endpoint
        self.predictor = model.deploy(
            initial_instance_count=1,
            instance_type='ml.t3.medium',  # Cost-effective inference
            endpoint_name=self.endpoint_name
        )
        
        return self.endpoint_name
    
    def predict_skill_level(self, image_features):
        """
        Predict skill level using deployed model
        
        Args:
            image_features: Extracted image features
            
        Returns:
            dict: Prediction with confidence scores
        """
        
        if not self.predictor:
            self.predictor = Predictor(
                endpoint_name=self.endpoint_name,
                sagemaker_session=sagemaker.Session()
            )
        
        # Make prediction
        response = self.predictor.predict(image_features)
        
        # Parse response
        predictions = json.loads(response)
        
        skill_levels = ['Beginner', 'Intermediate', 'Advanced']
        confidences = predictions['confidences']
        
        predicted_level = skill_levels[predictions['predicted_class']]
        confidence = confidences[predictions['predicted_class']]
        
        return {
            'skill_level': predicted_level,
            'confidence': confidence,
            'all_confidences': {
                'Beginner': confidences[0],
                'Intermediate': confidences[1],
                'Advanced': confidences[2]
            }
        }


# Integration with existing Lambda function
def enhanced_skill_analysis(image_data, category):
    """
    Combine Claude analysis with SageMaker classification
    """
    
    # Step 1: Get detailed analysis from Claude (existing)
    claude_analysis = analyze_with_claude(image_data, category)
    
    # Step 2: Get skill level prediction from SageMaker
    classifier = SkillClassifier()
    sagemaker_prediction = classifier.predict_skill_level(image_data)
    
    # Step 3: Combine results for enhanced accuracy
    final_analysis = {
        **claude_analysis,
        'sagemaker_prediction': sagemaker_prediction,
        'confidence_score': sagemaker_prediction['confidence'],
        'enhanced': True
    }
    
    # If SageMaker confidence is high, use it to validate Claude's assessment
    if sagemaker_prediction['confidence'] > 0.85:
        final_analysis['validated_skill_level'] = sagemaker_prediction['skill_level']
    
    return final_analysis
