/// <reference path="Long.ts" />

module io {
    export class BinaryReader {
        constructor () {
        }

        readByte(): number { throw new Error("Not implemented."); }
        readAtOffset(offset: number): BinaryReader { throw new Error("Not implemented."); }
        readBytes(count: number): Uint8Array { throw new Error("Not implemented."); }
        skipBytes(count: number): void { throw new Error("Not implemented."); }

        readShort(): number {
            var lo = this.readByte();
            var hi = this.readByte();
            return lo | (hi << 8);
        }

        readInt(): number {
            var lo = this.readShort();
            var hi = this.readShort();
            return lo | (hi * 65536);
        }

        readLong(): Long {
            var lo = this.readInt();
            var hi = this.readInt();
            return new Long(lo, hi);
        }

        readTimestamp(): Date {
            var timestampNum = this.readInt();
            var timestamp = new Date(timestampNum * 1000);
            var timestamp = new Date(
                Date.UTC(
                    timestamp.getFullYear(),
                    timestamp.getMonth(),
                    timestamp.getDate(),
                    timestamp.getHours(),
                    timestamp.getMinutes(),
                    timestamp.getSeconds(),
                    timestamp.getMilliseconds()));
            return timestamp;
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

        readAsciiZ(): string {
            var result = "";
            while (true) {
                var nextChar = this.readByte();
                if (nextChar == 0)
                    break;

                result += String.fromCharCode(nextChar);
            }

            return result;
        }

        readUtf8z(maxLength: number): string {
            var buffer = "";
            var isConversionRequired = false;

            for (var i = 0; !maxLength || i < maxLength; i++) {
                var b = this.readByte();

                if (b == 0)
                    break;

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

    export class DataViewBinaryReader extends BinaryReader {
        constructor (private dataView: DataView, private byteOffset: number = 0) {
            super();
        }

        readByte(): number {
            var result = this.dataView.getUint8(this.byteOffset);
            this.byteOffset++;
            return result;
        }

        readShort(): number {
            var result = this.dataView.getUint16(this.byteOffset, true);
            this.byteOffset += 2;
            return result;
        }

        readInt(): number {
            var result = this.dataView.getUint32(this.byteOffset, true);
            this.byteOffset += 4;
            return result;
        }

        readBytes(count: number): Uint8Array {
            var result = new Uint8Array(count);
            for (var i = 0; i < count; i++) {
                result[i] = this.dataView.getUint8(this.byteOffset + i);
            }
            this.byteOffset += count;
            return result;
        }

        skipBytes(count: number) {
            this.byteOffset += count;
        }

        readAtOffset(absoluteByteOffset: number): BinaryReader {
            return new DataViewBinaryReader(this.dataView, absoluteByteOffset);
        }
    }

    export class IEBinaryReader extends BinaryReader {
        constructor (private arrayOfBytes: number[], private byteOffset: number = 0) {
            super();
        }

        readByte(): number {
            var result = this.arrayOfBytes[this.byteOffset];
            this.byteOffset++;
            return result;
        }

        readBytes(count: number): Uint8Array {
            var result: number[] = Array(count);
            for (var i = 0; i < count; i++) {
                result[i] = this.arrayOfBytes[this.byteOffset + i];
            }
            this.byteOffset += count;
            return <any>result;
        }

        skipBytes(count: number) {
            this.byteOffset += count;
        }

        readAtOffset(absoluteByteOffset: number): BinaryReader {
            return new IEBinaryReader(this.arrayOfBytes, absoluteByteOffset);
        }
    }
}