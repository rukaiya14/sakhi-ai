@echo off
REM AI Sakhi Lambda Functions - Quick Deployment Script (Windows)
REM This script automates the deployment of all 4 AI Sakhi Lambda functions

echo.
echo 🤖 AI Sakhi Lambda Deployment Script (Windows)
echo ===============================================
echo.

REM Check if AWS CLI is installed
where aws >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ AWS CLI is not installed. Please install it first.
    exit /b 1
)

echo ✅ AWS CLI found
echo.

REM Check AWS credentials
aws sts get-caller-identity >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ AWS credentials not configured. Run 'aws configure' first.
    exit /b 1
)

echo ✅ AWS credentials configured
echo.

REM Get AWS account ID and region
for /f "tokens=*" %%i in ('aws sts get-caller-identity --query Account --output text') do set AWS_ACCOUNT_ID=%%i
if not defined AWS_REGION set AWS_REGION=us-east-1

echo 📋 Deployment Configuration:
echo    AWS Account: %AWS_ACCOUNT_ID%
echo    AWS Region: %AWS_REGION%
echo.

REM Ask for confirmation
set /p CONFIRM="Continue with deployment? (y/n): "
if /i not "%CONFIRM%"=="y" (
    echo Deployment cancelled.
    exit /b 0
)

echo.
echo 🔧 Step 1: Installing Dependencies
echo ====================================
echo.

REM Install dependencies for each Lambda
for %%L in (ai-sakhi-chat ai-sakhi-context ai-sakhi-intent ai-sakhi-action) do (
    echo Installing dependencies for %%L...
    cd %%L
    call npm install --production
    cd ..
    echo ✅ %%L dependencies installed
)

echo.
echo 📦 Step 2: Creating Deployment Packages
echo ========================================
echo.

REM Create ZIP files (requires PowerShell)
for %%L in (ai-sakhi-chat ai-sakhi-context ai-sakhi-intent ai-sakhi-action) do (
    echo Creating ZIP for %%L...
    powershell -Command "Compress-Archive -Path %%L\* -DestinationPath %%L.zip -Force"
    echo ✅ %%L.zip created
)

echo.
echo 🔐 Step 3: Creating IAM Role
echo =============================
echo.

set ROLE_NAME=SheBalance-AI-Sakhi-Lambda-Role

REM Check if role exists
aws iam get-role --role-name %ROLE_NAME% >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ⚠️  Role %ROLE_NAME% already exists, skipping creation
) else (
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

    REM Create role
    aws iam create-role --role-name %ROLE_NAME% --assume-role-policy-document file://trust-policy.json --description "Execution role for AI Sakhi Lambda functions"
    echo ✅ IAM role created

    REM Attach basic execution policy
    aws iam attach-role-policy --role-name %ROLE_NAME% --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

    REM Create custom policy
    echo { > custom-policy.json
    echo   "Version": "2012-10-17", >> custom-policy.json
    echo   "Statement": [ >> custom-policy.json
    echo     { >> custom-policy.json
    echo       "Effect": "Allow", >> custom-policy.json
    echo       "Action": [ >> custom-policy.json
    echo         "bedrock:InvokeModel", >> custom-policy.json
    echo         "bedrock:InvokeModelWithResponseStream" >> custom-policy.json
    echo       ], >> custom-policy.json
    echo       "Resource": [ >> custom-policy.json
    echo         "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-haiku-*" >> custom-policy.json
    echo       ] >> custom-policy.json
    echo     }, >> custom-policy.json
    echo     { >> custom-policy.json
    echo       "Effect": "Allow", >> custom-policy.json
    echo       "Action": [ >> custom-policy.json
    echo         "dynamodb:GetItem", >> custom-policy.json
    echo         "dynamodb:PutItem", >> custom-policy.json
    echo         "dynamodb:UpdateItem", >> custom-policy.json
    echo         "dynamodb:Query", >> custom-policy.json
    echo         "dynamodb:Scan" >> custom-policy.json
    echo       ], >> custom-policy.json
    echo       "Resource": [ >> custom-policy.json
    echo         "arn:aws:dynamodb:*:*:table/shebalance-*" >> custom-policy.json
    echo       ] >> custom-policy.json
    echo     }, >> custom-policy.json
    echo     { >> custom-policy.json
    echo       "Effect": "Allow", >> custom-policy.json
    echo       "Action": ["sns:Publish"], >> custom-policy.json
    echo       "Resource": "*" >> custom-policy.json
    echo     }, >> custom-policy.json
    echo     { >> custom-policy.json
    echo       "Effect": "Allow", >> custom-policy.json
    echo       "Action": ["states:StartExecution"], >> custom-policy.json
    echo       "Resource": "*" >> custom-policy.json
    echo     } >> custom-policy.json
    echo   ] >> custom-policy.json
    echo } >> custom-policy.json

    aws iam put-role-policy --role-name %ROLE_NAME% --policy-name SheBalance-AI-Sakhi-Custom-Policy --policy-document file://custom-policy.json
    echo ✅ IAM policies attached

    REM Wait for role to propagate
    echo Waiting for IAM role to propagate...
    timeout /t 10 /nobreak >nul
)

