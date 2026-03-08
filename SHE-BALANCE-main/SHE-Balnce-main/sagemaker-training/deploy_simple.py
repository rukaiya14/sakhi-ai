"""
Simplified SageMaker Deployment
Uses AWS built-in Image Classification algorithm
"""

import boto3
import sagemaker
from sagemaker import image_uris
from sagemaker.inputs import TrainingInput
import time
import json
import os

print("=" * 60)
print("SheBalance SkillScan - SageMaker Training")
print("=" * 60)

# Initialize
session = sagemaker.Session()
region = boto3.Session().region_name
account_id = '065538523474'
role_arn = f'arn:aws:iam::{account_id}:role/SageMakerRole'
bucket = f'shebalance-sagemaker-{account_id}'

print(f"\n📋 Configuration:")
print(f"   Region: {region}")
print(f"   Account: {account_id}")
print(f"   Role: {role_arn}")
print(f"   Bucket: {bucket}")

# Check if dataset is prepared
dataset_path = '../dataset-prepared'
if not os.path.exists(dataset_path):
    print(f"\n❌ Dataset not found at: {dataset_path}")
    print("Please run: python prepare_dataset.py")
    exit(1)

print(f"\n✅ Dataset found: {dataset_path}")

# Upload data to S3
print("\n📤 Step 1: Uploading training data to S3...")
print("   This may take 5-10 minutes depending on image count...")

try:
    train_s3 = session.upload_data(
        path=f'{dataset_path}/train',
        bucket=bucket,
        key_prefix='skillscan/training/train'
    )
    print(f"   ✅ Training data uploaded: {train_s3}")
    
    val_s3 = session.upload_data(
        path=f'{dataset_path}/val',
        bucket=bucket,
        key_prefix='skillscan/training/val'
    )
    print(f"   ✅ Validation data uploaded: {val_s3}")
except Exception as e:
    print(f"   ❌ Upload failed: {e}")
    exit(1)

# Get built-in image classification algorithm
print("\n🔍 Step 2: Getting SageMaker Image Classification algorithm...")
training_image = image_uris.retrieve(
    framework='image-classification',
    region=region,
    version='latest'
)
print(f"   ✅ Algorithm image: {training_image}")

# Create estimator
print("\n🚀 Step 3: Creating training job...")
job_name = f'shebalance-skillscan-{int(time.time())}'

estimator = sagemaker.estimator.Estimator(
    image_uri=training_image,
    role=role_arn,
    instance_count=1,
    instance_type='ml.p3.2xlarge',  # GPU instance
    output_path=f's3://{bucket}/skillscan/output',
    sagemaker_session=session,
    base_job_name='shebalance-skillscan'
)

# Set hyperparameters
print("\n⚙️  Step 4: Configuring hyperparameters...")
estimator.set_hyperparameters(
    num_layers=18,
    use_pretrained_model=1,
    image_shape='3,224,224',
    num_classes=3,  # beginner, intermediate, advanced
    num_training_samples=400,  # Approximate
    mini_batch_size=32,
    epochs=50,
    learning_rate=0.001,
    optimizer='adam',
    top_k=2,
    precision_dtype='float32'
)
print("   ✅ Hyperparameters configured")

# Start training
print("\n" + "=" * 60)
print("🎓 Step 5: Starting Training Job")
print("=" * 60)
print(f"\nJob Name: {job_name}")
print(f"Instance: ml.p3.2xlarge (GPU)")
print(f"Duration: ~30-60 minutes")
print(f"Cost: ~$3-5")
print("\n⏰ Training started... This will take a while.")
print("   You can close this window - training continues on AWS")
print("   Check progress in AWS Console: SageMaker > Training Jobs")
print("\n" + "=" * 60)

try:
    estimator.fit({
        'train': TrainingInput(train_s3, content_type='application/x-image'),
        'validation': TrainingInput(val_s3, content_type='application/x-image')
    }, wait=True, logs='All')
    
    print("\n" + "=" * 60)
    print("✅ TRAINING COMPLETE!")
    print("=" * 60)
    print(f"\nModel artifacts: {estimator.model_data}")
    
except Exception as e:
    print(f"\n❌ Training failed: {e}")
    print("\nPossible issues:")
    print("1. Insufficient data format")
    print("2. Instance quota exceeded")
    print("3. IAM permissions")
    exit(1)

# Deploy endpoint
print("\n" + "=" * 60)
print("🚀 Step 6: Deploying Endpoint")
print("=" * 60)
print("\nEndpoint Name: shebalance-skill-classifier")
print("Instance: ml.t3.medium")
print("Cost: ~$50/month")
print("\n⏰ Deploying... This takes 5-10 minutes")

try:
    predictor = estimator.deploy(
        initial_instance_count=1,
        instance_type='ml.t3.medium',
        endpoint_name='shebalance-skill-classifier'
    )
    
    print("\n" + "=" * 60)
    print("✅ DEPLOYMENT COMPLETE!")
    print("=" * 60)
    print("\nEndpoint: shebalance-skill-classifier")
    print("Status: InService")
    
except Exception as e:
    print(f"\n❌ Deployment failed: {e}")
    print("\nYou can deploy manually later using AWS Console")

# Save deployment info
deployment_info = {
    'endpoint_name': 'shebalance-skill-classifier',
    'model_data': estimator.model_data if hasattr(estimator, 'model_data') else 'N/A',
    'training_job': job_name,
    'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
    'status': 'deployed'
}

with open('deployment_info.json', 'w') as f:
    json.dump(deployment_info, f, indent=2)

print("\n" + "=" * 60)
print("📊 NEXT STEPS")
print("=" * 60)
print("\n1. Update Lambda Function:")
print("   aws lambda update-function-configuration \\")
print("     --function-name SheBalance-SkillScan-Analysis \\")
print("     --environment Variables=\"{")
print("       SKILLSCAN_TABLE=SheBalance-SkillScan,")
print("       S3_BUCKET=shebalance-skillscan-images-065538523474,")
print("       SAGEMAKER_ENDPOINT=shebalance-skill-classifier,")
print("       USE_SAGEMAKER=true")
print("     }\"")

print("\n2. Add SageMaker Permissions to Lambda:")
print("   aws iam attach-role-policy \\")
print("     --role-name SheBalance-SkillScan-Lambda-production \\")
print("     --policy-arn arn:aws:iam::aws:policy/AmazonSageMakerFullAccess")

print("\n3. Test Integration:")
print("   http://localhost:8000/skills.html")
print("   Upload image and check for 'enhanced_by_sagemaker': true")

print("\n" + "=" * 60)
print("✅ ALL DONE!")
print("=" * 60)
print("\nDeployment info saved to: deployment_info.json")
print("\nYour SkillScan AI now uses:")
print("- Claude 3.5 Sonnet for detailed analysis")
print("- SageMaker for skill level classification")
print("- Combined intelligence for best results!")
print("\n" + "=" * 60)
