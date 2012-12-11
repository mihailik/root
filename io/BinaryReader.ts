/// <reference path="../Long.ts" />

module pe.io {
    export class BinaryReader {
        private _scratchDate = new Date();

        constructor () {
        }

        readByte(): number { throw new Error("Not implemented."); }
        readAtOffset(absoluteByteOffset: number): BinaryReader { throw new Error("Not implemented."); }
        readBytes(count: number): Uint8Array { throw new Error("Not implemented."); }
        skipBytes(count: number): void { throw new Error("Not implemented."); }
        clone(): BinaryReader { throw new Error("Not implemented."); }

        readShort(): number {
            var lo = this.readByte();
            var hi = this.readByte();
            return lo + (hi << 8);
        }

        readInt(): number {
            var lo = this.readShort();
            var hi = this.readShort();
            return lo + (hi * 65536);
        }

        readLong(): pe.Long {
            var lo = this.readInt();
            var hi = this.readInt();
            return new pe.Long(lo, hi);
        }

        readTimestamp(timestamp: Date): void {
            var timestampNum = this.readInt();
            timestamp.setTime(timestampNum * 1000);
            return;
            var dt = this._scratchDate;
            dt.setTime(timestampNum * 1000);
            timestamp.setTime(0); // clean
            timestamp.setUTCMilliseconds(dt.getMilliseconds());
            timestamp.setUTCSeconds(dt.getSeconds());
            timestamp.setUTCMinutes(dt.getMinutes());
            timestamp.setUTCDate(dt.getDate());
            timestamp.setUTCMonth(dt.getMonth());
            timestamp.setUTCFullYear(dt.getFullYear());
        }

        readZeroFilledAscii(length: number) {
            var chars = "";

            for (var i = 0; i < length; i++) {
                var charCode = this.readByte();

                if (charCode == 0)
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
}