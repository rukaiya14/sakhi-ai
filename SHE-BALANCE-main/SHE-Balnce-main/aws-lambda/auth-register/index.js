/**
 * Lambda Function: auth-register
 * Purpose: Handle new user registration
 * Trigger: API Gateway POST /api/auth/register
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Environment variables
const USERS_TABLE = process.env.USERS_TABLE || 'shebalance-users';
const SALT_ROUNDS = 10;

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
  console.log('Registration request received:', JSON.stringify(event, null, 2));

  try {
    // Parse request body
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { name, email, password, phone, userType, skills, location } = body;

    // Validate required fields
    const validation = validateInput(body);
    if (!validation.valid) {
      return createResponse(400, {
        success: false,
        message: validation.message
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await checkUserExists(normalizedEmail, phone);
    if (existingUser) {
      return createResponse(409, {
        success: false,
        message: existingUser.message
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate user ID
    const userId = uuidv4();

    // Create user object
    const newUser = {
      userId,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : null,
      userType: userType || 'artisan',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      loginCount: 0,
      failedAttempts: 0,
      
      // User type specific fields
      ...(userType === 'artisan' && {
        skills: skills || [],
        location: location || null,
        rating: 0,
        totalOrders: 0,
        completedOrders: 0,
        labourBalance: 0,
        resilienceScore: 0,
        profileComplete: false,
        verified: false
      }),
      
      ...(userType === 'buyer' && {
        totalPurchases: 0,
        favoriteArtisans: [],
        savedItems: []
      }),
      
      ...(userType === 'corporate' && {
        companyName: body.companyName || null,
        industry: body.industry || null,
        totalContracts: 0,
        activeContracts: 0
      }),
      
      ...(userType === 'admin' && {
        role: body.role || 'moderator',
        permissions: body.permissions || ['view_users', 'view_orders']
      })
    };

    // Save to DynamoDB
    await saveUser(newUser);

    // Remove sensitive data for response
    const { password: _, ...userResponse } = newUser;

    // Return success response
    return createResponse(201, {
      success: true,
      message: 'Registration successful',
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    return createResponse(500, {
      success: false,
      message: 'Internal server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Validate input data
 */
function validateInput(data) {
  const { name, email, password, userType } = data;

  // Check required fields
  if (!name || !email || !password) {
    return {
      valid: false,
      message: 'Name, email, and password are required'
    };
  }

  // Validate name
  if (name.trim().length < 2) {
    return {
      valid: false,
      message: 'Name must be at least 2 characters long'
    };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      valid: false,
      message: 'Invalid email format'
    };
  }

  // Validate password strength
  if (password.length < 6) {
    return {
      valid: false,
      message: 'Password must be at least 6 characters long'
    };
  }

  // Validate user type
  const validUserTypes = ['artisan', 'buyer', 'corporate', 'admin'];
  if (userType && !validUserTypes.includes(userType)) {
    return {
      valid: false,
      message: 'Invalid user type. Must be: artisan, buyer, corporate, or admin'
    };
  }

  return { valid: true };
}

/**
 * Check if user already exists
 */
async function checkUserExists(email, phone) {
  try {
    // Check by email using GSI
    const emailParams = {
      TableName: USERS_TABLE,
      IndexName: 'email-index',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      },
      Limit: 1
    };

    const emailResult = await docClient.send(new QueryCommand(emailParams));
    
    if (emailResult.Items && emailResult.Items.length > 0) {
      return {
        exists: true,
        message: 'An account with this email already exists'
      };
    }

    // Check by phone if provided
    if (phone) {
      const phoneParams = {
        TableName: USERS_TABLE,
        IndexName: 'phone-index',
        KeyConditionExpression: 'phone = :phone',
        ExpressionAttributeValues: {
          ':phone': phone.trim()
        },
        Limit: 1
      };

      const phoneResult = await docClient.send(new QueryCommand(phoneParams));
      
      if (phoneResult.Items && phoneResult.Items.length > 0) {
        return {
          exists: true,
          message: 'An account with this phone number already exists'
        };
      }
    }

    return null;

  } catch (error) {
    console.error('Error checking user existence:', error);
    throw error;
  }
}

/**
 * Hash password using bcrypt
 */
async function hashPassword(password) {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Save user to DynamoDB
 */
async function saveUser(user) {
  try {
    const params = {
      TableName: USERS_TABLE,
      Item: user,
      ConditionExpression: 'attribute_not_exists(userId)'
    };

    await docClient.send(new PutCommand(params));
    console.log('User saved successfully:', user.userId);

  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      throw new Error('User ID already exists');
    }
    console.error('Error saving user:', error);
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
      'Access-Control-Allow-Methods': 'POST,OPTIONS'
    },
    body: JSON.stringify(body)
  };
}
