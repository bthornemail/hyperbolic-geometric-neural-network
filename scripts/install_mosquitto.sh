#!/bin/bash

# Update package lists and install Mosquitto
apt-get update -y
apt-get install -y mosquitto mosquitto-clients

# Enable Mosquitto to start on boot
systemctl enable mosquitto

# Create the Mosquitto configuration file
MOSQUITTO_CONF_DIR="/etc/mosquitto/conf.d"
MOSQUITTO_CONF_FILE="$MOSQUITTO_CONF_DIR/custom_mosquitto.conf"

if [ ! -d "$MOSQUITTO_CONF_DIR" ]; then
  echo "Mosquitto configuration directory not found!"
  exit 1
fi

cat << EOF > $MOSQUITTO_CONF_FILE
log_type error
log_type warning
log_type notice
log_type information

# pid_file /home/bthorne/github/vault_ai/services/mqtt.service/mosquitto.pid

persistence true
# persistence_location ./

# log_dest file /home/bthorne/github/vault_ai/services/mqtt.service/mosquitto.log

per_listener_settings true

listener 1883
allow_anonymous true
# acl_file acl_file

listener 2883
allow_anonymous true
protocol websockets

listener 3883
allow_anonymous true
protocol websockets
# http_dir /var/www/html/
# acl_file acl_file

listener 4883
protocol websockets
mount_point unity2D
# http_dir /var/www/html

listener 8883
# password_file ./pw_file
protocol websockets
mount_point unity2D
EOF

# Restart Mosquitto to apply the new configuration
systemctl restart mosquitto

# Print success message
echo "Mosquitto installed and configured successfully!"
echo "Configuration file: $MOSQUITTO_CONF_FILE"
