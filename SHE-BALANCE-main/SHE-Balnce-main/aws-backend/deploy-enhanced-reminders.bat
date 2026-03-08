@echo off
REM Enhanced Order Reminder System Deployment Script
REM This script deploys the complete reminder workflow:
REM 1. WhatsApp reminders for orders without progress (3+ days)
REM 2. Voice call follow-up if no response within 24 hours

echo ========================================
echo SHE-BALANCE Enhanced Reminder System
echo ========================================
echo.

REM Set AWS region
set AWS_REGION=us-east-1
set ACCOUNT_ID=065538523474

echo Step 1: Creating DynamoDB Reminders Table...
echo.

aws dynamodb create-table ^
    --cli-input-json file://reminders-table-config.json ^
    --region %AWS_REGION%

if %ERRORLEVEL% NEQ 0 (
    echo Warning: Table might already exist. Continuing...
) else (
    echo Waiting for table to be active...
    aws dynamodb wait table-exists --table-name shebalance-reminders --region %AWS_REGION%
    echo Reminders table created successfully!
)

echo.
echo Step 2: Creating Lambda Execution Role...
echo.

REM Check if role exists
aws iam get-role --role-name shebalance-reminder-orchestrator-role >nul 2>&1

if %ERRORLEVEL% NEQ 0 (
    echo Creating new IAM role...
    
    REM Create trust policy
    echo { > trust-policy.json
    echo   "Version": "2012-10-17", >> trust-policy.json
    echo   "Statement": [ >> trust-policy.json
    echo     { >> trust-policy.json
    echo       "Effect": "Allow", >> trust-policy.json
    echo       "Principal": { >> trust-policy.json
    echo         "Service": "lambda.amazonaws.com" >> trust-policy.json
    echo       }, >> trust-policy.json
    echo       "Action": "sts:AssumeRole" >> trust-policy.json
    echo     } >> trust-policy.json
    echo   ] >> trust-policy.json
    echo } >> trust-policy.json
    
    aws iam create-role ^
        --role-name shebalance-reminder-orchestrator-role ^
        --assume-role-policy-document file://trust-policy.json
    
    REM Attach policies
    aws iam attach-role-policy ^
        --role-name shebalance-reminder-orchestrator-role ^
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    
    aws iam attach-role-policy ^
        --role-name shebalance-reminder-orchestrator-role ^
        --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
    
    aws iam attach-role-policy ^
        --role-name shebalance-reminder-orchestrator-role ^
        --policy-arn arn:aws:iam::aws:policy/AmazonSNSFullAccess
    
    aws iam attach-role-policy ^
        --role-name shebalance-reminder-orchestrator-role ^
        --policy-arn arn:aws:iam::aws:policy/AWSLambda_FullAccess
    
    aws iam attach-role-policy ^
        --role-name shebalance-reminder-orchestrator-role ^
        --policy-arn arn:aws:iam::aws:policy/CloudWatchEventsFullAccess
    
    echo Waiting for role to propagate...
    timeout /t 10 /nobreak >nul
    
    del trust-policy.json
) else (
    echo Role already exists. Skipping creation.
)

echo.
echo Step 3: Deploying Lambda Functions...
echo.

REM Deploy Order Reminder Orchestrator
echo Deploying Order Reminder Orchestrator...
if exist lambda_order_reminder_orchestrator.zip del lambda_order_reminder_orchestrator.zip
powershell -Command "Compress-Archive -Path lambda_order_reminder_orchestrator.py -DestinationPath lambda_order_reminder_orchestrator.zip -Force"

