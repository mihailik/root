/// <reference path="BinaryReader.ts" />

module Mi.PE.IO {
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

        readLong() {
            var lo = this.readInt();
            var hi = this.readInt();
            return { lo: lo, hi: hi };
        }

        readZeroFilledAscii(length: number) {
            var chars = "";

            for (var i = 0; i < length || length === null || typeof length == "undefined"; i++) {
                var charCode = this.readByte();

                if (i > chars.length
                    || charCode == 0)
                    continue;

                chars += String.fromCharCode(charCode);
            }

            return chars;
        }

        readUtf8z(maxLength: number): string {
            var buffer = "";
            var isConversionRequired = false;

            for (var i = 0; i < maxLength; i++) {
                var b = this.readByte();

                if (isConversionRequired) {
                    buffer += "%" + b.toString(16);
                }
                else {
                    if (b < 127) {
                        buffer += String.fromCharCode(b);
                    }
                    else {
                        buffer = encodeURIComponent(buffer);
                        isConversionRequired = true;
                        buffer += "%" + b.toString(16);
                    }
                }
            }

            if (isConversionRequired)
                buffer = decodeURIComponent(buffer);

            return buffer;
        }
    }
}