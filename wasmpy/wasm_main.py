import os
import sys


# Shuffle stdio
instream = sys.stdin
sys.stdin = open(os.devnull)
outstream = sys.stdout
sys.stdout = sys.stderr


outstream.write("$READY$\n")
outstream.flush()

# print("Starting loop", flush=True)
while True:
    # This breaks when the buffer empties
    data = instream.read()
    if data:
        print(f"{data=}")

outstream.write("$EXIT$\n")
outstream.flush()
