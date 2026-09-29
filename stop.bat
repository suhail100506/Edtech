@echo off
setlocal
title EduInsight AI - Stop Servers
color 0C

echo =====================================================================
echo               EduInsight AI - Server Shutdown                        
echo =====================================================================
echo.

echo [*] Terminating FastAPI backend process (Port 8000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo     Killing PID %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo [*] Terminating Next.js frontend process (Port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo     Killing PID %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo [*] Terminating Next.js frontend process (Port 3001)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3001" ^| findstr "LISTENING"') do (
    echo     Killing PID %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo [OK] All backend and frontend processes have been stopped.
echo.
timeout /t 3 >nul 2>&1 || ping 127.0.0.1 -n 4 >nul
