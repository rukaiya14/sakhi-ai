/**
 * AWS Client Factory with Secrets Manager Integration
 * Provides pre-configured AWS service clients with credentials from Secrets Manager
 */

const { getAWSCredentials } = require('../../../../utils/secrets-manager');
const AWS = require('aws-sdk');

// AWS SDK v3 imports
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { S3Client } = require("@aws-sdk/client-s3");
const { TranslateClient } = require("@aws-sdk/client-translate");
const { PollyClient } = require("@aws-sdk/client-polly");
const { TranscribeClient } = require("@aws-sdk/client-transcribe");
const { CognitoIdentityProviderClient } = require("@aws-sdk/client-cognito-identity-provider");

const REGION = process.env.AWS_REGION || 'us-east-1';

let cachedCredentials = null;

/**
 * Get credentials (cached or fresh)
 */
async function getCredentials() {
  if (!cachedCredentials) {
    cachedCredentials = await getAWSCredentials();
  }
  return cachedCredentials;
}

/**
 * Initialize AWS SDK v2 clients (for legacy code)
 */
async function initializeAWSv2() {
  const credentials = await getCredentials();
  
  AWS.config.update({
    region: REGION,
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey
  });

  return {
    SNS: new AWS.SNS(),
    Polly: new AWS.Polly(),
    Translate: new AWS.Translate(),
    S3: new AWS.S3(),
    DynamoDB: new AWS.DynamoDB.DocumentClient(),
    TranscribeService: new AWS.TranscribeService()
  };
}

/**
 * Create DynamoDB client (v3)
 */
async function createDynamoDBClient() {
  const credentials = await getCredentials();
  
  const client = new DynamoDBClient({ 
    region: REGION,
    credentials: credentials
  });
  
  return DynamoDBDocumentClient.from(client);
}

/**
 * Create S3 client (v3)
 */
async function createS3Client() {
  const credentials = await getCredentials();
  
  return new S3Client({ 
    region: REGION,
    credentials: credentials
  });
}

/**
 * Create Translate client (v3)
 */
async function createTranslateClient() {
  const credentials = await getCredentials();
  
  return new TranslateClient({ 
    region: REGION,
    credentials: credentials
  });
}

/**
 * Create Polly client (v3)
 */
async function createPollyClient() {
  const credentials = await getCredentials();
  
  return new PollyClient({ 
    region: REGION,
    credentials: credentials
  });
}

/**
 * Create Transcribe client (v3)
 */
async function createTranscribeClient() {
  const credentials = await getCredentials();
  
  return new TranscribeClient({ 
    region: REGION,
    credentials: credentials
  });
}

/**
 * Create Cognito client (v3)
 */
async function createCognitoClient() {
  const credentials = await getCredentials();
  
  return new CognitoIdentityProviderClient({ 
    region: REGION,
    credentials: credentials
  });
}

module.exports = {
  initializeAWSv2,
  createDynamoDBClient,
  createS3Client,
  createTranslateClient,
  createPollyClient,
  createTranscribeClient,
  createCognitoClient,
  getCredentials
};