aws lambda create-function ^
    --function-name shebalance-order-reminder-orchestrator ^
    --runtime python3.11 ^
    --role arn:aws:iam::%ACCOUNT_ID%:role/shebalance-reminder-orchestrator-role ^
    --handler lambda_order_reminder_orchestrator.lambda_handler ^
    --zip-file fileb://lambda_order_reminder_orchestrator.zip ^
    --timeout 300 ^
    --memory-size 512 ^
    --region %AWS_REGION% 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo Function exists, updating code...
    aws lambda update-function-code ^
        --function-name shebalance-order-reminder-orchestrator ^
        --zip-file fileb://lambda_order_reminder_orchestrator.zip ^
        --region %AWS_REGION%
)

echo Orchestrator deployed successfully!

REM Update Voice Call Lambda
echo.
echo Updating Voice Call Lambda...
if exist lambda_generate_voice_call.zip del lambda_generate_voice_call.zip
powershell -Command "Compress-Archive -Path lambda_generate_voice_call.py -DestinationPath lambda_generate_voice_call.zip -Force"

aws lambda update-function-code ^
    --function-name shebalance-generate-voice-call ^
    --zip-file fileb://lambda_generate_voice_call.zip ^
    --region %AWS_REGION% 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo Creating Voice Call Lambda...
    aws lambda create-function ^
        --function-name shebalance-generate-voice-call ^
        --runtime python3.11 ^
        --role arn:aws:iam::%ACCOUNT_ID%:role/shebalance-reminder-orchestrator-role ^
        --handler lambda_generate_voice_call.lambda_handler ^
        --zip-file fileb://lambda_generate_voice_call.zip ^
        --timeout 300 ^
        --memory-size 512 ^
        --region %AWS_REGION%
)

echo Voice Call Lambda updated successfully!

echo.
echo Step 4: Creating EventBridge Rule...
echo.

REM Create EventBridge rule to run daily at 9 AM UTC
aws events put-rule ^
    --name shebalance-daily-order-reminder-check ^
    --schedule-expression "cron(0 9 * * ? *)" ^
    --state ENABLED ^
    --description "Daily check for orders needing reminders" ^
    --region %AWS_REGION%

REM Add Lambda permission for EventBridge
aws lambda add-permission ^
    --function-name shebalance-order-reminder-orchestrator ^
    --statement-id AllowEventBridgeInvoke ^
    --action lambda:InvokeFunction ^
    --principal events.amazonaws.com ^
    --source-arn arn:aws:events:%AWS_REGION%:%ACCOUNT_ID%:rule/shebalance-daily-order-reminder-check ^
    --region %AWS_REGION% 2>nul

REM Add Lambda as target
aws events put-targets ^
    --rule shebalance-daily-order-reminder-check ^
    --targets "Id"="1","Arn"="arn:aws:lambda:%AWS_REGION%:%ACCOUNT_ID%:function:shebalance-order-reminder-orchestrator" ^
    --region %AWS_REGION%

echo EventBridge rule created successfully!

echo.
echo Step 5: Testing the System...
echo.

echo Invoking orchestrator for test run...
aws lambda invoke ^
    --function-name shebalance-order-reminder-orchestrator ^
    --payload "{}" ^
    --region %AWS_REGION% ^
    response.json

echo.
echo Test response:
type response.json
echo.

REM Cleanup
del lambda_order_reminder_orchestrator.zip 2>nul
del lambda_generate_voice_call.zip 2>nul
del response.json 2>nul

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo System Overview:
echo - WhatsApp reminders sent for orders without progress (3+ days)
echo - Voice calls initiated if no response within 24 hours
echo - Daily check runs at 9 AM UTC
echo.
echo Lambda Functions:
echo 1. shebalance-order-reminder-orchestrator
echo 2. shebalance-generate-voice-call
echo.
echo DynamoDB Tables:
echo - shebalance-reminders (tracking reminder status)
echo.
echo EventBridge Rule:
echo - shebalance-daily-order-reminder-check (cron: 0 9 * * ? *)
echo.
echo Next Steps:
echo 1. Configure SNS for WhatsApp messaging
echo 2. Set up Twilio or Amazon Connect for voice calls
echo 3. Test with sample orders
echo.
echo ========================================

pause
