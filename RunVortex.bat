@echo off
title VocabVortex - Full Stack Runner

echo Resolving Port Conflicts...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081') do taskkill /F /PID %%a >nul 2>&1

echo [1/2] Starting Next.js Backend...
start cmd /k "cd server && echo Starting Server... && npm run dev"

echo [2/2] Starting Expo Web Frontend (with Cache Clear)...
start cmd /k "cd mobile && echo Starting Mobile (Web Mode)... && npx expo start --web --clear"

echo.
echo ==========================================
echo VORTEX IS SPINNING UP!
echo Backend: http://localhost:3000
echo Frontend: Opening in your browser...
echo ==========================================
pause
