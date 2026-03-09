/**
 * SHE-BALANCE Main AWS Infrastructure Stack
 * Complete backend with Lambda, API Gateway, DynamoDB, Bedrock, Step Functions
 * 
 * This stack creates:
 * - API Gateway with Lambda integration
 * - DynamoDB tables for all entities
 * - Lambda functions for auth, orders, AI Sakhi, payments
 * - Step Functions for reminder orchestration
 * - S3 buckets for file storage
 * - CloudWatch monitoring and alarms
 */

const cdk = require('aws-cdk-lib');
const lambda = require('aws-cdk-lib/aws-lambda');
const dynamodb = require('aws-cdk-lib/aws-dynamodb');
const s3 = require('aws-cdk-lib/aws-s3');
const apigateway = require('aws-cdk-lib/aws-apigateway');
const iam = require('aws-cdk-lib/aws-iam');
const events = require('aws-cdk-lib/aws-events');
const targets = require('aws-cdk-lib/aws-events-targets');
const stepfunctions = require('aws-cdk-lib/aws-stepfunctions');
const tasks = require('aws-cdk-lib/aws-stepfunctions-tasks');
const logs = require('aws-cdk-lib/aws-logs');
const path = require('path');

class SheBalanceMainStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // ==================== DYNAMODB TABLES ====================
    
    const tables = this.createDynamoDBTables();
    
    // ==================== S3 BUCKETS ====================
    
    const buckets = this.createS3Buckets();
    
    // ==================== IAM ROLES ====================
    
    const lambdaRole = this.createLambdaExecutionRole(tables, buckets);
    
    // ==================== LAMBDA LAYERS ====================
    
    const commonLayer = this.createCommonLayer();
    
    // ==================== LAMBDA FUNCTIONS ====================
    
    const lambdaFunctions = this.createLambdaFunctions(lambdaRole, commonLayer, tables, buckets);
    
    // ==================== API GATEWAY ====================
    
    const api = this.createAPIGateway(lambdaFunctions);
    
    // ==================== STEP FUNCTIONS ====================
    
    const reminderStateMachine = this.createReminderStateMachine(lambdaFunctions);
    
    // ==================== EVENTBRIDGE RULES ====================
    
    this.createEventBridgeRules(reminderStateMachine, lambdaFunctions);
    
    // ==================== CLOUDWATCH ALARMS ====================
    
    this.createCloudWatchAlarms(lambdaFunctions, api);
    
    // ==================== OUTPUTS ====================
    
    this.createOutputs(api, tables, buckets);
  }

  createDynamoDBTables() {
    const tablePrefix = 'shebalance-';
    const tables = {};

    // Users Table
    tables.users = new dynamodb.Table(this, 'UsersTable', {
      tableName: `${tablePrefix}users`,
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecovery: true,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });
    tables.users.addGlobalSecondaryIndex({
      indexName: 'EmailIndex',
      partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Artisan Profiles Table
    tables.artisanProfiles = new dynamodb.Table(this, 'ArtisanProfilesTable', {
      tableName: `${tablePrefix}artisan-profiles`,
      partitionKey: { name: 'artisanId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecovery: true,
    });
    tables.artisanProfiles.addGlobalSecondaryIndex({
      indexName: 'UserIdIndex',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Buyer Profiles Table
    tables.buyerProfiles = new dynamodb.Table(this, 'BuyerProfilesTable', {
      tableName: `${tablePrefix}buyer-profiles`,
      partitionKey: { name: 'buyerId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    tables.buyerProfiles.addGlobalSecondaryIndex({
      indexName: 'UserIdIndex',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Corporate Profiles Table
    tables.corporateProfiles = new dynamodb.Table(this, 'CorporateProfilesTable', {
      tableName: `${tablePrefix}corporate-profiles`,
      partitionKey: { name: 'corporateId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    tables.corporateProfiles.addGlobalSecondaryIndex({
      indexName: 'UserIdIndex',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Orders Table
    tables.orders = new dynamodb.Table(this, 'OrdersTable', {
      tableName: `${tablePrefix}orders`,
      partitionKey: { name: 'orderId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecovery: true,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });
    tables.orders.addGlobalSecondaryIndex({
      indexName: 'ArtisanIdIndex',
      partitionKey: { name: 'artisanId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });
    tables.orders.addGlobalSecondaryIndex({
      indexName: 'BuyerIdIndex',
      partitionKey: { name: 'buyerId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // SkillScan Results Table
    tables.skillscanResults = new dynamodb.Table(this, 'SkillScanResultsTable', {
      tableName: `${tablePrefix}skillscan-results`,
      partitionKey: { name: 'scanId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    tables.skillscanResults.addGlobalSecondaryIndex({
      indexName: 'ArtisanIdIndex',
      partitionKey: { name: 'artisanId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'scanDate', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Labour Tracking Table
    tables.labourTracking = new dynamodb.Table(this, 'LabourTrackingTable', {
      tableName: `${tablePrefix}labour-tracking`,
      partitionKey: { name: 'labourId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    tables.labourTracking.addGlobalSecondaryIndex({
      indexName: 'ArtisanIdIndex',
      partitionKey: { name: 'artisanId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'date', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // AI Conversations Table
    tables.aiConversations = new dynamodb.Table(this, 'AIConversationsTable', {
      tableName: `${tablePrefix}ai-conversations`,
      partitionKey: { name: 'conversationId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      timeToLiveAttribute: 'ttl',
    });
    tables.aiConversations.addGlobalSecondaryIndex({
      indexName: 'UserIdIndex',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Notifications Table
    tables.notifications = new dynamodb.Table(this, 'NotificationsTable', {
      tableName: `${tablePrefix}notifications`,
      partitionKey: { name: 'notificationId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      timeToLiveAttribute: 'ttl',
    });
    tables.notifications.addGlobalSecondaryIndex({
      indexName: 'UserIdIndex',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Reminders Table
    tables.reminders = new dynamodb.Table(this, 'RemindersTable', {
      tableName: `${tablePrefix}reminders`,
      partitionKey: { name: 'orderId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    return tables;
  }

  createS3Buckets() {
    const buckets = {};

    // Portfolio Images Bucket
    buckets.portfolioImages = new s3.Bucket(this, 'PortfolioImagesBucket', {
      bucketName: `shebalance-portfolio-${this.account}`,
      cors: [{
        allowedHeaders: ['*'],
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
        allowedOrigins: ['*'],
        maxAge: 3000,
      }],
      lifecycleRules: [{
        expiration: cdk.Duration.days(365),
      }],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Voice Messages Bucket
    buckets.voiceMessages = new s3.Bucket(this, 'VoiceMessagesBucket', {
      bucketName: `shebalance-voice-${this.account}`,
      lifecycleRules: [{
        expiration: cdk.Duration.days(30),
      }],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    return buckets;
  }

  createLambdaExecutionRole(tables, buckets) {
    const role = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // DynamoDB permissions
    Object.values(tables).forEach(table => {
      table.grantReadWriteData(role);
    });

    // S3 permissions
    Object.values(buckets).forEach(bucket => {
      bucket.grantReadWrite(role);
    });

    // Bedrock permissions
    role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'bedrock:InvokeModel',
        'bedrock:InvokeModelWithResponseStream',
      ],
      resources: [
        'arn:aws:bedrock:*::foundation-model/meta.llama3-*',
      ],
    }));

    // Polly permissions
    role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['polly:SynthesizeSpeech'],
      resources: ['*'],
    }));

    // SNS permissions
    role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['sns:Publish'],
      resources: ['*'],
    }));

    // Lambda invoke permissions
    role.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['lambda:InvokeFunction'],
      resources: ['*'],
    }));

    return role;
  }

  createCommonLayer() {
    return new lambda.LayerVersion(this, 'CommonLayer', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../../aws-backend/layers/common')),
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_11],
      description: 'Common utilities and dependencies',
    });
  }

  createLambdaFunctions(role, layer, tables, buckets) {
    const functions = {};
    const commonEnv = {
      USERS_TABLE: tables.users.tableName,
      ARTISAN_PROFILES_TABLE: tables.artisanProfiles.tableName,
      BUYER_PROFILES_TABLE: tables.buyerProfiles.tableName,
      ORDERS_TABLE: tables.orders.tableName,
      SKILLSCAN_TABLE: tables.skillscanResults.tableName,
      LABOUR_TABLE: tables.labourTracking.tableName,
      AI_CONVERSATIONS_TABLE: tables.aiConversations.tableName,
      NOTIFICATIONS_TABLE: tables.notifications.tableName,
      REMINDERS_TABLE: tables.reminders.tableName,
      PORTFOLIO_BUCKET: buckets.portfolioImages.bucketName,
      VOICE_BUCKET: buckets.voiceMessages.bucketName,
    };

    // Auth Functions
    functions.login = new lambda.Function(this, 'LoginFunction', {
      functionName: 'shebalance-auth-login',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../aws-lambda/auth-login')),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      role: role,
      environment: commonEnv,
    });

    functions.register = new lambda.Function(this, 'RegisterFunction', {
      functionName: 'shebalance-auth-register',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../aws-lambda/auth-register')),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      role: role,
      environment: commonEnv,
    });

    // AI Sakhi Function
    functions.aiSakhi = new lambda.Function(this, 'AISakhiFunction', {
      functionName: 'shebalance-ai-sakhi',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../aws-lambda/ai-sakhi')),
      timeout: cdk.Duration.seconds(60),
      memorySize: 1024,
      role: role,
      environment: commonEnv,
    });

    // Orders Functions
    functions.getOrders = new lambda.Function(this, 'GetOrdersFunction', {
      functionName: 'shebalance-get-orders',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../aws-lambda/orders-get')),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      role: role,
      environment: commonEnv,
    });

    functions.createOrder = new lambda.Function(this, 'CreateOrderFunction', {
      functionName: 'shebalance-create-order',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../aws-lambda/orders-create')),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      role: role,
      environment: commonEnv,
    });

    functions.updateOrderProgress = new lambda.Function(this, 'UpdateOrderProgressFunction', {
      functionName: 'shebalance-update-order-progress',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../aws-lambda/orders-update-progress')),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      role: role,
      environment: commonEnv,
    });

    // Reminder System Functions (Python)
    functions.reminderOrchestrator = new lambda.Function(this, 'ReminderOrchestratorFunction', {
      functionName: 'shebalance-reminder-orchestrator',
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'lambda_order_reminder_orchestrator.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../aws-backend')),
      timeout: cdk.Duration.seconds(300),
      memorySize: 512,
      role: role,
      environment: commonEnv,
    });

    functions.sendWhatsApp = new lambda.Function(this, 'SendWhatsAppFunction', {
      functionName: 'shebalance-send-whatsapp',
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'lambda_send_whatsapp_message.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../aws-backend')),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      role: role,
      environment: commonEnv,
    });

    functions.generateVoiceCall = new lambda.Function(this, 'GenerateVoiceCallFunction', {
      functionName: 'shebalance-generate-voice-call',
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'lambda_generate_voice_call.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../aws-backend')),
      timeout: cdk.Duration.seconds(60),
      memorySize: 512,
      role: role,
      environment: commonEnv,
    });

    // User Profile Functions
    functions.getUserProfile = new lambda.Function(this, 'GetUserProfileFunction', {
      functionName: 'shebalance-get-user-profile',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../aws-lambda/user-get-profile')),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      role: role,
      environment: commonEnv,
    });

    functions.updateUserProfile = new lambda.Function(this, 'UpdateUserProfileFunction', {
      functionName: 'shebalance-update-user-profile',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../aws-lambda/user-update-profile')),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      role: role,
      environment: commonEnv,
    });

    return functions;
  }

  createAPIGateway(functions) {
    const api = new apigateway.RestApi(this, 'SheBalanceAPI', {
      restApiName: 'SheBalance-Main-API',
      description: 'SheBalance Platform API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization', 'X-Amz-Date', 'X-Api-Key', 'X-Amz-Security-Token'],
      },
      deployOptions: {
        stageName: 'prod',
        throttlingRateLimit: 1000,
        throttlingBurstLimit: 2000,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        metricsEnabled: true,
      },
    });

    // Auth Routes
    const auth = api.root.addResource('auth');
    auth.addResource('login').addMethod('POST', new apigateway.LambdaIntegration(functions.login));
    auth.addResource('register').addMethod('POST', new apigateway.LambdaIntegration(functions.register));

    // AI Sakhi Routes
    const aiSakhi = api.root.addResource('ai-sakhi');
    aiSakhi.addResource('chat').addMethod('POST', new apigateway.LambdaIntegration(functions.aiSakhi));

    // Orders Routes
    const orders = api.root.addResource('orders');
    orders.addMethod('GET', new apigateway.LambdaIntegration(functions.getOrders));
    orders.addMethod('POST', new apigateway.LambdaIntegration(functions.createOrder));
    orders.addResource('{orderId}')
      .addResource('progress')
      .addMethod('PUT', new apigateway.LambdaIntegration(functions.updateOrderProgress));

    // User Routes
    const users = api.root.addResource('users');
    const profile = users.addResource('profile');
    profile.addMethod('GET', new apigateway.LambdaIntegration(functions.getUserProfile));
    profile.addMethod('PUT', new apigateway.LambdaIntegration(functions.updateUserProfile));

    return api;
  }

  createReminderStateMachine(functions) {
    // Define Step Functions workflow
    const scanOrders = new tasks.LambdaInvoke(this, 'ScanOrders', {
      lambdaFunction: functions.reminderOrchestrator,
      outputPath: '$.Payload',
    });

    const sendWhatsApp = new tasks.LambdaInvoke(this, 'SendWhatsApp', {
      lambdaFunction: functions.sendWhatsApp,
      outputPath: '$.Payload',
    });

    const wait24Hours = new stepfunctions.Wait(this, 'Wait24Hours', {
      time: stepfunctions.WaitTime.duration(cdk.Duration.hours(24)),
    });

    const generateVoiceCall = new tasks.LambdaInvoke(this, 'GenerateVoiceCall', {
      lambdaFunction: functions.generateVoiceCall,
      outputPath: '$.Payload',
    });

    const definition = scanOrders
      .next(sendWhatsApp)
      .next(wait24Hours)
      .next(generateVoiceCall);

    const stateMachine = new stepfunctions.StateMachine(this, 'ReminderStateMachine', {
      stateMachineName: 'SheBalance-Reminder-Workflow',
      definition,
      timeout: cdk.Duration.hours(48),
      logs: {
        destination: new logs.LogGroup(this, 'ReminderStateMachineLogs', {
          retention: logs.RetentionDays.ONE_WEEK,
        }),
        level: stepfunctions.LogLevel.ALL,
      },
    });

    return stateMachine;
  }

  createEventBridgeRules(stateMachine, functions) {
    // Daily reminder check at 9 AM UTC
    const dailyRule = new events.Rule(this, 'DailyReminderRule', {
      schedule: events.Schedule.cron({ hour: '9', minute: '0' }),
      description: 'Trigger daily order reminder check',
    });
    dailyRule.addTarget(new targets.SfnStateMachine(stateMachine));

    // Hourly health check
    const healthCheckRule = new events.Rule(this, 'HealthCheckRule', {
      schedule: events.Schedule.rate(cdk.Duration.hours(1)),
      description: 'Hourly system health check',
    });
    healthCheckRule.addTarget(new targets.LambdaFunction(functions.reminderOrchestrator));
  }

  createCloudWatchAlarms(functions, api) {
    // Lambda error alarms
    Object.entries(functions).forEach(([name, func]) => {
      func.metricErrors().createAlarm(this, `${name}ErrorAlarm`, {
        threshold: 5,
        evaluationPeriods: 1,
        alarmDescription: `Alarm when ${name} function has errors`,
      });
    });

    // API Gateway 5xx errors
    api.metricServerError().createAlarm(this, 'APIServerErrorAlarm', {
      threshold: 10,
      evaluationPeriods: 1,
      alarmDescription: 'Alarm when API has server errors',
    });
  }

  createOutputs(api, tables, buckets) {
    new cdk.CfnOutput(this, 'APIEndpoint', {
      value: api.url,
      description: 'API Gateway endpoint URL',
      exportName: 'SheBalanceAPIEndpoint',
    });

    new cdk.CfnOutput(this, 'UsersTableName', {
      value: tables.users.tableName,
      description: 'Users DynamoDB table name',
    });

    new cdk.CfnOutput(this, 'OrdersTableName', {
      value: tables.orders.tableName,
      description: 'Orders DynamoDB table name',
    });

    new cdk.CfnOutput(this, 'PortfolioBucketName', {
      value: buckets.portfolioImages.bucketName,
      description: 'Portfolio images S3 bucket',
    });
  }
}

module.exports = { SheBalanceMainStack };
