# Script to enable Windows Long Path Support (requires Administrator privileges)
# This allows Windows to handle paths longer than 260 characters

Write-Host "=== Enabling Windows Long Path Support ===" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$IsAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $IsAdmin) {
    Write-Host "Error: This script requires Administrator privileges." -ForegroundColor Red
    Write-Host ""
    Write-Host "To run as Administrator:" -ForegroundColor Yellow
    Write-Host "1. Right-click PowerShell" -ForegroundColor White
    Write-Host "2. Select 'Run as Administrator'" -ForegroundColor White
    Write-Host "3. Navigate to project directory" -ForegroundColor White
    Write-Host "4. Run: .\Enable-LongPathSupport.ps1" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "Enabling long path support..." -ForegroundColor Yellow

# Enable long path support via registry
$RegistryPath = "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem"
$PropertyName = "LongPathsEnabled"
$PropertyValue = 1

try {
    $CurrentValue = Get-ItemProperty -Path $RegistryPath -Name $PropertyName -ErrorAction SilentlyContinue
    
    if ($CurrentValue -and $CurrentValue.$PropertyName -eq 1) {
        Write-Host "✓ Long path support is already enabled" -ForegroundColor Green
    } else {
        Set-ItemProperty -Path $RegistryPath -Name $PropertyName -Value $PropertyValue -Type DWord
        Write-Host "✓ Long path support enabled" -ForegroundColor Green
        Write-Host ""
        Write-Host "Note: You may need to restart your computer for changes to take effect." -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error: Failed to enable long path support: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual steps:" -ForegroundColor Yellow
    Write-Host "1. Open Registry Editor (regedit)" -ForegroundColor White
    Write-Host "2. Navigate to: HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\FileSystem" -ForegroundColor White
    Write-Host "3. Find or create: LongPathsEnabled (DWORD)" -ForegroundColor White
    Write-Host "4. Set value to: 1" -ForegroundColor White
    Write-Host "5. Restart your computer" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "=== Long Path Support Enabled ===" -ForegroundColor Green
Write-Host ""
Write-Host "You can now copy projects with long paths." -ForegroundColor Green
Write-Host "If the change doesn't take effect, restart your computer." -ForegroundColor Yellow
Write-Host ""

