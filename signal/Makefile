all:
	mkdir -p /opt/wator.auto.run/
	cp -f /opt/watorvapor/rtc.wator/signal/peer.rsa.server.service /opt/wator.auto.run/
	systemctl enable /opt/wator.auto.run/peer.rsa.server.service
	systemctl start peer.rsa.server
