@echo off
echo ========================================
echo Elite Platform - Full Stack Launcher
echo ========================================
echo.
echo This will start both backend and frontend servers
echo.

cd /d "%~dp0"

echo Starting Backend Server...
start "Elite Backend" cmd /k "cd ai-engine && venv\Scripts\activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Elite Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Docs:     http://localhost:8000/docs
echo Frontend: http://localhost:5173
echo.
echo Close the terminal windows to stop the servers
echo.
pause
