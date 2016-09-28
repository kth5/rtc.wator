all:
	cp -f account /etc/nginx/sites-available/
	ln -sf /etc/nginx/sites-available/account /etc/nginx/sites-enabled/account
	systemctl stop nginx.service
	systemctl start nginx.service
	
