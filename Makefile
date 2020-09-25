VERSION=$(shell grep '"version"' src/manifest.json | cut -d ':' -f 2 | sed -e 's/[", ]//g')

usansible-$(VERSION).zip: src
	zip -r usansible-$(VERSION).zip src
