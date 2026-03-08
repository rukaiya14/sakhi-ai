# 🔌 Connect Frontend & Test SkillScan AI

## Step-by-Step Guide

---

## 📋 Prerequisites

Before connecting frontend, you need:
1. ✅ Deployed AWS backend (run `deploy.bat`)
2. ✅ API endpoint from deployment output

---

## 🔌 Step 1: Get Your API Endpoint

After running `deploy.bat`, you'll see:

```
Outputs:
SkillScanStack.APIEndpoint = https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod/
SkillScanStack.AnalyzeEndpoint = https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod/analyze
```

**Copy the APIEndpoint URL!**

---

## 🔧 Step 2: Update Frontend Configuration

### 2.1 Update `skillscan-backend-integration.js`

Open: `SHE-BALANCE-main/SHE-Balnce-main/skillscan-backend-integration.js`

Find line 7 and replace:
```javascript
// BEFORE:
API_ENDPOINT: 'https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/production',

// AFTER (use your actual endpoint):
API_ENDPOINT: 'https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod',
```

**Remove the trailing slash if present!**

### 2.2 Add Scripts to `skills.html`

Open: `SHE-BALANCE-main/SHE-Balnce-main/skills.html`

Find the closing `</body>` tag and add BEFORE it:

```html
<!-- SkillScan Backend Integration -->
<script src="skillscan-backend-integration.js"></script>
```

### 2.3 Update the Analyze Button

In `skills.html`, find the "Analyze My Skills" button (around line 300-400).

Change from:
```html
<button class="btn-primary" onclick="startSkillScanAnalysis()">
```

To:
```html
<button class="btn-primary" onclick="startSkillScanAnalysisWithBackend()">
```

---

## 🔧 Step 3: Update Admin Dashboard (Optional)

### 3.1 Add Scripts to `admin-dashboard.html`

Open: `SHE-BALANCE-main/SHE-Balnce-main/admin-dashboard.html`

Add BEFORE closing `</body>` tag:

```html
<!-- SkillScan Integration -->
<script src="skillscan-backend-integration.js"></script>
<script src="admin-skillscan-integration.js"></script>
```

---

## ✅ Step 4: Test the Connection

### Test 1: Check API Endpoint

Open Command Prompt and run:

```bash
curl https://YOUR-API-ENDPOINT/skillscans
```

Expected response:
```json
{
  "success": true,
  "count": 0,
  "skillscans": []
}
```

If you get this, your API is working! ✅

### Test 2: Test from Browser Console

1. Open `skills.html` in browser
2. Press F12 to open Developer Console
3. Go to "Console" tab
4. Type:

```javascript
console.log(SKILLSCAN_CONFIG.API_ENDPOINT);
```

You should see your API endpoint printed. ✅

### Test 3: Test Full Analysis

1. Open `skills.html` in browser
2. Scroll to "SkillScan AI" section
3. Click on a category (e.g., "Embroidery")
4. Click "Choose Photos"
5. Select 1-3 images from "Buyer Images" folder
6. Click "Analyze My Skills"
7. Wait 5-10 seconds

**Expected Result:**
- Loading animation appears
- After 5-10 seconds, results show:
  - Overall score (0-100)
  - Skill level (Beginner/Intermediate/Advanced)
  - Detailed breakdown
  - AI feedback from Claude

---

## 🐛 Troubleshooting

### Issue 1: "API endpoint not configured"

**Check:**
```javascript
// In skillscan-backend-integration.js
console.log(SKILLSCAN_CONFIG.API_ENDPOINT);
```

Should NOT contain "YOUR-API-ID"

**Fix:** Update line 7 with your actual endpoint

---

### Issue 2: CORS Error in Browser Console

**Error looks like:**
```
Access to fetch at 'https://...' from origin 'null' has been blocked by CORS policy
```

**Fix:** Open the HTML file through a local server, not directly.

**Option A - Python:**
```bash
cd SHE-BALANCE-main/SHE-Balnce-main
python -m http.server 8000
```
Then open: http://localhost:8000/skills.html

**Option B - Node.js:**
```bash
npx http-server -p 8000
```
Then open: http://localhost:8000/skills.html

---

### Issue 3: "Failed to fetch" or Network Error

**Check 1 - API Gateway:**
```bash
aws apigateway get-rest-apis --region us-east-1
```

**Check 2 - Lambda Function:**
```bash
aws lambda list-functions --region us-east-1 | findstr SkillScan
```

