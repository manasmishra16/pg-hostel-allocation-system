@echo off
title StayNest - Frontend Launcher
color 0D

echo =====================================================================
echo                STAYNEST FRONTEND (Next.js 15)
echo =====================================================================
echo.
cd /d %~dp0frontend
echo Starting Next.js development server on http://localhost:3000 ...
echo.
npm run dev
pause
