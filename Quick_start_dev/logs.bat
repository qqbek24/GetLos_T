@echo off
REM View logs for all services (Development Mode)

echo ========================================
echo  Viewing Logs (Development)
echo ========================================
echo.
echo Press Ctrl+C to exit logs
echo.

cd ..
docker-compose -f docker-compose.dev.yml logs -f
