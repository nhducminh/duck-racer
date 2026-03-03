# 🦆 Duck Race App - Deployment Guide

Ứng dụng đua vịt với 200 thí sinh, tốc độ thay đổi động, popup kết quả và auto-scroll.

## ✨ Tính năng chính
- 🏁 **Multi-round racing**: Thi nhiều lượt với top count tùy chỉnh (1-50)
- 🦆 **200 thí sinh mặc định** + hỗ trợ upload CSV
- ⚡ **Dynamic speed**: Vịt thay đổi tốc độ trong quá trình đua
- 🎉 **Smart ending**: Dừng khi đủ số top về đích
- 🎊 **Visual effects**: Popup modal + confetti + auto scroll
- 🏆 **Winners management**: Copy, remove, reset danh sách trúng

## 📋 Yêu cầu

- Docker và Docker Compose
- SSH access đến VPS
- Port 3000 mở trên VPS

## 🚀 Cách 1: Deploy bằng script tự động

```bash
# Cấp quyền thực thi
chmod +x deploy.sh

# Deploy lên VPS
./deploy.sh VPS_IP USERNAME

# Ví dụ:
./deploy.sh 192.168.1.100 root
```

## 🐳 Cách 2: Deploy thủ công với Docker

### Bước 1: Build Docker image
```bash
docker build -t duck-race:latest .
```

### Bước 2: Chạy container
```bash
# Chạy đơn lẻ
docker run -d -p 3000:3000 --name duck-race-app duck-race:latest

# Hoặc dùng Docker Compose
docker-compose up -d
```

### Bước 3: Kiểm tra
```bash
# Xem logs
docker logs duck-race-app

# Kiểm tra status
docker ps
```

## ☁️ Cách 3: Deploy thủ công lên VPS (không Docker)

### Bước 1: Upload files lên VPS
```bash
# Tạo folder trên VPS
ssh username@vps-ip "mkdir -p ~/duck-race-app"

# Upload files
scp -r dist/ public/ package.json username@vps-ip:~/duck-race-app/
```

### Bước 2: Cài đặt trên VPS
```bash
ssh username@vps-ip << 'EOF'
cd ~/duck-race-app

# Cài đặt Node.js (nếu chưa có)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Cài đặt PM2
sudo npm install -g pm2

# Cài đặt dependencies
npm install --production

# Chạy ứng dụng
pm2 start dist/app.js --name duck-race-app
pm2 save
pm2 startup

# Mở port 3000
sudo ufw allow 3000
EOF
```

## 📁 Cách 4: Deploy vào Subfolder (Apache/Nginx)

### Với Apache
```bash
# Upload vào subfolder
sudo mkdir -p /var/www/html/duckrace
sudo cp -r dist/ public/ package.json /var/www/html/duckrace/
sudo chown -R www-data:www-data /var/www/html/duckrace

# Chạy với BASE_PATH
cd /var/www/html/duckrace
sudo BASE_PATH=/duckrace npm start &
```

### Với Nginx (reverse proxy)
```nginx
# /etc/nginx/sites-available/duckrace
server {
    listen 80;
    server_name your-domain.com;
    
    location /duckrace/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Lưu ý**: Đảm bảo set `BASE_PATH=/duckrace` khi chạy ứng dụng trong subfolder.

## 🔧 Cấu hình VPS

### Cài đặt Docker (Ubuntu/Debian)
```bash
# Cập nhật system
sudo apt update && sudo apt upgrade -y

# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Cài đặt Docker Compose
sudo apt install docker-compose -y

# Thêm user vào docker group
sudo usermod -aG docker $USER
```

### Mở port 3000
```bash
# Với ufw
sudo ufw allow 3000

# Với iptables
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
```

## 🌐 Truy cập ứng dụng

Sau khi deploy thành công:
- **Local**: http://localhost:3000
- **VPS**: http://VPS_IP:3000
- **Subfolder**: http://VPS_IP/duckrace/
- **Race URL**: http://VPS_IP/duckrace/race (không cần .html)

## 📝 Tính năng

- ✅ 200 thí sinh mặc định với tên tiếng Việt
- ✅ Upload file CSV để nhập danh sách tùy chỉnh
- ✅ Tốc độ thay đổi động trong cuộc đua
- ✅ Cấu hình top count (1-50) mỗi lần đua
- ✅ Thi nhiều lượt liên tiếp (multi-round)
- ✅ Winners management (copy/remove/reset)
- ✅ Popup modal kết quả với animation
- ✅ Auto scroll xuống phần kết quả
- ✅ Hiệu ứng confetti khi kết thúc
- ✅ Real-time progress tracking
- ✅ Hiển thị top 5 vịt dẫn đầu
- ✅ Race logic thông minh (dừng khi đủ top)
- ✅ Responsive design
- ✅ Button "Bắt đầu đua" trong lane-header

## 🔍 Troubleshooting

### Container không start
```bash
docker logs duck-race-app
```

### Port bị chiếm
```bash
# Kiểm tra port đang sử dụng
sudo netstat -tulpn | grep :3000

# Kill process đang chiếm port
sudo kill -9 PID
```

### Rebuild container
```bash
docker-compose down
docker rmi duck-race:latest
docker-compose up --build -d
```

## 🛡️ Bảo mật

- Container chạy với user không có quyền root
- Health check tự động
- Restart policy: unless-stopped

## 📊 Monitoring

```bash
# Xem resource usage
docker stats duck-race-app

# Xem logs real-time
docker logs -f duck-race-app
```