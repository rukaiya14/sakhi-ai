# 🤖 SageMaker Integration Guide

Complete guide to add custom skill classification with SageMaker

---

## 🎯 What You're Building

**Hybrid AI System:**
- **Claude 3.5 Sonnet**: Detailed analysis, feedback, recommendations
- **SageMaker Custom Model**: Fast, accurate skill level classification
- **Combined**: Best of both worlds - detailed + accurate

---

## 📋 Prerequisites

1. ✅ SkillScan AI already deployed (Claude working)
2. ✅ AWS account with SageMaker access
3. ✅ Training images organized in dataset folder
4. ✅ IAM role with SageMaker permissions

---

## 🚀 Step-by-Step Setup

### Step 1: Create IAM Role for SageMaker

```bash
# Create role
aws iam create-role \
  --role-name SageMakerRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "sagemaker.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

# Attach policies
aws iam attach-role-policy \
  --role-name SageMakerRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonSageMakerFullAccess

aws iam attach-role-policy \
  --role-name SageMakerRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
```

### Step 2: Prepare Training Dataset

Your images should be organized like this:

```
dataset/
├── embroidery/
│   ├── beginner/       (at least 50 images)
│   ├── intermediate/   (at least 50 images)
│   └── advanced/       (at least 50 images)
├── cooking/
│   ├── beginner/
│   ├── intermediate/
│   └── advanced/
├── henna/
├── crochet/
├── tailoring/
└── crafts/
```

**Minimum Requirements:**
- At least 50 images per skill level
- Clear, well-lit photos
- JPG or PNG format
- Under 10MB each

Run preparation script:

```bash
cd sagemaker-training
python prepare_dataset.py
```

This will:
- Split data into train (80%) and validation (20%)
- Create `dataset-prepared/` folder
- Organize for SageMaker training

### Step 3: Deploy SageMaker Model

```bash
cd sagemaker-training
python deploy_sagemaker.py
```

This will:
1. Upload data to S3
2. Start training job (30-60 minutes)
3. Deploy model to endpoint
4. Test the endpoint

**Expected Output:**
```
✅ DEPLOYMENT COMPLETE!
Endpoint Name: shebalance-skill-classifier
Status: InService
Instance Type: ml.t3.medium
```

### Step 4: Update Lambda Function

Update environment variables:

```bash
aws lambda update-function-configuration \
  --function-name SheBalance-SkillScan-Analysis \
  --environment Variables="{
    SKILLSCAN_TABLE=SheBalance-SkillScan,
    S3_BUCKET=shebalance-skillscan-images-065538523474,
    SAGEMAKER_ENDPOINT=shebalance-skill-classifier,
    USE_SAGEMAKER=true
  }"
```

### Step 5: Update Lambda IAM Role

Add SageMaker permissions:

```bash
aws iam attach-role-policy \
  --role-name SheBalance-SkillScan-Lambda-production \
  --policy-arn arn:aws:iam::aws:policy/AmazonSageMakerFullAccess
```

### Step 6: Deploy Updated Lambda

```bash
cd aws-cdk
cdk deploy
```

---

## 🧪 Testing

### Test 1: SageMaker Endpoint Directly

```python
import boto3
import json
import base64

# Load test image
with open('test_image.jpg', 'rb') as f:
    image_data = base64.b64encode(f.read()).decode()

# Call endpoint
client = boto3.client('sagemaker-runtime')
response = client.invoke_endpoint(
    EndpointName='shebalance-skill-classifier',
    ContentType='application/json',
    Body=json.dumps({'image': image_data})
)

result = json.loads(response['Body'].read())
print(f"Predicted: {result['predicted_level']}")
print(f"Confidence: {result['confidence']:.2%}")
```

### Test 2: Full Integration Test

```bash
# Open test page
http://localhost:8000/skills.html

# Upload images and analyze
# Check results for "enhanced_by_sagemaker": true
```

---

## 📊 How It Works

### Analysis Flow:

```
1. User uploads images
   ↓
2. Lambda receives request
   ↓
3. Claude analyzes images (detailed feedback)
   ↓
4. SageMaker predicts skill level (fast, accurate)
   ↓
5. Combine predictions:
   - If match → Boost confidence
   - If SageMaker confident → Use SageMaker
   - If divergent → Flag for review
   ↓
6. Return enhanced results
```

### Prediction Combination Logic:

