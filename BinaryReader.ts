module Mi.PE {
    export interface BinaryReader {
        offset: number;

        readUint32(
            count : number,
            onsuccess : { (array: Uint32Array); },
            onfailure: Failure);
    }

    export interface Failure {
        (error: Error);
    }

    export class FileBinaryReader implements BinaryReader {
        private file: File;
        private reader: FileReader;

        offset: number;

        constructor (file: File) {
            this.offset = 0;
            this.file = file;
            this.reader = new FileReader();
        }

        private readArrayBufer(
            byteCount: number,
            onsuccessCore: { (buffer: ArrayBuffer); },
            onfailureCore: Failure) {
            var doneReadyState = 2; // FileReader.DONE

            this.reader.onloadend = () => {
                this.reader.onloadend = null;

                if (this.reader.readyState != doneReadyState) {
                    onfailureCore(new Error(this.reader.error.name));
                    return;
                }

                var resultArrayBuffer: ArrayBuffer;
                resultArrayBuffer = this.reader.result;

                this.offset += byteCount;

                onsuccessCore(resultArrayBuffer);
            };

            var slice = this.file.slice(this.offset, this.offset + byteCount);

            if (this.offset != 0 || byteCount != this.file.size)
                this.reader.readAsArrayBuffer(slice);
            else
                this.reader.readAsArrayBuffer(this.file);
        }           

        readUint32(
            count: number,
            onsuccess: { (array: Uint32Array); },
            onfailure: Failure) {

            this.readArrayBufer(
                count*4,
                arrayBuffer => {
                    var result = new Uint32Array(arrayBuffer, 0, count);
                    onsuccess(result);
                },
                onfailure);
        }
    }

    export class HttpBinaryReader implements BinaryReader {
        private request: XMLHttpRequest;
        private result: ArrayBuffer;
        private resultError: ErrorEvent;
        private queuedRead: { count: number; onsuccess: { (array: Uint32Array); }; onfailure: Failure; };

        offset: number;

        constructor (url: string) {
            this.offset = 0;
            this.request = new XMLHttpRequest();
            
            this.request.open("GET", url, true);
            this.request.responseType = "arraybuffer";

            this.request.onerror = e => this.requestError(e);
            this.request.onloadend = e => this.requestLoadEnd(e);

            this.request.send();
        }

        readUint32(
            count: number,
            onsuccess: { (array: Uint32Array); },
            onfailure: Failure) {

            if (this.resultError) {
                onfailure(new Error(this.resultError.message));
                return;
            }

            if (this.result) {
                var array = new Uint32Array(this.result, this.offset, count);
                this.offset += count * 4;
                onsuccess(array);
                return;
            }

            this.queuedRead = { count: count, onsuccess: onsuccess, onfailure: onfailure };
        }

        private requestError(e: ErrorEvent) {
            this.resultError = e;
            
            if (this.queuedRead) {
                var onfailure = this.queuedRead.onfailure;
                this.queuedRead = null;
                onfailure(new Error(e.message));
            }
        }

        private requestLoadEnd(e: ProgressEvent) {
            this.result = this.request.response;

            if (this.queuedRead) {
                var count = this.queuedRead.count;
                var onsuccess = this.queuedRead.onsuccess;

                var array = new Uint32Array(this.result, this.offset, count);
                this.offset += count * 4;
                onsuccess(array);
            }
        }
    }
}