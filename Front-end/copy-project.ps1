# Script to copy React Native project using robocopy (handles long paths better)
# Usage: .\copy-project.ps1 -DestinationPath "C:\Projects\MyApp"

param(
    [Parameter(Mandatory=$true)]
    [string]$DestinationPath
)

Write-Host "=== Copying React Native Project ===" -ForegroundColor Cyan
Write-Host ""

# Get current project directory
$SourcePath = Get-Location
Write-Host "Source: $SourcePath" -ForegroundColor Yellow
Write-Host "Destination: $DestinationPath" -ForegroundColor Yellow
Write-Host ""

# Check if destination exists
if (Test-Path $DestinationPath) {
    $response = Read-Host "Destination folder exists. Overwrite? (Y/N)"
    if ($response -ne "Y" -and $response -ne "y") {
        Write-Host "Copy cancelled." -ForegroundColor Red
        exit
    }
    Write-Host "Removing existing destination..." -ForegroundColor Yellow
    Remove-Item -Path $DestinationPath -Recurse -Force -ErrorAction SilentlyContinue
}

# Create destination directory
New-Item -ItemType Directory -Path $DestinationPath -Force | Out-Null

Write-Host "Copying project files..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Yellow
Write-Host ""

# Define folders/files to exclude
$ExcludeFiles = @(
    "node_modules",
    "android\app\build",
    "android\app\.cxx",
    "android\build",
    "android\.gradle",
    "ios\build",
    "ios\Pods",
    "ios\.xcode.env.local",
    ".metro",
    ".expo",
    "dist",
    "web-build",
    "*.log",
    ".git"
)

# Build robocopy exclude switches
$ExcludeSwitches = $ExcludeFiles | ForEach-Object { "/XD $_" }
$ExcludeSwitches += $ExcludeFiles | ForEach-Object { "/XF $_" }

# Use robocopy with long path support
# /E = copy subdirectories including empty ones
# /COPYALL = copy all file information
# /R:3 = retry 3 times on failure
# /W:5 = wait 5 seconds between retries
# /MT:8 = use 8 threads for faster copying
# /NP = no progress (less output)
# /NFL = no file list
# /NDL = no directory list

$RobocopyArgs = @(
    $SourcePath,
    $DestinationPath,
    "/E",
    "/COPYALL",
    "/R:3",
    "/W:5",
    "/MT:8",
    "/XD",
    "node_modules",
    "android\app\build",
    "android\app\.cxx",
    "android\build",
    "android\.gradle",
    "ios\build",
    "ios\Pods",
    "ios\.xcode.env.local",
    ".metro",
    ".expo",
    "dist",
    "web-build",
    ".git",
    "/XF",
    "*.log",
    "build*.log",
    "/NP",
    "/NFL",
    "/NDL"
)

try {
    $Result = & robocopy @RobocopyArgs
    
    # Robocopy returns different exit codes
    # 0-7 are success codes, 8+ are error codes
    if ($LASTEXITCODE -le 7) {
        Write-Host ""
        Write-Host "=== Copy Complete ===" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Navigate to: $DestinationPath" -ForegroundColor White
        Write-Host "2. Run: .\setup-new-project.ps1" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "Copy completed with warnings (exit code: $LASTEXITCODE)" -ForegroundColor Yellow
        Write-Host "Some files may have been skipped. Check the output above." -ForegroundColor Yellow
        Write-Host ""
    }
} catch {
    Write-Host ""
    Write-Host "Error during copy: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Use Windows File Explorer with a shorter path" -ForegroundColor Yellow
    Write-Host "Or enable Windows long path support:" -ForegroundColor Yellow
    Write-Host "1. Run as Administrator: Enable-LongPathSupport.ps1" -ForegroundColor White
    exit 1
}

