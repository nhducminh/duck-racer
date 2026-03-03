#!/bin/bash

# Script deploy nhanh cho VPS không có Docker
# Cài đặt và chạy ứng dụng trực tiếp trên VPS

set -e

VPS_IP=${1:-"your-vps-ip"}
USERNAME=${2:-"root"}

echo "🦆 Deploy Duck Race App không dùng Docker..."

# Tạo package để deploy
echo "📦 Tạo package..."
npm run build
tar -czf duck-race-app.tar.gz dist/ public/ package.json

# Copy lên VPS
echo "📤 Upload lên VPS..."
scp duck-race-app.tar.gz $USERNAME@$VPS_IP:~/

# Cài đặt và chạy trên VPS
ssh $USERNAME@$VPS_IP << 'EOF'
    # Cài đặt Node.js nếu chưa có
    if ! command -v node &> /dev/null; then
        echo "📥 Cài đặt Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    # Cài đặt PM2 để quản lý process
    if ! command -v pm2 &> /dev/null; then
        echo "📥 Cài đặt PM2..."
        sudo npm install -g pm2
    fi
    
    # Giải nén và cài đặt
    echo "📂 Giải nén và cài đặt..."
    rm -rf duck-race-app
    mkdir duck-race-app
    cd duck-race-app
    tar -xzf ../duck-race-app.tar.gz
    npm install --production
    
    # Tạo file ecosystem cho PM2
    cat > ecosystem.config.js << 'EOFPM2'
module.exports = {
  apps: [{
    name: 'duck-race-app',
    script: 'dist/app.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOFPM2
    
    # Dừng app cũ và start app mới
    pm2 stop duck-race-app || true
    pm2 delete duck-race-app || true
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    
    # Mở port 3000
    sudo ufw allow 3000 || true
    
    echo "✅ Deploy hoàn tất!"
    echo "🌐 Ứng dụng đang chạy tại: http://$(curl -s ifconfig.me):3000"
EOF

# Clean up
rm duck-race-app.tar.gz

echo "🎉 Deploy hoàn tất!"