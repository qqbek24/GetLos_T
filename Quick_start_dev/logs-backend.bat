@echo off
REM View backend logs only (Development Mode)

echo ========================================
echo  Viewing Backend Logs
echo ========================================
echo.
echo Press Ctrl+C to exit logs
echo.

cd ..
docker-compose -f docker-compose.dev.yml logs -f backend
