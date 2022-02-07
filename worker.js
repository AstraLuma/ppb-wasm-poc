const NEWLINE = 10; // ASCII/UTF-8 newline

class StdinStream {
    constructor(text) {
        const in_buffer = (new TextEncoder()).encode(text);
        this.in_stream = in_buffer.values();
    }

    get = () => {
        const { value, done } = this.in_stream.next();
        if (done) {
//            console.log("worker: stdin: done");
            return null;
        } else {
//            console.log("worker: stdin:", value);
            return value;
        }
    }
}

class OutBuffer {
    constructor(on_line) {
        this.on_line = on_line;
        this.buffer = [];
    }
    feed = (charCode) => {
//        console.log("stdout", typeof charCode, charCode);
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

const stdin = new StdinStream("import lib.wasm_main\n")
const stdout = new OutBuffer((line) => console.log("out", line));
const stderr = new OutBuffer((line) => console.log("err", line));


// https://emscripten.org/docs/api_reference/module.html
var Module = {
    noInitialRun: true,
    stdin: stdin.get,
    stdout: stdout.feed,
    stderr: stderr.feed,
    onRuntimeInitialized: () => {
        console.log("onRuntimeInitialized");
        postMessage({type: 'inited'})
    },
    onAbort: () => {
        console.log("onAbort");
        stdout.flush();
        stderr.flush();
    },
}

onmessage = (event) => {
    if (event.data.type === 'run') {
        // TODO: Set up files from event.data.files
        // https://emscripten.org/docs/api_reference/Filesystem-API.html
        const ret = callMain(['-v'] /*event.data.args*/)
        postMessage({
            type: 'exit',
            returnCode: ret
        })
    }
}

console.log("Loading CPython");
importScripts('python.js')
