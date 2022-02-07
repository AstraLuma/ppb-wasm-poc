.PHONY: all
all: python.js python.wasm python.data

python.js python.wasm:
	wget https://repl.ethanhs.me/worker/$(notdir $@) -O $@

# FIXME: Recursion
python.data: lib/*
	wget https://repl.ethanhs.me/worker/$(notdir $@) -O $@
	zip $@ $^