# AI Sakhi Admin Dashboard - Architecture Documentation

## Overview

The AI Sakhi Admin Dashboard is a real-time monitoring system for tracking artisan health, interventions, and emergency situations. It provides administrators with comprehensive visibility into the AI Sakhi ecosystem.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Admin Dashboard                     │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Header     │  │    Stats     │  │  Artisan     │      │
│  │  Component   │  │   Overview   │  │   Health     │      │
│  └──────────────┘  └──────────────┘  │    Grid      │      │
│                                       └──────────────┘      │
│  ┌──────────────────────────────────────────────────┐      │
│  │           Intervention Log (Sidebar)              │      │
│  └──────────────────────────────────────────────────┘      │
│  ┌──────────────────────────────────────────────────┐      │
│  │          Emergency Inbox (Sidebar)                │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ API Calls
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Service Layer                       │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Fetch      │  │   Fetch      │  │   Fetch      │      │
│  │  Artisans    │  │Interventions │  │  Emergency   │      │
│  └──────────────┘  └──────────────┘  │   Messages   │      │
│                                       └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Manual     │  │   Escalate   │                        │
│  │    Call      │  │ to Community │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ AWS Amplify / API Gateway
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      AWS Backend Services                    │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  DynamoDB    │  │    Lambda    │  │   Step       │      │
│  │   Tables     │  │  Functions   │  │  Functions   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Cognito    │  │   Amazon     │  │  WhatsApp    │      │
│  │    Auth      │  │    Polly     │  │     API      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. App Component (`App.js`)
**Responsibility**: Root component, state management, data fetching orchestration

**State Management**:
- `artisans`: Array of artisan objects with health status
- `interventions`: Array of intervention records
- `emergencyMessages`: Array of emergency messages
- `selectedArtisan`: Currently selected artisan for filtering
- `loading`: Loading state for UI feedback
- `refreshInterval`: Auto-refresh interval (default: 30s)

**Key Functions**:
- `loadData()`: Fetches all data from API
- `handleArtisanSelect()`: Updates selected artisan filter
- `handleManualCall()`: Initiates manual intervention
- `handleRefresh()`: Manual data refresh

### 2. DashboardHeader Component
**Responsibility**: Top navigation, branding, actions

**Features**:
- SheBalance logo display
- Real-time refresh button with loading state
- Notification bell with unread indicator
- Settings access
- Admin profile display

**Props**:
- `onRefresh`: Callback for refresh action
- `loading`: Loading state indicator

### 3. StatsOverview Component
**Responsibility**: Display key performance indicators

**Metrics Displayed**:
1. Total Artisans (with active count)
2. Critical Cases (requiring immediate attention)
3. Active Interventions (alerts + calls breakdown)
4. Average Resilience Score (out of 100)
5. Total Interventions (with success rate)
6. Emergency Messages (with unread count)

**Props**:
- `artisans`: Array of artisan data
- `interventions`: Array of intervention data
- `emergencyMessages`: Array of emergency messages

**Calculations**:
- Filters and aggregates data in real-time
- Color-codes metrics based on thresholds
- Shows trends and status indicators

### 4. ArtisanHealthGrid Component
**Responsibility**: Main monitoring grid for artisan health

**Features**:
- Color-coded status cards:
  - 🟢 Active (green)
  - 🟡 Alert Sent (yellow)
  - 🟠 Call Pending (orange)
  - 🔴 Critical (red)
- Filter by status (all, active, alert_sent, call_pending, critical)
- Sort by status, days inactive, or resilience score
- Display key metrics per artisan
- Quick actions: View details, Manual call

**Props**:
- `artisans`: Array of artisan objects
- `onArtisanSelect`: Callback when artisan is selected
- `onManualCall`: Callback for manual call action
- `loading`: Loading state

**Data Structure** (Artisan Object):
```javascript
{
  artisanId: "ART1001",
  artisanName: "Priya Sharma",
  skill: "Embroidery",
  location: "Mumbai",
  status: "active" | "alert_sent" | "call_pending" | "critical",
  daysInactive: 3,
  resilienceScore: 85,
  heritageScore: 92,
  lastActivityDate: "2024-02-25",
  bulkOrder: {
    orderName: "Taj Hotels Wedding Collection",
    orderValue: "₹45,000"
  } | null
}
```

### 5. InterventionLog Component
**Responsibility**: Timeline view of all interventions

**Features**:
- Chronological timeline display
- Filter by intervention type:
  - WhatsApp Message
  - Voice Call
  - Community Alert
