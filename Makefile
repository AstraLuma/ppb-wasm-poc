.PHONY: all clean
all: python.js python.wasm python.data

clean:
	git clean -X -f

python.js python.wasm:
	wget https://ethanhs.github.io/python-wasm/$(notdir $@) -O $@

# FIXME: Recursion
python.data:  # wasmpy/*
	wget https://ethanhs.github.io/python-wasm/$(notdir $@) -O $@
# FIXME: This breaks the bundle in strange ways.
# 	zip $@ $^
