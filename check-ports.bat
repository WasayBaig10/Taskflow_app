@echo off
echo Checking Port Status...
echo ====================
echo.

echo Backend Port (8000):
netstat -ano | findstr :8000
echo.

echo Frontend Ports (3000-3002):
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :3002
echo.

echo Testing Backend Connection...
curl -s http://localhost:8000/health
echo.
echo.

pause
