class StdinBuffer {
    constructor() {
        /*
        this.sab = new SharedArrayBuffer(128 * Int32Array.BYTES_PER_ELEMENT)
        this.buffer = new Int32Array(this.sab)
        this.readIndex = 1;
        this.numberOfCharacters = 0;
        this.sentNull = true
        */
        this.buffer = (new TextEncoder()).encode("print('hello')");
        this.stream = this.buffer.values();
    }

    prompt() {
        console.log("worker: prompt");
        /*
        this.readIndex = 1
        Atomics.store(this.buffer, 0, -1)
        postMessage({
            type: 'stdin',
            buffer: this.sab
        })
        Atomics.wait(this.buffer, 0, -1)
        this.numberOfCharacters = this.buffer[0]
        */
    }

    stdin = () => {
        const { value, done } = this.stream.next();
        if (done) {
            console.log("worker: stdin: done");
            return null;
        } else {
            console.log("worker: stdin:", value);
            return value;
        }
        /*
        if (this.numberOfCharacters + 1 === this.readIndex) {
            if (!this.sentNull) {
                // Must return null once to indicate we're done for now.
                this.sentNull = true
                return null
            }
            this.sentNull = false
            this.prompt()
        }
        const char = this.buffer[this.readIndex]
        this.readIndex += 1
        // How do I send an EOF??
        return char
        */
    }
}

const stdoutBufSize = 128;
const stdoutBuf = new Int32Array()
let index = 0;

const stdout = (charCode) => {
    console.log("stdout", typeof charCode, charCode);
}

const stderr = (charCode) => {
    console.log("stderr", typeof charCode, charCode);
}

const stdinBuffer = new StdinBuffer()

// https://emscripten.org/docs/api_reference/module.html
var Module = {
    noInitialRun: true,
    stdin: stdinBuffer.stdin,
    stdout: stdout,
    stderr: stderr,
    onRuntimeInitialized: () => {
        postMessage({type: 'ready', stdinBuffer: stdinBuffer.sab})
    }
    // onAbort
}

onmessage = (event) => {
    if (event.data.type === 'run') {
        // TODO: Set up files from event.data.files
        // https://emscripten.org/docs/api_reference/Filesystem-API.html
        const ret = callMain(event.data.args)
        postMessage({
            type: 'finished',
            returnCode: ret
        })
    }
}

console.log("Loading python");
importScripts('python.js')
