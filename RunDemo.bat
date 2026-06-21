@echo off
title VocabVortex - DEMO MODE (Tunnel + Server)
set ROOT=%~dp0

echo ==========================================
echo   VOCABVORTEX DEMO LAUNCHER
echo   Multiple devices via Expo Go tunnel
echo ==========================================
echo.

echo [0/3] Clearing ports 3000 and 8081...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081') do taskkill /F /PID %%a >nul 2>&1

echo [1/3] Checking server dependencies...
if not exist "%ROOT%server\node_modules" (
    echo      Installing server packages...
    cd /d "%ROOT%server" && npm install
    cd /d "%ROOT%"
) else (
    echo      OK
)

echo [2/3] Checking mobile dependencies...
if not exist "%ROOT%mobile\node_modules" (
    echo      Installing mobile packages...
    cd /d "%ROOT%mobile" && npm install --legacy-peer-deps
    cd /d "%ROOT%"
) else (
    echo      OK
)

echo [3/3] Starting server + Expo with TUNNEL...
start cmd /k "title VocabVortex-SERVER && cd /d "%ROOT%server" && npm run dev"
timeout /t 3 /nobreak >nul
start cmd /k "title VocabVortex-MOBILE (TUNNEL) && cd /d "%ROOT%mobile" && npx expo start --tunnel --clear"

echo.
echo ==========================================
echo  DEMO MODE ACTIVE!
echo  Backend:      http://localhost:3000
echo  Expo tunnel:  QR code will appear above
echo.
echo  STEPS FOR EACH DEVICE:
echo  1. Install "Expo Go" from Play Store/App Store
echo  2. Open Expo Go, scan the QR code shown above
echo  3. Wait for bundle to load
echo ==========================================
pause
