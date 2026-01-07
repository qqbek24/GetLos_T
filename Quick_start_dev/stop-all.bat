@echo off
REM Stop All Services

echo ========================================
echo  Stopping All Services
echo ========================================
echo.

cd ..
REM Try to stop both dev and prod
docker-compose -f docker-compose.dev.yml down
docker-compose down

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  All Services Stopped Successfully!
    echo ========================================
) else (
    echo.
    echo ERROR: Failed to stop services
    exit /b 1
)

pause
