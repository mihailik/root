/// <reference path="BinaryReader.ts" />
/// <reference path="../PEFormat/DataDirectory.ts" />

module Mi.PE.IO {
    export class DataViewBinaryReader implements BinaryReader {
        constructor (private dataView: DataView, private m_byteOffset: number = 0) {
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

        private sections: { physical: Mi.PE.PEFormat.DataDirectory; virtual: Mi.PE.PEFormat.DataDirectory; }[] = [];

        addSection(physical: Mi.PE.PEFormat.DataDirectory, virtual: Mi.PE.PEFormat.DataDirectory): void {
            this.sections.push(
                { 
                    physical: physical,
                    virtual: virtual,
                    toString: () => { return physical + "=>" + virtual; }
                });
        }

        get virtualByteOffset(): number {
            for (var i = 0; i < this.sections.length; i++) {
                if (this.sections[i].physical.contains(this.m_byteOffset))
                    return this.sections[i].virtual.address + (this.m_byteOffset - this.sections[i].physical.address);
            }

            return null;
        }

        set virtualByteOffset(value: number) {
            for (var i = 0; i < this.sections.length; i++) {
                if (this.sections[i].virtual.contains(value)) {
                    this.byteOffset = this.sections[i].physical.address + (value - this.sections[i].virtual.address);
                    return;
                }
            }

            throw new Error("Virtual address "+value.toString(16)+"h does not fall into any of "+this.sections.length+" sections ("+this.sections.join(" ")+").");
        }

        readOffset(absoluteByteOffset: number): BinaryReader {
            return new DataViewBinaryReader(this.dataView, absoluteByteOffset);
        }
    }
}