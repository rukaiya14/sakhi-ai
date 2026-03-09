"""
SageMaker Recommendation Engine
Recommends best artisans to buyers based on:
- Skill scores
- Past work quality
- Buyer preferences
- Order history
"""

import boto3
import json
from sagemaker import get_execution_role
from sagemaker.amazon.amazon_estimator import get_image_uri

class ArtisanRecommendationEngine:
    """
    Personalized artisan recommendations using SageMaker
    """
    
    def __init__(self):
        self.endpoint_name = 'shebalance-artisan-recommender'
        self.sagemaker_client = boto3.client('sagemaker-runtime')
    
    def train_recommendation_model(self, training_data_s3):
        """
        Train recommendation model using Factorization Machines
        
        Features:
        - Artisan skill scores
        - Category expertise
        - Past ratings
        - Completion rate
        - Response time
        - Price range
        """
        
        # Use SageMaker's built-in Factorization Machines algorithm
        container = get_image_uri(boto3.Session().region_name, 'factorization-machines')
        
        fm = sagemaker.estimator.Estimator(
            container,
            role=get_execution_role(),
            instance_count=1,
            instance_type='ml.m5.xlarge',
            output_path='s3://shebalance-models/recommendations/',
            sagemaker_session=sagemaker.Session()
        )
        
        # Set hyperparameters
        fm.set_hyperparameters(
            feature_dim=50,  # Number of features
            predictor_type='regressor',
            mini_batch_size=100,
            num_factors=64,
            epochs=100
        )
        
        # Train
        fm.fit({'train': training_data_s3})
        
        return fm
    
    def get_recommendations(self, buyer_id, category, top_n=10):
        """
        Get top N artisan recommendations for a buyer
        
        Args:
            buyer_id: Buyer identifier
            category: Skill category (embroidery, cooking, etc.)
            top_n: Number of recommendations
            
        Returns:
            list: Top recommended artisans with scores
        """
        
        # Prepare input features
        features = self._prepare_features(buyer_id, category)
        
        # Call SageMaker endpoint
        response = self.sagemaker_client.invoke_endpoint(
            EndpointName=self.endpoint_name,
            ContentType='application/json',
            Body=json.dumps(features)
        )
        
        # Parse recommendations
        predictions = json.loads(response['Body'].read())
        
        # Get top N artisans
        recommendations = self._rank_artisans(predictions, top_n)
        
        return recommendations
    
    def _prepare_features(self, buyer_id, category):
        """
        Prepare feature vector for recommendation
        """
        
        # Get buyer preferences from DynamoDB
        buyer_prefs = self._get_buyer_preferences(buyer_id)
        
        # Get artisan features for category
        artisan_features = self._get_artisan_features(category)
        
        # Combine features
        features = {
            'buyer_id': buyer_id,
            'category': category,
            'buyer_budget': buyer_prefs.get('budget', 'medium'),
            'preferred_style': buyer_prefs.get('style', 'traditional'),
            'past_categories': buyer_prefs.get('past_categories', []),
            'artisan_features': artisan_features
        }
        
        return features
    
    def _rank_artisans(self, predictions, top_n):
        """
        Rank artisans by prediction score
        """
        
        ranked = sorted(
            predictions,
            key=lambda x: x['score'],
            reverse=True
        )[:top_n]
        
        return ranked


# Usage in Lambda function
def recommend_artisans_for_buyer(buyer_id, category):
    """
    Get personalized artisan recommendations
    """
    
    recommender = ArtisanRecommendationEngine()
    recommendations = recommender.get_recommendations(buyer_id, category, top_n=10)
    
    return {
        'buyer_id': buyer_id,
        'category': category,
        'recommendations': recommendations,
        'personalized': True
    }
