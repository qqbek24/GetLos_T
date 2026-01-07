@echo off
REM Restart All Services (Development Mode)

echo ========================================
echo  Restarting All Services
echo ========================================
echo.

cd ..
docker-compose -f docker-compose.dev.yml restart

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  All Services Restarted Successfully!
    echo  Frontend: http://localhost:5174
    echo  Backend:  http://localhost:8001
    echo ========================================
) else (
    echo.
    echo ERROR: Failed to restart services
    exit /b 1
)

pause
