@echo off
echo ====================================
echo COMPLETE LOGIN FIX SCRIPT
echo ====================================
echo.

echo Step 1: Check if backend is running
echo ------------------------------------
tasklist | findstr python >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] Python processes are running
    echo.
    echo Killing all Python processes to ensure clean start...
    taskkill /F /IM python.exe >nul 2>&1
    timeout /t 2 /nobreak >nul
    echo Done.
) else (
    echo [OK] No Python processes running
)

echo.
echo Step 2: Check if port 8000 is free
echo ------------------------------------
netstat -ano | findstr :8000 >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] Port 8000 is in use
    echo.
    echo Processes using port 8000:
    netstat -ano | findstr :8000
    echo.
    echo Killing processes on port 8000...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
    echo Done.
) else (
    echo [OK] Port 8000 is free
)

echo.
echo Step 3: Install missing dependencies
echo ------------------------------------
cd backend
echo Installing psutil...
python -m pip install psutil -q
echo Done.

echo.
echo Step 4: Test backend can start
echo ------------------------------------
echo Testing backend imports...
python -c "from src.main import app; print('OK')" >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Backend imports successfully
) else (
    echo [ERROR] Backend has import errors
    echo.
    echo Trying to fix dependencies...
    python -m pip install -r requirements.txt -q
)

echo.
echo ====================================
echo READY TO START BACKEND
echo ====================================
echo.
echo The backend is ready to start. Run this command:
echo.
echo   cd backend
echo   python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
echo.
echo Or use the start script:
echo.
echo   python restart_server.py
echo.
echo Then test with:
echo.
echo   python test_login.py
echo.
pause
