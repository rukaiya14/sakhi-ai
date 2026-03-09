@echo off
echo Starting SheBalance Local Development Server...
echo.
echo Server will be available at:
echo http://localhost:8080
echo http://localhost:8080/dashboard.html
echo.
echo Press Ctrl+C to stop the server
echo.
python -m http.server 8080
pause