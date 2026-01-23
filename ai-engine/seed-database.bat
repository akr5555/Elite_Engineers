@echo off
echo ========================================
echo Seeding Database with Sample Engineers
echo ========================================
echo.

cd /d D:\Elite\ai-engine

python seed_data.py

echo.
echo Press any key to exit...
pause > nul
