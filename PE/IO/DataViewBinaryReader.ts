/// <reference path="BaseBinaryReader.ts" />

module Mi.PE.IO {
    export class DataViewBinaryReader extends BaseBinaryReader {
        constructor (private dataView: DataView, public byteOffset: number = 0, public sections: { physical: PEFormat.DataDirectory; virtual: PEFormat.DataDirectory; }[] = []) {
            super(byteOffset, sections);
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

        readAtOffset(absoluteByteOffset: number): BinaryReader {
            return new DataViewBinaryReader(this.dataView, absoluteByteOffset, this.sections);
        }
    }
}