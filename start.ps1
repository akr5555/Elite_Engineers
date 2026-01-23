#!/usr/bin/env pwsh
# Quick Start Script for Elite Engineers Platform
# This script starts all required services in separate terminal windows

Write-Host "🚀 Starting Elite Engineers Platform..." -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "📦 Checking Docker..." -ForegroundColor Yellow
$dockerRunning = docker info 2>&1 | Select-String -Pattern "Server Version" -Quiet
if (-not $dockerRunning) {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker is running" -ForegroundColor Green
Write-Host ""

# Start PostgreSQL if not already running
Write-Host "🐘 Starting PostgreSQL with pgvector..." -ForegroundColor Yellow
$containerRunning = docker ps --filter "name=elite-engineers-postgres" --format "{{.Names}}" | Select-String -Pattern "elite-engineers-postgres" -Quiet
if ($containerRunning) {
    Write-Host "✅ PostgreSQL container already running" -ForegroundColor Green
} else {
    docker-compose up -d
    Write-Host "✅ PostgreSQL container started" -ForegroundColor Green
}
Write-Host ""

# Wait for PostgreSQL to be ready
Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Write-Host "✅ PostgreSQL is ready" -ForegroundColor Green
Write-Host ""

# Start Backend API
Write-Host "🔧 Starting Backend API (FastAPI)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd 'd:\EliteEngineersProject\Elite_Engineers\ai-engine'; Write-Host '🚀 Starting Backend API...' -ForegroundColor Cyan; d:\EliteEngineersProject\Elite_Engineers\ai-engine\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
)
Write-Host "✅ Backend API starting in new window" -ForegroundColor Green
Write-Host ""

# Wait for backend to start
Write-Host "⏳ Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test backend health
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/health" -ErrorAction Stop
    Write-Host "✅ Backend API is healthy" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend may still be starting up..." -ForegroundColor Yellow
}
Write-Host ""

# Start Frontend
Write-Host "⚛️  Starting Frontend (React + Vite)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd 'd:\EliteEngineersProject\Elite_Engineers\frontend'; Write-Host '🚀 Starting Frontend...' -ForegroundColor Cyan; npm run dev"
)
Write-Host "✅ Frontend starting in new window" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎉 Elite Engineers Platform Started!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Services:" -ForegroundColor White
Write-Host "   🐘 PostgreSQL:  http://localhost:5435" -ForegroundColor Gray
Write-Host "   🔧 Backend API:  http://localhost:8000" -ForegroundColor Gray
Write-Host "   🔧 API Docs:     http://localhost:8000/docs" -ForegroundColor Gray
Write-Host "   ⚛️  Frontend:     http://localhost:8080" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 Quick Start:" -ForegroundColor White
Write-Host "   1. Open browser to http://localhost:8080" -ForegroundColor Gray
Write-Host "   2. Sign up or log in with your account" -ForegroundColor Gray
Write-Host "   3. Start exploring engineer profiles!" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 To stop all services:" -ForegroundColor White
Write-Host "   - Close the terminal windows" -ForegroundColor Gray
Write-Host "   - Run: docker-compose down" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to open the application in browser..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open browser
Start-Process "http://localhost:8080"

Write-Host ""
Write-Host "✨ Happy coding!" -ForegroundColor Green
