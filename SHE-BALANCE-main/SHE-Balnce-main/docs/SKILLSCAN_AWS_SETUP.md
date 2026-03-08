

# SkillScan AI - AWS Backend Setup Guide

Complete guide to deploy SkillScan AI with Claude 3.5 Sonnet on AWS Bedrock

## 🎯 Overview

SkillScan AI uses AWS Bedrock's Claude 3.5 Sonnet model to analyze artisan work images and provide detailed skill assessments. The system includes:

- **AWS Bedrock**: Claude 3.5 Sonnet for AI image analysis
- **AWS Lambda**: Serverless functions for processing
- **Amazon DynamoDB**: Store analysis results
- **Amazon S3**: Store uploaded images
- **API Gateway**: REST API endpoints

## 📋 Prerequisites

### 1. AWS Account Setup
- Active AWS account with billing enabled
- IAM user with administrative access
- AWS CLI installed and configured

### 2. Required AWS Services Access
- AWS Bedrock (Claude 3.5 Sonnet model access)
- AWS Lambda
- Amazon DynamoDB
- Amazon S3
- Amazon API Gateway
- AWS CloudFormation

### 3. Local Development Tools
- AWS CLI v2.x or higher
- Python 3.11 or higher
- Bash shell (Linux/Mac) or Git Bash (Windows)

## 🚀 Step-by-Step Deployment

### Step 1: Enable AWS Bedrock Model Access

1. **Navigate to AWS Bedrock Console**
   ```
   https://console.aws.amazon.com/bedrock/
   ```

2. **Request Model Access**
   - Go to "Model access" in the left sidebar
   - Click "Manage model access"
   - Find "Anthropic" section
   - Enable "Claude 3.5 Sonnet v2" model
   - Click "Request model access"
   - Wait for approval (usually instant for most accounts)

3. **Verify Access**
   ```bash
   aws bedrock list-foundation-models --region us-east-1 \
     --query "modelSummaries[?contains(modelId, 'claude-3-5-sonnet')]"
   ```

### Step 2: Configure AWS CLI

1. **Set up AWS credentials**
   ```bash
   aws configure
   ```
   
   Enter:
   - AWS Access Key ID: `YOUR_ACCESS_KEY`
   - AWS Secret Access Key: `YOUR_SECRET_KEY`
   - Default region: `us-east-1`
   - Default output format: `json`

2. **Verify configuration**
   ```bash
   aws sts get-caller-identity
   ```

### Step 3: Deploy Infrastructure

1. **Navigate to backend directory**
   ```bash
   cd SHE-BALANCE-main/SHE-Balnce-main/aws-backend
   ```

2. **Make deployment script executable**
   ```bash
   chmod +x deploy-skillscan.sh
   ```

3. **Run deployment**
   ```bash
   ./deploy-skillscan.sh production us-east-1
   ```

   This will:
   - Create DynamoDB table for storing results
   - Create S3 bucket for images
   - Deploy Lambda functions
   - Set up API Gateway endpoints
   - Configure IAM roles and permissions

4. **Note the API endpoints** (displayed at end of deployment)
   ```
   API Endpoints:
     Base URL: https://xxxxx.execute-api.us-east-1.amazonaws.com/production
     Analyze: https://xxxxx.execute-api.us-east-1.amazonaws.com/production/analyze
     Get SkillScans: https://xxxxx.execute-api.us-east-1.amazonaws.com/production/skillscans
   ```

### Step 4: Update Frontend Configuration

1. **Open `skillscan-backend-integration.js`**

2. **Update API endpoint**
   ```javascript
   const SKILLSCAN_CONFIG = {
       // Replace with your actual API Gateway endpoint
       API_ENDPOINT: 'https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/production',
       // ... rest of config
   };
   ```

3. **Add script to skills.html**
   ```html
   <!-- Add before closing </body> tag -->
   <script src="skillscan-backend-integration.js"></script>
   ```

### Step 5: Test the Integration

1. **Open skills.html in browser**

2. **Navigate to SkillScan section**

3. **Upload test images**
   - Select a skill category (embroidery, cooking, henna, etc.)
   - Upload 1-5 images of work
   - Click "Analyze My Skills"

4. **Verify results**
   - Should see loading animation
   - Analysis completes in 5-10 seconds
   - Results display with scores and feedback

## 🔧 Configuration Options

### Environment Variables

Lambda functions use these environment variables:

```yaml
SKILLSCAN_TABLE: DynamoDB table name
S3_BUCKET: S3 bucket for images
ENVIRONMENT: production/staging/development
```

### Adjusting Lambda Settings

Edit `skillscan-infrastructure.yaml`:

```yaml
SkillScanAnalysisFunction:
  Properties:
    Timeout: 300        # Increase for slower analysis
    MemorySize: 1024    # Increase for better performance
```

### Cost Optimization

1. **DynamoDB**: Uses on-demand pricing (pay per request)
2. **Lambda**: Free tier covers 1M requests/month
3. **Bedrock**: ~$0.003 per image analysis
4. **S3**: Minimal storage costs
5. **API Gateway**: Free tier covers 1M requests/month

