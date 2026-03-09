@echo off
echo ========================================
echo AI Sakhi Admin Dashboard - Quick Start
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    echo.
    call npm install
    echo.
    echo Dependencies installed!
    echo.
) else (
    echo Dependencies already installed.
    echo.
)

REM Copy logo if it doesn't exist in public folder
if not exist "public\logo She balance.png" (
    echo Copying logo file...
    if exist "..\logo She balance.png" (
        copy "..\logo She balance.png" "public\"
        echo Logo copied successfully!
    ) else (
        echo Warning: Logo file not found at ..\logo She balance.png
        echo Dashboard will still work, but logo won't display.
    )
    echo.
)

echo Starting development server...
echo.
echo The dashboard will open at http://localhost:3000
echo.
echo Features:
echo - Mock data enabled (no AWS setup needed)
echo - 12 sample artisans with health monitoring
echo - 20 intervention records
echo - 8 emergency messages
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

npm start
