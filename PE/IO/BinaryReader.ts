/// <reference path="../PEFormat/DataDirectory.ts" />
/// <reference path="Long.ts" />

module Mi.PE.IO {
    export class BinaryReader {
        constructor () {
        }

        readAtOffset(offset: number): BinaryReader { throw new Error("Not implemented."); }

        readByte(): number { throw new Error("Not implemented."); }
        readShort(): number { throw new Error("Not implemented."); }
        readInt(): number { throw new Error("Not implemented."); }

        readLong(): Long {
            var lo = this.readInt();
            var hi = this.readInt();
            return new Long(lo, hi);
        }

        readBytes(count: number): Uint8Array { throw new Error("Not implemented."); }

        skipBytes(count: number): void { throw new Error("Not implemented."); }

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
                if (nextChar==0)
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

                if (b==0)
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
}