**Estimated monthly cost for 1000 analyses**: ~$5-10

## 📊 Monitoring and Logs

### CloudWatch Logs

View Lambda execution logs:

```bash
# Analysis function logs
aws logs tail /aws/lambda/SheBalance-SkillScan-Analysis-production --follow

# Get SkillScans function logs
aws logs tail /aws/lambda/SheBalance-Get-SkillScans-production --follow
```

### DynamoDB Monitoring

View stored analyses:

```bash
aws dynamodb scan \
  --table-name SheBalance-SkillScan-production \
  --limit 10
```

### API Gateway Metrics

Monitor API usage in AWS Console:
```
CloudWatch > Metrics > API Gateway > [Your API]
```

## 🔒 Security Best Practices

### 1. API Authentication (Recommended for Production)

Add API key authentication:

```yaml
# In skillscan-infrastructure.yaml
AnalyzeMethod:
  Properties:
    AuthorizationType: API_KEY
    ApiKeyRequired: true
```

### 2. CORS Configuration

Update CORS settings in Lambda functions:

```python
def cors_headers():
    return {
        'Access-Control-Allow-Origin': 'https://yourdomain.com',  # Specific domain
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'POST,GET,OPTIONS',
    }
```

### 3. Rate Limiting

Add throttling in API Gateway:

```yaml
SkillScanAPIDeployment:
  Properties:
    ThrottleSettings:
      RateLimit: 100
      BurstLimit: 200
```

### 4. Input Validation

Lambda functions validate:
- Image size (max 10MB)
- Image format (JPEG, PNG, HEIC)
- Number of images (max 5)
- Required fields

## 🐛 Troubleshooting

### Issue: "Model access denied"

**Solution**: Enable Claude 3.5 Sonnet in Bedrock console
```bash
# Check model access
aws bedrock list-foundation-models --region us-east-1
```

### Issue: "Lambda timeout"

**Solution**: Increase timeout in CloudFormation template
```yaml
Timeout: 300  # Increase to 300 seconds
```

### Issue: "CORS error in browser"

**Solution**: Verify CORS headers in Lambda response
```python
'Access-Control-Allow-Origin': '*'
```

### Issue: "DynamoDB write error"

**Solution**: Check IAM permissions
```bash
aws iam get-role-policy \
  --role-name SheBalance-SkillScan-Lambda-production \
  --policy-name SkillScanPermissions
```

### Issue: "Image too large"

**Solution**: Frontend automatically compresses images, but you can adjust:
```javascript
await skillScanBackend.compressImage(file, 1920, 1920);
```

## 📈 Scaling Considerations

### High Volume (>10,000 analyses/month)

1. **Enable DynamoDB Auto Scaling**
   ```yaml
   BillingMode: PROVISIONED
   ProvisionedThroughput:
     ReadCapacityUnits: 5
     WriteCapacityUnits: 5
   ```

2. **Add CloudFront CDN**
   - Cache API responses
   - Reduce latency globally

3. **Implement Caching**
   - Cache identical image analyses
   - Use ElastiCache for frequent queries

4. **Batch Processing**
   - Queue analyses with SQS
   - Process in batches during off-peak

## 🔄 Updates and Maintenance

### Update Lambda Code

```bash
cd aws-backend
./deploy-skillscan.sh production us-east-1
```

### Update Claude Model Version

Edit `lambda_skillscan_analysis.py`:
```python
CLAUDE_MODEL_ID = "anthropic.claude-3-5-sonnet-20241022-v2:0"
```

### Backup DynamoDB Data

```bash
aws dynamodb create-backup \
  --table-name SheBalance-SkillScan-production \
  --backup-name skillscan-backup-$(date +%Y%m%d)
```

## 📞 Support and Resources

### AWS Documentation
- [AWS Bedrock](https://docs.aws.amazon.com/bedrock/)
- [Claude Models](https://docs.anthropic.com/claude/docs)
- [Lambda Functions](https://docs.aws.amazon.com/lambda/)

### Cost Calculator
- [AWS Pricing Calculator](https://calculator.aws/)

### Community
- AWS Support (if you have a support plan)
- Stack Overflow: `[aws-bedrock]` tag

## ✅ Deployment Checklist

- [ ] AWS account created and configured
- [ ] AWS CLI installed and credentials set
- [ ] Bedrock Claude 3.5 Sonnet access enabled
- [ ] CloudFormation stack deployed successfully
- [ ] API endpoints noted and saved
- [ ] Frontend configuration updated
- [ ] Test analysis completed successfully
- [ ] CloudWatch logs verified
- [ ] Security settings reviewed
- [ ] Monitoring alerts configured
- [ ] Backup strategy implemented

## 🎉 Next Steps

1. **Test with real artisan images**
2. **Integrate with admin dashboard**
3. **Set up monitoring alerts**
4. **Configure automated backups**
5. **Implement user authentication**
6. **Add analytics tracking**

---

**Need Help?** Check the troubleshooting section or review CloudWatch logs for detailed error messages.
