@echo off
echo ========================================
echo Deploying Voice Command Lambda Function
echo ========================================
echo.

REM Set variables
set FUNCTION_NAME=shebalance-voice-command
set REGION=us-east-1
set ROLE_ARN=arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role

echo Step 1: Creating deployment package...
if exist lambda_voice_command.zip del lambda_voice_command.zip
powershell -Command "Compress-Archive -Path lambda_voice_command.py -DestinationPath lambda_voice_command.zip -Force"
echo ✅ Package created

echo.
echo Step 2: Creating/Updating Lambda function...
aws lambda get-function --function-name %FUNCTION_NAME% --region %REGION% >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo Function exists, updating code...
    aws lambda update-function-code ^
        --function-name %FUNCTION_NAME% ^
        --zip-file fileb://lambda_voice_command.zip ^
        --region %REGION%
    echo ✅ Function code updated
) else (
    echo Function doesn't exist, creating...
    aws lambda create-function ^
        --function-name %FUNCTION_NAME% ^
        --runtime python3.11 ^
        --role %ROLE_ARN% ^
        --handler lambda_voice_command.lambda_handler ^
        --zip-file fileb://lambda_voice_command.zip ^
        --timeout 300 ^
        --memory-size 512 ^
        --region %REGION% ^
        --environment Variables={S3_BUCKET=shebalance-voice-commands}
    echo ✅ Function created
)

echo.
echo Step 3: Updating function configuration...
aws lambda update-function-configuration ^
    --function-name %FUNCTION_NAME% ^
    --timeout 300 ^
    --memory-size 512 ^
    --region %REGION% ^
    --environment Variables={S3_BUCKET=shebalance-voice-commands}
echo ✅ Configuration updated

echo.
echo Step 4: Creating S3 bucket for voice commands...
aws s3 mb s3://shebalance-voice-commands --region %REGION% 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ S3 bucket created
) else (
    echo ℹ️  S3 bucket already exists
)

echo.
echo Step 5: Setting up API Gateway (if needed)...
echo You can create an API Gateway endpoint manually or use the AWS Console
echo.

echo ========================================
echo ✅ Deployment Complete!
echo ========================================
echo.
echo Lambda Function: %FUNCTION_NAME%
echo Region: %REGION%
echo.
echo Next Steps:
echo 1. Update the ROLE_ARN in this script with your IAM role
echo 2. Create an API Gateway endpoint for this Lambda
echo 3. Update the apiEndpoint in voice-command-aws.js
echo 4. Test the voice command feature
echo.
pause