for /f "tokens=*" %%i in ('aws iam get-role --role-name %ROLE_NAME% --query Role.Arn --output text') do set ROLE_ARN=%%i
echo Role ARN: %ROLE_ARN%

echo.
echo 🚀 Step 4: Deploying Lambda Functions
echo ======================================
echo.

REM Deploy ai-sakhi-chat
echo Deploying ai-sakhi-chat...
aws lambda get-function --function-name shebalance-ai-sakhi-chat >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Updating existing function...
    aws lambda update-function-code --function-name shebalance-ai-sakhi-chat --zip-file fileb://ai-sakhi-chat.zip
) else (
    aws lambda create-function --function-name shebalance-ai-sakhi-chat --runtime nodejs18.x --role %ROLE_ARN% --handler index.handler --zip-file fileb://ai-sakhi-chat.zip --timeout 60 --memory-size 1024 --environment Variables="{AWS_REGION=%AWS_REGION%,USERS_TABLE=shebalance-users,ARTISAN_PROFILES_TABLE=shebalance-artisan-profiles,ORDERS_TABLE=shebalance-orders,LABOUR_TABLE=shebalance-labour-tracking,AI_CONVERSATIONS_TABLE=shebalance-ai-conversations}"
)
echo ✅ ai-sakhi-chat deployed

REM Deploy ai-sakhi-context
echo Deploying ai-sakhi-context...
aws lambda get-function --function-name shebalance-ai-sakhi-context >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Updating existing function...
    aws lambda update-function-code --function-name shebalance-ai-sakhi-context --zip-file fileb://ai-sakhi-context.zip
) else (
    aws lambda create-function --function-name shebalance-ai-sakhi-context --runtime nodejs18.x --role %ROLE_ARN% --handler index.handler --zip-file fileb://ai-sakhi-context.zip --timeout 30 --memory-size 512 --environment Variables="{AWS_REGION=%AWS_REGION%,USERS_TABLE=shebalance-users,ARTISAN_PROFILES_TABLE=shebalance-artisan-profiles,ORDERS_TABLE=shebalance-orders,LABOUR_TABLE=shebalance-labour-tracking,SKILLSCAN_TABLE=shebalance-skillscan-results,AI_CONVERSATIONS_TABLE=shebalance-ai-conversations}"
)
echo ✅ ai-sakhi-context deployed

REM Deploy ai-sakhi-intent
echo Deploying ai-sakhi-intent...
aws lambda get-function --function-name shebalance-ai-sakhi-intent >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Updating existing function...
    aws lambda update-function-code --function-name shebalance-ai-sakhi-intent --zip-file fileb://ai-sakhi-intent.zip
) else (
    aws lambda create-function --function-name shebalance-ai-sakhi-intent --runtime nodejs18.x --role %ROLE_ARN% --handler index.handler --zip-file fileb://ai-sakhi-intent.zip --timeout 15 --memory-size 256
)
echo ✅ ai-sakhi-intent deployed

REM Deploy ai-sakhi-action
echo Deploying ai-sakhi-action...
aws lambda get-function --function-name shebalance-ai-sakhi-action >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Updating existing function...
    aws lambda update-function-code --function-name shebalance-ai-sakhi-action --zip-file fileb://ai-sakhi-action.zip
) else (
    aws lambda create-function --function-name shebalance-ai-sakhi-action --runtime nodejs18.x --role %ROLE_ARN% --handler index.handler --zip-file fileb://ai-sakhi-action.zip --timeout 30 --memory-size 512 --environment Variables="{AWS_REGION=%AWS_REGION%,SUPPORT_REQUESTS_TABLE=shebalance-support-requests,PAYMENT_REQUESTS_TABLE=shebalance-payment-requests,NOTIFICATIONS_TABLE=shebalance-notifications}"
)
echo ✅ ai-sakhi-action deployed

echo.
echo 🎉 Deployment Complete!
echo =======================
echo.
echo Next Steps:
echo 1. Enable Claude 3 Haiku in Amazon Bedrock console
echo 2. Create API Gateway integration (see deployment guide)
echo 3. Update frontend with API Gateway URL
echo 4. Test the deployment
echo.
echo Lambda Functions:
echo   - shebalance-ai-sakhi-chat
echo   - shebalance-ai-sakhi-context
echo   - shebalance-ai-sakhi-intent
echo   - shebalance-ai-sakhi-action
echo.
echo ✅ All Lambda functions deployed successfully!
echo.
pause
