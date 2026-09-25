@echo off
title StayNest - Stop Local Servers
color 0C

echo =====================================================================
echo                STOPPING STAYNEST SERVERS
echo =====================================================================
echo.
echo Stopping processes running on Port 8000 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Stopping processes running on Port 3000 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo StayNest servers on port 8000 and 3000 have been stopped.
echo =====================================================================
pause
