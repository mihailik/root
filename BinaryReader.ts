//module Mi.PE {
    interface BinaryReader {
        offset: number;

        readUint32(
            count : number,
            onsuccess : { (array: Uint32Array); },
            onfailure: Failure);
    }

    interface Failure {
        (error: Error);
    }

    class FileBinaryReader implements BinaryReader {
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

                this.offset += byteCount;

                resultArrayBuffer = this.reader.result;

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
//}