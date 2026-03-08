/**
 * Lambda Function: artisan-get-details
 * Purpose: Get detailed artisan profile with portfolio and reviews
 * Trigger: API Gateway GET /api/artisans/{artisanId}
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const USERS_TABLE = process.env.USERS_TABLE || 'shebalance-users';
const ORDERS_TABLE = process.env.ORDERS_TABLE || 'shebalance-orders';
const REVIEWS_TABLE = process.env.REVIEWS_TABLE || 'shebalance-reviews';

exports.handler = async (event) => {
  console.log('Get artisan details request received');

  try {
    const artisanId = event.pathParameters?.artisanId;

    if (!artisanId) {
      return createResponse(400, {
        success: false,
        message: 'Artisan ID is required'
      });
    }

    // Get artisan profile
    const artisan = await getArtisan(artisanId);

    if (!artisan) {
      return createResponse(404, {
        success: false,
        message: 'Artisan not found'
      });
    }

    if (artisan.userType !== 'artisan') {
      return createResponse(400, {
        success: false,
        message: 'User is not an artisan'
      });
    }

    // Get additional data
    const [completedOrders, reviews] = await Promise.all([
      getCompletedOrders(artisanId),
      getReviews(artisanId)
    ]);

    // Calculate statistics
    const stats = calculateStats(artisan, completedOrders, reviews);

    // Remove sensitive data
    const { password, failedAttempts, lastFailedAttempt, bankDetails, ...sanitizedArtisan } = artisan;

    // Return complete profile
    return createResponse(200, {
      success: true,
      artisan: {
        ...sanitizedArtisan,
        stats,
        recentWork: completedOrders.slice(0, 6),
        reviews: reviews.slice(0, 10)
      }
    });

  } catch (error) {
    console.error('Get artisan details error:', error);
    return createResponse(500, {
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

async function getArtisan(artisanId) {
  try {
    const params = {
      TableName: USERS_TABLE,
      Key: { userId: artisanId }
    };

    const result = await docClient.send(new GetCommand(params));
    return result.Item || null;

  } catch (error) {
    console.error('Error fetching artisan:', error);
    throw error;
  }
}

async function getCompletedOrders(artisanId) {
  try {
    const params = {
      TableName: ORDERS_TABLE,
      IndexName: 'artisanId-index',
      KeyConditionExpression: 'artisanId = :artisanId',
      FilterExpression: '#status = :completed',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':artisanId': artisanId,
        ':completed': 'completed'
      },
      ScanIndexForward: false,
      Limit: 20
    };

    const result = await docClient.send(new QueryCommand(params));
    return result.Items || [];

  } catch (error) {
    console.error('Error fetching completed orders:', error);
    return [];
  }
}

async function getReviews(artisanId) {
  try {
    const params = {
      TableName: REVIEWS_TABLE,
      IndexName: 'artisanId-index',
      KeyConditionExpression: 'artisanId = :artisanId',
      ExpressionAttributeValues: {
        ':artisanId': artisanId
      },
      ScanIndexForward: false,
      Limit: 20
    };

    const result = await docClient.send(new QueryCommand(params));
    return result.Items || [];

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

function calculateStats(artisan, completedOrders, reviews) {
  // Calculate average rating from reviews
  let averageRating = artisan.rating || 0;
  if (reviews.length > 0) {
    const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    averageRating = Math.round((totalRating / reviews.length) * 10) / 10;
  }

  // Calculate completion rate
  const totalOrders = artisan.totalOrders || 0;
  const completed = completedOrders.length;
  const completionRate = totalOrders > 0 ? Math.round((completed / totalOrders) * 100) : 0;

  // Calculate average order value
  let averageOrderValue = 0;
  if (completedOrders.length > 0) {
    const totalValue = completedOrders.reduce((sum, order) => sum + (order.price || 0), 0);
    averageOrderValue = Math.round(totalValue / completedOrders.length);
  }

  // Calculate response time (mock for now)
  const averageResponseTime = '< 2 hours';

  // Calculate on-time delivery rate (mock for now)
  const onTimeDeliveryRate = 95;

  return {
    totalOrders,
    completedOrders: completed,
    completionRate,
    averageRating,
    totalReviews: reviews.length,
    averageOrderValue,
    averageResponseTime,
    onTimeDeliveryRate,
    resilienceScore: artisan.resilienceScore || 0,
    labourBalance: artisan.labourBalance || 0
  };
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
