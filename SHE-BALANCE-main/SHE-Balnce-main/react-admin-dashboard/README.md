# AI Sakhi Admin Dashboard

Real-time monitoring dashboard for AI Sakhi interventions and artisan health tracking.

## Features

- **Artisan Health Monitor**: Real-time grid view of all artisans with color-coded health status
- **Intervention Log**: Complete history of WhatsApp messages, voice calls, and community alerts
- **Emergency Inbox**: Priority inbox for "Unseen Circumstances" messages from artisans
- **Stats Overview**: Key metrics and KPIs at a glance
- **Manual Interventions**: Ability to manually trigger calls or escalate to community support

## Tech Stack

- React 18
- AWS Amplify (Authentication & API)
- Recharts (Data visualization)
- Lucide React (Icons)
- Date-fns (Date formatting)

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- AWS Account with Amplify configured
- DynamoDB tables set up (see aws-backend folder)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Configuration

1. Update AWS Amplify configuration in `src/App.js`:
   ```javascript
   Amplify.configure({
     Auth: {
       region: 'YOUR_REGION',
       userPoolId: 'YOUR_USER_POOL_ID',
       userPoolWebClientId: 'YOUR_CLIENT_ID'
     },
     API: {
       endpoints: [
         {
           name: 'AISakhiAPI',
           endpoint: 'YOUR_API_ENDPOINT',
           region: 'YOUR_REGION'
         }
       ]
     }
   });
   ```

2. Set `MOCK_MODE = false` in `src/services/api.js` to use real API calls

### Mock Mode

The dashboard includes mock data for development and testing. To use mock mode:
- Keep `MOCK_MODE = true` in `src/services/api.js`
- No AWS configuration needed
- Generates realistic sample data for all features

## Project Structure

```
src/
├── components/
│   ├── ArtisanHealthGrid.js    # Main artisan monitoring grid
│   ├── InterventionLog.js      # Intervention history timeline
│   ├── EmergencyInbox.js       # Emergency messages inbox
│   ├── DashboardHeader.js      # Top navigation bar
│   └── StatsOverview.js        # KPI statistics cards
├── services/
│   └── api.js                  # API service layer
├── App.js                      # Main application component
└── index.js                    # Application entry point
```

## Available Scripts

- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Features in Detail

### Artisan Health Grid
- Color-coded status indicators (Active, Alert Sent, Call Pending, Critical)
- Filtering by status
- Sorting by status, days inactive, or resilience score
- Quick actions: View details, Manual call
- Displays key metrics: Days inactive, Resilience score, Heritage score

### Intervention Log
- Timeline view of all interventions
- Filter by type: WhatsApp, Voice calls, Community alerts
- Expandable details showing full message content, replies, transcripts
- AI analysis metrics for each intervention
- Filter by specific artisan

### Emergency Inbox
- Priority-based message display (Critical, High, Medium)
- Unread message counter
- Quick actions: Call now, Mark as read, Escalate to community
- Shows artisan details and circumstance tags

### Stats Overview
- Total artisans and active count
- Critical cases requiring attention
- Active interventions breakdown
- Average resilience score
- Total interventions with success rate
- Emergency messages with unread count

## Integration with AWS Backend

This dashboard integrates with the serverless backend in the `aws-backend` folder:

- Reads from DynamoDB tables: `ArtisanActivity`, `Interventions`, `EmergencyMessages`
- Triggers manual interventions via Lambda functions
- Real-time updates via AppSync subscriptions (optional)

## Deployment

### Deploy to AWS Amplify Hosting

```bash
# Build the app
npm run build

# Deploy using Amplify CLI
amplify publish
```

### Deploy to S3 + CloudFront

```bash
# Build the app
npm run build

# Upload to S3
aws s3 sync build/ s3://your-bucket-name

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## License

MIT

## Support

For issues or questions, contact the SheBalance development team.
