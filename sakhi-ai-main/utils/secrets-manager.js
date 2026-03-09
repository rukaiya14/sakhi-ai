/**
 * AWS Secrets Manager Integration
 * Centralized module for retrieving AWS credentials from Secrets Manager
 */

const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");

const SECRET_NAME = "shebalance-deployment";
const REGION = "us-east-1";
const CACHE_TTL = 3600000; // 1 hour in milliseconds

let credentialsCache = null;
let cacheTimestamp = null;

/**
 * Retrieves AWS credentials from Secrets Manager with caching
 * @returns {Promise<{accessKeyId: string, secretAccessKey: string}>}
 */
async function getAWSCredentials() {
  // Return cached credentials if still valid
  if (credentialsCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL)) {
    console.log('✅ Using cached AWS credentials');
    return credentialsCache;
  }

  console.log('🔐 Fetching AWS credentials from Secrets Manager...');

  const client = new SecretsManagerClient({
    region: REGION,
  });

  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: SECRET_NAME,
        VersionStage: "AWSCURRENT",
      })
    );

    if (!response.SecretString) {
      throw new Error('SecretString is empty or undefined');
    }

    const secret = JSON.parse(response.SecretString);

    // Handle different field name variations
    let accessKeyId = secret.accessKeyId || secret['aws access key'] || secret.AWS_ACCESS_KEY_ID;
    let secretAccessKey = secret.secretAccessKey || secret['aws secret access key'] || secret['aws secret access key '] || secret.AWS_SECRET_ACCESS_KEY;

    // Validate required fields
    if (!accessKeyId || !secretAccessKey) {
      throw new Error('Missing required credential fields: accessKeyId or secretAccessKey');
    }

    // Validate non-empty strings
    if (typeof accessKeyId !== 'string' || accessKeyId.trim() === '') {
      throw new Error('accessKeyId must be a non-empty string');
    }
    if (typeof secretAccessKey !== 'string' || secretAccessKey.trim() === '') {
      throw new Error('secretAccessKey must be a non-empty string');
    }

    // Cache the credentials
    credentialsCache = {
      accessKeyId: accessKeyId.trim(),
      secretAccessKey: secretAccessKey.trim()
    };
    cacheTimestamp = Date.now();

    console.log('✅ AWS credentials retrieved and cached successfully');
    return credentialsCache;

  } catch (error) {
    console.error('❌ Error retrieving AWS credentials from Secrets Manager:', error.message);
    
    // Fallback to environment variables if available (migration mode)
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      console.warn('⚠️  Falling back to environment variables');
      return {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      };
    }

    throw new Error(`Failed to retrieve AWS credentials: ${error.message}`);
  }
}

/**
 * Clears the credentials cache
 */
function clearCache() {
  credentialsCache = null;
  cacheTimestamp = null;
  console.log('🗑️  Credentials cache cleared');
}

/**
 * Manually refresh credentials (bypass cache)
 */
async function refreshCredentials() {
  clearCache();
  return await getAWSCredentials();
}

module.exports = {
  getAWSCredentials,
  clearCache,
  refreshCredentials
};
