# Script to set up the project after copying to a new location
# This installs dependencies and sets up the project

Write-Host "=== Setting Up New Project ===" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the project directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Write-Host "This may take several minutes..." -ForegroundColor Yellow
Write-Host ""

npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Error: npm install failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Clean Android build (if exists)
if (Test-Path "android") {
    Write-Host "Cleaning Android build..." -ForegroundColor Yellow
    Push-Location android
    .\gradlew clean
    Pop-Location
    Write-Host "✓ Android build cleaned" -ForegroundColor Green
    Write-Host ""
}

# Verify setup
Write-Host "=== Setup Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Project is ready to use!" -ForegroundColor Green
Write-Host ""
Write-Host "To run the app:" -ForegroundColor Yellow
Write-Host "  Android: npx react-native run-android" -ForegroundColor White
Write-Host "  iOS:     npx react-native run-ios" -ForegroundColor White
Write-Host ""
Write-Host "To start Metro bundler:" -ForegroundColor Yellow
Write-Host "  npx react-native start" -ForegroundColor White
Write-Host ""