```python
if claude_level == sagemaker_level:
    # Predictions match - high confidence
    status = "CONFIRMED"
    confidence = 95%

elif sagemaker_confidence > 85%:
    # SageMaker very confident - use it
    status = "SAGEMAKER_OVERRIDE"
    final_level = sagemaker_level

else:
    # Predictions differ - flag for review
    status = "DIVERGENT"
    confidence = 70%
```

---

## 💰 Cost Breakdown

### Training (One-time):
- **Instance**: ml.p3.2xlarge (GPU)
- **Duration**: ~1 hour
- **Cost**: ~$3-5

### Inference (Monthly):
- **Instance**: ml.t3.medium
- **Always-on**: $50/month
- **Per prediction**: ~$0.001

### Total Monthly Cost (1000 analyses):
- Claude: $3-5
- SageMaker: $50
- Lambda: $0 (free tier)
- DynamoDB: $1-2
- **Total**: ~$55-60/month

**Cost Optimization:**
- Use serverless inference (pay per use)
- Auto-scaling endpoints
- Batch predictions

---

## 📈 Monitoring

### CloudWatch Metrics:

```bash
# SageMaker endpoint metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/SageMaker \
  --metric-name ModelLatency \
  --dimensions Name=EndpointName,Value=shebalance-skill-classifier \
  --start-time 2026-03-01T00:00:00Z \
  --end-time 2026-03-02T00:00:00Z \
  --period 3600 \
  --statistics Average
```

### Key Metrics to Monitor:
- Model latency
- Invocation count
- Model accuracy
- Prediction confidence distribution

---

## 🔧 Troubleshooting

### Issue: Training job fails

**Check logs:**
```bash
aws sagemaker describe-training-job \
  --training-job-name shebalance-skill-classifier-YYYY-MM-DD-HH-MM-SS
```

**Common causes:**
- Insufficient training data
- Incorrect data format
- IAM permission issues

### Issue: Endpoint not responding

**Check status:**
```bash
aws sagemaker describe-endpoint \
  --endpoint-name shebalance-skill-classifier
```

**Restart endpoint:**
```bash
aws sagemaker update-endpoint \
  --endpoint-name shebalance-skill-classifier \
  --endpoint-config-name shebalance-skill-classifier-config
```

### Issue: Low accuracy

**Solutions:**
- Add more training images
- Balance dataset (equal images per class)
- Increase training epochs
- Fine-tune hyperparameters

---

## 🎯 Expected Results

### Before SageMaker (Claude only):
```json
{
  "overall_score": 85,
  "skill_level": "Advanced",
  "confidence": "N/A"
}
```

### After SageMaker Integration:
```json
{
  "overall_score": 85,
  "skill_level": "Advanced",
  "sagemaker_prediction": {
    "predicted_level": "Advanced",
    "confidence": 0.92
  },
  "validation_status": "CONFIRMED",
  "combined_confidence": 0.95,
  "enhanced_by_sagemaker": true
}
```

---

## 📚 Files Created

1. `sagemaker-training/train_skill_classifier.py` - Training script
2. `sagemaker-training/inference.py` - Inference handler
3. `sagemaker-training/deploy_sagemaker.py` - Deployment script
4. `sagemaker-training/prepare_dataset.py` - Data preparation
5. `aws-backend/lambda_skillscan_analysis.py` - Updated Lambda (with SageMaker)

---

## 🚀 Quick Start Commands

```bash
# 1. Prepare dataset
cd sagemaker-training
python prepare_dataset.py

# 2. Deploy SageMaker
python deploy_sagemaker.py

# 3. Update Lambda
cd ../aws-cdk
cdk deploy

# 4. Test
http://localhost:8000/skills.html
```

---

## ✅ Success Checklist

- [ ] IAM role created for SageMaker
- [ ] Dataset prepared (train/val split)
- [ ] Training job completed successfully
- [ ] Model deployed to endpoint
- [ ] Endpoint status: InService
- [ ] Lambda updated with SageMaker integration
- [ ] IAM permissions added
- [ ] Test prediction successful
- [ ] Full integration test passed
- [ ] Results show "enhanced_by_sagemaker": true

---

## 🎉 Benefits

✅ **Higher Accuracy**: Custom model trained on your data  
✅ **Faster Inference**: SageMaker optimized for speed  
✅ **Validation**: Cross-check Claude predictions  
✅ **Confidence Scores**: Know when predictions are reliable  
✅ **Scalable**: Handle high volume efficiently  

---

**Ready to deploy?** Start with Step 1! 🚀
