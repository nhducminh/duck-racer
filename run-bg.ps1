# Script khởi động Duck Race App chạy ngầm
Write-Host "Đang kiểm tra và cài đặt PM2 nếu cần thiết..." -ForegroundColor Cyan
if (!(Get-Command pm2 -ErrorAction SilentlyContinue)) {
    npm install -g pm2
}

Write-Host "Đang khởi động ứng dụng 'duck-race'..." -ForegroundColor Green
pm2 start dist/app.js --name "duck-race"

Write-Host "------------------------------------------------"
Write-Host "Ứng dụng đã được chạy ngầm!" -ForegroundColor Yellow
Write-Host "Bạn có thể đóng terminal này."
Write-Host "Sử dụng 'pm2 list' để xem trạng thái."
Write-Host "Sử dụng 'pm2 logs duck-race' để xem nhật ký."
Write-Host "------------------------------------------------"
pause
