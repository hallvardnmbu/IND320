#!/bin/bash

# Update and upgrade
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

cd ~/api

# Start the API with PM2
pm2 start app.js --name api

# Save the PM2 process list and set it to startup on reboot
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ${USER} --hp /home/${USER}
