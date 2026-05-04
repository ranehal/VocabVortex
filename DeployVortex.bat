@echo off
title VocabVortex - Deploy to Git
echo [1/3] Checking status...
git status

echo [2/3] Adding any untracked files...
git add .

echo [3/3] Pushing to GitHub (ranehal/VocabVortex)...
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Push failed. Check your GitHub permissions.
) else (
    echo.
    echo [SUCCESS] Vortex is LIVE at https://github.com/ranehal/VocabVortex
)
pause
