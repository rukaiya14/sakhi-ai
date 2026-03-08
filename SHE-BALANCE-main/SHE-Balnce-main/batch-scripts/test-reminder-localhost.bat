@echo off
REM Local Testing Script for Enhanced Reminder System
REM Starts backend server and opens test interface

echo ========================================
echo Enhanced Reminder System - Local Test
echo ========================================
echo.

echo Step 1: Checking Node.js installation...
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js is installed
echo.

echo Step 2: Checking dependencies...
cd backend
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)
echo ✅ Dependencies ready
echo.

echo Step 3: Checking AWS credentials...
if not defined AWS_ACCESS_KEY_ID (
    echo ⚠️  AWS credentials not found in environment
    echo Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
    echo Or configure them in .env file
    echo.
)
echo.

echo Step 4: Starting backend server...
echo Server will run on http://localhost:5000
echo.

start "SHE-BALANCE Backend" cmd /k "node server-dynamodb.js"

timeout /t 3 /nobreak >nul

echo.
echo Step 5: Opening test interface...
cd ..
start "" "test-reminder-system.html"

echo.
echo ========================================
echo ✅ Test Environment Ready!
echo ========================================
echo.
echo Backend Server: http://localhost:5000
echo Test Interface: test-reminder-system.html
echo.
echo What you can test:
echo 1. Create test orders with old progress updates
echo 2. Scan orders needing reminders
echo 3. Send WhatsApp reminders (simulated)
echo 4. Initiate voice calls (simulated)
echo 5. Check reminder status in DynamoDB
echo.
echo To stop the server:
echo - Close the backend server window
echo - Or press Ctrl+C in the server window
echo.
echo ========================================

pause
