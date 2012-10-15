//module Mi.PE {
    interface BinaryReader {
        offset: number;

        readUint8(
            count : number,
            onsuccess : SuccessUint8,
            onfailure: Failure);

        readUint16(
            count : number,
            onsuccess : SuccessUint16,
            onfailure: Failure);

        readUint32(
            count : number,
            onsuccess : SuccessUint32,
            onfailure: Failure);
    }

    interface SuccessUint8 {
        (array : Uint8Array);
    }

    interface SuccessUint16 {
        (array : Uint16Array);
    }

    interface SuccessUint32 {
        (array : Uint32Array);
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
            onsuccessCore,
            onfailureCore: Failure) {
            var doneReadyState = 2; // FileReader.DONE

            this.reader.onloadend = () => {
                this.reader.onloadend = null;

                if (this.reader.readyState != doneReadyState) {
                    onfailureCore(new Error(this.reader.error.name));
                    return;
                }

                var resultArrayBuffer: ArrayBuffer;

                var msg1 = "readArrayBufer completion: " + this.offset + "+" + byteCount + " = ";
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

        readUint8(
            count: number,
            onsuccess: SuccessUint8,
            onfailure: Failure) {
            this.readArrayBufer(
                count,
                arrayBuffer => {
                    var result = new Uint8Array(arrayBuffer, 0, count);
                    onsuccess(result);
                },
                onfailure);
        }

        readUint16(
            count: number,
            onsuccess: SuccessUint16,
            onfailure: Failure) {
            this.readArrayBufer(
                count*2,
                arrayBuffer => {
                    var result = new Uint16Array(arrayBuffer, 0, count);
                    onsuccess(result);
                },
                onfailure);
        }

        readUint32(
            count: number,
            onsuccess: SuccessUint32,
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