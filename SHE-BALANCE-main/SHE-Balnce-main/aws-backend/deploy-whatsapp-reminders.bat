@echo off
REM Deploy WhatsApp Reminder System for SHE-BALANCE
REM This script sets up automated WhatsApp reminders via AWS SNS

echo ==========================================
echo   SHE-BALANCE WhatsApp Reminder Setup
echo ==========================================
echo.

REM Configuration
set REGION=us-east-1
set FUNCTION_NAME=shebalance-check-order-progress
set ROLE_NAME=shebalance-lambda-reminder-role
set RULE_NAME=shebalance-daily-order-check

REM Get AWS Account ID
echo Getting AWS Account ID...
for /f %%i in ('aws sts get-caller-identity --query Account --output text') do set ACCOUNT_ID=%%i
echo AWS Account ID: %ACCOUNT_ID%
echo.

REM Step 1: Create IAM Role
echo [1/6] Creating IAM role for Lambda...

REM Create trust policy file
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
aws iam create-role --role-name %ROLE_NAME% --assume-role-policy-document file://trust-policy.json --description "Role for SHE-BALANCE order reminder Lambda" 2>nul
if errorlevel 1 echo Role already exists

REM Attach policies
echo Attaching policies to role...
aws iam attach-role-policy --role-name %ROLE_NAME% --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
aws iam attach-role-policy --role-name %ROLE_NAME% --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
aws iam attach-role-policy --role-name %ROLE_NAME% --policy-arn arn:aws:iam::aws:policy/AmazonSNSFullAccess

echo Done: IAM role created
echo.

REM Wait for role propagation
echo Waiting for IAM role to propagate...
timeout /t 10 /nobreak >nul

REM Step 2: Package Lambda function
echo [2/6] Packaging Lambda function...
powershell -Command "Compress-Archive -Path lambda_check_order_progress.py -DestinationPath lambda_check_order_progress.zip -Force"
echo Done: Lambda function packaged
echo.

REM Step 3: Create Lambda function
echo [3/6] Creating Lambda function...
set ROLE_ARN=arn:aws:iam::%ACCOUNT_ID%:role/%ROLE_NAME%

aws lambda create-function --function-name %FUNCTION_NAME% --runtime python3.9 --role %ROLE_ARN% --handler lambda_check_order_progress.lambda_handler --zip-file fileb://lambda_check_order_progress.zip --timeout 300 --memory-size 512 --region %REGION% --description "Checks order progress and sends WhatsApp reminders" 2>nul
if errorlevel 1 (
    echo Function exists, updating...
    aws lambda update-function-code --function-name %FUNCTION_NAME% --zip-file fileb://lambda_check_order_progress.zip --region %REGION%
)

echo Done: Lambda function created/updated
echo.

REM Step 4: Create EventBridge rule
echo [4/6] Creating EventBridge rule...
aws events put-rule --name %RULE_NAME% --schedule-expression "cron(0 9 * * ? *)" --state ENABLED --description "Triggers daily order progress check" --region %REGION%
echo Done: EventBridge rule created
echo.

REM Step 5: Add Lambda permission
echo [5/6] Adding Lambda permission for EventBridge...
aws lambda add-permission --function-name %FUNCTION_NAME% --statement-id AllowEventBridgeInvoke --action lambda:InvokeFunction --principal events.amazonaws.com --source-arn "arn:aws:events:%REGION%:%ACCOUNT_ID%:rule/%RULE_NAME%" --region %REGION% 2>nul
if errorlevel 1 echo Permission already exists
echo Done: Lambda permission added
echo.

REM Step 6: Add Lambda as target
echo [6/6] Connecting EventBridge rule to Lambda...
set LAMBDA_ARN=arn:aws:lambda:%REGION%:%ACCOUNT_ID%:function:%FUNCTION_NAME%
aws events put-targets --rule %RULE_NAME% --targets "Id=1,Arn=%LAMBDA_ARN%" --region %REGION%
echo Done: EventBridge target configured
echo.

REM Cleanup
del trust-policy.json 2>nul
del lambda_check_order_progress.zip 2>nul

echo ==========================================
echo   Done: WhatsApp Reminder System Deployed!
echo ==========================================
echo.
echo Configuration:
echo   Lambda Function: %FUNCTION_NAME%
echo   EventBridge Rule: %RULE_NAME%
echo   Schedule: Daily at 9:00 AM UTC
echo   Region: %REGION%
echo.
echo Next Steps:
echo   1. Configure SNS for WhatsApp
echo   2. Test the Lambda function manually
echo   3. Monitor CloudWatch logs
echo.
echo Test command:
echo   aws lambda invoke --function-name %FUNCTION_NAME% output.json
echo.
pause
