/**
 * Lambda Function: artisan-list
 * Purpose: List and search artisans
 * Trigger: API Gateway GET /api/artisans
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const USERS_TABLE = process.env.USERS_TABLE || 'shebalance-users';

exports.handler = async (event) => {
  console.log('List artisans request received');

  try {
    // Get query parameters
    const queryParams = event.queryStringParameters || {};
    const skill = queryParams.skill;
    const location = queryParams.location;
    const minRating = queryParams.minRating ? parseFloat(queryParams.minRating) : null;
    const verified = queryParams.verified === 'true';
    const limit = parseInt(queryParams.limit) || 50;

    // Fetch artisans
    let artisans = await getArtisans(limit);

    // Apply filters
    artisans = filterArtisans(artisans, { skill, location, minRating, verified });

    // Remove sensitive data
    artisans = artisans.map(sanitizeArtisan);

    // Sort by rating (descending)
    artisans.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return createResponse(200, {
      success: true,
      artisans,
      count: artisans.length
    });

  } catch (error) {
    console.error('List artisans error:', error);
    return createResponse(500, {
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

async function getArtisans(limit) {
  try {
    // Use GSI on userType for better performance
    const params = {
      TableName: USERS_TABLE,
      IndexName: 'userType-index',
      KeyConditionExpression: 'userType = :userType',
      ExpressionAttributeValues: {
        ':userType': 'artisan'
      },
      FilterExpression: '#status = :active',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':userType': 'artisan',
        ':active': 'active'
      },
      Limit: limit
    };

    const result = await docClient.send(new QueryCommand(params));
    return result.Items || [];

  } catch (error) {
    // Fallback to scan if GSI doesn't exist
    console.log('GSI not found, falling back to scan');
    
    const scanParams = {
      TableName: USERS_TABLE,
      FilterExpression: 'userType = :userType AND #status = :active',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':userType': 'artisan',
        ':active': 'active'
      },
      Limit: limit
    };

    const result = await docClient.send(new ScanCommand(scanParams));
    return result.Items || [];
  }
}

function filterArtisans(artisans, filters) {
  let filtered = artisans;

  // Filter by skill
  if (filters.skill) {
    const skillLower = filters.skill.toLowerCase();
    filtered = filtered.filter(artisan => 
      artisan.skills && artisan.skills.some(s => 
        s.toLowerCase().includes(skillLower)
      )
    );
  }

  // Filter by location
  if (filters.location) {
    const locationLower = filters.location.toLowerCase();
    filtered = filtered.filter(artisan => 
      artisan.location && artisan.location.toLowerCase().includes(locationLower)
    );
  }

  // Filter by minimum rating
  if (filters.minRating !== null) {
    filtered = filtered.filter(artisan => 
      (artisan.rating || 0) >= filters.minRating
    );
  }

  // Filter by verified status
  if (filters.verified) {
    filtered = filtered.filter(artisan => artisan.verified === true);
  }

  return filtered;
}

function sanitizeArtisan(artisan) {
  const {
    password,
    failedAttempts,
    lastFailedAttempt,
    bankDetails,
    ...sanitized
  } = artisan;

  return sanitized;
}

function createResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,OPTIONS'
    },
    body: JSON.stringify(body)
  };
}
