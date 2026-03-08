# AI Sakhi - Serverless Backend Workflow

## Overview
This serverless backend implements the Behavioral Resilience Insurance system for SheBalance artisans using AWS Step Functions, Lambda, DynamoDB, Polly, and WhatsApp Business API.

## Architecture Components

### 1. AWS Step Functions
- **File**: `step-function-definition.json`
- **Purpose**: Orchestrates the entire intervention workflow
- **Features**:
  - Automatic retry logic with exponential backoff
  - Error handling and logging
  - Parallel processing of multiple artisans
  - Escalation workflow (WhatsApp → Voice Call → Community Alert)

### 2. Lambda Functions

#### a. Scan Artisan Activity
- **File**: `lambda_scan_artisan_activity.py`
- **Trigger**: Scheduled (EventBridge - every 6 hours)
- **Purpose**: Scan DynamoDB for inactive artisans
- **Output**: List of artisans requiring intervention

#### b. Send WhatsApp Message
- **File**: `lambda_send_whatsapp_message.py`
- **Trigger**: Step Function
- **Purpose**: Send automated wellness check via WhatsApp Business API
- **Features**:
  - Multi-language support (Hindi, English)
  - Personalized messages
  - Delivery tracking

#### c. Check WhatsApp Reply
- **File**: `lambda_check_whatsapp_reply.py`
- **Trigger**: Step Function (after 24-hour wait)
- **Purpose**: Verify if artisan responded to WhatsApp message
- **Output**: Reply status and sentiment

#### d. Generate Voice Call
- **File**: `lambda_generate_voice_call.py`
- **Trigger**: Step Function (if no WhatsApp reply)
- **Purpose**: Create voice message using Amazon Polly and initiate call
- **Features**:
  - SSML-based natural speech
  - Multi-language support
  - Audio storage in S3
  - Call initiation via Twilio/Amazon Connect

#### e. Update Resilience Metric
- **File**: `lambda_update_resilience_metric.py`
- **Trigger**: Step Function (after each intervention)
- **Purpose**: Calculate and update Heritage Score and Resilience Metric
- **Metrics**:
  - Resilience Score (0-100)
  - Heritage Score (0-100)
  - Success Rate
  - Average Response Time

## DynamoDB Tables

### 1. ArtisanActivity
```
Primary Key: artisanId (String)
Attributes:
- artisanName (String)
- phoneNumber (String)
- lastActivityDate (String - ISO 8601)
- skill (String)
- location (String)
- interventionHistory (List)
- resilienceScore (Number)
- heritageScore (Number)
```

### 2. InterventionLog
```
Primary Key: interventionId (String)
Sort Key: timestamp (String)
Attributes:
- artisanId (String)
- interventionType (String) - whatsapp_message, voice_call, community_alert
- status (String) - sent, failed, responded
- messageId (String)
- callId (String)
- error (String)
```

### 3. WhatsAppReplies
```
Primary Key: artisanId (String)
Sort Key: messageId (String)
Attributes:
- timestamp (String)
- content (String)
- sentiment (String) - positive, neutral, negative
```

### 4. ResilienceMetrics
```
Primary Key: artisanId (String)
Attributes:
- resilienceScore (Number)
- heritageScore (Number)
- interventionCount (Number)
- successfulInterventions (Number)
- responseTimeAvg (Number)
- successRate (Number)
- lastInterventionDate (String)
```

## Deployment Instructions

### Prerequisites
1. AWS Account with appropriate permissions
2. AWS CLI configured
3. Python 3.9+ installed
4. WhatsApp Business API account
5. Twilio account (optional, for voice calls)

### Step 1: Create DynamoDB Tables
```bash
# Create ArtisanActivity table
aws dynamodb create-table \
    --table-name ArtisanActivity \
    --attribute-definitions \
        AttributeName=artisanId,AttributeType=S \
    --key-schema \
        AttributeName=artisanId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST

# Create InterventionLog table
aws dynamodb create-table \
    --table-name InterventionLog \
    --attribute-definitions \
        AttributeName=interventionId,AttributeType=S \
        AttributeName=timestamp,AttributeType=S \
    --key-schema \
        AttributeName=interventionId,KeyType=HASH \
        AttributeName=timestamp,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST

# Create WhatsAppReplies table
aws dynamodb create-table \
    --table-name WhatsAppReplies \
    --attribute-definitions \
        AttributeName=artisanId,AttributeType=S \
        AttributeName=messageId,AttributeType=S \
    --key-schema \
        AttributeName=artisanId,KeyType=HASH \
        AttributeName=messageId,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST

# Create ResilienceMetrics table
aws dynamodb create-table \
    --table-name ResilienceMetrics \
    --attribute-definitions \
        AttributeName=artisanId,AttributeType=S \
    --key-schema \
        AttributeName=artisanId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST
```

### Step 2: Create S3 Bucket for Audio Files
```bash
aws s3 mb s3://shebalance-voice-messages
```

