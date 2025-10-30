npm run build
cp -r build/* /var/www/html/
systemctl restart nginx.service
#sudo nano /etc/nginx/sites-available/default