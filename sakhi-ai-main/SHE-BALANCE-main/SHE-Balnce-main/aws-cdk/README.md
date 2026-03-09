# SkillScan AI - AWS CDK Deployment

Simple deployment using AWS CDK with Claude 3.5 Sonnet

## 📋 Prerequisites

1. **IAM User Created** with these permissions:
   - AmazonBedrockFullAccess
   - AWSLambda_FullAccess
   - AmazonDynamoDBFullAccess
   - AmazonS3FullAccess
   - IAMFullAccess
   - CloudFormationFullAccess
   - AmazonAPIGatewayAdministrator

2. **Node.js installed** (v18 or higher)
3. **AWS CDK installed**: `npm install -g aws-cdk`
4. **Python 3.11** installed

## 🚀 Quick Deployment

### Step 1: Provide Your AWS Credentials

Create a file: `aws-credentials.txt` with:
```
AWS_ACCESS_KEY_ID=your-access-key-here
AWS_SECRET_ACCESS_KEY=your-secret-key-here
AWS_REGION=us-east-1
```

### Step 2: Install Dependencies

```bash
cd aws-cdk
npm install
pip install -r requirements.txt
```

### Step 3: Deploy

```bash
# Configure AWS credentials
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_DEFAULT_REGION=us-east-1

# Bootstrap CDK (first time only)
cdk bootstrap

# Deploy
cdk deploy
```

### Step 4: Get API Endpoint

After deployment, you'll see:
```
Outputs:
SkillScanStack.APIEndpoint = https://xxxxx.execute-api.us-east-1.amazonaws.com/prod
```

Copy this endpoint!

## 📁 Dataset Folder Structure

Place your images in: `dataset/` folder

```
dataset/
├── embroidery/
│   ├── beginner/
│   │   ├── image1.jpg
│   │   ├── image2.jpg
│   │   └── ...
│   ├── intermediate/
│   └── advanced/
├── cooking/
│   ├── beginner/
│   ├── intermediate/
│   └── advanced/
├── henna/
├── crochet/
├── tailoring/
└── crafts/
```

Images will be automatically uploaded to S3 during deployment.

## ✅ That's It!

The system is ready to use - no training needed!
Claude 3.5 Sonnet works immediately with your images.
