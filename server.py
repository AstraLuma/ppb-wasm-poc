#!/usr/bin/env python

import argparse
from http import server

parser = argparse.ArgumentParser(description='Start a local webserver with a Python terminal.')
parser.add_argument('--port', type=int, default=8000, help='port for the http server to listen on')
args = parser.parse_args()


class MyHTTPRequestHandler(server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        super().end_headers()


server.test(HandlerClass=MyHTTPRequestHandler, protocol="HTTP/1.1", port=args.port, bind='127.0.0.1')
