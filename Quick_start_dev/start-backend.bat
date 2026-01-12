@echo off
REM Start Backend Only (Development Mode)

echo ========================================
echo  Starting Backend (Development)
echo ========================================
echo.

cd ..
docker-compose -f docker-compose.dev.yml up -d --build backend

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  Backend Started Successfully!
    echo  API: http://localhost:8001
    echo  Docs: http://localhost:8001/docs
    echo ========================================
) else (
    echo.
    echo ERROR: Failed to start backend
    exit /b 1
)

pause
