# Script để setup port forwarding cho WSL2
# Chạy script này trong PowerShell với quyền Administrator trên Windows

# Xóa rule cũ nếu có
netsh interface portproxy delete v4tov4 listenport=3000 listenaddress=0.0.0.0

# Lấy IP của WSL2
$wslIP = (wsl.exe hostname -I).Trim()
Write-Host "WSL IP: $wslIP"

# Thêm port forwarding rule
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=$wslIP

# Hiển thị rules hiện tại
Write-Host "`nCurrent port forwarding rules:"
netsh interface portproxy show all

# Thêm Windows Firewall rule nếu cần
Write-Host "`nAdding Windows Firewall rule..."
New-NetFirewallRule -DisplayName "WSL Duck Race App" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow

Write-Host "`nSetup completed! Your duck race app should now be accessible at:"
Write-Host "http://192.168.10.157:3000"