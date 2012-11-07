/// <reference path="BinaryReader.ts" />
/// <reference path="../PEFormat/DataDirectory.ts" />

module Mi.PE.IO {
    export class DataViewBinaryReader implements BinaryReader {
        constructor (private dataView: DataView, public byteOffset: number = 0, public sections: { physical: PEFormat.DataDirectory; virtual: PEFormat.DataDirectory; }[] = []) {
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

        readLong(): Long {
            var lo = this.readInt();
            var hi = this.readInt();
            return new Long(lo, hi);
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

        addSection(physical: Mi.PE.PEFormat.DataDirectory, virtual: Mi.PE.PEFormat.DataDirectory): void {
            this.sections.push(
                { 
                    physical: physical,
                    virtual: virtual,
                    toString: () => { return physical + "=>" + virtual; }
                });
        }

        readAtOffset(absoluteByteOffset: number): BinaryReader {
            return new DataViewBinaryReader(this.dataView, absoluteByteOffset, this.sections);
        }

        readAtVirtualOffset(virtualByteOffset: number): BinaryReader {
            for (var i = 0; i < this.sections.length; i++) {
                if (this.sections[i].virtual.contains(virtualByteOffset)) {
                    var newByteOffset = this.sections[i].physical.address + (virtualByteOffset - this.sections[i].virtual.address);
                    return new DataViewBinaryReader(this.dataView, newByteOffset, this.sections);
                }
            }

            throw new Error("Virtual address "+virtualByteOffset.toString(16)+"h does not fall into any of "+this.sections.length+" sections ("+this.sections.join(" ")+").");
        }
    }
}