# Elite Engineers - Health Check
# This script verifies all backend services are running properly

Write-Host "🏥 Elite Engineers Health Check" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

function Test-ServerHealth {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Color
    )
    
    Write-Host "Checking $Name..." -ForegroundColor $Color -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host " ✅ HEALTHY" -ForegroundColor Green
            return $true
        } else {
            Write-Host " ⚠️  Status: $($response.StatusCode)" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host " ❌ NOT RESPONDING" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor DarkRed
        return $false
    }
}

# Check Main Backend
$mainBackendOk = Test-ServerHealth -Name "Main Backend API (Port 8000)" `
                                    -Url "http://localhost:8000/docs" `
                                    -Color "Green"

# Check Elite Brain AI Engine
$eliteBrainOk = Test-ServerHealth -Name "Elite Brain AI (Port 8001)" `
                                   -Url "http://localhost:8001/docs" `
                                   -Color "Magenta"

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan

if ($mainBackendOk -and $eliteBrainOk) {
    Write-Host "✅ All systems operational!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now:" -ForegroundColor Cyan
    Write-Host "  • Create engineer profiles with AI scoring" -ForegroundColor White
    Write-Host "  • Use AI-powered candidate search" -ForegroundColor White
    Write-Host "  • Access API documentation at:" -ForegroundColor White
    Write-Host "    - http://localhost:8000/docs" -ForegroundColor DarkGray
    Write-Host "    - http://localhost:8001/docs" -ForegroundColor DarkGray
} else {
    Write-Host "⚠️  Some services are not responding!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To start all servers, run:" -ForegroundColor Cyan
    Write-Host "  .\start_all_servers.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "Or start them manually:" -ForegroundColor Cyan
    
    if (-not $mainBackendOk) {
        Write-Host "  Main Backend:" -ForegroundColor Red
        Write-Host "    Set-Location 'D:\EliteEngineersProject\Elite_Engineers\ai-engine'" -ForegroundColor DarkGray
        Write-Host "    D:\anaconda3\Scripts\uvicorn.exe app.main:app --reload --host 0.0.0.0 --port 8000" -ForegroundColor DarkGray
    }
    
    if (-not $eliteBrainOk) {
        Write-Host "  Elite Brain AI:" -ForegroundColor Red
        Write-Host "    Set-Location 'D:\EliteEngineersProject\Elite_Engineers\Elite_brain'" -ForegroundColor DarkGray
        Write-Host "    D:\anaconda3\Scripts\uvicorn.exe main:app --reload --port 8001" -ForegroundColor DarkGray
    }
}

Write-Host ""
