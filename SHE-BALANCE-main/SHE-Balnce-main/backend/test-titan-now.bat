@echo off
echo ============================================================
echo   Testing Amazon Titan Connection
echo ============================================================
echo.
echo This will verify:
echo   - AWS credentials are configured
echo   - Bedrock access is enabled
echo   - Titan model is working
echo.
echo ============================================================
echo.

node test-titan-connection.js

echo.
pause
