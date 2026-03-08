/**
 * Lambda Function: order-create
 * Purpose: Create new order
 * Trigger: API Gateway POST /api/orders
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

// Initialize clients
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const snsClient = new SNSClient({ region: process.env.AWS_REGION || 'us-east-1' });

// Environment variables
const ORDERS_TABLE = process.env.ORDERS_TABLE || 'shebalance-orders';
const USERS_TABLE = process.env.USERS_TABLE || 'shebalance-users';
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
  console.log('Create order request received:', JSON.stringify(event, null, 2));

  try {
    // Extract and verify JWT token
    const token = extractToken(event);
    if (!token) {
      return createResponse(401, {
        success: false,
        message: 'Authorization token required'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return createResponse(401, {
        success: false,
        message: 'Invalid or expired token'
      });
    }

    const buyerId = decoded.userId;

    // Parse request body
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

    // Validate input
    const validation = validateOrderInput(body);
    if (!validation.valid) {
      return createResponse(400, {
        success: false,
        message: validation.message
      });
    }

    // Verify artisan exists
    const artisan = await getUser(body.artisanId);
    if (!artisan || artisan.userType !== 'artisan') {
      return createResponse(404, {
        success: false,
        message: 'Artisan not found'
      });
    }

    // Create order object
    const orderId = uuidv4();
    const now = new Date().toISOString();

    const order = {
      orderId,
      buyerId,
      artisanId: body.artisanId,
      corporateId: body.corporateId || null,
      
      // Order details
      title: body.title,
      description: body.description,
      category: body.category || artisan.skills?.[0] || 'general',
      quantity: body.quantity || 1,
      
      // Pricing
      price: body.price,
      currency: body.currency || 'INR',
      
      // Delivery
      deliveryDate: body.deliveryDate,
      deliveryAddress: body.deliveryAddress || null,
      
      // Status
      status: 'pending',
      progress: 0,
      
      // Timestamps
      createdAt: now,
      updatedAt: now,
      
      // Additional fields
      requirements: body.requirements || null,
      attachments: body.attachments || [],
      notes: body.notes || null,
      
      // Tracking
      statusHistory: [{
        status: 'pending',
        timestamp: now,
        note: 'Order created'
      }]
    };

    // Save order to DynamoDB
    await saveOrder(order);

    // Update artisan's order count
    await updateArtisanStats(body.artisanId, 'totalOrders');

    // Send notification to artisan
    if (SNS_TOPIC_ARN && artisan.phone) {
      await sendOrderNotification(artisan, order);
    }

    // Return success response
    return createResponse(201, {
      success: true,
      message: 'Order created successfully',
      order
    });

  } catch (error) {
    console.error('Create order error:', error);
    
    return createResponse(500, {
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Validate order input
 */
function validateOrderInput(data) {
  const { artisanId, title, price, deliveryDate } = data;

  if (!artisanId) {
    return { valid: false, message: 'Artisan ID is required' };
  }

  if (!title || title.trim().length < 3) {
    return { valid: false, message: 'Title must be at least 3 characters' };
  }

  if (!price || typeof price !== 'number' || price <= 0) {
    return { valid: false, message: 'Valid price is required' };
  }

  if (deliveryDate) {
    const deliveryDateObj = new Date(deliveryDate);
    if (isNaN(deliveryDateObj.getTime())) {
      return { valid: false, message: 'Invalid delivery date format' };
    }
    if (deliveryDateObj < new Date()) {
      return { valid: false, message: 'Delivery date must be in the future' };
    }
  }

  return { valid: true };
}

/**
 * Get user from DynamoDB
 */
async function getUser(userId) {
  try {
    const params = {
      TableName: USERS_TABLE,
      Key: { userId }
    };

    const result = await docClient.send(new GetCommand(params));
    return result.Item || null;

  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

/**
 * Save order to DynamoDB
 */
async function saveOrder(order) {
  try {
    const params = {
      TableName: ORDERS_TABLE,
      Item: order
    };

    await docClient.send(new PutCommand(params));
    console.log('Order saved successfully:', order.orderId);

  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  }
}

/**
 * Update artisan statistics
 */
async function updateArtisanStats(artisanId, field) {
  try {
    const params = {
      TableName: USERS_TABLE,
      Key: { userId: artisanId },
      UpdateExpression: `SET ${field} = if_not_exists(${field}, :zero) + :one`,
      ExpressionAttributeValues: {
        ':zero': 0,
        ':one': 1
      }
    };

    await docClient.send(new UpdateCommand(params));

  } catch (error) {
    console.error('Error updating artisan stats:', error);
    // Don't throw - this is not critical
  }
}

/**
 * Send order notification via SNS
 */
async function sendOrderNotification(artisan, order) {
  try {
    const message = `New order received! "${order.title}" - ₹${order.price}. Check your dashboard for details.`;

    const params = {
      TopicArn: SNS_TOPIC_ARN,
      Message: message,
      Subject: 'New Order - SHE-BALANCE',
      MessageAttributes: {
        userId: {
          DataType: 'String',
          StringValue: artisan.userId
        },
        orderType: {
          DataType: 'String',
          StringValue: 'new_order'
        }
      }
    };

    await snsClient.send(new PublishCommand(params));
    console.log('Notification sent to artisan:', artisan.userId);

  } catch (error) {
    console.error('Error sending notification:', error);
    // Don't throw - this is not critical
  }
}

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
