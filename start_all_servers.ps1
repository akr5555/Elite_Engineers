# Elite Engineers - Start All Servers
# This script starts both the main backend and Elite Brain AI Engine

Write-Host "🚀 Starting Elite Engineers Backend Services..." -ForegroundColor Cyan
Write-Host ""

# Run database migrations first
Write-Host "📋 Running database migrations..." -ForegroundColor Yellow
& ".\run_migrations.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Migrations failed, but continuing with server startup..." -ForegroundColor Yellow
}
Write-Host ""

# Check if Python and Uvicorn are available
$uvicornPath = "D:\anaconda3\Scripts\uvicorn.exe"

if (-not (Test-Path $uvicornPath)) {
    Write-Host "❌ Error: Uvicorn not found at $uvicornPath" -ForegroundColor Red
    Write-Host "Please update the path in this script or install uvicorn" -ForegroundColor Yellow
    exit 1
}

# Function to start a server in a new window
function Start-Server {
    param(
        [string]$Name,
        [string]$Directory,
        [string]$Module,
        [int]$Port,
        [string]$Color
    )
    
    Write-Host "Starting $Name on port $Port..." -ForegroundColor $Color
    
    $command = "Set-Location '$Directory'; $uvicornPath $Module --reload --host 0.0.0.0 --port $Port"
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $command -WindowStyle Normal
    
    Start-Sleep -Seconds 2
    Write-Host "✓ $Name started" -ForegroundColor Green
}

# Start Main Backend (Port 8000)
Start-Server -Name "Main Backend API" `
             -Directory "D:\EliteEngineersProject\Elite_Engineers\ai-engine" `
             -Module "app.main:app" `
             -Port 8000 `
             -Color "Green"

# Start Elite Brain AI Engine (Port 8001)
Start-Server -Name "Elite Brain AI Engine" `
             -Directory "D:\EliteEngineersProject\Elite_Engineers\Elite_brain" `
             -Module "main:app" `
             -Port 8001 `
             -Color "Magenta"

Write-Host ""
Write-Host "✅ All servers started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Server URLs:" -ForegroundColor Cyan
Write-Host "   Main Backend:     http://localhost:8000" -ForegroundColor White
Write-Host "   API Docs:         http://localhost:8000/docs" -ForegroundColor White
Write-Host "   Elite Brain AI:   http://localhost:8001" -ForegroundColor White
Write-Host "   AI Docs:          http://localhost:8001/docs" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: Keep these terminal windows open. Both servers must be running." -ForegroundColor Yellow
Write-Host ""

# Optional: Wait for user input before closing this launcher window
Read-Host "Press Enter to close this window (servers will keep running)"
