import os
import sys


# Shuffle stdio
instream = sys.stdin
sys.stdin = open(os.devnull)
outstream = sys.stdout
sys.stdout = sys.stderr


outstream.write("$READY$\n")
outstream.flush()

while True:
    # This breaks when the buffer empties
    for msg in instream:
        print(f"{msg=}")
        outstream.write(msg)
        outstream.flush()

outstream.write("$EXIT$\n")
outstream.flush()
