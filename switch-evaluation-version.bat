@echo off
setlocal enabledelayedexpansion

:: Evaluation System Version Switcher for Windows
:: This script helps you switch between localStorage and Firestore versions

set "ADMIN_DIR=src\app\admin\evaluation"
set "CURRENT_PAGE=%ADMIN_DIR%\page.tsx"
set "FIRESTORE_PAGE=%ADMIN_DIR%\page-firestore.tsx"
set "LOCALSTORAGE_PAGE=%ADMIN_DIR%\page-localstorage.tsx"

echo 🔄 Evaluation System Version Switcher
echo ======================================

:: Check if files exist
if not exist "%CURRENT_PAGE%" (
    echo ❌ Error: %CURRENT_PAGE% not found
    pause
    exit /b 1
)

if not exist "%FIRESTORE_PAGE%" (
    echo ❌ Error: %FIRESTORE_PAGE% not found
    pause
    exit /b 1
)

:: Backup current version if localStorage backup doesn't exist
if not exist "%LOCALSTORAGE_PAGE%" (
    echo 📁 Creating localStorage backup...
    copy "%CURRENT_PAGE%" "%LOCALSTORAGE_PAGE%" >nul
    echo ✅ Backup created: %LOCALSTORAGE_PAGE%
)

:: Check current version
findstr /C:"localStorage" "%CURRENT_PAGE%" >nul
if !errorlevel! equ 0 (
    set "CURRENT_VERSION=localStorage"
) else (
    set "CURRENT_VERSION=Firestore"
)

echo 📊 Current version: !CURRENT_VERSION!
echo.
echo Available options:
echo 1. Switch to Firestore version (requires deployed Firestore rules)
echo 2. Switch to localStorage version (works without Firebase setup)
echo 3. Show deployment status
echo 4. Exit
echo.

set /p choice="Choose an option (1-4): "

if "%choice%"=="1" goto firestore
if "%choice%"=="2" goto localstorage
if "%choice%"=="3" goto status
if "%choice%"=="4" goto exit
goto invalid

:firestore
echo 🔄 Switching to Firestore version...
copy "%FIRESTORE_PAGE%" "%CURRENT_PAGE%" >nul
echo ✅ Switched to Firestore version
echo.
echo ⚠️  IMPORTANT: Make sure your Firestore rules are deployed!
echo    1. Go to: https://console.firebase.google.com
echo    2. Select your project
echo    3. Go to Firestore Database → Rules
echo    4. Click 'Publish' to deploy rules
goto end

:localstorage
echo 🔄 Switching to localStorage version...
copy "%LOCALSTORAGE_PAGE%" "%CURRENT_PAGE%" >nul
echo ✅ Switched to localStorage version
echo.
echo ℹ️  This version works completely offline and doesn't require Firebase setup
goto end

:status
echo 📋 Deployment Status Check
echo ==========================
echo.
echo Firestore Rules File: firestore.rules
if exist "firestore.rules" (
    echo ✅ Found firestore.rules
    echo 📄 Rules preview:
    echo ---
    findstr /C:"evaluation_rounds" firestore.rules
    echo ---
) else (
    echo ❌ firestore.rules not found
)
echo.
echo 🔗 To deploy rules manually:
echo    1. Open: https://console.firebase.google.com
echo    2. Go to your project → Firestore Database → Rules
echo    3. Copy the contents of firestore.rules
echo    4. Paste into the rules editor
echo    5. Click 'Publish'
goto end

:invalid
echo ❌ Invalid option
pause
exit /b 1

:exit
echo 👋 Goodbye!
exit /b 0

:end
echo.
echo 🚀 Changes applied! Restart your development server if needed.
pause
