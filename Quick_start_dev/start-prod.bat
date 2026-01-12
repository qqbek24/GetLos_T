@echo off
REM Start All Services (Production Mode)

echo ========================================
echo  Starting All Services (Production)
echo ========================================
echo.

cd ..
docker-compose up -d --build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  All Services Started Successfully!
    echo  Frontend: http://localhost:5174
    echo  Backend:  http://localhost:8001
    echo  API Docs: http://localhost:8001/docs
    echo ========================================
    echo.
    echo To view logs: docker-compose logs -f
) else (
    echo.
    echo ERROR: Failed to start services
    exit /b 1
)

pause
