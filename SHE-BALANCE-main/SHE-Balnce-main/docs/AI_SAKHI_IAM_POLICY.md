# AI Sakhi - IAM Policy Required

## What's Already Built ✅

1. **Backend Integration** - Complete
   - AI Sakhi endpoint working
   - DynamoDB data fetching working
   - Dashboard integration ready

2. **Frontend** - Complete
   - AI Sakhi button in dashboard sidebar
   - Chat panel ready
   - All UI components working

3. **Data Storage** - Using DynamoDB (already working)
   - Orders stored in DynamoDB
   - User data in DynamoDB
   - No additional storage needed

## What You Need: IAM Policy for Bedrock

Add this policy to your IAM role/user:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "BedrockInvokeModel",
            "Effect": "Allow",
            "Action": [
                "bedrock:InvokeModel",
                "bedrock:InvokeModelWithResponseStream"
            ],
            "Resource": [
                "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-7-sonnet-*",
                "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-haiku-*",
                "arn:aws:bedrock:*::foundation-model/anthropic.claude-*"
            ]
        },
        {
            "Sid": "BedrockListModels",
            "Effect": "Allow",
            "Action": [
                "bedrock:ListFoundationModels",
                "bedrock:GetFoundationModel"
            ],
            "Resource": "*"
        }
    ]
}
```

## How to Add This Policy

### Option 1: AWS Console (Easiest)

1. Go to: https://console.aws.amazon.com/iam/
2. Click "Users" (or "Roles" if using a role)
3. Find your user/role
4. Click "Add permissions" → "Create inline policy"
5. Click "JSON" tab
6. Paste the policy above
7. Click "Review policy"
8. Name it: `BedrockAccessPolicy`
9. Click "Create policy"

### Option 2: AWS CLI

```bash
# Save the policy to a file first: bedrock-policy.json
# Then run:
aws iam put-user-policy --user-name YOUR_USERNAME --policy-name BedrockAccessPolicy --policy-document file://bedrock-policy.json
```

## After Adding Policy

1. **Wait 1-2 minutes** for policy to propagate

2. **Test Bedrock access:**
```bash
cd SHE-BALANCE-main\SHE-Balnce-main\backend
node test-sonnet.js
```

3. **Start servers:**
```bash
# Terminal 1:
cd SHE-BALANCE-main\SHE-Balnce-main\backend
node server.js

# Terminal 2:
cd SHE-BALANCE-main\SHE-Balnce-main
node frontend-server.js
```

4. **Test in dashboard:**
- Open: `http://localhost:8080/dashboard.html`
- Click "AI Sakhi Assistant" in sidebar
- Chat panel opens on the right
- Send message: "Hello!"
- Should get real AI response

## Current Setup Summary

- **AI Model**: Claude 3.7 Sonnet (AWS Bedrock)
- **Data Storage**: DynamoDB (already configured)
- **Backend**: Node.js server on port 5000
- **Frontend**: Dashboard with integrated chat panel
- **Authentication**: JWT tokens (already working)

## What Happens When It Works

1. Click "AI Sakhi Assistant" button in dashboard
2. Chat panel slides in from right
3. Send message about your orders
4. AI Sakhi fetches your real data from DynamoDB
5. Claude 3.7 Sonnet generates personalized response
6. You see intelligent answer with your specific order details

## No Additional Storage Needed

Everything uses your existing DynamoDB tables:
- `Users` - User accounts
- `Orders` - Order data
- `ArtisanProfiles` - Artisan info
- `LabourTracking` - Work hours

AI Sakhi reads from these tables in real-time to provide context-aware responses.

## The Only Missing Piece

Just add the IAM policy above to enable Bedrock access. That's it!
