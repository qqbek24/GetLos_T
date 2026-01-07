@echo off
REM View frontend logs only (Development Mode)

echo ========================================
echo  Viewing Frontend Logs
echo ========================================
echo.
echo Press Ctrl+C to exit logs
echo.

cd ..
docker-compose -f docker-compose.dev.yml logs -f frontend
