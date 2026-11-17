@echo off
title PRAYOGAPROOF - Offline Interactive Mathematics Lab
color 0B
cls
echo ========================================================
echo   PRAYOGAPROOF - Offline Mathematics Learning Lab
echo   Starting local offline server and launching browser...
echo ========================================================
echo.

cd /d "%~dp0"

:: Start browser after 1 second delay in background
start "" cmd /c "timeout /t 1 /nobreak >nul && start http://localhost:5173"

:: Start Node offline server
node server.js

pause
