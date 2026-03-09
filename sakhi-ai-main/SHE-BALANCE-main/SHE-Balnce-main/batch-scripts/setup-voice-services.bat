@echo off
echo ========================================
echo  Multi-Language Voice Services Setup
echo ========================================
echo.

echo This script will help you set up AWS voice services for SheBalance
echo.

echo Step 1: Checking AWS CLI installation...
aws --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] AWS CLI is not installed!
    echo Please install AWS CLI from: https://aws.amazon.com/cli/
    pause
    exit /b 1
)
echo [OK] AWS CLI is installed
echo.

echo Step 2: Checking AWS credentials...
aws sts get-caller-identity >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] AWS credentials not configured!
    echo Please run: aws configure
    pause
    exit /b 1
)
echo [OK] AWS credentials are configured
echo.

echo Step 3: Creating S3 bucket for audio files...
set BUCKET_NAME=shebalance-voice-files-%RANDOM%
aws s3 mb s3://%BUCKET_NAME% --region us-east-1
if %errorlevel% equ 0 (
    echo [OK] S3 bucket created: %BUCKET_NAME%
) else (
    echo [WARNING] S3 bucket may already exist or creation failed
)
echo.

echo Step 4: Creating DynamoDB table for audio metadata...
aws dynamodb create-table ^
    --table-name shebalance-audio-files ^
    --attribute-definitions AttributeName=audioId,AttributeType=S ^
    --key-schema AttributeName=audioId,KeyType=HASH ^
    --billing-mode PAY_PER_REQUEST ^
    --region us-east-1 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] DynamoDB table created: shebalance-audio-files
) else (
    echo [WARNING] DynamoDB table may already exist or creation failed
)
echo.

echo Step 5: Testing AWS Polly (Text-to-Speech)...
aws polly synthesize-speech ^
    --text "Hello from SheBalance" ^
    --output-format mp3 ^
    --voice-id Joanna ^
    --region us-east-1 ^
    test-polly.mp3 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] AWS Polly is working
    del test-polly.mp3 >nul 2>&1
) else (
    echo [ERROR] AWS Polly test failed
)
echo.

echo Step 6: Checking AWS Transcribe access...
aws transcribe list-transcription-jobs --max-results 1 --region us-east-1 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] AWS Transcribe is accessible
) else (
    echo [ERROR] AWS Transcribe access failed
)
echo.

echo Step 7: Checking AWS Translate access...
aws translate translate-text ^
    --text "Hello" ^
    --source-language-code en ^
    --target-language-code hi ^
    --region us-east-1 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] AWS Translate is accessible
) else (
    echo [ERROR] AWS Translate access failed
)
echo.

echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Update your .env file with:
echo    S3_BUCKET=%BUCKET_NAME%
echo    AUDIO_TABLE=shebalance-audio-files
echo    AWS_REGION=us-east-1
echo.
echo 2. Start your backend server:
echo    cd backend
echo    npm install
echo    node server.js
echo.
echo 3. Open dashboard.html in your browser
echo.
echo 4. Click the "Voice Assistant" button to test!
echo.
pause
