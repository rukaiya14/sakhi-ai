# 🚀 Deploy SkillScan AI NOW

## ⚠️ FIRST - SECURE YOUR CREDENTIALS!

**You accidentally shared your AWS credentials publicly. Please:**

1. Go to AWS Console → IAM → Users → Your User
2. Security credentials tab
3. Find access key: `AKIAQ6QTGQFJMMLWKLON`
4. Click "Actions" → "Deactivate" → "Delete"
5. Create new access key
6. Run `aws configure` again with new credentials

---

## 📋 What You Need

1. ✅ AWS CLI configured (you already did this)
2. ✅ Node.js installed
3. ✅ Dataset folder with images (see structure below)

## 📁 Dataset Folder Structure

Create this folder in your project:

```
SHE-BALANCE-main/SHE-Balnce-main/dataset/
├── embroidery/
│   ├── beginner/
│   │   ├── image1.jpg
│   │   ├── image2.jpg
│   │   └── image3.jpg
│   ├── intermediate/
│   └── advanced/
├── cooking/
│   ├── beginner/
│   ├── intermediate/
│   └── advanced/
├── henna/
│   ├── beginner/
│   ├── intermediate/
│   └── advanced/
├── crochet/
├── tailoring/
└── crafts/
```

**Image Requirements:**
- Format: JPG, PNG
- Size: Under 10MB each
- At least 5-10 images per skill level

---

## 🚀 Deploy in 3 Steps

### Step 1: Enable Bedrock Claude Access

1. Go to: https://console.aws.amazon.com/bedrock/
2. Click "Model access" (left sidebar)
3. Click "Manage model access"
4. Find "Anthropic" → Enable "Claude 3.5 Sonnet v2"
5. Click "Request model access" (instant approval)

### Step 2: Install Dependencies

Open Command Prompt in the project folder:

```bash
cd SHE-BALANCE-main\SHE-Balnce-main\aws-cdk

# Install Node.js dependencies
npm install

# Install AWS CDK globally
npm install -g aws-cdk
```

### Step 3: Deploy

```bash
# Run the deployment script
deploy.bat
```

This will:
- ✅ Verify your AWS credentials
- ✅ Install dependencies
- ✅ Bootstrap CDK (first time)
- ✅ Deploy all infrastructure
- ✅ Give you the API endpoint

---

## 📝 After Deployment

You'll see output like:

```
Outputs:
SkillScanStack.APIEndpoint = https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/
SkillScanStack.AnalyzeEndpoint = https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/analyze
```

**Copy the API endpoint!**

### Update Frontend

1. Open: `skillscan-backend-integration.js`
2. Find line 7:
   ```javascript
   API_ENDPOINT: 'https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/production',
   ```
3. Replace with your actual endpoint

4. Add to `skills.html` (before `</body>`):
   ```html
   <script src="skillscan-backend-integration.js"></script>
   ```

5. Update the analyze button in `skills.html`:
   ```html
   <button onclick="startSkillScanAnalysisWithBackend()">
   ```

---

## ✅ Test It

1. Open `skills.html` in browser
2. Go to SkillScan section
3. Select category
4. Upload images from your dataset
5. Click "Analyze My Skills"
6. Wait 5-10 seconds for Claude's analysis!

---

## 💰 Cost

For 1000 analyses/month: **~$5-10**

- Bedrock (Claude): $3-5
- Lambda: Free tier
- DynamoDB: $1-2
- S3: <$1
- API Gateway: Free tier

---

## 🐛 Troubleshooting

### "Model access denied"
→ Enable Claude 3.5 Sonnet in Bedrock console

### "CDK not found"
→ Run: `npm install -g aws-cdk`

### "Credentials not configured"
→ Run: `aws configure` again

### "Deployment failed"
→ Check CloudWatch logs or share error message

---

## 📞 Need Help?

Run this to check your setup:
```bash
aws sts get-caller-identity
cdk --version
node --version
```

Share the output if you have issues!

---

## 🎉 Ready to Deploy?

1. ✅ Secure your old credentials (delete them)
2. ✅ Create dataset folder with images
3. ✅ Enable Bedrock Claude access
4. ✅ Run `deploy.bat`

That's it! 🚀
