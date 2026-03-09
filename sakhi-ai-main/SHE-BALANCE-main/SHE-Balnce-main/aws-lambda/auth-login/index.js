/**
 * Lambda Function: auth-login
 * Purpose: Handle user authentication and JWT token generation
 * Trigger: API Gateway POST /api/auth/login
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Environment variables
const USERS_TABLE = process.env.USERS_TABLE || 'shebalance-users';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
  console.log('Login request received:', JSON.stringify(event, null, 2));

  try {
    // Parse request body
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { email, password, userType } = body;

    // Validate input
    if (!email || !password) {
      return createResponse(400, {
        success: false,
        message: 'Email and password are required'
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return createResponse(400, {
        success: false,
        message: 'Invalid email format'
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Fetch user from DynamoDB
    const user = await getUserByEmail(normalizedEmail);

    if (!user) {
      return createResponse(401, {
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      // Log failed attempt
      await logFailedAttempt(user.userId);
      
      return createResponse(401, {
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user type matches (if provided)
    if (userType && user.userType !== userType) {
      return createResponse(403, {
        success: false,
        message: `This account is not registered as ${userType}`
      });
    }

    // Check if account is active
    if (user.status === 'suspended' || user.status === 'deleted') {
      return createResponse(403, {
        success: false,
        message: 'Account is suspended or deleted. Please contact support.'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Update last login
    await updateLastLogin(user.userId);

    // Prepare user data (remove sensitive info)
    const userData = sanitizeUserData(user);

    // Return success response
    return createResponse(200, {
      success: true,
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    
    return createResponse(500, {
      success: false,
      message: 'Internal server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get user by email from DynamoDB
 */
async function getUserByEmail(email) {
  try {
    const params = {
      TableName: USERS_TABLE,
      IndexName: 'email-index', // GSI on email
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      },
      Limit: 1
    };

    // Use Query instead of Scan for better performance
    const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
    const { QueryCommand } = require('@aws-sdk/lib-dynamodb');
    
    const command = new QueryCommand(params);
    const result = await docClient.send(command);

    if (result.Items && result.Items.length > 0) {
      return result.Items[0];
    }

    // Fallback: Get by userId if email is used as userId
    const getParams = {
      TableName: USERS_TABLE,
      Key: { userId: email }
    };

    const getResult = await docClient.send(new GetCommand(getParams));
    return getResult.Item || null;

  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

/**
 * Verify password using bcrypt
 */
async function verifyPassword(plainPassword, hashedPassword) {
  try {
    // If password is not hashed (for testing), do direct comparison
    if (!hashedPassword.startsWith('$2a$') && !hashedPassword.startsWith('$2b$')) {
      return plainPassword === hashedPassword;
    }

    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Generate JWT token
 */
function generateToken(user) {
  const payload = {
    userId: user.userId,
    email: user.email,
    userType: user.userType,
    name: user.name,
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Update last login timestamp
 */
async function updateLastLogin(userId) {
  try {
    const params = {
      TableName: USERS_TABLE,
      Key: { userId },
      UpdateExpression: 'SET lastLogin = :now, loginCount = if_not_exists(loginCount, :zero) + :one',
      ExpressionAttributeValues: {
        ':now': new Date().toISOString(),
        ':zero': 0,
        ':one': 1
      }
    };

    await docClient.send(new UpdateCommand(params));
  } catch (error) {
    console.error('Error updating last login:', error);
    // Don't throw - this is not critical
  }
}

/**
 * Log failed login attempt
 */
async function logFailedAttempt(userId) {
  try {
    const params = {
      TableName: USERS_TABLE,
      Key: { userId },
      UpdateExpression: 'SET failedAttempts = if_not_exists(failedAttempts, :zero) + :one, lastFailedAttempt = :now',
      ExpressionAttributeValues: {
        ':zero': 0,
        ':one': 1,
        ':now': new Date().toISOString()
      }
    };

    await docClient.send(new UpdateCommand(params));
  } catch (error) {
    console.error('Error logging failed attempt:', error);
    // Don't throw - this is not critical
  }
}

/**
 * Remove sensitive data from user object
 */
function sanitizeUserData(user) {
  const { password, failedAttempts, ...sanitized } = user;
  return sanitized;
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
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
      'Access-Control-Allow-Methods': 'POST,OPTIONS'
    },
    body: JSON.stringify(body)
  };
}
