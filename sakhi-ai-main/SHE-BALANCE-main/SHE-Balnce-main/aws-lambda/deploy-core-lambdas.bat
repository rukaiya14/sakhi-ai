@echo off
REM Automated deployment script for core Lambda functions (Windows)
REM SHE-BALANCE Platform

echo ========================================
echo  SHE-BALANCE Core Lambda Deployment
echo ========================================
echo.

REM Check if AWS CLI is installed
aws --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: AWS CLI is not installed or not in PATH
    echo Please install AWS CLI: https://aws.amazon.com/cli/
    pause
    exit /b 1
)

echo [1/4] Installing dependencies for all Lambda functions...
echo.

REM Authentication functions
echo Installing auth-login dependencies...
cd auth-login
call npm install --production
if errorlevel 1 (
    echo ERROR: Failed to install auth-login dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo Installing auth-register dependencies...
cd auth-register
call npm install --production
if errorlevel 1 (
    echo ERROR: Failed to install auth-register dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

REM User management functions
echo Installing user-get-profile dependencies...
cd user-get-profile
call npm install --production
if errorlevel 1 (
    echo ERROR: Failed to install user-get-profile dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo Installing user-update-profile dependencies...
cd user-update-profile
call npm install --production
if errorlevel 1 (
    echo ERROR: Failed to install user-update-profile dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

REM Order management functions
echo Installing order-create dependencies...
cd order-create
call npm install --production
if errorlevel 1 (
    echo ERROR: Failed to install order-create dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo Installing order-list dependencies...
cd order-list
call npm install --production
if errorlevel 1 (
    echo ERROR: Failed to install order-list dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo Installing order-update-status dependencies...
cd order-update-status
call npm install --production
if errorlevel 1 (
    echo ERROR: Failed to install order-update-status dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo Installing order-update-progress dependencies...
cd order-update-progress
call npm install --production
if errorlevel 1 (
    echo ERROR: Failed to install order-update-progress dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

REM Artisan management functions
echo Installing artisan-list dependencies...
cd artisan-list
call npm install --production
if errorlevel 1 (
    echo ERROR: Failed to install artisan-list dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo Installing artisan-get-details dependencies...
cd artisan-get-details
call npm install --production
if errorlevel 1 (
    echo ERROR: Failed to install artisan-get-details dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo [2/4] Creating deployment packages...
echo.

REM Create zip files for each function
powershell -Command "Compress-Archive -Path auth-login\* -DestinationPath auth-login.zip -Force"
powershell -Command "Compress-Archive -Path auth-register\* -DestinationPath auth-register.zip -Force"
powershell -Command "Compress-Archive -Path user-get-profile\* -DestinationPath user-get-profile.zip -Force"
powershell -Command "Compress-Archive -Path user-update-profile\* -DestinationPath user-update-profile.zip -Force"
powershell -Command "Compress-Archive -Path order-create\* -DestinationPath order-create.zip -Force"
powershell -Command "Compress-Archive -Path order-list\* -DestinationPath order-list.zip -Force"
powershell -Command "Compress-Archive -Path order-update-status\* -DestinationPath order-update-status.zip -Force"
powershell -Command "Compress-Archive -Path order-update-progress\* -DestinationPath order-update-progress.zip -Force"
powershell -Command "Compress-Archive -Path artisan-list\* -DestinationPath artisan-list.zip -Force"
powershell -Command "Compress-Archive -Path artisan-get-details\* -DestinationPath artisan-get-details.zip -Force"

echo.
echo [3/4] Deployment packages created successfully!
echo.
echo The following ZIP files are ready for deployment:
echo   - auth-login.zip
echo   - auth-register.zip
echo   - user-get-profile.zip
echo   - user-update-profile.zip
echo   - order-create.zip
echo   - order-list.zip
echo   - order-update-status.zip
echo   - order-update-progress.zip
echo   - artisan-list.zip
echo   - artisan-get-details.zip
echo.

echo [4/4] Next Steps:
echo.
echo 1. Deploy Lambda functions using AWS CLI or Console
echo 2. Configure environment variables for each function
echo 3. Set up API Gateway endpoints
echo 4. Test all endpoints
echo.
echo For detailed deployment instructions, see:
echo   CORE_LAMBDAS_DEPLOYMENT_GUIDE.md
echo.

echo ========================================
echo  Deployment packages ready!
echo ========================================
echo.

pause
