all:
	mkdir -p /opt/wator.auto.run/
	cp -f /opt/watorvapor/rtc.wator/signal/peer.rsa.server.service /opt/wator.auto.run/
	cd  /opt/wator.auto.run && systemctl enable peer.rsa.server.service
	systemctl start peer.rsa.server.service
