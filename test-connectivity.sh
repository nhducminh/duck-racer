#!/bin/bash

echo "=== Testing Duck Race App Connectivity ==="
echo

# Test local connection
echo "1. Testing local connection (localhost:3000)..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3000 || echo "Failed to connect to localhost:3000"

# Test WSL IP connection
WSL_IP=$(hostname -I | awk '{print $1}')
echo "2. Testing WSL IP connection ($WSL_IP:3000)..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://$WSL_IP:3000 || echo "Failed to connect to $WSL_IP:3000"

# Test Windows host IP connection
echo "3. Testing Windows host IP connection (192.168.10.157:3000)..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://192.168.10.157:3000 || echo "Failed to connect to 192.168.10.157:3000"

echo
echo "WSL IP: $WSL_IP"
echo "Host IP: 192.168.10.157"
echo
echo "If test 3 fails, you need to run the PowerShell script on Windows:"
echo "1. Open PowerShell as Administrator on Windows"
echo "2. Navigate to: $(pwd)"
echo "3. Run: .\setup-port-forwarding.ps1"