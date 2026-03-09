/**
 * Lambda Function: order-list
 * Purpose: List orders for user (buyer/artisan/corporate)
 * Trigger: API Gateway GET /api/orders
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const jwt = require('jsonwebtoken');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const ORDERS_TABLE = process.env.ORDERS_TABLE || 'shebalance-orders';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

exports.handler = async (event) => {
  console.log('List orders request received');

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
    const userType = decoded.userType;

    // Get query parameters
    const queryParams = event.queryStringParameters || {};
    const status = queryParams.status;
    const limit = parseInt(queryParams.limit) || 20;

    // Fetch orders based on user type
    let orders = [];
    
    if (userType === 'artisan') {
      orders = await getOrdersByArtisan(userId, status, limit);
    } else if (userType === 'buyer') {
      orders = await getOrdersByBuyer(userId, status, limit);
    } else if (userType === 'corporate') {
      orders = await getOrdersByCorporate(userId, status, limit);
    } else if (userType === 'admin') {
      orders = await getAllOrders(status, limit);
    }

    return createResponse(200, {
      success: true,
      orders,
      count: orders.length
    });

  } catch (error) {
    console.error('List orders error:', error);
    return createResponse(500, {
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

async function getOrdersByArtisan(artisanId, status, limit) {
  const params = {
    TableName: ORDERS_TABLE,
    IndexName: 'artisanId-index',
    KeyConditionExpression: 'artisanId = :artisanId',
    ExpressionAttributeValues: { ':artisanId': artisanId },
    ScanIndexForward: false,
    Limit: limit
  };

  if (status) {
    params.FilterExpression = '#status = :status';
    params.ExpressionAttributeNames = { '#status': 'status' };
    params.ExpressionAttributeValues[':status'] = status;
  }

  const result = await docClient.send(new QueryCommand(params));
  return result.Items || [];
}

async function getOrdersByBuyer(buyerId, status, limit) {
  const params = {
    TableName: ORDERS_TABLE,
    IndexName: 'buyerId-index',
    KeyConditionExpression: 'buyerId = :buyerId',
    ExpressionAttributeValues: { ':buyerId': buyerId },
    ScanIndexForward: false,
    Limit: limit
  };

  if (status) {
    params.FilterExpression = '#status = :status';
    params.ExpressionAttributeNames = { '#status': 'status' };
    params.ExpressionAttributeValues[':status'] = status;
  }

  const result = await docClient.send(new QueryCommand(params));
  return result.Items || [];
}

async function getOrdersByCorporate(corporateId, status, limit) {
  const params = {
    TableName: ORDERS_TABLE,
    IndexName: 'corporateId-index',
    KeyConditionExpression: 'corporateId = :corporateId',
    ExpressionAttributeValues: { ':corporateId': corporateId },
    ScanIndexForward: false,
    Limit: limit
  };

  if (status) {
    params.FilterExpression = '#status = :status';
    params.ExpressionAttributeNames = { '#status': 'status' };
    params.ExpressionAttributeValues[':status'] = status;
  }

  const result = await docClient.send(new QueryCommand(params));
  return result.Items || [];
}

async function getAllOrders(status, limit) {
  const params = {
    TableName: ORDERS_TABLE,
    Limit: limit
  };

  if (status) {
    params.FilterExpression = '#status = :status';
    params.ExpressionAttributeNames = { '#status': 'status' };
    params.ExpressionAttributeValues = { ':status': status };
  }

  const result = await docClient.send(new ScanCommand(params));
  return result.Items || [];
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
      'Access-Control-Allow-Methods': 'GET,OPTIONS'
    },
    body: JSON.stringify(body)
  };
}
