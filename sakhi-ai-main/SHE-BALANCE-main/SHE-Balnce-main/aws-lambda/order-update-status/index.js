/**
 * Lambda Function: order-update-status
 * Purpose: Update order status
 * Trigger: API Gateway PUT /api/orders/{orderId}/status
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const jwt = require('jsonwebtoken');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const snsClient = new SNSClient({ region: process.env.AWS_REGION || 'us-east-1' });

const ORDERS_TABLE = process.env.ORDERS_TABLE || 'shebalance-orders';
const USERS_TABLE = process.env.USERS_TABLE || 'shebalance-users';
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const VALID_STATUSES = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected'];

exports.handler = async (event) => {
  console.log('Update order status request received');

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
    const { status, note } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return createResponse(400, {
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    // Get order
    const order = await getOrder(orderId);
    if (!order) {
      return createResponse(404, { success: false, message: 'Order not found' });
    }

    // Check authorization
    if (order.artisanId !== userId && order.buyerId !== userId && decoded.userType !== 'admin') {
      return createResponse(403, { success: false, message: 'Not authorized to update this order' });
    }

    // Update order status
    const updatedOrder = await updateOrderStatus(orderId, status, note, userId);

    // Update artisan stats if completed
    if (status === 'completed' && order.status !== 'completed') {
      await updateArtisanCompletedOrders(order.artisanId);
    }

    // Send notification
    if (SNS_TOPIC_ARN) {
      await sendStatusNotification(order, status);
    }

    return createResponse(200, {
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Update order status error:', error);
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

async function updateOrderStatus(orderId, status, note, updatedBy) {
  const now = new Date().toISOString();
  
  const params = {
    TableName: ORDERS_TABLE,
    Key: { orderId },
    UpdateExpression: 'SET #status = :status, updatedAt = :now, statusHistory = list_append(if_not_exists(statusHistory, :empty_list), :history)',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':status': status,
      ':now': now,
      ':empty_list': [],
      ':history': [{
        status,
        timestamp: now,
        note: note || null,
        updatedBy
      }]
    },
    ReturnValues: 'ALL_NEW'
  };

  const result = await docClient.send(new UpdateCommand(params));
  return result.Attributes;
}

async function updateArtisanCompletedOrders(artisanId) {
  try {
    const params = {
      TableName: USERS_TABLE,
      Key: { userId: artisanId },
      UpdateExpression: 'SET completedOrders = if_not_exists(completedOrders, :zero) + :one',
      ExpressionAttributeValues: {
        ':zero': 0,
        ':one': 1
      }
    };
    await docClient.send(new UpdateCommand(params));
  } catch (error) {
    console.error('Error updating artisan stats:', error);
  }
}

async function sendStatusNotification(order, newStatus) {
  try {
    const message = `Order "${order.title}" status updated to: ${newStatus}`;
    const params = {
      TopicArn: SNS_TOPIC_ARN,
      Message: message,
      Subject: 'Order Status Update - SHE-BALANCE',
      MessageAttributes: {
        orderId: { DataType: 'String', StringValue: order.orderId },
        status: { DataType: 'String', StringValue: newStatus }
      }
    };
    await snsClient.send(new PublishCommand(params));
  } catch (error) {
    console.error('Error sending notification:', error);
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