### Step 3: Deploy Lambda Functions
```bash
# Package and deploy each Lambda function
cd aws-backend

# Scan Artisan Activity
zip -r scan_activity.zip lambda_scan_artisan_activity.py
aws lambda create-function \
    --function-name ScanArtisanActivity \
    --runtime python3.9 \
    --role arn:aws:iam::ACCOUNT_ID:role/LambdaExecutionRole \
    --handler lambda_scan_artisan_activity.lambda_handler \
    --zip-file fileb://scan_activity.zip \
    --timeout 60 \
    --memory-size 256

# Send WhatsApp Message
zip -r whatsapp.zip lambda_send_whatsapp_message.py
aws lambda create-function \
    --function-name SendWhatsAppMessage \
    --runtime python3.9 \
    --role arn:aws:iam::ACCOUNT_ID:role/LambdaExecutionRole \
    --handler lambda_send_whatsapp_message.lambda_handler \
    --zip-file fileb://whatsapp.zip \
    --timeout 30 \
    --memory-size 256 \
    --environment Variables="{WHATSAPP_API_URL=https://graph.facebook.com/v17.0,WHATSAPP_PHONE_NUMBER_ID=YOUR_PHONE_ID,WHATSAPP_ACCESS_TOKEN=YOUR_TOKEN}"

# Check WhatsApp Reply
zip -r check_reply.zip lambda_check_whatsapp_reply.py
aws lambda create-function \
    --function-name CheckWhatsAppReply \
    --runtime python3.9 \
    --role arn:aws:iam::ACCOUNT_ID:role/LambdaExecutionRole \
    --handler lambda_check_whatsapp_reply.lambda_handler \
    --zip-file fileb://check_reply.zip \
    --timeout 30 \
    --memory-size 128

# Generate Voice Call
zip -r voice_call.zip lambda_generate_voice_call.py
aws lambda create-function \
    --function-name GenerateVoiceCall \
    --runtime python3.9 \
    --role arn:aws:iam::ACCOUNT_ID:role/LambdaExecutionRole \
    --handler lambda_generate_voice_call.lambda_handler \
    --zip-file fileb://voice_call.zip \
    --timeout 60 \
    --memory-size 512 \
    --environment Variables="{AUDIO_BUCKET=shebalance-voice-messages,TWILIO_PHONE_NUMBER=YOUR_TWILIO_NUMBER}"

# Update Resilience Metric
zip -r resilience.zip lambda_update_resilience_metric.py
aws lambda create-function \
    --function-name UpdateResilienceMetric \
    --runtime python3.9 \
    --role arn:aws:iam::ACCOUNT_ID:role/LambdaExecutionRole \
    --handler lambda_update_resilience_metric.lambda_handler \
    --zip-file fileb://resilience.zip \
    --timeout 30 \
    --memory-size 256
```

### Step 4: Create Step Function
```bash
aws stepfunctions create-state-machine \
    --name AISakhiWorkflow \
    --definition file://step-function-definition.json \
    --role-arn arn:aws:iam::ACCOUNT_ID:role/StepFunctionsExecutionRole
```

### Step 5: Schedule Execution
```bash
# Create EventBridge rule to trigger every 6 hours
aws events put-rule \
    --name AISakhiSchedule \
    --schedule-expression "rate(6 hours)"

# Add Step Function as target
aws events put-targets \
    --rule AISakhiSchedule \
    --targets "Id"="1","Arn"="arn:aws:states:REGION:ACCOUNT_ID:stateMachine:AISakhiWorkflow"
```

## Environment Variables

### WhatsApp Lambda
- `WHATSAPP_API_URL`: WhatsApp Business API endpoint
- `WHATSAPP_PHONE_NUMBER_ID`: Your WhatsApp Business phone number ID
- `WHATSAPP_ACCESS_TOKEN`: WhatsApp Business API access token

### Voice Call Lambda
- `AUDIO_BUCKET`: S3 bucket for audio files
- `TWILIO_PHONE_NUMBER`: Twilio phone number for calls
- `MONITORING_TOPIC_ARN`: SNS topic for monitoring

## IAM Permissions Required

### Lambda Execution Role
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "polly:SynthesizeSpeech"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::shebalance-voice-messages/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "sns:Publish"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

## Monitoring and Logging

### CloudWatch Metrics
- Lambda invocation count
- Step Function execution status
- DynamoDB read/write capacity
- Polly character count

### CloudWatch Logs
- All Lambda functions log to CloudWatch
- Step Function execution history
- Error tracking and alerting

### SNS Notifications
- Critical intervention failures
- Voice call initiation
- Community alert triggers

## Cost Estimation

### Monthly Cost (for 500 artisans)
- **Lambda**: ~$5 (assuming 10,000 invocations)
- **Step Functions**: ~$2 (assuming 1,000 executions)
- **DynamoDB**: ~$3 (on-demand pricing)
- **Polly**: ~$4 (assuming 100 voice calls)
- **S3**: ~$1 (audio storage)
- **WhatsApp Business API**: Variable (depends on provider)
- **Total**: ~$15-20/month (excluding WhatsApp API)

## Testing

### Test Individual Lambda
```bash
aws lambda invoke \
    --function-name ScanArtisanActivity \
    --payload '{"tableName":"ArtisanActivity","inactivityThreshold":3}' \
    response.json
```

### Test Step Function
```bash
aws stepfunctions start-execution \
    --state-machine-arn arn:aws:states:REGION:ACCOUNT_ID:stateMachine:AISakhiWorkflow \
    --input '{}'
```

## Troubleshooting

### Common Issues
1. **Lambda timeout**: Increase timeout in function configuration
2. **DynamoDB throttling**: Switch to provisioned capacity or increase on-demand limits
3. **Polly limits**: Request limit increase from AWS Support
4. **WhatsApp API errors**: Check API credentials and rate limits

## Security Best Practices
1. Store API keys in AWS Secrets Manager
2. Enable encryption at rest for DynamoDB
3. Use VPC endpoints for Lambda
4. Implement least privilege IAM policies
5. Enable CloudTrail for audit logging

## Future Enhancements
1. Add sentiment analysis for WhatsApp replies
2. Implement ML-based prediction for intervention timing
3. Add multi-channel support (SMS, Email)
4. Create dashboard for monitoring interventions
5. Implement A/B testing for message effectiveness

## Support
For issues or questions, contact: support@shebalance.com
