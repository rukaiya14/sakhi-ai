"""
Deploy trained SageMaker model to endpoint
"""

import boto3
import time
import json

print("=" * 60)
print("SageMaker Model Deployment")
print("=" * 60)

# Configuration
REGION = 'us-east-1'
ACCOUNT_ID = '065538523474'
ROLE_ARN = f'arn:aws:iam::{ACCOUNT_ID}:role/SageMakerRole'
MODEL_NAME = 'shebalance-skill-classifier-model'
ENDPOINT_CONFIG_NAME = 'shebalance-skill-classifier-config'
ENDPOINT_NAME = 'shebalance-skill-classifier'
MODEL_DATA = 's3://shebalance-sagemaker-065538523474/skillscan/output/shebalance-skillscan-working/output/model.tar.gz'
CONTAINER_IMAGE = '763104351884.dkr.ecr.us-east-1.amazonaws.com/pytorch-inference:2.0.0-cpu-py310'

# Initialize client
sagemaker = boto3.client('sagemaker', region_name=REGION)

print(f"\n📋 Configuration:")
print(f"   Model Name: {MODEL_NAME}")
print(f"   Endpoint: {ENDPOINT_NAME}")
print(f"   Model Data: {MODEL_DATA}")

# Step 1: Create Model
print("\n🔨 Step 1: Creating SageMaker Model...")
try:
    # Delete existing model if exists
    try:
        sagemaker.delete_model(ModelName=MODEL_NAME)
        print(f"   Deleted existing model: {MODEL_NAME}")
        time.sleep(2)
    except:
        pass
    
    response = sagemaker.create_model(
        ModelName=MODEL_NAME,
        PrimaryContainer={
            'Image': CONTAINER_IMAGE,
            'ModelDataUrl': MODEL_DATA,
            'Environment': {
                'SAGEMAKER_PROGRAM': 'train.py',
                'SAGEMAKER_SUBMIT_DIRECTORY': MODEL_DATA
            }
        },
        ExecutionRoleArn=ROLE_ARN
    )
    print(f"   ✅ Model created: {response['ModelArn']}")
except Exception as e:
    print(f"   ❌ Error creating model: {e}")
    exit(1)

# Step 2: Create Endpoint Configuration
print("\n⚙️  Step 2: Creating Endpoint Configuration...")
try:
    # Delete existing config if exists
    try:
        sagemaker.delete_endpoint_config(EndpointConfigName=ENDPOINT_CONFIG_NAME)
        print(f"   Deleted existing config: {ENDPOINT_CONFIG_NAME}")
        time.sleep(2)
    except:
        pass
    
    response = sagemaker.create_endpoint_config(
        EndpointConfigName=ENDPOINT_CONFIG_NAME,
        ProductionVariants=[{
            'VariantName': 'AllTraffic',
            'ModelName': MODEL_NAME,
            'InstanceType': 'ml.t2.medium',
            'InitialInstanceCount': 1
        }]
    )
    print(f"   ✅ Config created: {response['EndpointConfigArn']}")
except Exception as e:
    print(f"   ❌ Error creating config: {e}")
    exit(1)

# Step 3: Create/Update Endpoint
print("\n🚀 Step 3: Creating Endpoint...")
print("   This will take 5-10 minutes...")

try:
    # Check if endpoint exists
    try:
        sagemaker.describe_endpoint(EndpointName=ENDPOINT_NAME)
        print(f"   Endpoint exists, updating...")
        
        response = sagemaker.update_endpoint(
            EndpointName=ENDPOINT_NAME,
            EndpointConfigName=ENDPOINT_CONFIG_NAME
        )
        print(f"   ✅ Endpoint updating: {response['EndpointArn']}")
    except:
        print(f"   Creating new endpoint...")
        
        response = sagemaker.create_endpoint(
            EndpointName=ENDPOINT_NAME,
            EndpointConfigName=ENDPOINT_CONFIG_NAME
        )
        print(f"   ✅ Endpoint creating: {response['EndpointArn']}")
    
    # Wait for endpoint to be in service
    print("\n⏰ Waiting for endpoint to be ready...")
    print("   Status updates every 30 seconds...")
    
    while True:
        response = sagemaker.describe_endpoint(EndpointName=ENDPOINT_NAME)
        status = response['EndpointStatus']
        
        if status == 'InService':
            print(f"\n   ✅ Endpoint is ready!")
            break
        elif status == 'Failed':
            print(f"\n   ❌ Endpoint creation failed!")
            print(f"   Reason: {response.get('FailureReason', 'Unknown')}")
            exit(1)
        else:
            print(f"   Status: {status}...")
            time.sleep(30)
    
except Exception as e:
    print(f"\n   ❌ Error with endpoint: {e}")
    exit(1)

# Save deployment info
deployment_info = {
    'model_name': MODEL_NAME,
    'endpoint_name': ENDPOINT_NAME,
    'endpoint_config': ENDPOINT_CONFIG_NAME,
    'model_data': MODEL_DATA,
    'status': 'deployed',
    'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
}

with open('deployment_info.json', 'w') as f:
    json.dump(deployment_info, f, indent=2)

print("\n" + "=" * 60)
print("✅ DEPLOYMENT COMPLETE!")
print("=" * 60)
print(f"\nEndpoint Name: {ENDPOINT_NAME}")
print(f"Status: InService")
print(f"Instance: ml.t2.medium")
print(f"Cost: ~$0.065/hour = ~$47/month")

print("\n📊 Next Steps:")
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
print("Deployment info saved to: deployment_info.json")
print("=" * 60)
