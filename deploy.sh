#!/bin/bash

# Script để build và deploy Duck Race App lên VPS
# Cách sử dụng: ./deploy.sh [VPS_IP] [USERNAME]

set -e

VPS_IP=${1:-"your-vps-ip"}
USERNAME=${2:-"root"}
APP_NAME="duck-race-app"
DOCKER_IMAGE="duck-race:latest"

echo "🦆 Bắt đầu deploy Duck Race App..."

# Build Docker image
echo "📦 Building Docker image..."
docker build -t $DOCKER_IMAGE .

# Save image to tar file
echo "💾 Saving Docker image to file..."
docker save $DOCKER_IMAGE > duck-race-app.tar

# Copy files to VPS
echo "📤 Copying files to VPS..."
scp duck-race-app.tar docker-compose.yml $USERNAME@$VPS_IP:~/

# Deploy on VPS
echo "🚀 Deploying on VPS..."
ssh $USERNAME@$VPS_IP << 'EOF'
    # Load Docker image
    echo "📥 Loading Docker image..."
    docker load < duck-race-app.tar
    
    # Stop existing container if running
    echo "🛑 Stopping existing containers..."
    docker-compose down || true
    
    # Start new container
    echo "▶️ Starting new container..."
    docker-compose up -d
    
    # Clean up
    rm duck-race-app.tar
    
    echo "✅ Deploy completed!"
    echo "🌐 App is now running at: http://$(curl -s ifconfig.me):3000"
EOF

# Clean up local files
rm duck-race-app.tar

echo "🎉 Deploy hoàn tất! Ứng dụng Duck Race đã sẵn sàng trên VPS."