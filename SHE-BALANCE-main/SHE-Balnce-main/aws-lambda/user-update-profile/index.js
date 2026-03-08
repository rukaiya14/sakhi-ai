/**
 * Lambda Function: user-update-profile
 * Purpose: Update user profile data
 * Trigger: API Gateway PUT /api/user/profile
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const jwt = require('jsonwebtoken');

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Environment variables
const USERS_TABLE = process.env.USERS_TABLE || 'shebalance-users';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Allowed fields for update
const ALLOWED_FIELDS = {
  common: ['name', 'phone', 'location', 'bio', 'avatar', 'language', 'timezone'],
  artisan: ['skills', 'experience', 'portfolio', 'availability', 'hourlyRate', 'bankDetails'],
  buyer: ['preferences', 'shippingAddress', 'billingAddress'],
  corporate: ['companyName', 'industry', 'contactPerson', 'taxId', 'billingAddress'],
  admin: ['role', 'permissions']
};

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
  console.log('Update profile request received:', JSON.stringify(event, null, 2));

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

    // Parse request body
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

    // Get current user data
    const currentUser = await getUserProfile(userId);
    
    if (!currentUser) {
      return createResponse(404, {
        success: false,
        message: 'User not found'
      });
    }

    // Validate and filter update fields
    const allowedFields = [
      ...ALLOWED_FIELDS.common,
      ...(ALLOWED_FIELDS[currentUser.userType] || [])
    ];

    const updates = {};
    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      return createResponse(400, {
        success: false,
        message: 'No valid fields to update'
      });
    }

    // Validate specific fields
    const validation = validateUpdates(updates, currentUser.userType);
    if (!validation.valid) {
      return createResponse(400, {
        success: false,
        message: validation.message
      });
    }

    // Update user profile
    const updatedUser = await updateUserProfile(userId, updates);

    // Remove sensitive data
    const { password, failedAttempts, ...sanitizedUser } = updatedUser;

    // Return success response
    return createResponse(200, {
      success: true,
      message: 'Profile updated successfully',
      user: sanitizedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
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
 * Validate update fields
 */
function validateUpdates(updates, userType) {
  // Validate name
  if (updates.name !== undefined) {
    if (typeof updates.name !== 'string' || updates.name.trim().length < 2) {
      return {
        valid: false,
        message: 'Name must be at least 2 characters long'
      };
    }
  }

  // Validate phone
  if (updates.phone !== undefined) {
    if (updates.phone && typeof updates.phone !== 'string') {
      return {
        valid: false,
        message: 'Invalid phone number format'
      };
    }
  }

  // Validate skills (for artisans)
  if (updates.skills !== undefined && userType === 'artisan') {
    if (!Array.isArray(updates.skills)) {
      return {
        valid: false,
        message: 'Skills must be an array'
      };
    }
  }

  // Validate hourly rate (for artisans)
  if (updates.hourlyRate !== undefined && userType === 'artisan') {
    if (typeof updates.hourlyRate !== 'number' || updates.hourlyRate < 0) {
      return {
        valid: false,
        message: 'Hourly rate must be a positive number'
      };
    }
  }

  return { valid: true };
}

/**
 * Update user profile in DynamoDB
 */
async function updateUserProfile(userId, updates) {
  try {
    // Build update expression
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    let index = 0;
    for (const [key, value] of Object.entries(updates)) {
      const attrName = `#attr${index}`;
      const attrValue = `:val${index}`;
      
      updateExpressions.push(`${attrName} = ${attrValue}`);
      expressionAttributeNames[attrName] = key;
      expressionAttributeValues[attrValue] = value;
      
      index++;
    }

    // Add updatedAt timestamp
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const params = {
      TableName: USERS_TABLE,
      Key: { userId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };

    const result = await docClient.send(new UpdateCommand(params));
    return result.Attributes;

  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
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
      'Access-Control-Allow-Methods': 'PUT,OPTIONS'
    },
    body: JSON.stringify(body)
  };
}
