@echo off
echo ========================================
echo Deploying Voice Services to AWS
echo ========================================
echo.

REM Set variables
set FUNCTION_NAME=shebalance-voice-services
set ROLE_NAME=shebalance-voice-services-role
set S3_BUCKET=shebalance-voice-files
set AUDIO_TABLE=shebalance-audio-files
set REGION=us-east-1

echo [1/6] Creating S3 bucket for audio files...
aws s3 mb s3://%S3_BUCKET% --region %REGION% 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ S3 bucket created
) else (
    echo ℹ S3 bucket already exists or error occurred
)

echo.
echo [2/6] Creating DynamoDB table for audio metadata...
aws dynamodb create-table ^
    --table-name %AUDIO_TABLE% ^
    --attribute-definitions ^
        AttributeName=audioId,AttributeType=S ^
        AttributeName=userId,AttributeType=S ^
    --key-schema ^
        AttributeName=audioId,KeyType=HASH ^
    --global-secondary-indexes ^
        "[{\"IndexName\":\"UserIdIndex\",\"KeySchema\":[{\"AttributeName\":\"userId\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}}]" ^
    --provisioned-throughput ^
        ReadCapacityUnits=5,WriteCapacityUnits=5 ^
    --region %REGION% 2>nul

if %ERRORLEVEL% EQU 0 (
    echo ✓ DynamoDB table created
) else (
    echo ℹ DynamoDB table already exists or error occurred
)

echo.
echo [3/6] Creating IAM role for Lambda...
aws iam create-role ^
    --role-name %ROLE_NAME% ^
    --assume-role-policy-document "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"lambda.amazonaws.com\"},\"Action\":\"sts:AssumeRole\"}]}" 2>nul

if %ERRORLEVEL% EQU 0 (
    echo ✓ IAM role created
) else (
    echo ℹ IAM role already exists
)

echo.
echo [4/6] Attaching policies to IAM role...
aws iam attach-role-policy --role-name %ROLE_NAME% --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
aws iam attach-role-policy --role-name %ROLE_NAME% --policy-arn arn:aws:iam::aws:policy/AmazonPollyFullAccess
aws iam attach-role-policy --role-name %ROLE_NAME% --policy-arn arn:aws:iam::aws:policy/AmazonTranscribeFullAccess
aws iam attach-role-policy --role-name %ROLE_NAME% --policy-arn arn:aws:iam::aws:policy/TranslateFullAccess
aws iam attach-role-policy --role-name %ROLE_NAME% --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
aws iam attach-role-policy --role-name %ROLE_NAME% --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
echo ✓ Policies attached

echo.
echo [5/6] Waiting for IAM role to be ready...
timeout /t 10 /nobreak >nul
echo ✓ Ready

echo.
echo [6/6] Creating Lambda function...

REM Get account ID
for /f "tokens=*" %%i in ('aws sts get-caller-identity --query Account --output text') do set ACCOUNT_ID=%%i

REM Create deployment package
echo Creating deployment package...
if exist lambda_voice_services.zip del lambda_voice_services.zip
powershell -Command "Compress-Archive -Path lambda_voice_services.py -DestinationPath lambda_voice_services.zip -Force"

REM Create or update Lambda function
aws lambda create-function ^
    --function-name %FUNCTION_NAME% ^
    --runtime python3.9 ^
    --role arn:aws:iam::%ACCOUNT_ID%:role/%ROLE_NAME% ^
    --handler lambda_voice_services.lambda_handler ^
    --zip-file fileb://lambda_voice_services.zip ^
    --timeout 300 ^
    --memory-size 512 ^
    --environment "Variables={S3_BUCKET=%S3_BUCKET%,AUDIO_TABLE=%AUDIO_TABLE%}" ^
    --region %REGION% 2>nul

if %ERRORLEVEL% EQU 0 (
    echo ✓ Lambda function created
) else (
    echo ℹ Lambda function exists, updating...
    aws lambda update-function-code ^
        --function-name %FUNCTION_NAME% ^
        --zip-file fileb://lambda_voice_services.zip ^
        --region %REGION%
    
    aws lambda update-function-configuration ^
        --function-name %FUNCTION_NAME% ^
        --environment "Variables={S3_BUCKET=%S3_BUCKET%,AUDIO_TABLE=%AUDIO_TABLE%}" ^
        --region %REGION%
    
    echo ✓ Lambda function updated
)

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Lambda Function: %FUNCTION_NAME%
echo S3 Bucket: %S3_BUCKET%
echo DynamoDB Table: %AUDIO_TABLE%
echo Region: %REGION%
echo.
echo Next Steps:
echo 1. Create API Gateway endpoint
echo 2. Update frontend with API Gateway URL
echo 3. Test voice services
echo.
pause
