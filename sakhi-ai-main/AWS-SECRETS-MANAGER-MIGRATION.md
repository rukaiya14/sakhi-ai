# AWS Secrets Manager Migration Guide

## Overview

All AWS credentials have been migrated from hardcoded values and environment variables to AWS Secrets Manager for improved security. The application now retrieves credentials from AWS Secrets Manager at runtime.

## What Changed

### 1. Removed Hardcoded Credentials
- **create-cognito.js**: Removed hardcoded `AWS_ACCESS_KEY` and `AWS_SECRET_KEY`
- All files now use the centralized secrets management module

### 2. New Modules Created

#### `utils/secrets-manager.js`
Centralized module for retrieving AWS credentials from Secrets Manager with:
- Automatic caching (1-hour TTL)
- Fallback to environment variables (migration mode)
- Error handling and validation
- Manual refresh capability

#### `backend/utils/aws-clients.js`
Factory module for creating AWS service clients with Secrets Manager credentials:
- AWS SDK v2 clients (SNS, Polly, Translate, S3, DynamoDB, Transcribe)
- AWS SDK v3 clients (DynamoDB, S3, Translate, Polly, Transcribe, Cognito)
- Automatic credential injection

### 3. Updated Files

All AWS service initializations have been updated to use Secrets Manager:

- `create-cognito.js` - Cognito User Pool creation
- `backend/server.js` - DynamoDB, Transcribe, Translate, Polly, S3 clients
- `backend/server-dynamodb.js` - SNS client
- `backend/voice-services-routes.js` - Voice service clients
- `backend/voice-command-service.js` - Voice command clients
- `backend/cognito-auth.js` - Cognito authentication client

## AWS Secrets Manager Setup

### Secret Structure

Your secret in AWS Secrets Manager must be named `shebalance-deployment` and contain:

```json
{
  "accessKeyId": "YOUR_AWS_ACCESS_KEY_ID",
  "secretAccessKey": "YOUR_AWS_SECRET_ACCESS_KEY"
}
```

### Creating the Secret

```bash
aws secretsmanager create-secret \
  --name shebalance-deployment \
  --description "AWS credentials for SHE-BALANCE application" \
  --secret-string '{"accessKeyId":"YOUR_KEY","secretAccessKey":"YOUR_SECRET"}' \
  --region us-east-1
```

### Updating the Secret

```bash
aws secretsmanager update-secret \
  --secret-id shebalance-deployment \
  --secret-string '{"accessKeyId":"NEW_KEY","secretAccessKey":"NEW_SECRET"}' \
  --region us-east-1
```

## Migration Mode (Backward Compatibility)

The secrets manager module includes a fallback mechanism:

1. **Primary**: Attempts to retrieve credentials from AWS Secrets Manager
2. **Fallback**: If Secrets Manager fails, falls back to environment variables:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

This allows gradual migration without breaking existing deployments.

## Required IAM Permissions

The application needs these IAM permissions to access Secrets Manager:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:*:secret:shebalance-deployment-*"
    }
  ]
}
```

## Installation

Install the required AWS SDK package:

```bash
npm install @aws-sdk/client-secrets-manager
```

## Usage Examples

### Using the Secrets Manager Module Directly

```javascript
const { getAWSCredentials, refreshCredentials, clearCache } = require('./utils/secrets-manager');

// Get credentials (cached)
const credentials = await getAWSCredentials();
console.log(credentials.accessKeyId);

// Force refresh (bypass cache)
const freshCredentials = await refreshCredentials();

// Clear cache
clearCache();
```

### Using AWS Client Factory

```javascript
const { createS3Client, createDynamoDBClient } = require('./utils/aws-clients');

// Create S3 client with Secrets Manager credentials
const s3Client = await createS3Client();

// Create DynamoDB client with Secrets Manager credentials
const dynamoClient = await createDynamoDBClient();
```

## Caching Behavior

- Credentials are cached in memory for 1 hour (3600 seconds)
- Cache is automatically cleared on application restart
- Manual refresh available via `refreshCredentials()`
- Reduces API calls to Secrets Manager

## Error Handling

The module provides detailed error messages:

- **Missing Secret**: "Failed to retrieve AWS credentials: Secret not found"
- **Invalid JSON**: "SecretString is empty or undefined"
- **Missing Fields**: "Missing required credential fields: accessKeyId or secretAccessKey"
- **Empty Values**: "accessKeyId must be a non-empty string"

## Security Best Practices

1. ✅ **Never commit credentials** to version control
2. ✅ **Use IAM roles** when running on AWS (EC2, ECS, Lambda)
3. ✅ **Rotate credentials** regularly in Secrets Manager
4. ✅ **Monitor access** using CloudTrail
5. ✅ **Use least privilege** IAM policies

## Troubleshooting

### "Failed to retrieve AWS credentials"

**Cause**: Cannot access Secrets Manager or secret doesn't exist

**Solution**:
1. Verify secret exists: `aws secretsmanager describe-secret --secret-id shebalance-deployment`
2. Check IAM permissions
3. Verify AWS region is `us-east-1`

### "Missing required credential fields"

**Cause**: Secret structure is incorrect

**Solution**: Update secret with correct JSON structure (see above)

### Application falls back to environment variables

**Cause**: Secrets Manager retrieval failed

**Solution**: Check CloudWatch logs for detailed error message

## Monitoring

Monitor Secrets Manager usage:

```bash
# View secret metadata
aws secretsmanager describe-secret --secret-id shebalance-deployment

# Check CloudTrail for access logs
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=ResourceName,AttributeValue=shebalance-deployment
```

## Next Steps

1. ✅ Remove `.env` files from production servers
2. ✅ Update deployment scripts to use IAM roles instead of access keys
3. ✅ Set up credential rotation in Secrets Manager
4. ✅ Configure CloudWatch alarms for failed secret retrievals
5. ✅ Document the secret structure for your team

## Support

For issues or questions:
1. Check application logs for detailed error messages
2. Verify AWS Secrets Manager configuration
3. Review IAM permissions
4. Test with `aws secretsmanager get-secret-value --secret-id shebalance-deployment`
