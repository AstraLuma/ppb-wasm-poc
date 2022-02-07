
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
            this.worker = new Worker(this.workerURL)
            this.worker.addEventListener('message', this.handleMessageFromWorker)
        }
    }

    async run(options) {
        this.worker.postMessage({
            type: 'run',
            args: options.args || [],
            files: options.files || {}
        })
    }

    handleMessageFromWorker = (event) => {
        const type = event.data.type
        if (type === 'started') {
            console.log("CPython starting");
        } else if (type === 'ready') {
            this.readyCallBack()
        } else if (type === 'exit') {
            this.standardIO.stderr(`Exited with status: ${event.data.returnCode}\r\n`)
        }
      }
}
