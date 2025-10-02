#!/bin/bash

# Install Coturn STUN/TURN Server Script
# Tested on Ubuntu/Debian

# Variables
PUBLIC_IP=$(curl -s ifconfig.me) # Automatically detect public IP
TURN_USERNAME="webrtc"
TURN_PASSWORD="securepassword"
REALM="yourdomain.com"
LOG_FILE="/var/log/turn.log"

# Step 1: Install Coturn
echo "Installing Coturn..."
apt update
apt install -y coturn

# Step 2: Enable Coturn
echo "Enabling Coturn..."
sed -i 's/TURNSERVER_ENABLED=0/TURNSERVER_ENABLED=1/' /etc/default/coturn

# Step 3: Configure Coturn
echo "Configuring Coturn..."
bash -c "cat > /etc/turnserver.conf << EOL
listening-ip=0.0.0.0
relay-ip=0.0.0.0
external-ip=$PUBLIC_IP
realm=$REALM
lt-cred-mech
user=$TURN_USERNAME:$TURN_PASSWORD
log-file=$LOG_FILE
verbose
EOL"

# Step 4: Set Permissions for Log File
echo "Setting permissions for log file..."
touch $LOG_FILE
chown turnserver:turnserver $LOG_FILE

# Step 5: Start and Enable Coturn Service
echo "Starting Coturn service..."
systemctl start coturn
systemctl enable coturn

# Step 6: Verify Coturn Status
echo "Checking Coturn status..."
systemctl status coturn --no-pager

# Step 7: Test the Server
echo "Testing the STUN/TURN server..."
turnutils_uclient -v -u $TURN_USERNAME -w $TURN_PASSWORD $PUBLIC_IP

echo "Coturn installation and configuration complete!"
echo "STUN/TURN server is running on $PUBLIC_IP:3478"
echo "Username: $TURN_USERNAME"
echo "Password: $TURN_PASSWORD"