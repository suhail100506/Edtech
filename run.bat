@echo off
setlocal EnableDelayedExpansion
title EduInsight AI - Service Runner
color 0A

echo =====================================================================
echo               EduInsight AI - Full Stack Launcher                    
echo =====================================================================
echo.

:: Ensure we are in the project root directory
cd /d "%~dp0"
echo [*] Project Directory: %CD%
echo.

:: 1. Check Python installation
where python >nul 2>&1
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] Python is not installed or not in your system PATH!
    echo Please install Python (3.10+) from https://www.python.org/
    echo and make sure to check "Add Python to PATH".
    echo.
    pause
    exit /b 1
)

:: 2. Check Node.js and NPM
where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] Node.js / NPM is not installed or not in your system PATH!
    echo Please install Node.js (v18+) from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 3. Detect Python executable (virtual environment vs system Python)
set "PYTHON_EXEC=python"
if exist "%~dp0.venv\Scripts\python.exe" (
    echo [*] Virtual environment detected: .venv
    set "PYTHON_EXEC=%~dp0.venv\Scripts\python.exe"
) else if exist "%~dp0venv\Scripts\python.exe" (
    echo [*] Virtual environment detected: venv
    set "PYTHON_EXEC=%~dp0venv\Scripts\python.exe"
) else (
    echo [*] Using system Python
)

:: 4. Detect Frontend directory and check node_modules
set "FRONTEND_DIR=%~dp0"
if exist "%~dp0frontend\package.json" (
    set "FRONTEND_DIR=%~dp0frontend"
)

if not exist "%FRONTEND_DIR%\node_modules" (
    echo [!] node_modules not found in %FRONTEND_DIR%.
    echo [*] Installing frontend dependencies via npm install...
    pushd "%FRONTEND_DIR%"
    call npm install
    popd
)

:: 5. Check if ports are already in use and prompt to clean up
set "PORT_8000_IN_USE=0"
set "PORT_3000_IN_USE=0"
set "PORT_3001_IN_USE=0"

netstat -ano | findstr ":8000" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% equ 0 set "PORT_8000_IN_USE=1"

netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% equ 0 set "PORT_3000_IN_USE=1"

netstat -ano | findstr ":3001" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% equ 0 set "PORT_3001_IN_USE=1"

if "%PORT_8000_IN_USE%"=="1" (
    echo [!] Port 8000 is already in use by an existing process.
)
if "%PORT_3000_IN_USE%"=="1" (
    echo [!] Port 3000 is already in use by an existing process.
)
if "%PORT_3001_IN_USE%"=="1" (
    echo [!] Port 3001 is already in use by an existing process.
)

if "%PORT_8000_IN_USE%"=="1" (
    echo.
    echo Old server instances are currently running.
    echo Would you like to terminate existing instances before starting fresh?
    choice /C YN /M "Terminate old processes on ports 8000/3000/3001? (Y/N)"
    if !ERRORLEVEL! equ 1 (
        echo [*] Stopping previous instances...
        for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
        for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
        for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3001" ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
        timeout /t 2 /nobreak >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
    )
)

echo.
echo =====================================================================
echo [*] Launching FastAPI Backend (Port 8000)...
echo =====================================================================
start "EduInsight - FastAPI Backend" cmd /k "title EduInsight - FastAPI Backend (Port 8000) && cd /d "%~dp0" && "%PYTHON_EXEC%" -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

echo.
echo =====================================================================
echo [*] Launching Next.js Frontend...
echo =====================================================================
start "EduInsight - Next.js Frontend" cmd /k "title EduInsight - Next.js Frontend && cd /d "%FRONTEND_DIR%" && npm run dev"

echo.
echo [*] Waiting 3 seconds for initial boot...
timeout /t 3 /nobreak >nul 2>&1 || ping 127.0.0.1 -n 4 >nul

echo.
echo =====================================================================
echo                      SERVERS ARE NOW ACTIVE!                         
echo =====================================================================
echo.
echo   * Frontend UI      : http://localhost:3000 (or http://localhost:3001)
echo   * FastAPI Backend  : http://127.0.0.1:8000
echo   * API Documentation: http://127.0.0.1:8000/docs
echo.
echo =====================================================================
echo   CONTROLS:
echo   [1] Open Frontend UI in default browser
echo   [2] Open API Documentation (Swagger) in default browser
echo   [3] Stop both servers and exit
echo   [4] Keep servers running and close this launcher
echo =====================================================================
echo.

:menu_loop
choice /C 1234 /N /M "Choose an option [1-4]: "
if errorlevel 4 goto exit_launcher
if errorlevel 3 goto stop_servers
if errorlevel 2 goto open_docs
if errorlevel 1 goto open_frontend

:open_frontend
echo [*] Opening Frontend in browser...
start http://localhost:3000
goto menu_loop

:open_docs
echo [*] Opening API Documentation in browser...
start http://127.0.0.1:8000/docs
goto menu_loop

:stop_servers
echo.
echo [*] Terminating servers on ports 8000, 3000, and 3001...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3001" ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
echo [OK] All servers have been stopped.
timeout /t 2 /nobreak >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
exit /b 0

:exit_launcher
echo [*] Exiting launcher. Background server windows remain open.
exit /b 0
