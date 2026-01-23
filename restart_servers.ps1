# Elite Engineers - Restart All Servers
# Stops and restarts both backend servers with fresh state

Write-Host "🔄 Restarting Elite Engineers Servers..." -ForegroundColor Cyan
Write-Host ""

# Kill existing uvicorn processes
Write-Host "Stopping existing servers..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*uvicorn*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "✓ Servers stopped" -ForegroundColor Green
Write-Host ""

# Run migrations
Write-Host "📋 Running database migrations..." -ForegroundColor Yellow
& ".\run_migrations.ps1"
Write-Host ""

# Start servers
Write-Host "Starting servers..." -ForegroundColor Green
& ".\start_all_servers.ps1"
