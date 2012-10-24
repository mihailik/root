module Mi.PE {
    export interface BinaryReader {
        byteOffset: number;

        readByte(): number;
        readShort(): number;
        readInt(): number;
        readLong(): number;
        readBytes(count: number): Uint8Array;
    }

    export function getFileBinaryReader(
        file: File,
        onsuccess: (BinaryReader) => void,
        onfailure: (Error) => void ) {
        
        var reader = new FileReader();
        
        reader.onerror = onfailure;
        reader.onloadend = () => {
            if (reader.readyState != 2) {
                onfailure(reader.error);
                return;
            }

            var result: DataViewBinaryReader;

            try {
                var resultArrayBuffer: ArrayBuffer;
                resultArrayBuffer = reader.result;

                var resultDataView = new DataView(resultArrayBuffer);

                result = new DataViewBinaryReader(resultDataView);
            }
            catch (error) {
                onfailure(error);
            }

            onsuccess(result);
        };

        reader.readAsArrayBuffer(file);
    }

    export function getUrlBinaryReader(
        url: string,
        onsuccess: (BinaryReader) => void,
        onfailure: (Error) => void ) {

        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";

        request.onerror = onfailure;
        request.onloadend = () => {
            var result: DataViewBinaryReader;

            try {
                var response: ArrayBuffer = request.response;
                var resultDataView = new DataView(response);
                result = new DataViewBinaryReader(resultDataView);
            }
            catch (error) {
                onfailure(error);
                return;
            }

            onsuccess(result);
        };

        request.send();
    }

    export class DataViewBinaryReader implements BinaryReader {
        private m_byteOffset: number = 0;

        constructor (private dataView: DataView) {
        }

        get byteOffset() { return this.m_byteOffset; }

        set byteOffset(value: number) {
            if (value > this.dataView.byteLength)
                throw new Error("Offset (" + value + ") cannot be greater than the underlying DataView byte length (" + this.dataView.byteLength + ").");

            this.m_byteOffset = value;
        }

        readByte(): number {
            var result = this.dataView.getUint8(this.m_byteOffset);
            this.m_byteOffset++;
            return result;
        }

        readShort(): number {
            var result = this.dataView.getUint16(this.m_byteOffset, true);
            this.m_byteOffset += 2;
            return result;
        }

        readInt(): number {
            var result = this.dataView.getUint32(this.m_byteOffset, true);
            this.m_byteOffset += 4;
            return result;
        }

        readBytes(count: number): Uint8Array {
            var result = new Uint8Array(count);
            for (var i = 0; i < count; i++) {
                result[i] = this.dataView.getUint8(this.m_byteOffset + i);
            }
            this.m_byteOffset += count;
            return result;
        }

        readLong(): number {
            var lo = this.readInt();
            var hi = this.readInt();
            return lo + (hi << 14) * 4;
        }
    }
}