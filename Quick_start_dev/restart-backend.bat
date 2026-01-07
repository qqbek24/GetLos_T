@echo off
REM Restart Backend (Development Mode)

echo ========================================
echo  Restarting Backend
echo ========================================
echo.

cd ..
docker-compose -f docker-compose.dev.yml restart backend

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  Backend Restarted Successfully!
    echo  API: http://localhost:8001
    echo ========================================
) else (
    echo.
    echo ERROR: Failed to restart backend
    exit /b 1
)

pause
