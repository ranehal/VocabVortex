@echo off
title VocabVortex - Mobile Only
set ROOT=%~dp0

echo ==========================================
echo   VOCABVORTEX MOBILE LAUNCHER
echo   (ReadFlow, LexFlow, ClauseFlow)
echo ==========================================
echo.

echo [1/2] Clearing port 8081...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081') do taskkill /F /PID %%a >nul 2>&1

echo [2/2] Checking mobile dependencies...
if not exist "%ROOT%mobile\node_modules" (
    echo      Installing mobile packages...
    cd /d "%ROOT%mobile" && npm install --legacy-peer-deps
) else (
    echo      OK
    cd /d "%ROOT%mobile"
)

echo.
echo Starting Expo...
npx expo start --web --clear
