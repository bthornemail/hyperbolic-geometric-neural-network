#!/bin/bash

# Install Coturn STUN/TURN Server Script
# Tested on Ubuntu/Debian

# Variables
PUBLIC_IP=$(curl -s ifconfig.me) # Automatically detect public IP
TURN_USERNAME="webrtc"
TURN_PASSWORD="securepassword"
REALM="yourdomain.com"
LOG_FILE="/var/log/turn.log"

# Ensure ports 3478 (STUN/TURN) and 5349 (TLS) are open in your firewall:
ufw allow 3478
ufw allow 5349
ufw reload