- Expandable details showing:
  - Message content and replies
  - Voice call transcripts and audio
  - Community alert details
  - AI analysis metrics
- Status indicators (success, pending, failed)
- Filter by selected artisan

**Props**:
- `interventions`: Array of intervention records
- `selectedArtisan`: Currently selected artisan (for filtering)
- `loading`: Loading state

**Data Structure** (Intervention Object):
```javascript
{
  interventionId: "INT2001",
  artisanId: "ART1001",
  artisanName: "Priya Sharma",
  interventionType: "whatsapp_message" | "voice_call" | "community_alert",
  status: "success" | "pending" | "failed",
  timestamp: "2024-02-25T10:30:00Z",
  daysInactive: 3,
  interventionCount: 2,
  successRate: 85,
  
  // WhatsApp specific
  messageContent: "नमस्ते! हमें आपकी चिंता है। क्या सब ठीक है?",
  messageId: "MSG123",
  replyContent: "हाँ, सब ठीक है। धन्यवाद!",
  sentiment: "positive" | "neutral" | "negative",
  replyTime: "2 hours",
  
  // Voice call specific
  transcript: "Automated wellness check call...",
  callId: "CALL456",
  duration: "45 seconds",
  audioUrl: "https://...",
  
  // Community alert specific
  alertReason: "Extended inactivity detected",
  coordinatorsNotified: 5,
  artisansAlerted: 10
}
```

### 6. EmergencyInbox Component
**Responsibility**: Priority inbox for emergency messages

**Features**:
- Priority-based display (Critical, High, Medium)
- Unread message counter
- Message selection and expansion
- Quick actions:
  - Call Now
  - Mark as Read
  - Escalate to Community
- Circumstance tags
- Location and timestamp display

**Props**:
- `messages`: Array of emergency messages
- `onMessageSelect`: Callback when message is selected
- `loading`: Loading state

**Data Structure** (Emergency Message Object):
```javascript
{
  messageId: "EMG3001",
  artisanId: "ART1001",
  artisanName: "Priya Sharma",
  skill: "Embroidery",
  location: "Mumbai",
  messageText: "Family illness - need to care for sick child",
  circumstance: "Family illness",
  priority: "critical" | "high" | "medium",
  timestamp: "2024-02-25T08:00:00Z",
  read: false
}
```

## API Service Layer (`services/api.js`)

### Mock Mode
- Enabled by default for development
- Generates realistic sample data
- No AWS configuration needed
- Simulates API delays

### Production Mode
- Connects to AWS API Gateway or AppSync
- Uses AWS Amplify for authentication
- Real-time data from DynamoDB

### API Functions

#### `fetchArtisans()`
**Purpose**: Retrieve all artisans with health status
**Returns**: Array of artisan objects
**Endpoint**: `GET /artisans`

#### `fetchInterventions()`
**Purpose**: Retrieve intervention history
**Returns**: Array of intervention records
**Endpoint**: `GET /interventions`

#### `fetchEmergencyMessages()`
**Purpose**: Retrieve emergency messages
**Returns**: Array of emergency messages
**Endpoint**: `GET /emergency-messages`

#### `initiateManualCall(artisanId)`
**Purpose**: Trigger manual intervention call
**Parameters**: `artisanId` (String)
**Returns**: Success/failure response
**Endpoint**: `POST /manual-call`

#### `markMessageAsRead(messageId)`
**Purpose**: Mark emergency message as read
**Parameters**: `messageId` (String)
**Returns**: Success response
**Endpoint**: `PUT /messages/{id}/read`

#### `escalateToComm unity(artisanId, reason)`
**Purpose**: Escalate to community support
**Parameters**: `artisanId` (String), `reason` (String)
**Returns**: Success response
**Endpoint**: `POST /escalate`

## Data Flow

### 1. Initial Load
```
User opens dashboard
    ↓
App.useEffect() triggers
    ↓
loadData() called
    ↓
Parallel API calls:
  - fetchArtisans()
  - fetchInterventions()
  - fetchEmergencyMessages()
    ↓
State updated with data
    ↓
Components re-render with data
```

### 2. Auto-Refresh
```
Timer interval (30s)
    ↓
loadData() called
    ↓
API calls fetch latest data
    ↓
State updated
    ↓
UI updates automatically
```

### 3. Manual Intervention
```
User clicks "Manual Call"
    ↓
handleManualCall(artisanId)
    ↓
initiateManualCall() API call
    ↓
Lambda function triggered
    ↓
WhatsApp/Voice call initiated
    ↓
Intervention logged in DynamoDB
    ↓
Next refresh shows new intervention
```

