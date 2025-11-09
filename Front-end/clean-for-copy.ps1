# Script to clean build artifacts before copying project to pendrive
# This removes build folders and caches to reduce path length issues

Write-Host "=== Preparing Project for Pendrive ===" -ForegroundColor Cyan
Write-Host ""

# Remove Android build folders
Write-Host "Cleaning Android build folders..." -ForegroundColor Yellow
if (Test-Path "android\app\build") {
    Remove-Item -Path "android\app\build" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Removed android\app\build" -ForegroundColor Green
}

if (Test-Path "android\app\.cxx") {
    Remove-Item -Path "android\app\.cxx" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Removed android\app\.cxx" -ForegroundColor Green
}

if (Test-Path "android\build") {
    Remove-Item -Path "android\build" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Removed android\build" -ForegroundColor Green
}

if (Test-Path "android\.gradle") {
    Remove-Item -Path "android\.gradle" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Removed android\.gradle" -ForegroundColor Green
}

# Remove iOS build folders
Write-Host "Cleaning iOS build folders..." -ForegroundColor Yellow
if (Test-Path "ios\build") {
    Remove-Item -Path "ios\build" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Removed ios\build" -ForegroundColor Green
}

if (Test-Path "ios\Pods") {
    Remove-Item -Path "ios\Pods" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Removed ios\Pods" -ForegroundColor Green
}

if (Test-Path "ios\.xcode.env.local") {
    Remove-Item -Path "ios\.xcode.env.local" -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Removed ios\.xcode.env.local" -ForegroundColor Green
}

# Remove Metro cache
Write-Host "Cleaning Metro cache..." -ForegroundColor Yellow
if (Test-Path ".metro") {
    Remove-Item -Path ".metro" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Removed .metro" -ForegroundColor Green
}

# Remove temporary files
Write-Host "Cleaning temporary files..." -ForegroundColor Yellow
Get-ChildItem -Path "." -Filter "*.log" -File | Remove-Item -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path "." -Filter "build*.log" -File | Remove-Item -Force -ErrorAction SilentlyContinue
Write-Host "  ✓ Removed log files" -ForegroundColor Green

Write-Host ""
Write-Host "=== Project Ready for Pendrive ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Copy this entire folder to pendrive" -ForegroundColor White
Write-Host "2. Give pendrive to your friend" -ForegroundColor White
Write-Host "3. Friend should copy to laptop (use short path like C:\Projects\vimmi404)" -ForegroundColor White
Write-Host "4. Friend should run: INSTALL-AND-RUN.bat" -ForegroundColor White
Write-Host ""
Write-Host "Note: node_modules is kept for faster setup on friend's laptop" -ForegroundColor Cyan
Write-Host "      (If pendrive is small, you can delete node_modules folder)" -ForegroundColor Cyan
Write-Host ""

