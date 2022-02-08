
export class WorkerManager {
    constructor(workerURL, standardIO, readyCallBack) {
        this.workerURL = workerURL
        this.worker = null
        this.standardIO = standardIO
        this.readyCallBack = readyCallBack

        this.initialiseWorker()
    }

    async initialiseWorker() {
        if (!this.worker) {
            console.log("Starting worker", this.workerURL);
            this.worker = new Worker(this.workerURL)
            this.worker.addEventListener('message', this.on_message);
            this.worker.addEventListener('messageerror', this.on_error);
            this.worker.addEventListener('unhandledrejection', this.on_error);
            this.worker.addEventListener('error', this.on_error);
            console.log("Worker started", this.worker);
        }
    }

    on_message = (event) => {
        console.log("message from worker", event.data);
        const type = event.data.$;
        if (type === 'inited') {
            console.log("CPython runtime loaded");
            this.msg('run');
        } else if (type === 'ready') {
            this.readyCallBack()
        } else if (type === 'exit') {
            this.standardIO.stderr(`Exited with status: ${event.data.retcode}\r\n`)
        } else {
            // TODO: Pass up
        }
    }

    on_error = (error) => {
        console.error("Error from worker", error);
    } 

    msg(kind, args) {
        // TODO: guard rails
        const msg = {$: kind, ...(args || {})};
        console.log("Sending message", this.worker, msg);
        this.worker.postMessage(msg);
    }
}
