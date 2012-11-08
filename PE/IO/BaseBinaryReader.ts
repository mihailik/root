/// <reference path="BinaryReader.ts" />
/// <reference path="../PEFormat/DataDirectory.ts" />

module Mi.PE.IO {
    export class BaseBinaryReader implements BinaryReader {
        constructor (public byteOffset: number = 0, public sections: { physical: PEFormat.DataDirectory; virtual: PEFormat.DataDirectory; }[] = []) {
        }

        readByte(): number { throw new Error("Not implemented."); }
        readShort(): number { throw new Error("Not implemented."); }
        readInt(): number { throw new Error("Not implemented."); }
        readBytes(count: number): Uint8Array { throw new Error("Not implemented."); }
        
        skipBytes(count: number) {
            this.byteOffset += count;
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

        readAtOffset(absoluteByteOffset: number): BinaryReader { throw new Error("Not implemented."); }

        readAtVirtualOffset(virtualByteOffset: number): BinaryReader {
            for (var i = 0; i < this.sections.length; i++) {
                if (this.sections[i].virtual.contains(virtualByteOffset)) {
                    var newByteOffset = this.sections[i].physical.address + (virtualByteOffset - this.sections[i].virtual.address);
                    return this.readAtOffset(newByteOffset);
                }
            }

            throw new Error("Virtual address "+virtualByteOffset.toString(16)+"h does not fall into any of "+this.sections.length+" sections ("+this.sections.join(" ")+").");
        }
    }
}