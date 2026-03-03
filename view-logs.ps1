# Script xem log của Duck Race App
Write-Host "Đang hiển thị nhật ký (logs) cho 'duck-race'..." -ForegroundColor Cyan
Write-Host "Nhấn Ctrl+C để thoát khỏi chế độ xem log."
pm2 logs "duck-race"
