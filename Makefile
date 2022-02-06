.PHONY: all
all: python.js python.wasm python.data

python.js python.wasm python.data:
	wget https://repl.ethanhs.me/$(notdir $@) -O $@

