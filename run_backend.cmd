@echo off
title StayNest - Backend Launcher
color 0B

echo =====================================================================
echo                STAYNEST BACKEND (FastAPI)
echo =====================================================================
echo.
cd /d %~dp0backend
echo Starting Uvicorn server on http://127.0.0.1:8000 ...
echo Swagger Docs: http://127.0.0.1:8000/docs
echo.
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
pause
