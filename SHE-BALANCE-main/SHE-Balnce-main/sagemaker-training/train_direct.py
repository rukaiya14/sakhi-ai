"""
Direct SageMaker Training using boto3
Bypasses sagemaker SDK issues
"""

import boto3
import json
import time
import os
from pathlib import Path

print("=" * 60)
print("SheBalance SkillScan - Direct SageMaker Training")
print("=" * 60)

# Configuration
ACCOUNT_ID = '065538523474'
REGION = 'us-east-1'
ROLE_ARN = f'arn:aws:iam::{ACCOUNT_ID}:role/SageMakerRole'
BUCKET = f'shebalance-sagemaker-{ACCOUNT_ID}'
JOB_NAME = f'shebalance-skillscan-{int(time.time())}'

# Initialize clients
s3 = boto3.client('s3', region_name=REGION)
sagemaker = boto3.client('sagemaker', region_name=REGION)

print(f"\n📋 Configuration:")
print(f"   Region: {REGION}")
print(f"   Account: {ACCOUNT_ID}")
print(f"   Role: {ROLE_ARN}")
print(f"   Bucket: {BUCKET}")
print(f"   Job Name: {JOB_NAME}")

# Check dataset
dataset_path = Path('../dataset-prepared')
if not dataset_path.exists():
    print(f"\n❌ Dataset not found: {dataset_path}")
    print("Run: python prepare_dataset.py")
    exit(1)

print(f"\n✅ Dataset found: {dataset_path}")

# Count images
def count_images(path):
    count = 0
    for root, dirs, files in os.walk(path):
        count += len([f for f in files if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))])
    return count

train_count = count_images(dataset_path / 'train')
val_count = count_images(dataset_path / 'val')

print(f"   Training images: {train_count}")
print(f"   Validation images: {val_count}")

# Upload to S3
print("\n📤 Step 1: Uploading data to S3...")
print("   This may take 5-10 minutes...")

def upload_directory(local_path, s3_prefix):
    uploaded = 0
    for root, dirs, files in os.walk(local_path):
        for file in files:
            if file.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                local_file = os.path.join(root, file)
                relative_path = os.path.relpath(local_file, local_path)
                s3_key = f'{s3_prefix}/{relative_path}'.replace('\\', '/')
                
                try:
                    s3.upload_file(local_file, BUCKET, s3_key)
                    uploaded += 1
                    if uploaded % 50 == 0:
                        print(f"   Uploaded {uploaded} images...")
                except Exception as e:
                    print(f"   ⚠️  Failed to upload {file}: {e}")
    
    return uploaded

try:
    train_uploaded = upload_directory(dataset_path / 'train', 'skillscan/training/train')
    print(f"   ✅ Training data uploaded: {train_uploaded} images")
    
    val_uploaded = upload_directory(dataset_path / 'val', 'skillscan/training/val')
    print(f"   ✅ Validation data uploaded: {val_uploaded} images")
    
    train_s3_uri = f's3://{BUCKET}/skillscan/training/train'
    val_s3_uri = f's3://{BUCKET}/skillscan/training/val'
    
except Exception as e:
    print(f"   ❌ Upload failed: {e}")
    exit(1)

# Get Image Classification algorithm image
print("\n🔍 Step 2: Getting algorithm container...")

# Image Classification algorithm container for us-east-1
training_image = f'382416733822.dkr.ecr.{REGION}.amazonaws.com/image-classification:latest'
print(f"   ✅ Container: {training_image}")

# Create training job
print("\n🚀 Step 3: Creating training job...")
print(f"   Job: {JOB_NAME}")
print(f"   Instance: ml.p3.2xlarge (GPU)")
print(f"   Duration: ~30-60 minutes")
print(f"   Cost: ~$3-5")

