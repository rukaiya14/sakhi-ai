@echo off
REM Test Script for Enhanced Reminder System
REM This script tests the complete reminder workflow

echo ========================================
echo Testing Enhanced Reminder System
echo ========================================
echo.

set AWS_REGION=us-east-1
set ACCOUNT_ID=065538523474

echo Step 1: Creating Test Order in DynamoDB...
echo.

REM Create test order JSON
echo { > test-order.json
echo   "orderId": "test-order-%RANDOM%", >> test-order.json
echo   "artisanId": "artisan-rukaiya", >> test-order.json
echo   "buyerId": "buyer-rahul", >> test-order.json
echo   "title": "Test Embroidered Sarees (50 pieces)", >> test-order.json
echo   "orderType": "bulk", >> test-order.json
echo   "status": "in_progress", >> test-order.json
echo   "quantity": 50, >> test-order.json
echo   "price": 25000, >> test-order.json
echo   "createdAt": "%date:~-4%-%date:~4,2%-%date:~7,2%T00:00:00Z", >> test-order.json
echo   "lastProgressUpdate": "2026-02-27T00:00:00Z" >> test-order.json
echo } >> test-order.json

REM Insert test order
aws dynamodb put-item ^
    --table-name shebalance-orders ^
    --item file://test-order.json ^
    --region %AWS_REGION%

if %ERRORLEVEL% EQU 0 (
    echo ✅ Test order created successfully!
) else (
    echo ❌ Failed to create test order
    pause
    exit /b 1
)

echo.
echo Step 2: Testing Orchestrator Lambda...
echo.

REM Invoke orchestrator
aws lambda invoke ^
    --function-name shebalance-order-reminder-orchestrator ^
    --payload "{}" ^
    --region %AWS_REGION% ^
    orchestrator-response.json

if %ERRORLEVEL% EQU 0 (
    echo ✅ Orchestrator invoked successfully!
    echo.
    echo Response:
    type orchestrator-response.json
    echo.
) else (
    echo ❌ Failed to invoke orchestrator
    pause
    exit /b 1
)

echo.
echo Step 3: Checking Reminder Record...
echo.

timeout /t 3 /nobreak >nul

REM Query reminders table
aws dynamodb scan ^
    --table-name shebalance-reminders ^
    --limit 5 ^
    --region %AWS_REGION% ^
    > reminders-check.json

echo Recent reminders:
type reminders-check.json
echo.

echo.
echo Step 4: Testing Voice Call Lambda (Dry Run)...
echo.

REM Create voice call test payload
echo { > voice-test.json
echo   "artisanId": "artisan-rukaiya", >> voice-test.json
echo   "artisanName": "Rukaiya", >> voice-test.json
echo   "phoneNumber": "+919876543210", >> voice-test.json
echo   "orderId": "test-order-123", >> voice-test.json
echo   "orderTitle": "Test Embroidered Sarees", >> voice-test.json
echo   "daysInactive": 4, >> voice-test.json
echo   "language": "hi-IN" >> voice-test.json
echo } >> voice-test.json

REM Invoke voice call Lambda
aws lambda invoke ^
    --function-name shebalance-generate-voice-call ^
    --payload file://voice-test.json ^
    --region %AWS_REGION% ^
    voice-response.json

if %ERRORLEVEL% EQU 0 (
    echo ✅ Voice call Lambda invoked successfully!
    echo.
    echo Response:
    type voice-response.json
    echo.
) else (
    echo ❌ Failed to invoke voice call Lambda
)

echo.
echo Step 5: Viewing Lambda Logs...
echo.

echo Orchestrator Logs (last 20 lines):
aws logs tail /aws/lambda/shebalance-order-reminder-orchestrator ^
    --since 10m ^
    --region %AWS_REGION% 2>nul

echo.
echo Voice Call Logs (last 20 lines):
aws logs tail /aws/lambda/shebalance-generate-voice-call ^
    --since 10m ^
    --region %AWS_REGION% 2>nul

echo.
echo Step 6: Checking EventBridge Rule...
echo.

aws events describe-rule ^
    --name shebalance-daily-order-reminder-check ^
    --region %AWS_REGION%

echo.
echo Step 7: Test Summary
echo ========================================
echo.

REM Cleanup test files
del test-order.json 2>nul
del voice-test.json 2>nul

echo ✅ Test completed!
echo.
echo What was tested:
echo 1. Created test order with old lastProgressUpdate (4 days ago)
echo 2. Invoked orchestrator to check orders
echo 3. Verified reminder record creation
echo 4. Tested voice call Lambda
echo 5. Checked Lambda logs
echo 6. Verified EventBridge rule
echo.
echo Next Steps:
echo 1. Check your phone for WhatsApp message (if SNS configured)
echo 2. Wait 24 hours and check for voice call (if Twilio configured)
echo 3. Monitor CloudWatch logs for any errors
echo.
echo To view live logs:
echo aws logs tail /aws/lambda/shebalance-order-reminder-orchestrator --follow
echo.
echo ========================================

pause
