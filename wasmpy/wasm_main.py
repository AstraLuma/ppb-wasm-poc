import os
import sys


# Shuffle stdio
instream = sys.stdin
sys.stdin = open(os.devnull)
outstream = sys.stdout
sys.stdout = sys.stderr


outstream.write("$READY$\n")
outstream.flush()

for msg in instream:
    outstream.write(msg)
