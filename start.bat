@echo off
echo Starting SIH Sentiment Analysis Platform...
echo.

echo Starting Python Backend...
start "Backend Server" cmd /k "cd backend && python start_backend.py"

echo Waiting for backend to start...
timeout /t 10 /nobreak > nul

echo Starting Frontend...
start "Frontend Server" cmd /k "pnpm dev"

echo.
echo Both services are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul
