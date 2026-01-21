@echo off
echo ========================================
echo Elite Platform - Backend Quick Start
echo ========================================
echo.

cd /d "%~dp0ai-engine"

echo Checking if virtual environment exists...
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
    echo Virtual environment created!
) else (
    echo Virtual environment already exists.
)

echo.
echo Activating virtual environment...
call venv\Scripts\activate

echo.
echo Checking if dependencies are installed...
pip show fastapi >nul 2>&1
if errorlevel 1 (
    echo Installing dependencies...
    pip install -r requirements.txt
    echo Dependencies installed!
) else (
    echo Dependencies already installed.
)

echo.
echo ========================================
echo Starting FastAPI Backend Server...
echo ========================================
echo.
echo API will be available at:
echo   - http://localhost:8000
echo   - Docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