training_params = {
    'TrainingJobName': JOB_NAME,
    'RoleArn': ROLE_ARN,
    'AlgorithmSpecification': {
        'TrainingImage': training_image,
        'TrainingInputMode': 'File'
    },
    'InputDataConfig': [
        {
            'ChannelName': 'train',
            'DataSource': {
                'S3DataSource': {
                    'S3DataType': 'S3Prefix',
                    'S3Uri': train_s3_uri,
                    'S3DataDistributionType': 'FullyReplicated'
                }
            },
            'ContentType': 'application/x-image',
            'CompressionType': 'None'
        },
        {
            'ChannelName': 'validation',
            'DataSource': {
                'S3DataSource': {
                    'S3DataType': 'S3Prefix',
                    'S3Uri': val_s3_uri,
                    'S3DataDistributionType': 'FullyReplicated'
                }
            },
            'ContentType': 'application/x-image',
            'CompressionType': 'None'
        }
    ],
    'OutputDataConfig': {
        'S3OutputPath': f's3://{BUCKET}/skillscan/output'
    },
    'ResourceConfig': {
        'InstanceType': 'ml.p3.2xlarge',
        'InstanceCount': 1,
        'VolumeSizeInGB': 50
    },
    'StoppingCondition': {
        'MaxRuntimeInSeconds': 86400  # 24 hours max
    },
    'HyperParameters': {
        'num_layers': '18',
        'use_pretrained_model': '1',
        'image_shape': '3,224,224',
        'num_classes': '3',
        'num_training_samples': str(train_count),
        'mini_batch_size': '32',
        'epochs': '50',
        'learning_rate': '0.001',
        'optimizer': 'adam',
        'top_k': '2',
        'precision_dtype': 'float32'
    }
}

try:
    response = sagemaker.create_training_job(**training_params)
    print(f"\n✅ Training job created!")
    print(f"   Job ARN: {response['TrainingJobArn']}")
    
except Exception as e:
    print(f"\n❌ Failed to create training job: {e}")
    print("\nPossible issues:")
    print("1. Instance quota exceeded (request ml.p3.2xlarge quota increase)")
    print("2. IAM role permissions")
    print("3. S3 bucket access")
    exit(1)

# Monitor training
print("\n" + "=" * 60)
print("⏰ TRAINING IN PROGRESS")
print("=" * 60)
print("\nYou can:")
print("1. Close this window - training continues on AWS")
print("2. Check progress in AWS Console:")
print("   https://console.aws.amazon.com/sagemaker/home?region=us-east-1#/jobs")
print(f"3. Search for job: {JOB_NAME}")
print("\nOr wait here for completion (30-60 minutes)...")

choice = input("\nWait for completion? (y/n): ")

if choice.lower() == 'y':
    print("\n⏰ Monitoring training job...")
    print("   This will take 30-60 minutes...")
    
    while True:
        try:
            status = sagemaker.describe_training_job(TrainingJobName=JOB_NAME)
            current_status = status['TrainingJobStatus']
            
            if current_status == 'Completed':
                print("\n" + "=" * 60)
                print("✅ TRAINING COMPLETE!")
                print("=" * 60)
                print(f"\nModel artifacts: {status['ModelArtifacts']['S3ModelArtifacts']}")
                break
            
            elif current_status == 'Failed':
                print("\n❌ Training failed!")
                print(f"Reason: {status.get('FailureReason', 'Unknown')}")
                exit(1)
            
            elif current_status in ['InProgress', 'Stopping']:
                print(f"   Status: {current_status} - {time.strftime('%H:%M:%S')}")
                time.sleep(60)  # Check every minute
            
            else:
                print(f"   Status: {current_status}")
                time.sleep(30)
        
        except KeyboardInterrupt:
            print("\n\n⚠️  Monitoring stopped (training continues on AWS)")
            break
        except Exception as e:
            print(f"\n⚠️  Error checking status: {e}")
            time.sleep(60)

# Save job info
job_info = {
    'job_name': JOB_NAME,
    'status': 'in_progress',
    'train_s3': train_s3_uri,
    'val_s3': val_s3_uri,
    'output_s3': f's3://{BUCKET}/skillscan/output',
    'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
}

with open('training_job_info.json', 'w') as f:
    json.dump(job_info, f, indent=2)

print("\n" + "=" * 60)
print("📊 TRAINING JOB STARTED")
print("=" * 60)
print(f"\nJob Name: {JOB_NAME}")
print(f"Status: In Progress")
print(f"\nJob info saved to: training_job_info.json")
print("\nTo check status later:")
print(f"aws sagemaker describe-training-job --training-job-name {JOB_NAME}")
print("\nOnce complete, run: python deploy_endpoint.py")
print("\n" + "=" * 60)
