@echo off
echo ========================================
echo   SHE-BALANCE Full Stack Launcher
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Checking backend dependencies...
cd backend
if not exist node_modules (
    echo Installing backend dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo [2/4] Starting Backend Server (Port 5000)...
start "SHE-BALANCE Backend" cmd /k "npm start"

REM Wait for backend to start
timeout /t 3 /nobreak >nul

cd ..

echo.
echo [3/4] Starting Frontend Server (Port 3000)...
start "SHE-BALANCE Frontend" cmd /k "python -m http.server 3000"

REM Wait for frontend to start
timeout /t 2 /nobreak >nul

echo.
echo [4/4] Opening application in browser...
timeout /t 2 /nobreak >nul
start http://localhost:3000/index.html

echo.
echo ========================================
echo   SHE-BALANCE is now running!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Two command windows have opened:
echo   1. Backend Server (keep running)
echo   2. Frontend Server (keep running)
echo.
echo Press Ctrl+C in those windows to stop servers
echo.
echo Sample Login Credentials:
echo   Admin:   admin@shebalance.com / admin123
echo   Artisan: priya@example.com / artisan123
echo   Buyer:   rahul@example.com / buyer123
echo.
echo ========================================
pause
