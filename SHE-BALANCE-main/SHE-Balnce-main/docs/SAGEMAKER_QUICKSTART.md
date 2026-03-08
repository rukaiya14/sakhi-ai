# 🚀 SageMaker Integration - Quick Start

Add custom skill classification to your SkillScan AI in 4 steps

---

## ✅ What You Have Now

- Claude 3.5 Sonnet analyzing images ✅
- Detailed feedback and recommendations ✅
- Working on localhost ✅

## 🎯 What You'll Add

- Custom ML model trained on YOUR data
- Faster, more accurate skill level prediction
- Validation of Claude's assessments
- Higher confidence scores

---

## 📋 Requirements

1. **Training Images**: At least 50 images per skill level
   - Beginner: 50+ images
   - Intermediate: 50+ images
   - Advanced: 50+ images

2. **Time**: ~2 hours total
   - Data prep: 10 minutes
   - Training: 60 minutes (automated)
   - Deployment: 30 minutes

3. **Cost**: ~$55/month
   - Training (one-time): $3-5
   - Inference: $50/month

---

## 🚀 4-Step Setup

### Step 1: Prepare Your Images (10 min)

```bash
cd sagemaker-training
python prepare_dataset.py
```

**What it does:**
- Organizes your images
- Splits into train/val (80/20)
- Creates `dataset-prepared/` folder

**Expected output:**
```
✅ Dataset Preparation Complete!
Total Images: 900
Training Images: 720 (80%)
Validation Images: 180 (20%)
```

---

### Step 2: Train & Deploy Model (60 min)

```bash
python deploy_sagemaker.py
```

**What it does:**
1. Uploads data to S3
2. Starts SageMaker training job
3. Trains CNN model (MobileNetV2)
4. Deploys to endpoint
5. Tests the model

**Expected output:**
```
✅ DEPLOYMENT COMPLETE!
Endpoint Name: shebalance-skill-classifier
Status: InService
```

**Note:** Training takes 30-60 minutes. Grab a coffee! ☕

---

### Step 3: Update Lambda (5 min)

```bash
# Enable SageMaker in Lambda
aws lambda update-function-configuration \
  --function-name SheBalance-SkillScan-Analysis \
  --environment Variables="{
    SKILLSCAN_TABLE=SheBalance-SkillScan,
    S3_BUCKET=shebalance-skillscan-images-065538523474,
    SAGEMAKER_ENDPOINT=shebalance-skill-classifier,
    USE_SAGEMAKER=true
  }"

# Add SageMaker permissions
aws iam attach-role-policy \
  --role-name SheBalance-SkillScan-Lambda-production \
  --policy-arn arn:aws:iam::aws:policy/AmazonSageMakerFullAccess

# Deploy
cd ../aws-cdk
cdk deploy
```

---

### Step 4: Test It! (5 min)

```bash
# Open skills page
http://localhost:8000/skills.html

# Upload images and analyze
# Look for "enhanced_by_sagemaker": true in results
```

---

## 📊 Before vs After

### Before (Claude Only):
```json
{
  "skill_level": "Advanced",
  "overall_score": 85
}
```

### After (Claude + SageMaker):
```json
{
  "skill_level": "Advanced",
  "overall_score": 85,
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

## 💡 Key Benefits

| Feature | Claude Only | Claude + SageMaker |
|---------|-------------|-------------------|
| **Accuracy** | Good | Excellent |
| **Speed** | 5-10 sec | 3-5 sec |
| **Confidence** | N/A | 85-95% |
| **Validation** | No | Yes |
| **Custom Training** | No | Yes |

---

## 🐛 Quick Troubleshooting

### "Not enough training data"
→ Need at least 50 images per skill level

### "Training job failed"
→ Check CloudWatch logs:
```bash
aws sagemaker describe-training-job \
  --training-job-name [job-name]
```

### "Endpoint not found"
→ Check endpoint status:
```bash
aws sagemaker describe-endpoint \
  --endpoint-name shebalance-skill-classifier
```

### "Lambda timeout"
→ Increase timeout to 300 seconds

---

## 💰 Cost Breakdown

**One-time (Training):**
- GPU instance: $3-5

**Monthly (Inference):**
- SageMaker endpoint: $50
- Claude API: $3-5
- Lambda: $0 (free tier)
- **Total: ~$55/month**

**Cost Optimization:**
- Use serverless inference (pay per use)
- Auto-scale endpoints
- Batch predictions

---

## 📚 Full Documentation

For detailed guide, see: `SAGEMAKER_SETUP_GUIDE.md`

---

## ✅ Success Checklist

- [ ] Dataset prepared (train/val split)
- [ ] Training job completed
- [ ] Endpoint deployed and InService
- [ ] Lambda updated with SageMaker
- [ ] Test shows "enhanced_by_sagemaker": true
- [ ] Predictions are accurate

---

## 🎉 You're Done!

Your SkillScan AI now uses:
- **Claude 3.5 Sonnet** for detailed analysis
- **Custom SageMaker Model** for accurate classification
- **Combined Intelligence** for best results

**Start using it:** http://localhost:8000/skills.html

---

**Questions?** Check `SAGEMAKER_SETUP_GUIDE.md` for detailed troubleshooting.
