/**
 * Lambda Function: order-update-progress
 * Purpose: Update order progress percentage
 * Trigger: API Gateway PUT /api/orders/{orderId}/progress
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const jwt = require('jsonwebtoken');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const ORDERS_TABLE = process.env.ORDERS_TABLE || 'shebalance-orders';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

exports.handler = async (event) => {
  console.log('Update order progress request received');

  try {
    const token = extractToken(event);
    if (!token) {
      return createResponse(401, { success: false, message: 'Authorization token required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return createResponse(401, { success: false, message: 'Invalid or expired token' });
    }

    const userId = decoded.userId;
    const orderId = event.pathParameters?.orderId;

    if (!orderId) {
      return createResponse(400, { success: false, message: 'Order ID is required' });
    }

    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { progress, milestone, note } = body;

    // Validate progress
    if (progress === undefined || typeof progress !== 'number' || progress < 0 || progress > 100) {
      return createResponse(400, {
        success: false,
        message: 'Progress must be a number between 0 and 100'
      });
    }

    // Get order
    const order = await getOrder(orderId);
    if (!order) {
      return createResponse(404, { success: false, message: 'Order not found' });
    }

    // Check authorization (only artisan can update progress)
    if (order.artisanId !== userId && decoded.userType !== 'admin') {
      return createResponse(403, { success: false, message: 'Only the artisan can update order progress' });
    }

    // Update order progress
    const updatedOrder = await updateOrderProgress(orderId, progress, milestone, note);

    // Auto-update status based on progress
    if (progress === 100 && order.status !== 'completed') {
      await updateOrderStatus(orderId, 'completed');
    } else if (progress > 0 && order.status === 'accepted') {
      await updateOrderStatus(orderId, 'in_progress');
    }

    return createResponse(200, {
      success: true,
      message: 'Order progress updated successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Update order progress error:', error);
    return createResponse(500, {
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

async function getOrder(orderId) {
  const params = {
    TableName: ORDERS_TABLE,
    Key: { orderId }
  };
  const result = await docClient.send(new GetCommand(params));
  return result.Item || null;
}

async function updateOrderProgress(orderId, progress, milestone, note) {
  const now = new Date().toISOString();
  
  const updateExpression = 'SET progress = :progress, updatedAt = :now, progressHistory = list_append(if_not_exists(progressHistory, :empty_list), :history)';
  const expressionAttributeValues = {
    ':progress': progress,
    ':now': now,
    ':empty_list': [],
    ':history': [{
      progress,
      milestone: milestone || null,
      note: note || null,
      timestamp: now
    }]
  };

  const params = {
    TableName: ORDERS_TABLE,
    Key: { orderId },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  };

  const result = await docClient.send(new UpdateCommand(params));
  return result.Attributes;
}

async function updateOrderStatus(orderId, status) {
  try {
    const params = {
      TableName: ORDERS_TABLE,
      Key: { orderId },
      UpdateExpression: 'SET #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': status
      }
    };
    await docClient.send(new UpdateCommand(params));
  } catch (error) {
    console.error('Error auto-updating status:', error);
  }
}

function extractToken(event) {
  const authHeader = event.headers?.Authorization || event.headers?.authorization;
  if (!authHeader) return null;
  return authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
}

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
