# AI Sakhi Admin Dashboard - Setup Guide

## Quick Start (Development Mode with Mock Data)

The dashboard comes with built-in mock data, so you can start immediately without AWS configuration.

### Step 1: Install Dependencies

```bash
cd SHE-Balnce-main/react-admin-dashboard
npm install
```

### Step 2: Copy Logo File

Copy the SheBalance logo to the public folder:

```bash
# Windows
copy ..\logo She balance.png public\

# Linux/Mac
cp "../logo She balance.png" public/
```

### Step 3: Start Development Server

```bash
npm start
```

The dashboard will open at http://localhost:3000 with mock data showing:
- 12 sample artisans with various health statuses
- 20 intervention records (WhatsApp, calls, community alerts)
- 8 emergency messages with different priorities

## Features You'll See

### 1. Dashboard Header
- SheBalance logo
- Real-time refresh button
- Notification bell
- Admin profile

### 2. Stats Overview (6 Cards)
- Total Artisans (with active count)
- Critical Cases (requiring attention)
- Active Interventions (alerts + calls)
- Average Resilience Score
- Total Interventions (with success rate)
- Emergency Messages (with unread count)

### 3. Artisan Health Grid
- Color-coded status cards:
  - 🟢 Green = Active
  - 🟡 Yellow = Alert Sent
  - 🟠 Orange = Call Pending
  - 🔴 Red = Critical
- Filter by status
- Sort by status, days inactive, or resilience score
- View details and manual call buttons

### 4. Intervention Log (Right Sidebar)
- Timeline of all interventions
- Filter by type (WhatsApp, Voice Call, Community Alert)
- Expandable details showing:
  - Message content and replies
  - Voice call transcripts
  - Community alert details
  - AI analysis metrics

### 5. Emergency Inbox (Right Sidebar)
- Priority-based messages (Critical, High, Medium)
- Unread message counter
- Quick actions:
  - Call Now
  - Mark as Read
  - Escalate to Community

## Production Setup (AWS Integration)

### Prerequisites

1. AWS Account with:
   - DynamoDB tables (from aws-backend folder)
   - Lambda functions deployed
   - API Gateway or AppSync endpoint
   - Cognito User Pool for authentication

2. AWS Amplify CLI installed:
   ```bash
   npm install -g @aws-amplify/cli
   ```

### Step 1: Configure AWS Amplify

Edit `src/App.js` and update the Amplify configuration:

```javascript
Amplify.configure({
  Auth: {
    region: 'us-east-1',              // Your AWS region
    userPoolId: 'us-east-1_XXXXXX',   // Your Cognito User Pool ID
    userPoolWebClientId: 'XXXXXXXXX'   // Your Cognito App Client ID
  },
  API: {
    endpoints: [
      {
        name: 'AISakhiAPI',
        endpoint: 'https://your-api-id.execute-api.us-east-1.amazonaws.com/prod',
        region: 'us-east-1'
      }
    ]
  }
});
```

### Step 2: Disable Mock Mode

Edit `src/services/api.js`:

```javascript
// Change this line from true to false
const MOCK_MODE = false;
```

### Step 3: Set Up DynamoDB Tables

Ensure these tables exist in DynamoDB:

1. **ArtisanActivity**
   - Primary Key: `artisanId` (String)
   - Attributes: artisanName, skill, location, status, daysInactive, resilienceScore, heritageScore, lastActivityDate

2. **Interventions**
   - Primary Key: `interventionId` (String)
   - Attributes: artisanId, interventionType, status, timestamp, messageContent, etc.

3. **EmergencyMessages**
   - Primary Key: `messageId` (String)
   - Attributes: artisanId, messageText, priority, timestamp, read

### Step 4: Create API Endpoints

Create Lambda functions and API Gateway endpoints for:

- `GET /artisans` - Fetch all artisans
- `GET /interventions` - Fetch intervention history
- `GET /emergency-messages` - Fetch emergency messages
- `POST /manual-call` - Initiate manual intervention
- `PUT /messages/{id}/read` - Mark message as read
- `POST /escalate` - Escalate to community

### Step 5: Deploy

```bash
# Build for production
npm run build

# Deploy to Amplify Hosting
amplify publish

# Or deploy to S3
aws s3 sync build/ s3://your-bucket-name
```

## Environment Variables

Create `.env` file for environment-specific configuration:

```env
REACT_APP_AWS_REGION=us-east-1
REACT_APP_USER_POOL_ID=us-east-1_XXXXXX
REACT_APP_CLIENT_ID=XXXXXXXXX
REACT_APP_API_ENDPOINT=https://your-api.amazonaws.com/prod
```

Then update `src/App.js` to use these:

```javascript
Amplify.configure({
  Auth: {
    region: process.env.REACT_APP_AWS_REGION,
    userPoolId: process.env.REACT_APP_USER_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_CLIENT_ID
  },
  API: {
    endpoints: [
      {
        name: 'AISakhiAPI',
        endpoint: process.env.REACT_APP_API_ENDPOINT,
        region: process.env.REACT_APP_AWS_REGION
      }
    ]
  }
});
```

## Customization

### Change Refresh Interval

Edit `src/App.js`:

```javascript
const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
```

### Modify Color Scheme

Edit CSS files in `src/components/` to match your brand colors.

### Add New Metrics

Edit `src/components/StatsOverview.js` to add custom KPIs.

## Troubleshooting

### Issue: Logo not showing
**Solution**: Ensure `logo She balance.png` is copied to `public/` folder

### Issue: CORS errors
**Solution**: Configure CORS in API Gateway to allow your domain

### Issue: Authentication errors
**Solution**: Verify Cognito User Pool configuration and credentials

### Issue: No data showing
**Solution**: Check that `MOCK_MODE = true` in `src/services/api.js` for development

## Performance Optimization

1. **Enable Code Splitting**: Already configured with React.lazy (if needed)
2. **Optimize Images**: Compress logo and avatar images
3. **Enable Caching**: Configure CloudFront caching for static assets
4. **Use AppSync Subscriptions**: For real-time updates instead of polling

## Security Best Practices

1. Never commit AWS credentials to Git
2. Use environment variables for sensitive data
3. Enable Cognito MFA for admin users
4. Implement row-level security in DynamoDB
5. Use HTTPS only in production
6. Regularly rotate API keys

## Support

For issues or questions:
- Check the main README.md
- Review AWS backend documentation in `aws-backend/` folder
- Contact SheBalance development team

## Next Steps

1. ✅ Install dependencies
2. ✅ Copy logo file
3. ✅ Start development server
4. ✅ Explore mock data features
5. ⏭️ Configure AWS (when ready for production)
6. ⏭️ Deploy to Amplify or S3

Happy monitoring! 🚀
