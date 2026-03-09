@echo off
REM SkillScan AI Deployment Script for Windows
REM Uses your local AWS credentials (already configured)

echo ========================================
echo SkillScan AI - AWS CDK Deployment
echo ========================================
echo.

REM Check if AWS CLI is configured
echo Checking AWS credentials...
aws sts get-caller-identity >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: AWS credentials not configured!
    echo Please run: aws configure
    exit /b 1
)

echo ✓ AWS credentials verified
echo.

REM Check if Node.js is installed
echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not installed!
    echo Please install Node.js from: https://nodejs.org/
    exit /b 1
)

echo ✓ Node.js installed
echo.

REM Check if CDK is installed
echo Checking AWS CDK...
cdk --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing AWS CDK...
    npm install -g aws-cdk
)

echo ✓ AWS CDK ready
echo.

REM Install dependencies
echo Installing dependencies...
if not exist node_modules (
    call npm install
)

echo ✓ Dependencies installed
echo.

REM Bootstrap CDK (first time only)
echo Checking CDK bootstrap...
cdk bootstrap

echo.
echo ========================================
echo Deploying SkillScan AI Infrastructure
echo ========================================
echo.
echo This will create:
echo   - DynamoDB table for results
echo   - S3 bucket for images
echo   - Lambda functions
echo   - API Gateway
echo.

REM Deploy
cdk deploy --require-approval never

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Copy the API endpoint from above
echo 2. Update skillscan-backend-integration.js
echo 3. Test with your images
echo.

pause
