.PHONY : setup laravel service
NAME := $(basename $(notdir $(shell pwd)))
setup:
	docker build -t wator/$(NAME)  ./docker

APP := rtc
laravel:
	cd $(APP)/ && composer update
	mkdir -p $(APP)/storage/app
	mkdir -p $(APP)/storage/framework
	mkdir -p $(APP)/storage/framework/views
	mkdir -p $(APP)/storage/framework/sessions
	mkdir -p $(APP)/storage/framework/cache
	mkdir -p $(APP)/storage/logs
	mkdir -p $(APP)/bootstrap/cache
	-chmod 777 -R $(APP)/storage
	-chmod 777 -R $(APP)/bootstrap/cache

service:
	mkdir -p /opt/wator.auto.run/
	cp -f /opt/watorvapor/rtc.wator/rtc.wator.service /opt/wator.auto.run/
	cp -f /opt/watorvapor/rtc.wator/rtc.wator.server /opt/wator.auto.run/
	#cd  /opt/wator.auto.run && systemctl enable rtc.wator.service
	systemctl enable /opt/wator.auto.run/rtc.wator.service
	systemctl start rtc.wator