### 4. Filter/Sort
```
User selects filter/sort
    ↓
Local state updated
    ↓
Component re-renders with filtered data
    ↓
No API call needed (client-side)
```

## State Management Strategy

### Current Approach: Component State
- Uses React useState hooks
- State lifted to App component
- Props passed down to children
- Simple and effective for current scale

### Future Scalability Options:

#### Option 1: Context API
```javascript
const DashboardContext = createContext();

// Wrap App with provider
<DashboardContext.Provider value={{ artisans, interventions, ... }}>
  <App />
</DashboardContext.Provider>

// Use in components
const { artisans } = useContext(DashboardContext);
```

#### Option 2: Redux
For larger scale with complex state interactions

#### Option 3: React Query
For advanced caching and server state management

## Performance Considerations

### Current Optimizations:
1. **Parallel API Calls**: All data fetched simultaneously
2. **Client-Side Filtering**: No API calls for filter/sort
3. **Conditional Rendering**: Loading states prevent unnecessary renders
4. **CSS Transitions**: Smooth animations without JS

### Future Optimizations:
1. **React.memo**: Memoize expensive components
2. **useMemo/useCallback**: Memoize calculations and callbacks
3. **Virtual Scrolling**: For large lists (react-window)
4. **Code Splitting**: Lazy load components
5. **AppSync Subscriptions**: Real-time updates instead of polling
6. **Service Worker**: Offline support and caching

## Security Architecture

### Authentication Flow:
```
User login
    ↓
AWS Cognito authentication
    ↓
JWT token received
    ↓
Token stored in Amplify
    ↓
Token included in all API requests
    ↓
API Gateway validates token
    ↓
Lambda executes with user context
```

### Security Measures:
1. **Cognito Authentication**: Secure user management
2. **JWT Tokens**: Stateless authentication
3. **HTTPS Only**: Encrypted communication
4. **CORS Configuration**: Restricted origins
5. **IAM Roles**: Least privilege access
6. **Environment Variables**: No hardcoded secrets
7. **Input Validation**: Sanitize all user inputs

## Deployment Architecture

### Development:
```
Local Machine
    ↓
npm start
    ↓
React Dev Server (localhost:3000)
    ↓
Mock data (no AWS needed)
```

### Production:
```
Code Repository (Git)
    ↓
npm run build
    ↓
Static files (build/)
    ↓
AWS S3 Bucket
    ↓
CloudFront CDN
    ↓
Users worldwide
```

### CI/CD Pipeline:
```
Git push to main
    ↓
GitHub Actions / AWS CodePipeline
    ↓
Run tests
    ↓
Build production bundle
    ↓
Deploy to S3
    ↓
Invalidate CloudFront cache
    ↓
Production live
```

## Monitoring and Logging

### Client-Side:
- Console errors logged
- API failures caught and displayed
- User actions tracked (optional)

### Server-Side:
- CloudWatch Logs for Lambda
- API Gateway access logs
- DynamoDB metrics
- X-Ray tracing (optional)

## Scalability Considerations

### Current Capacity:
- Handles 100s of artisans efficiently
- 1000s of intervention records
- Real-time updates every 30s

### Scaling Strategies:

#### Horizontal Scaling:
- CloudFront CDN for global distribution
- Multiple Lambda instances auto-scale
- DynamoDB auto-scaling enabled

#### Vertical Scaling:
- Optimize bundle size
- Implement pagination for large datasets
- Use GraphQL for selective data fetching

#### Caching:
- CloudFront edge caching
- Browser caching for static assets
- API response caching (optional)

## Testing Strategy

### Unit Tests:
- Component rendering
- Function logic
- API service layer

### Integration Tests:
- Component interactions
- API integration
- State management

### E2E Tests:
- User workflows
- Critical paths
- Cross-browser testing

## Future Enhancements

1. **Real-time Updates**: WebSocket/AppSync subscriptions
2. **Advanced Analytics**: Charts and trends
3. **Export Functionality**: CSV/PDF reports
4. **Mobile App**: React Native version
5. **Multi-language**: i18n support
6. **Dark Mode**: Theme switching
7. **Notifications**: Push notifications for critical events
8. **Bulk Actions**: Select multiple artisans for actions
9. **Advanced Filters**: Date ranges, custom queries
10. **Role-Based Access**: Different views for different admin levels

## Conclusion

The AI Sakhi Admin Dashboard provides a comprehensive, scalable solution for monitoring artisan health and interventions. Its modular architecture allows for easy maintenance and future enhancements while maintaining performance and security.
