sudo wget https://github.com/csskevin/web-glasses/releases/download/v1.0/web-glasses-server_armv7 --directory-prefix=/bin/
sudo chmod +x /bin/web-glasses-server_armv7
sudo wget https://raw.githubusercontent.com/csskevin/web-glasses/master/scripts/linux/webglasses.service --directory-prefix=/etc/systemd/system
sudo systemctl enable webglasses.service
sudo systemctl start webglasses.service