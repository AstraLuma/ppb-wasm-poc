console.log("Worker starting");

const NEWLINE = 10; // ASCII/UTF-8 newline

class StdinStream {
    constructor() {
        this.buffer = [];
    }

    get = () => {
        const value = this.buffer.shift();
        if (value === undefined) {
            // console.log("stdin:empty");
            return null;
        } else {
            // console.log("stdin:char", value);
            return value;
        }
    }

    feed_string(str) {
        const stream = (new TextEncoder()).encode(str);
        this.feed_binary(stream);
    }

    feed_binary(seq) {
        for (let i of seq) {
            this.buffer.push(i);
        }
    }
}


class OutBuffer {
    constructor(on_line) {
        this.on_line = on_line;
        this.buffer = [];
    }
    feed = (charCode) => {
        // console.log("buffer", charCode);
        this.buffer.push(charCode);
        var i;
        while ((i = this.buffer.indexOf(NEWLINE)) != -1) {
            const raw_line = this.buffer.slice(0, i + 1);
            this.buffer = this.buffer.slice(i + 1);
            const line = (new TextDecoder()).decode(Uint8Array.from(raw_line));
            this.on_line && this.on_line(line);
        }
    }

    flush() {
        const line = (new TextDecoder()).decode(Uint8Array.from(this.buffer));
        this.buffer = [];
        this.on_line && this.on_line(line);
    }
}


/**
 * Handles stdin/stdout-based comms with Python
 */
class CommsHandler {
    constructor() {
        this.stdin = new StdinStream();
        this.stdout = new OutBuffer(this._get_out_data);
        // True when we think the other end will correctly interpret & send messages
        this.can_message = false;

        this.get_stdin = this.stdin.get;
        this.feed_stdout = this.stdout.feed;
    }

    _get_out_data(line) {
        console.log("out", line);
        if (line == '$READY$\n') {
            this.can_message = true;
            postMessage({$: 'ready'});
        } else if (line == '$EXIT$\n') {
            postMessage({$: 'unready'});
            this.can_message = false;
        } else if (this.can_message) {
            // Parse and dispatch message
            var msg;
            try {
                msg = JSON.parse(line);
            } catch (err) {
                postMessage({
                    $: 'bad-msg',
                    m: line,
                    e: err,
                });
            }
            if (msg) {
                postMessage(msg);
            }
        } else {
            postMessage({
                $: 'log',
                l: line,
            });
        }
    }

    /// Pass a message from the tab to Python
    on_message(msg) {
        if (!this.can_message) {
            console.error("Unable to proxy message", msg);
            // ???
            return
        }
        console.log("Proxying message", msg);
        var line = JSON.stringify(msg);
        this.stdin.feed_string(line + '\n');
    }

    /// Feed the interpretor code
    feed_code(src) {
        if (this.can_message) {
            throw Error("Can't feed code when code is running");
        }
        this.stdin.feed_string(src);
        this.stdin.feed_string("\n");

    }

    /// Immediately flush textual buffers
    flush() {
        this.stdout.flush();
    }

    on_exit() {
        this.stdout.flush();
        this.can_message = false;
    }
}

console.log("IO ~shenanigans~ scaffolding initializing");
const comms = new CommsHandler();
const stderr = new OutBuffer((line) => {
    console.log("err", line);
    postMessage({
        $: 'log',
        l: line,
    });
});


fetch("/wasmpy/wasm_main.py")
.then((resp) => resp.text())
.then((txt) => {
    console.log("Got Python code");
    comms.feed_code(txt);
});


// https://emscripten.org/docs/api_reference/module.html
var Module = {
    noInitialRun: true,
    stdin: comms.get_stdin,
    stdout: comms.feed_stdout,
    stderr: stderr.feed,
    onRuntimeInitialized: () => {
        console.log("onRuntimeInitialized");
        postMessage({$: 'inited'});
    },
    onAbort: () => {
        console.log("onAbort");
        stderr.flush();
        comms.flush();
        postMessage({$: 'abort'});
    },
};

onmessage = (event) => {
    console.log("onmessage", event.data);
    if (event.data.$ == 'run') {
        const ret = callMain([/*'-v'*/]);
        postMessage({
            type: 'exit',
            returnCode: ret
        });        
    } else {
        comms.on_message(event.data);
    }
};

console.log("Loading CPython");
importScripts('python.js')
