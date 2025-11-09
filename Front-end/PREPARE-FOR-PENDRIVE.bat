@echo off
echo ========================================
echo   PREPARING PROJECT FOR PENDRIVE
echo ========================================
echo.
echo This will clean build folders to make copying easier.
echo.

REM Remove Android build folders
echo Cleaning Android build folders...
if exist "android\app\build" (
    rmdir /s /q "android\app\build"
    echo   [OK] Removed android\app\build
)
if exist "android\app\.cxx" (
    rmdir /s /q "android\app\.cxx"
    echo   [OK] Removed android\app\.cxx
)
if exist "android\build" (
    rmdir /s /q "android\build"
    echo   [OK] Removed android\build
)
if exist "android\.gradle" (
    rmdir /s /q "android\.gradle"
    echo   [OK] Removed android\.gradle
)

REM Remove iOS build folders
echo Cleaning iOS build folders...
if exist "ios\build" (
    rmdir /s /q "ios\build"
    echo   [OK] Removed ios\build
)
if exist "ios\Pods" (
    rmdir /s /q "ios\Pods"
    echo   [OK] Removed ios\Pods
)

REM Remove Metro cache
echo Cleaning Metro cache...
if exist ".metro" (
    rmdir /s /q ".metro"
    echo   [OK] Removed .metro
)

REM Remove log files
echo Cleaning log files...
del /q *.log 2>nul
del /q build*.log 2>nul
echo   [OK] Removed log files

echo.
echo ========================================
echo   PROJECT READY FOR PENDRIVE!
echo ========================================
echo.
echo NOTE: node_modules folder is kept for faster setup.
echo If you want to remove it (smaller size), delete it manually.
echo.
echo Next steps:
echo 1. Copy this entire folder to pendrive
echo 2. Give pendrive to your friend
echo 3. Friend should copy to laptop and run INSTALL-AND-RUN.bat
echo.
pause

