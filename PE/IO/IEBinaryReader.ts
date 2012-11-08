/// <reference path="BaseBinaryReader.ts" />

module Mi.PE.IO {
    export class IEBinaryReader extends BaseBinaryReader {
        constructor (private dataView: number[], public byteOffset: number = 0, public sections: { physical: PEFormat.DataDirectory; virtual: PEFormat.DataDirectory; }[] = []) {
            super(byteOffset, sections);
        }

        readByte(): number {
            var result = this.dataView[this.byteOffset];
            this.byteOffset++;
            return result;
        }

        readShort(): number {
            var lo = this.readByte();
            var hi = this.readByte();
            return lo | (hi << 8);
        }

        readInt(): number {
            var lo = this.readByte();
            var hi = this.readByte();
            return lo | (hi * 65536);
        }

        readBytes(count: number): Uint8Array {
            var result: number[] = Array(count);
            for (var i = 0; i < count; i++) {
                result[i] = this.dataView[this.byteOffset + i];
            }
            this.byteOffset += count;
            return <any>result;
        }

        readAtOffset(absoluteByteOffset: number): BinaryReader {
            return new IEBinaryReader(this.dataView, absoluteByteOffset, this.sections);
        }
    }
}