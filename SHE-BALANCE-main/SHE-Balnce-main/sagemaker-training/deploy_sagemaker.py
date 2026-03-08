"""
Deploy SageMaker Skill Classifier
Complete deployment pipeline
"""

import boto3
import sagemaker
from sagemaker.tensorflow import TensorFlow
from sagemaker.model import Model
import time
import json

class SageMakerDeployer:
    """
    Deploy skill classification model to SageMaker
    """
    
    def __init__(self):
        self.session = sagemaker.Session()
        self.region = boto3.Session().region_name
        self.role = 'arn:aws:iam::065538523474:role/SageMakerRole'  # Update with your role
        self.bucket = f'shebalance-sagemaker-{self.session.account_id()}'
        
        # Create bucket if doesn't exist
        self._create_bucket()
    
    def _create_bucket(self):
        """
        Create S3 bucket for SageMaker
        """
        s3_client = boto3.client('s3')
        
        try:
            s3_client.head_bucket(Bucket=self.bucket)
            print(f"✅ Bucket {self.bucket} already exists")
        except:
            print(f"Creating bucket {self.bucket}...")
            s3_client.create_bucket(Bucket=self.bucket)
            print(f"✅ Bucket created")
    
    def prepare_training_data(self, local_data_path):
        """
        Upload training data to S3
        
        Args:
            local_data_path: Path to local dataset folder
        """
        print("Uploading training data to S3...")
        
        # Upload to S3
        train_s3 = self.session.upload_data(
            path=f'{local_data_path}/train',
            bucket=self.bucket,
            key_prefix='skillscan/training/train'
        )
        
        val_s3 = self.session.upload_data(
            path=f'{local_data_path}/val',
            bucket=self.bucket,
            key_prefix='skillscan/training/val'
        )
        
        print(f"✅ Training data uploaded")
        print(f"   Train: {train_s3}")
        print(f"   Val: {val_s3}")
        
        return train_s3, val_s3
    
    def train_model(self, train_s3, val_s3):
        """
        Train model on SageMaker
        """
        print("\n🚀 Starting SageMaker training job...")
        
        # Create TensorFlow estimator
        estimator = TensorFlow(
            entry_point='train_skill_classifier.py',
            source_dir='.',
            role=self.role,
            instance_count=1,
            instance_type='ml.p3.2xlarge',  # GPU instance
            framework_version='2.12',
            py_version='py310',
            hyperparameters={
                'epochs': 50,
                'batch_size': 32,
                'learning_rate': 0.001
            },
            output_path=f's3://{self.bucket}/skillscan/output',
            base_job_name='shebalance-skill-classifier'
        )
        
        # Start training
        estimator.fit({
            'training': train_s3,
            'validation': val_s3
        })
        
        print("✅ Training completed!")
        print(f"   Model artifacts: {estimator.model_data}")
        
        return estimator
    
    def deploy_endpoint(self, estimator, endpoint_name='shebalance-skill-classifier'):
        """
        Deploy model to SageMaker endpoint
        """
        print(f"\n🚀 Deploying model to endpoint: {endpoint_name}")
        
        # Deploy
        predictor = estimator.deploy(
            initial_instance_count=1,
            instance_type='ml.t3.medium',  # Cost-effective for inference
            endpoint_name=endpoint_name,
            wait=True
        )
        
        print(f"✅ Endpoint deployed: {endpoint_name}")
        
        return predictor
    
    def test_endpoint(self, endpoint_name, test_image_path):
        """
        Test deployed endpoint
        """
        print(f"\n🧪 Testing endpoint: {endpoint_name}")
        
        # Load test image
        from PIL import Image
        import base64
        from io import BytesIO
        
        image = Image.open(test_image_path)
        buffered = BytesIO()
        image.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        # Create predictor
        predictor = sagemaker.predictor.Predictor(
            endpoint_name=endpoint_name,
            sagemaker_session=self.session
        )
        
        # Make prediction
        response = predictor.predict({
            'image': img_str
        })
        
        result = json.loads(response)
        
        print("✅ Test prediction:")
        print(f"   Predicted Level: {result['predicted_level']}")
        print(f"   Confidence: {result['confidence']:.2%}")
        print(f"   All Confidences:")
        for level, conf in result['confidences'].items():
            print(f"      {level}: {conf:.2%}")
        
        return result
    
    def get_deployment_info(self, endpoint_name):
        """
        Get deployment information
        """
        sagemaker_client = boto3.client('sagemaker')
        
        endpoint = sagemaker_client.describe_endpoint(EndpointName=endpoint_name)
        
        info = {
            'endpoint_name': endpoint_name,
            'endpoint_arn': endpoint['EndpointArn'],
            'status': endpoint['EndpointStatus'],
            'instance_type': endpoint['ProductionVariants'][0]['InstanceType'],
            'instance_count': endpoint['ProductionVariants'][0]['CurrentInstanceCount'],
            'creation_time': endpoint['CreationTime'].isoformat()
        }
        
        return info

def main():
    """
    Main deployment function
    """
    print("=" * 60)
    print("SheBalance Skill Classifier - SageMaker Deployment")
    print("=" * 60)
    
    deployer = SageMakerDeployer()
    
    # Step 1: Prepare data
    print("\n📁 Step 1: Preparing training data...")
    local_data_path = '../dataset-prepared'  # Update with your path
    
    # Check if data exists
    import os
    if not os.path.exists(local_data_path):
        print(f"❌ Data path not found: {local_data_path}")
        print("\nPlease prepare your dataset in this structure:")
        print("dataset-prepared/")
        print("  train/")
        print("    embroidery/")
        print("      beginner/")
        print("      intermediate/")
        print("      advanced/")
        print("    cooking/")
        print("      beginner/")
        print("      intermediate/")
        print("      advanced/")
        print("  val/")
        print("    (same structure)")
        return
    
    train_s3, val_s3 = deployer.prepare_training_data(local_data_path)
    
    # Step 2: Train model
    print("\n🎓 Step 2: Training model...")
    print("⏰ This will take 30-60 minutes...")
    
    estimator = deployer.train_model(train_s3, val_s3)
    
    # Step 3: Deploy endpoint
    print("\n🚀 Step 3: Deploying endpoint...")
    endpoint_name = 'shebalance-skill-classifier'
    
    predictor = deployer.deploy_endpoint(estimator, endpoint_name)
    
    # Step 4: Test endpoint
    print("\n🧪 Step 4: Testing endpoint...")
    test_image = '../dataset/embroidery/intermediate/test_image.jpg'
    
    if os.path.exists(test_image):
        deployer.test_endpoint(endpoint_name, test_image)
    else:
        print("⚠️  Test image not found, skipping test")
    
    # Step 5: Get deployment info
    print("\n📊 Step 5: Deployment Summary")
    info = deployer.get_deployment_info(endpoint_name)
    
    print("\n" + "=" * 60)
    print("✅ DEPLOYMENT COMPLETE!")
    print("=" * 60)
    print(f"\nEndpoint Name: {info['endpoint_name']}")
    print(f"Status: {info['status']}")
    print(f"Instance Type: {info['instance_type']}")
    print(f"Instance Count: {info['instance_count']}")
    print(f"\nYou can now use this endpoint in your Lambda function!")
    print("\nNext steps:")
    print("1. Update lambda_skillscan_analysis.py with endpoint name")
    print("2. Test integration with existing SkillScan")
    print("3. Monitor CloudWatch metrics")
    print("=" * 60)

if __name__ == '__main__':
    main()
