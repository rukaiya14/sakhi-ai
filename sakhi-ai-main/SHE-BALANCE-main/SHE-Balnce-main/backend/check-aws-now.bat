@echo off
echo ============================================================
echo   AWS Backend Status Check
echo ============================================================
echo.
echo Checking:
echo   1. AWS Credentials
echo   2. Bedrock Access
echo   3. Titan Model
echo.
echo ============================================================
echo.

node check-aws-backend.js

echo.
pause
