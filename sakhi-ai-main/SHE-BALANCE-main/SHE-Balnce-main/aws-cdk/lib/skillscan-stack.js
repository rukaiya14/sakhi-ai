const cdk = require('aws-cdk-lib');
const lambda = require('aws-cdk-lib/aws-lambda');
const dynamodb = require('aws-cdk-lib/aws-dynamodb');
const s3 = require('aws-cdk-lib/aws-s3');
const apigateway = require('aws-cdk-lib/aws-apigateway');
const iam = require('aws-cdk-lib/aws-iam');
const path = require('path');

class SkillScanStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // DynamoDB Table for SkillScan Results
    const skillscanTable = new dynamodb.Table(this, 'SkillScanTable', {
      tableName: 'SheBalance-SkillScan',
      partitionKey: { name: 'artisan_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'analysis_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Add GSI for timestamp queries
    skillscanTable.addGlobalSecondaryIndex({
      indexName: 'TimestampIndex',
      partitionKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // S3 Bucket for Images
    const imageBucket = new s3.Bucket(this, 'SkillScanImageBucket', {
      bucketName: `shebalance-skillscan-images-${this.account}`,
      cors: [{
        allowedHeaders: ['*'],
        allowedMethods: [
          s3.HttpMethods.GET,
          s3.HttpMethods.PUT,
          s3.HttpMethods.POST,
          s3.HttpMethods.DELETE,
        ],
        allowedOrigins: ['*'],
        maxAge: 3000,
      }],
      lifecycleRules: [{
        expiration: cdk.Duration.days(365),
      }],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // IAM Role for Lambda
    const lambdaRole = new iam.Role(this, 'SkillScanLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Add Bedrock permissions
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'bedrock:InvokeModel',
        'bedrock:InvokeModelWithResponseStream',
      ],
      resources: ['arn:aws:bedrock:*::foundation-model/meta.llama3-*'],
    }));

    // Add DynamoDB permissions
    skillscanTable.grantReadWriteData(lambdaRole);

    // Add S3 permissions
    imageBucket.grantReadWrite(lambdaRole);

    // Lambda Function for SkillScan Analysis
    const analysisFunction = new lambda.Function(this, 'SkillScanAnalysisFunction', {
      functionName: 'SheBalance-SkillScan-Analysis',
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'lambda_skillscan_analysis.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../aws-backend')),
      timeout: cdk.Duration.seconds(300),
      memorySize: 1024,
      role: lambdaRole,
      environment: {
        SKILLSCAN_TABLE: skillscanTable.tableName,
        S3_BUCKET: imageBucket.bucketName,
      },
    });

    // Lambda Function to Get SkillScans
    const getSkillScansFunction = new lambda.Function(this, 'GetSkillScansFunction', {
      functionName: 'SheBalance-Get-SkillScans',
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'lambda_get_artisan_skillscans.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../aws-backend')),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      role: lambdaRole,
      environment: {
        SKILLSCAN_TABLE: skillscanTable.tableName,
      },
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'SkillScanAPI', {
      restApiName: 'SheBalance-SkillScan-API',
      description: 'API for SkillScan AI functionality',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // API Resources and Methods
    const analyzeResource = api.root.addResource('analyze');
    analyzeResource.addMethod('POST', new apigateway.LambdaIntegration(analysisFunction));

    const skillscansResource = api.root.addResource('skillscans');
    skillscansResource.addMethod('GET', new apigateway.LambdaIntegration(getSkillScansFunction));

    // Outputs
    new cdk.CfnOutput(this, 'APIEndpoint', {
      value: api.url,
      description: 'API Gateway endpoint URL',
      exportName: 'SkillScanAPIEndpoint',
    });

    new cdk.CfnOutput(this, 'AnalyzeEndpoint', {
      value: `${api.url}analyze`,
      description: 'SkillScan Analysis endpoint',
    });

    new cdk.CfnOutput(this, 'GetSkillScansEndpoint', {
      value: `${api.url}skillscans`,
      description: 'Get SkillScans endpoint',
    });

    new cdk.CfnOutput(this, 'DynamoDBTableName', {
      value: skillscanTable.tableName,
      description: 'DynamoDB table name',
    });

    new cdk.CfnOutput(this, 'S3BucketName', {
      value: imageBucket.bucketName,
      description: 'S3 bucket name',
    });
  }
}

module.exports = { SkillScanStack };
