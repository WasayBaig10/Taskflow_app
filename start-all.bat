@echo off
echo ====================================
echo TaskFlow - Start All Services
echo ====================================
echo.

echo [1/3] Starting Backend Server...
echo --------------------------------
start "Backend Server" cmd /k "cd backend && python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000"
timeout /t 3 /nobreak > nul

echo [2/3] Waiting for backend to be ready...
echo --------------------------------
:waitloop
timeout /t 2 /nobreak > nul
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo Backend is ready!
) else (
    echo Still waiting for backend...
    goto waitloop
)

echo.
echo [3/3] Starting Frontend Server...
echo --------------------------------
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ====================================
echo All servers starting...
echo ====================================
echo.
echo Frontend: http://localhost:3000 (or 3001, 3002)
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo Press any key to open browser...
pause > nul

echo Opening browser...
start http://localhost:3000
