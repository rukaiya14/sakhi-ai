@echo off
REM Setup Sample Data and Start Dashboard

echo ========================================
echo SHE-BALANCE Sample Data Setup
echo ========================================
echo.

echo Step 1: Creating sample data in DynamoDB...
echo.

cd backend\scripts
node create-sample-data.js

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Error creating sample data!
    echo Make sure:
    echo 1. AWS credentials are configured
    echo 2. DynamoDB tables exist
    echo 3. Node.js dependencies are installed
    echo.
    pause
    exit /b 1
)

cd ..\..

echo.
echo Step 2: Starting backend server...
echo.

start "Backend Server" cmd /k "cd backend && node server-dynamodb.js"

timeout /t 3 /nobreak >nul

echo.
echo Step 3: Opening Orders Dashboard...
echo.

timeout /t 2 /nobreak >nul
start http://localhost:5000/test

timeout /t 1 /nobreak >nul
start orders-dashboard.html

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Backend Server: http://localhost:5000
echo Test Interface: http://localhost:5000/test
echo Orders Dashboard: orders-dashboard.html
echo.
echo Sample Data Created:
echo - 8 orders (various statuses)
echo - 2 reminders (WhatsApp and voice call)
echo.
echo You can now:
echo 1. View orders in the dashboard
echo 2. Test reminder system
echo 3. See orders needing reminders
echo.
echo ========================================

pause
