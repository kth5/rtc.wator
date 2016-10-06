all:
	mkdir -p /opt/wator.auto.run/
	cp -f /opt/watorvapor/rtc.wator/signal/peer.rsa.server /opt/wator.auto.run/
	cp -f /opt/watorvapor/rtc.wator/signal/peer.rsa.server.service /opt/wator.auto.run/peer.rsa.service
	cd  /opt/wator.auto.run && systemctl enable peer.rsa.service
	systemctl start peer.rsa.service