**Check 3 - CloudWatch Logs:**
```bash
aws logs tail /aws/lambda/SheBalance-SkillScan-Analysis --follow
```

---

### Issue 4: Analysis Takes Too Long (>30 seconds)

**Cause:** Lambda cold start (first time)

**Fix:** Try again - second attempt will be faster (5-10 seconds)

---

### Issue 5: "Model access denied"

**Check Bedrock Access:**
```bash
aws bedrock list-foundation-models --region us-east-1 --query "modelSummaries[?contains(modelId, 'claude-3-5-sonnet')]"
```

**Fix:** Enable Claude 3.5 Sonnet in Bedrock Console

---

## 📊 Step 5: Verify in Admin Dashboard

1. Open `admin-dashboard.html`
2. Go to "User Management" section
3. Scroll down to "SkillScan AI Analyses"
4. You should see:
   - Total analyses count
   - Recent analyses table
   - Statistics

---

## 🧪 Complete Test Checklist

Run through this checklist:

### Backend Tests:
- [ ] API endpoint responds to curl/browser
- [ ] Lambda function exists in AWS
- [ ] DynamoDB table created
- [ ] S3 bucket created
- [ ] Bedrock Claude access enabled

### Frontend Tests:
- [ ] `skillscan-backend-integration.js` loaded
- [ ] API endpoint configured correctly
- [ ] Category selection works
- [ ] Image upload works
- [ ] Analyze button triggers backend call
- [ ] Loading animation shows
- [ ] Results display correctly
- [ ] Admin dashboard shows analyses

---

## 🎯 Quick Test Script

Save this as `test-frontend.html` and open in browser:

```html
<!DOCTYPE html>
<html>
<head>
    <title>SkillScan Test</title>
</head>
<body>
    <h1>SkillScan API Test</h1>
    <button onclick="testAPI()">Test API Connection</button>
    <pre id="result"></pre>

    <script>
        const API_ENDPOINT = 'YOUR-API-ENDPOINT-HERE'; // Replace this!

        async function testAPI() {
            const result = document.getElementById('result');
            result.textContent = 'Testing...';

            try {
                const response = await fetch(`${API_ENDPOINT}/skillscans`);
                const data = await response.json();
                
                result.textContent = JSON.stringify(data, null, 2);
                
                if (data.success) {
                    alert('✅ API is working!');
                } else {
                    alert('⚠️ API responded but with error');
                }
            } catch (error) {
                result.textContent = `❌ Error: ${error.message}`;
                alert('❌ API connection failed');
            }
        }
    </script>
</body>
</html>
```

---

## 📝 Expected Flow

### User Flow:
1. User opens `skills.html`
2. Navigates to SkillScan section
3. Selects category
4. Uploads images
5. Clicks "Analyze My Skills"
6. Sees loading animation
7. Gets AI analysis results

### Technical Flow:
1. Frontend calls `startSkillScanAnalysisWithBackend()`
2. Images converted to base64
3. POST request to API Gateway `/analyze`
4. API Gateway triggers Lambda function
5. Lambda calls Bedrock Claude 3.5 Sonnet
6. Claude analyzes images
7. Results stored in DynamoDB
8. Response sent back to frontend
9. Frontend displays results

---

## 🎉 Success Indicators

You'll know it's working when:

✅ No console errors in browser  
✅ API endpoint responds to test  
✅ Images upload successfully  
✅ Loading animation appears  
✅ Results show within 10 seconds  
✅ Score and feedback display  
✅ Admin dashboard shows analysis  

---

## 📞 Still Having Issues?

### Get Detailed Logs:

```bash
# Lambda logs
aws logs tail /aws/lambda/SheBalance-SkillScan-Analysis --follow

# API Gateway logs
aws logs tail /aws/apigateway/SkillScanAPI --follow
```

### Check Deployment Status:

```bash
cdk list
cdk diff
```

### Re-deploy if Needed:

```bash
cd aws-cdk
cdk deploy --force
```

---

## 🚀 Next Steps After Testing

Once everything works:

1. ✅ Test with different categories
2. ✅ Test with multiple images
3. ✅ Check admin dashboard
4. ✅ Export analysis data
5. ✅ Share with team for feedback

---

**Need help?** Share:
1. Browser console errors (F12)
2. API endpoint URL
3. CloudWatch logs
4. Deployment output
