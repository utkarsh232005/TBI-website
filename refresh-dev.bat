@echo off
echo Stopping any running Next.js development server...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo Clearing Next.js cache...
rmdir /s /q .next >nul 2>&1

echo Starting development server...
npm run dev
