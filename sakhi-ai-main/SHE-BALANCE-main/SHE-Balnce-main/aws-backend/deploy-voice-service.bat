@echo off
echo ========================================
echo Deploying Voice Service Lambda
echo ========================================
echo.

echo [1/6] Installing dependencies...
if not exist package mkdir package
pip install boto3 -t package/
copy lambda_generate_voice_call_enhanced.py package/

echo.
echo [2/6] Creating deployment package...
cd package
powershell Compress-Archive -Path * -DestinationPath ../voice-service.zip -Force
cd ..

echo.
echo [3/6] Creating S3 bucket for audio files...
aws s3 mb s3://shebalance-voice-audio --region us-east-1 2>nul
echo Bucket created or already exists

echo.
echo [4/6] Creating Lambda function...
aws lambda create-function ^
    --function-name shebalance-voice-call-service ^
    --runtime python3.9 ^
    --role arn:aws:iam::065538523474:role/shebalance-lambda-role ^
    --handler lambda_generate_voice_call_enhanced.lambda_handler ^
    --zip-file fileb://voice-service.zip ^
    --timeout 60 ^
    --memory-size 512 ^
    --region us-east-1 2>nul

if %ERRORLEVEL% NEQ 0 (
    echo Function already exists, updating code...
    aws lambda update-function-code ^
        --function-name shebalance-voice-call-service ^
        --zip-file fileb://voice-service.zip ^
        --region us-east-1
)

echo.
echo [5/6] Updating environment variables...
aws lambda update-function-configuration ^
    --function-name shebalance-voice-call-service ^
    --environment Variables={ORDERS_TABLE=shebalance-orders,REMINDERS_TABLE=shebalance-reminders,USERS_TABLE=shebalance-users,ARTISAN_PROFILES_TABLE=shebalance-artisan-profiles,AUDIO_BUCKET=shebalance-voice-audio} ^
    --region us-east-1

echo.
echo [6/6] Granting S3 permissions...
aws lambda add-permission ^
    --function-name shebalance-voice-call-service ^
    --statement-id s3-invoke ^
    --action lambda:InvokeFunction ^
    --principal s3.amazonaws.com ^
    --region us-east-1 2>nul

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Lambda Function: shebalance-voice-call-service
echo S3 Bucket: shebalance-voice-audio
echo Region: us-east-1
echo.
echo IMPORTANT: To enable actual voice calls, you need to:
echo 1. Set up Amazon Connect instance
echo 2. Claim a phone number
echo 3. Create a contact flow
echo 4. Update environment variables with:
echo    - CONNECT_INSTANCE_ID
echo    - CONNECT_CONTACT_FLOW_ID
echo    - CONNECT_SOURCE_PHONE
echo.
echo See VOICE_SERVICES_IMPLEMENTATION.md for details
echo.
pause
