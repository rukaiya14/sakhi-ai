/**
 * Lambda Function: user-get-profile
 * Purpose: Get user profile data
 * Trigger: API Gateway GET /api/user/profile
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const jwt = require('jsonwebtoken');

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Environment variables
const USERS_TABLE = process.env.USERS_TABLE || 'shebalance-users';
const ORDERS_TABLE = process.env.ORDERS_TABLE || 'shebalance-orders';
const LABOUR_TABLE = process.env.LABOUR_TABLE || 'shebalance-labour';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
  console.log('Get profile request received:', JSON.stringify(event, null, 2));

  try {
    // Extract and verify JWT token
    const token = extractToken(event);
    if (!token) {
      return createResponse(401, {
        success: false,
        message: 'Authorization token required'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return createResponse(401, {
        success: false,
        message: 'Invalid or expired token'
      });
    }

    const userId = decoded.userId;

    // Get user profile
    const user = await getUserProfile(userId);
    
    if (!user) {
      return createResponse(404, {
        success: false,
        message: 'User not found'
      });
    }

    // Get additional data based on user type
    let additionalData = {};
    
    if (user.userType === 'artisan') {
      additionalData = await getArtisanData(userId);
    } else if (user.userType === 'buyer') {
      additionalData = await getBuyerData(userId);
    } else if (user.userType === 'corporate') {
      additionalData = await getCorporateData(userId);
    }

    // Remove sensitive data
    const { password, failedAttempts, ...sanitizedUser } = user;

    // Return success response
    return createResponse(200, {
      success: true,
      user: {
        ...sanitizedUser,
        ...additionalData
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    
    return createResponse(500, {
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Extract JWT token from headers
 */
function extractToken(event) {
  const authHeader = event.headers?.Authorization || event.headers?.authorization;
  
  if (!authHeader) {
    return null;
  }

  // Handle "Bearer <token>" format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return authHeader;
}

/**
 * Get user profile from DynamoDB
 */
async function getUserProfile(userId) {
  try {
    const params = {
      TableName: USERS_TABLE,
      Key: { userId }
    };

    const result = await docClient.send(new GetCommand(params));
    return result.Item || null;

  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Get artisan-specific data
 */
async function getArtisanData(userId) {
  try {
    // Get recent orders
    const ordersParams = {
      TableName: ORDERS_TABLE,
      IndexName: 'artisanId-index',
      KeyConditionExpression: 'artisanId = :artisanId',
      ExpressionAttributeValues: {
        ':artisanId': userId
      },
      ScanIndexForward: false,
      Limit: 5
    };

    const ordersResult = await docClient.send(new QueryCommand(ordersParams));

    // Get labour hours summary
    const labourParams = {
      TableName: LABOUR_TABLE,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false,
      Limit: 10
    };

    const labourResult = await docClient.send(new QueryCommand(labourParams));

    // Calculate labour statistics
    const labourStats = calculateLabourStats(labourResult.Items || []);

    return {
      recentOrders: ordersResult.Items || [],
      recentLabourLogs: labourResult.Items || [],
      labourStats
    };

  } catch (error) {
    console.error('Error fetching artisan data:', error);
    return {};
  }
}

/**
 * Get buyer-specific data
 */
async function getBuyerData(userId) {
  try {
    // Get recent orders
    const ordersParams = {
      TableName: ORDERS_TABLE,
      IndexName: 'buyerId-index',
      KeyConditionExpression: 'buyerId = :buyerId',
      ExpressionAttributeValues: {
        ':buyerId': userId
      },
      ScanIndexForward: false,
      Limit: 5
    };

    const ordersResult = await docClient.send(new QueryCommand(ordersParams));

    return {
      recentOrders: ordersResult.Items || []
    };

  } catch (error) {
    console.error('Error fetching buyer data:', error);
    return {};
  }
}

/**
 * Get corporate-specific data
 */
async function getCorporateData(userId) {
  try {
    // Get bulk orders
    const ordersParams = {
      TableName: ORDERS_TABLE,
      IndexName: 'corporateId-index',
      KeyConditionExpression: 'corporateId = :corporateId',
      ExpressionAttributeValues: {
        ':corporateId': userId
      },
      ScanIndexForward: false,
      Limit: 10
    };

    const ordersResult = await docClient.send(new QueryCommand(ordersParams));

    return {
      recentOrders: ordersResult.Items || []
    };

  } catch (error) {
    console.error('Error fetching corporate data:', error);
    return {};
  }
}

/**
 * Calculate labour statistics
 */
function calculateLabourStats(labourLogs) {
  if (!labourLogs || labourLogs.length === 0) {
    return {
      totalHours: 0,
      thisWeek: 0,
      thisMonth: 0,
      averageDaily: 0
    };
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  let totalHours = 0;
  let weekHours = 0;
  let monthHours = 0;

  labourLogs.forEach(log => {
    const hours = log.hours || 0;
    totalHours += hours;

    const logDate = new Date(log.date);
    if (logDate >= weekAgo) {
      weekHours += hours;
    }
    if (logDate >= monthAgo) {
      monthHours += hours;
    }
  });

  return {
    totalHours: Math.round(totalHours * 10) / 10,
    thisWeek: Math.round(weekHours * 10) / 10,
    thisMonth: Math.round(monthHours * 10) / 10,
    averageDaily: Math.round((monthHours / 30) * 10) / 10
  };
}

/**
 * Create HTTP response with CORS headers
 */
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
