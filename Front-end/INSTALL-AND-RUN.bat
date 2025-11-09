@echo off
echo ========================================
echo   INSTALLING AND RUNNING THE PROJECT
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Then restart this script.
    echo.
    pause
    exit /b 1
)

echo [1/3] Checking Node.js installation...
node --version
npm --version
echo.

echo [2/3] Installing dependencies...
if exist "node_modules" (
    echo node_modules folder found, checking dependencies...
    echo.
    npm install --prefer-offline --no-audit
) else (
    echo node_modules not found, installing all dependencies...
    echo This may take 5-10 minutes, please wait...
    echo.
    npm install
)

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: npm install failed!
    echo Please check the error messages above.
    echo.
    pause
    exit /b 1
)

echo.
echo [3/3] Starting the app...
echo Make sure your Android phone is connected OR emulator is running!
echo.
pause

npx react-native run-android

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to run the app!
    echo Please check:
    echo 1. Android phone is connected (USB debugging enabled)
    echo 2. OR Android Studio emulator is running
    echo 3. Check error messages above
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   SUCCESS! App is running!
echo ========================================
pause

