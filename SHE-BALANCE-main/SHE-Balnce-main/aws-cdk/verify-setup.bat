@echo off
echo ========================================
echo SkillScan AI - Setup Verification
echo ========================================
echo.

echo Checking AWS CLI...
aws --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ AWS CLI not installed
    echo Install from: https://aws.amazon.com/cli/
    goto :end
) else (
    echo ✅ AWS CLI installed
    aws --version
)
echo.

echo Checking AWS credentials...
aws sts get-caller-identity >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ AWS credentials not configured
    echo Run: aws configure
    goto :end
) else (
    echo ✅ AWS credentials configured
    aws sts get-caller-identity
)
echo.

echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not installed
    echo Install from: https://nodejs.org/
    goto :end
) else (
    echo ✅ Node.js installed
    node --version
)
echo.

echo Checking AWS CDK...
cdk --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  AWS CDK not installed
    echo Installing now...
    npm install -g aws-cdk
    if %errorlevel% neq 0 (
        echo ❌ Failed to install CDK
        goto :end
    )
)
echo ✅ AWS CDK installed
cdk --version
echo.

echo Checking Bedrock access...
aws bedrock list-foundation-models --region us-east-1 --query "modelSummaries[?contains(modelId, 'claude-3-5-sonnet')]" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Cannot verify Bedrock access
    echo Please enable Claude 3.5 Sonnet in AWS Bedrock Console
    echo https://console.aws.amazon.com/bedrock/
) else (
    echo ✅ Bedrock access verified
)
echo.

echo Checking dataset folder...
if exist "..\dataset" (
    echo ✅ Dataset folder exists
    dir /b /s "..\dataset\*.jpg" "..\dataset\*.png" 2>nul | find /c /v "" > temp.txt
    set /p count=<temp.txt
    del temp.txt
    echo Found images in dataset folder
) else (
    echo ⚠️  Dataset folder not found
    echo Create: SHE-BALANCE-main\SHE-Balnce-main\dataset\
)
echo.

echo ========================================
echo Setup Verification Complete
echo ========================================
echo.
echo Next step: Run deploy.bat
echo.

:end
pause
