@echo off
title StayNest - Full Stack Launcher
color 0A

echo =====================================================================
echo                STAYNEST - HOSTEL ALLOCATION SYSTEM
echo =====================================================================
echo.
echo [1/3] Starting Backend Server (FastAPI on Port 8000)...
start "StayNest Backend (FastAPI)" cmd /k "cd /d %~dp0backend && color 0B && title StayNest Backend && .venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

echo [2/3] Starting Frontend Dev Server (Next.js on Port 3000)...
start "StayNest Frontend (Next.js)" cmd /k "cd /d %~dp0frontend && color 0D && title StayNest Frontend && npm run dev"

echo [3/3] Waiting for servers to initialize...
timeout /t 5 /nobreak >nul

echo.
echo Opening browser at http://localhost:3000 ...
start http://localhost:3000

echo.
echo =====================================================================
echo                 STAYNEST IS LIVE ON LOCALHOST!
echo =====================================================================
echo   - Frontend:     http://localhost:3000
echo   - Backend API:  http://127.0.0.1:8000
echo   - Swagger Docs: http://127.0.0.1:8000/docs
echo.
echo   Demo Personas (Switchable via top navbar Persona dropdown):
echo     * Tenant:      manas@staynest.com / password123
echo     * Owner:       owner@staynest.com / password123
echo     * Warden:      warden@staynest.com / password123
echo     * Staff:       staff@staynest.com / password123
echo     * Super Admin: admin@staynest.com / password123
echo =====================================================================
echo.
echo Both servers are running in separate windows. Close those windows or run stop.cmd to stop them.
pause
