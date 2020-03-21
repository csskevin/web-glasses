sudo systemctl stop webglasses
sudo systemctl disable webglasses
sudo rm /etc/systemd/system/webglasses.service
sudo systemctl daemon-reload
sudo systemctl reset-failed
sudo rm /bin/web-glasses-server_armv7