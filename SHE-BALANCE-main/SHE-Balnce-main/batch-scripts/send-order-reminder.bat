@echo off
echo.
echo ========================================
echo   SHE-BALANCE Order Reminder
echo   Sending to: +917666544797
echo ========================================
echo.
cd backend
node send-order-update-to-me.js
echo.
pause
