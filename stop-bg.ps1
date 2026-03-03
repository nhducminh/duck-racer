# Script dừng Duck Race App đang chạy ngầm
Write-Host "Đang dừng ứng dụng 'duck-race'..." -ForegroundColor Red
pm2 delete "duck-race"

Write-Host "------------------------------------------------"
Write-Host "Đã dừng và gỡ bỏ ứng dụng khởi chạy ngầm." -ForegroundColor Yellow
Write-Host "------------------------------------------------"
pause
