@echo off
REM Restart Frontend (Development Mode)

echo ========================================
echo  Restarting Frontend
echo ========================================
echo.

cd ..
docker-compose -f docker-compose.dev.yml restart frontend

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  Frontend Restarted Successfully!
    echo  App: http://localhost:5174
    echo ========================================
) else (
    echo.
    echo ERROR: Failed to restart frontend
    exit /b 1
)

pause
