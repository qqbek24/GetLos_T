@echo off
REM Start Frontend Only (Development Mode)

echo ========================================
echo  Starting Frontend (Development)
echo ========================================
echo.

cd ..
docker-compose -f docker-compose.dev.yml up -d --build frontend

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  Frontend Started Successfully!
    echo  App: http://localhost:5174
    echo ========================================
) else (
    echo.
    echo ERROR: Failed to start frontend
    exit /b 1
)

pause
