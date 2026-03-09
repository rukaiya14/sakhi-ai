@echo off
REM Start both backend and frontend servers for testing

echo ========================================
echo Starting Test Environment
echo ========================================
echo.

echo Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd backend && node server-dynamodb.js"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server (Port 8080)...
start "Frontend Server" cmd /k "npx http-server -p 8080 -c-1"

timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo Servers Started!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:8080
echo.
echo Opening test interface...
timeout /t 2 /nobreak >nul

start http://localhost:8080/test-reminder-system.html

echo.
echo Test interface should open in your browser.
echo If not, manually open: http://localhost:8080/test-reminder-system.html
echo.
echo To stop servers: Close the server windows
echo.
pause
