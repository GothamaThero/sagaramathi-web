@echo off
title Sagaramati Pirivena Platform Launcher
echo ========================================================
echo 1. Cleaning up old processes on ports 3000, 5173, 5174, 5175...
echo ========================================================
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5174') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5175') do taskkill /f /pid %%a 2>nul

ping 127.0.0.1 -n 3 >nul

echo.
echo ========================================================
echo 2. Starting Backend API Server (http://localhost:3000)...
echo ========================================================
start "Sagaramati Backend API (Port 3000)" /D "%~dp0backend" cmd /k "npm run dev"

ping 127.0.0.1 -n 4 >nul

echo.
echo ========================================================
echo 3. Starting Frontend Web App (http://localhost:5173)...
echo ========================================================
start "Sagaramati Frontend Web App (Port 5173)" /D "%~dp0frontend" cmd /k "npx vite --port 5173 --strictPort"

ping 127.0.0.1 -n 4 >nul

echo.
echo ========================================================
echo ✅ All Servers Successfully Started!
echo ➜ Backend API: http://localhost:3000
echo ➜ Frontend App: http://localhost:5173
echo ========================================================
echo Opening http://localhost:5173 in default browser...
start http://localhost:5173
echo ========================================================
pause
