.PHONY : setup laravel
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
	
