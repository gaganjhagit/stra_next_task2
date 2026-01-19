# XAMPP MySQL Fix Script
# This script helps diagnose and fix common XAMPP MySQL shutdown issues

Write-Host "=== XAMPP MySQL Diagnostic & Fix Script ===" -ForegroundColor Cyan
Write-Host ""

# 1. Check if port 3306 is in use
Write-Host "1. Checking port 3306..." -ForegroundColor Yellow
$port3306 = netstat -ano | findstr :3306
if ($port3306) {
    Write-Host "   WARNING: Port 3306 is in use!" -ForegroundColor Red
    Write-Host "   $port3306" -ForegroundColor Red
    Write-Host "   Solution: Stop the process using port 3306 or change XAMPP MySQL port" -ForegroundColor Yellow
} else {
    Write-Host "   ✓ Port 3306 is free" -ForegroundColor Green
}

# 2. Check MySQL Windows Service
Write-Host ""
Write-Host "2. Checking MySQL Windows Services..." -ForegroundColor Yellow
$mysqlServices = Get-Service | Where-Object { $_.DisplayName -like "*mysql*" -or $_.Name -like "*mysql*" }
if ($mysqlServices) {
    Write-Host "   Found MySQL services:" -ForegroundColor Yellow
    $mysqlServices | Format-Table Name, DisplayName, Status -AutoSize
    Write-Host "   Solution: Stop these services if they conflict with XAMPP" -ForegroundColor Yellow
} else {
    Write-Host "   ✓ No conflicting MySQL services found" -ForegroundColor Green
}

# 3. Check XAMPP MySQL data directory
Write-Host ""
Write-Host "3. Checking XAMPP MySQL data directory..." -ForegroundColor Yellow
$dataDir = "C:\xampp\mysql\data"
if (Test-Path $dataDir) {
    $fileCount = (Get-ChildItem $dataDir -ErrorAction SilentlyContinue | Measure-Object).Count
    Write-Host "   ✓ Data directory exists with $fileCount files" -ForegroundColor Green
} else {
    Write-Host "   ✗ Data directory not found!" -ForegroundColor Red
}

# 4. Check for error logs
Write-Host ""
Write-Host "4. Checking for MySQL error logs..." -ForegroundColor Yellow
$errorLogs = Get-ChildItem "C:\xampp\mysql\data\*.err" -ErrorAction SilentlyContinue
if ($errorLogs) {
    Write-Host "   Found error log(s):" -ForegroundColor Yellow
    foreach ($log in $errorLogs) {
        Write-Host "   - $($log.Name)" -ForegroundColor Yellow
        Write-Host "   Last 10 lines:" -ForegroundColor Gray
        Get-Content $log.FullName -Tail 10 | ForEach-Object { Write-Host "     $_" -ForegroundColor Gray }
    }
} else {
    Write-Host "   No error logs found" -ForegroundColor Gray
}

# 5. Recommendations
Write-Host ""
Write-Host "=== RECOMMENDED FIXES ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Try these solutions in order:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Run XAMPP Control Panel as Administrator" -ForegroundColor White
Write-Host "   - Right-click XAMPP Control Panel" -ForegroundColor Gray
Write-Host "   - Select 'Run as administrator'" -ForegroundColor Gray
Write-Host "   - Try starting MySQL again" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Stop Standalone MySQL Service (if installed)" -ForegroundColor White
Write-Host "   - Open Services (services.msc)" -ForegroundColor Gray
Write-Host "   - Find 'MySQL' service and stop it" -ForegroundColor Gray
Write-Host "   - Set it to 'Manual' startup" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Reinitialize MySQL Data Directory" -ForegroundColor White
Write-Host "   - Backup: C:\xampp\mysql\data (if you have important data)" -ForegroundColor Gray
Write-Host "   - Stop XAMPP MySQL" -ForegroundColor Gray
Write-Host "   - Delete contents of: C:\xampp\mysql\data" -ForegroundColor Gray
Write-Host "   - Run: C:\xampp\mysql\bin\mysql_install_db.exe" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Check Windows Event Viewer" -ForegroundColor White
Write-Host "   - Open Event Viewer" -ForegroundColor Gray
Write-Host "   - Check Windows Logs > Application" -ForegroundColor Gray
Write-Host "   - Look for MySQL errors" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Change MySQL Port (if port conflict)" -ForegroundColor White
Write-Host "   - Edit: C:\xampp\mysql\bin\my.ini" -ForegroundColor Gray
Write-Host "   - Change port=3306 to port=3307" -ForegroundColor Gray
Write-Host "   - Update your .env file: DB_HOST=localhost:3307" -ForegroundColor Gray
Write-Host ""

Write-Host "=== Script Complete ===" -ForegroundColor Cyan

