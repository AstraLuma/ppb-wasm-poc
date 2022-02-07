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
    for msg in instream:
        print(msg)
        outstream.write(msg)

outstream.write("$READY$\n")
outstream.flush()
