@echo off
echo ============================================================
echo   POPULATE DYNAMODB WITH MOCK DATA
echo ============================================================
echo.
echo This will create:
echo   - Artisan user (rukaiya@example.com)
echo   - 2 Buyer users
echo   - 3 Orders (1 in-progress, 1 completed, 1 pending)
echo   - Labour tracking records
echo   - SkillScan results
echo   - Notifications
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul

echo.
echo Running population script...
echo.

node populate-mock-data.js

echo.
echo ============================================================
echo   DONE!
echo ============================================================
echo.
echo You can now:
echo   1. Login at http://localhost:8080/login.html
echo   2. Use: rukaiya@example.com / artisan123
echo   3. Ask AI Sakhi about your orders
echo.
echo Press any key to exit...
pause >nul
