# AI Sakhi - Serverless Architecture Documentation

## System Overview

The AI Sakhi system is a serverless, event-driven architecture that automatically monitors artisan activity and provides timely interventions when needed. The system uses AWS Step Functions to orchestrate a multi-stage escalation workflow.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EventBridge Schedule                         │
│                        (Every 6 hours)                               │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      AWS Step Functions                              │
│                     (AISakhiWorkflow)                                │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 1. Scan Artisan Activity (Lambda)                           │   │
│  │    ↓                                                         │   │
│  │ 2. Check for Inactive Artisans                              │   │
│  │    ↓                                                         │   │
│  │ 3. Process Each Artisan (Map State)                         │   │
│  │    ├─→ Threshold 1: 3+ Days Inactive                        │   │
│  │    │   ├─→ Send WhatsApp Message (Lambda)                   │   │
│  │    │   ├─→ Log Intervention (DynamoDB)                      │   │
│  │    │   ├─→ Wait 24 Hours                                    │   │
│  │    │   └─→ Check Reply Status (Lambda)                      │   │
│  │    │                                                         │   │
│  │    └─→ Threshold 2: No Reply                                │   │
│  │        ├─→ Generate Voice Call (Lambda + Polly)             │   │
│  │        ├─→ Upload Audio to S3                               │   │
│  │        ├─→ Initiate Phone Call (Twilio/Connect)             │   │
│  │        ├─→ Log Intervention (DynamoDB)                      │   │
│  │        └─→ Alert Community Support (Lambda)                 │   │
│  │                                                              │   │
│  │ 4. Update Resilience Metrics (Lambda)                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Data Storage                                 │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  DynamoDB    │  │  DynamoDB    │  │  DynamoDB    │             │
│  │  Artisan     │  │ Intervention │  │  Resilience  │             │
│  │  Activity    │  │     Log      │  │   Metrics    │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                       │
│  ┌──────────────┐                                                   │
│  │      S3      │                                                   │
│  │ Voice Audio  │                                                   │
│  │    Files     │                                                   │
│  └──────────────┘                                                   │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    External Integrations                             │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  WhatsApp    │  │   Amazon     │  │    Twilio    │             │
│  │  Business    │  │    Polly     │  │   (Voice)    │             │
│  │     API      │  │   (TTS)      │  │              │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
```

## Workflow States

### 1. ScanArtisanActivity
**Type**: Task (Lambda)
**Purpose**: Scan DynamoDB for artisans with no activity for 3+ days
**Input**: 
```json
{
  "tableName": "ArtisanActivity",
  "inactivityThreshold": 3
}
```
**Output**:
```json
{
  "inactiveArtisans": [
    {
      "artisanId": "ART001",
      "artisanName": "Sunita Devi",
      "phoneNumber": "+919876543210",
      "daysInactive": 7,
      "skill": "Embroidery",
      "location": "Delhi"
    }
  ],
  "totalCount": 5
}
```

### 2. CheckInactiveArtisans
**Type**: Choice
**Purpose**: Determine if any artisans need intervention
**Logic**: If `inactiveArtisans` array is not empty, proceed to processing

### 3. ProcessInactiveArtisans
**Type**: Map (Parallel Processing)
**Purpose**: Process each inactive artisan independently
**Max Concurrency**: 5 artisans at a time

#### 3a. CheckThreshold1
**Type**: Choice
**Purpose**: Check if artisan meets 3-day inactivity threshold
**Logic**: If `daysInactive >= 3`, send WhatsApp message

#### 3b. SendWhatsAppMessage
**Type**: Task (Lambda)
**Purpose**: Send automated wellness check via WhatsApp
**Features**:
- Multi-language support (Hindi, English)
- Personalized message with artisan name
- Delivery tracking via message ID
**Retry Policy**: 3 attempts with exponential backoff

#### 3c. LogWhatsAppIntervention
**Type**: Task (DynamoDB PutItem)
**Purpose**: Record intervention attempt
**Data Logged**:
- Intervention ID (UUID)
- Artisan ID
- Timestamp
- Message ID
- Status (sent/failed)

#### 3d. WaitForReply
**Type**: Wait
**Duration**: 86400 seconds (24 hours)
**Purpose**: Give artisan time to respond

#### 3e. CheckReplyStatus
**Type**: Task (Lambda)
**Purpose**: Verify if artisan replied to WhatsApp message
**Output**:
```json
{
  "hasReplied": true/false,
  "replyTimestamp": "2024-01-15T10:30:00Z",
  "sentiment": "positive/neutral/negative"
}
```

#### 3f. EvaluateReply
**Type**: Choice
**Purpose**: Determine next action based on reply status
**Logic**:
- If replied: Mark intervention successful
- If no reply: Escalate to voice call

#### 3g. EscalateToVoiceCall
**Type**: Task (Lambda)
**Purpose**: Generate and initiate voice call
**Process**:
1. Generate voice script (personalized)
2. Synthesize speech using Amazon Polly
3. Upload audio to S3
4. Initiate phone call via Twilio/Amazon Connect
**Retry Policy**: 2 attempts with exponential backoff

#### 3h. LogVoiceCallIntervention
**Type**: Task (DynamoDB PutItem)
**Purpose**: Record voice call attempt
**Data Logged**:
- Call ID
- Audio URL
- Call status
- Duration

#### 3i. AlertCommunitySupport
**Type**: Task (Lambda)
**Purpose**: Notify community support team for manual intervention
**Triggered When**: All automated interventions fail
**Actions**:
- Send alert to community coordinators
- Create support ticket
- Notify nearby artisans in network

#### 3j. UpdateResilienceMetric
**Type**: Task (Lambda)
**Purpose**: Calculate and update Heritage Score and Resilience Metric
**Metrics Updated**:
- Resilience Score (0-100)
- Heritage Score (0-100)
- Success Rate
- Average Response Time

## Data Flow

### Input Data (Artisan Activity)
```json
{
  "artisanId": "ART001",
  "artisanName": "Sunita Devi",
  "phoneNumber": "+919876543210",
  "lastActivityDate": "2024-01-08T15:30:00Z",
  "skill": "Embroidery",
  "location": "Delhi",
  "resilienceScore": 75.5,
  "heritageScore": 82.3
}
```

### Intervention Log Entry
```json
{
  "interventionId": "INT_20240115_001",
  "artisanId": "ART001",
  "timestamp": "2024-01-15T10:00:00Z",
  "interventionType": "whatsapp_message",
  "status": "sent",
  "messageId": "wamid.HBgNOTE5ODc2NTQzMjEwFQIAERgSQzg5RjBGNzY4QzA4MjhBRjAA",
  "messageContent": "नमस्ते Sunita Devi जी! हम SheBalance परिवार से हैं..."
}
```

### Resilience Metrics
```json
{
  "artisanId": "ART001",
  "resilienceScore": 78.5,
  "heritageScore": 85.0,
  "interventionCount": 3,
  "successfulInterventions": 2,
  "responseTimeAvg": 7200,
  "successRate": 66.67,
  "lastInterventionDate": "2024-01-15T10:00:00Z"
}
```

## Error Handling

### Retry Strategy
- **Lambda Errors**: 3 retries with exponential backoff (2x multiplier)
- **API Errors**: 2 retries with 5-second intervals
- **Timeout**: Configurable per Lambda (30-60 seconds)

### Catch Blocks
- All errors caught and logged to DynamoDB
- Failed interventions trigger alternative paths
- Critical failures alert monitoring system

### Fallback Mechanisms
1. WhatsApp fails → Escalate to voice call
2. Voice call fails → Alert community support
3. All automated fails → Create manual support ticket

## Monitoring and Observability

### CloudWatch Metrics
- **Lambda Invocations**: Count, duration, errors
- **Step Function Executions**: Success rate, duration
- **DynamoDB Operations**: Read/write capacity, throttles
- **Polly Usage**: Character count, synthesis time

### CloudWatch Logs
- All Lambda functions log to dedicated log groups
- Step Function execution history
- Error traces with stack traces
- Performance metrics

### Alarms
- Lambda error rate > 5%
- Step Function execution failures
- DynamoDB throttling events
- Polly synthesis failures

### SNS Notifications
- Critical intervention failures
- System health alerts
- Daily summary reports

## Security

### IAM Roles
- **Lambda Execution Role**: DynamoDB, Polly, S3, SNS access
- **Step Functions Role**: Lambda invoke, DynamoDB access
- **EventBridge Role**: Step Functions execution

### Data Encryption
- **At Rest**: DynamoDB encryption enabled
- **In Transit**: TLS 1.2+ for all API calls
- **S3**: Server-side encryption (SSE-S3)

### API Security
- WhatsApp Business API: OAuth 2.0 tokens
- Twilio: API key authentication
- AWS Services: IAM role-based access

### Secrets Management
- API keys stored in AWS Secrets Manager
- Automatic rotation enabled
- Least privilege access

## Performance Optimization

### Lambda Optimization
- **Memory**: 128MB-512MB based on function
- **Timeout**: 30-60 seconds
- **Concurrency**: Reserved capacity for critical functions
- **Cold Start**: Provisioned concurrency for high-traffic functions

### DynamoDB Optimization
- **On-Demand Pricing**: Auto-scaling for variable workload
- **GSI**: Secondary indexes for query optimization
- **TTL**: Automatic cleanup of old intervention logs

### S3 Optimization
- **Lifecycle Policies**: Move old audio to Glacier after 90 days
- **CloudFront**: CDN for audio file delivery
- **Compression**: MP3 format for optimal size

## Cost Optimization

### Strategies
1. **On-Demand Pricing**: Pay only for what you use
2. **Lambda Memory**: Right-sized for each function
3. **S3 Lifecycle**: Archive old files to reduce storage costs
4. **DynamoDB**: On-demand mode for variable traffic
5. **Polly**: Cache common phrases to reduce synthesis

### Cost Breakdown (500 artisans/month)
- Lambda: $5 (10,000 invocations)
- Step Functions: $2 (1,000 executions)
- DynamoDB: $3 (on-demand)
- Polly: $4 (100 voice calls)
- S3: $1 (audio storage)
- **Total**: ~$15/month

## Scalability

### Current Capacity
- **Artisans**: 500-1,000
- **Interventions**: 100-200/day
- **Voice Calls**: 20-50/day

### Scale Targets
- **Artisans**: 10,000+
- **Interventions**: 2,000+/day
- **Voice Calls**: 500+/day

### Scaling Strategy
1. Increase Lambda concurrency limits
2. Enable DynamoDB auto-scaling
3. Use Step Functions Express for high-volume
4. Implement caching layer (ElastiCache)
5. Add read replicas for DynamoDB

## Disaster Recovery

### Backup Strategy
- **DynamoDB**: Point-in-time recovery enabled
- **S3**: Versioning and cross-region replication
- **Lambda**: Code stored in version control

### Recovery Objectives
- **RTO**: 1 hour (Recovery Time Objective)
- **RPO**: 5 minutes (Recovery Point Objective)

### Failover Plan
1. Detect failure via CloudWatch alarms
2. Trigger automated failover to backup region
3. Restore DynamoDB from backup
4. Redeploy Lambda functions
5. Update DNS/endpoints

## Testing Strategy

### Unit Tests
- Individual Lambda functions
- Mock AWS services
- Test edge cases

### Integration Tests
- End-to-end workflow
- API integrations
- Error scenarios

### Load Tests
- Simulate 1,000 concurrent artisans
- Measure response times
- Identify bottlenecks

## Compliance

### Data Privacy
- GDPR compliant data handling
- PII encryption
- Data retention policies

### Audit Trail
- CloudTrail logging enabled
- All API calls logged
- Immutable audit logs

## Future Enhancements

1. **ML-Based Prediction**: Predict intervention needs before 3-day threshold
2. **Sentiment Analysis**: Analyze WhatsApp replies for emotional state
3. **Multi-Channel**: Add SMS, Email support
4. **Real-Time Dashboard**: Monitor interventions in real-time
5. **A/B Testing**: Test message effectiveness
6. **Voice Recognition**: Analyze voice call responses
7. **Chatbot Integration**: AI-powered conversation
8. **Predictive Analytics**: Forecast artisan churn risk

## Conclusion

The AI Sakhi serverless architecture provides a scalable, cost-effective solution for monitoring and supporting artisans. The event-driven design ensures timely interventions while the multi-stage escalation workflow maximizes response rates. With comprehensive monitoring, error handling, and security measures, the system is production-ready and can scale to support thousands of artisans.
