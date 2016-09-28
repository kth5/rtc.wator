all:
	cp -f wator.rtc /etc/nginx/sites-available/
	ln -sf /etc/nginx/sites-available/wator.rtc /etc/nginx/sites-enabled/wator.rtc
	systemctl stop nginx.service
	systemctl start nginx.service
	
