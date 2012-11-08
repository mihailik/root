/// <reference path="BinaryReader.ts" />

module Mi.PE.IO {
    export class IEBinaryReader extends BinaryReader {
        constructor (private dataView: number[], private byteOffset: number = 0) {
            super();
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
            var lo = this.readShort();
            var hi = this.readShort();
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

        skipBytes(count: number) {
            this.byteOffset += count;
        }


        readAtOffset(absoluteByteOffset: number): BinaryReader {
            return new IEBinaryReader(this.dataView, absoluteByteOffset);
        }
    }
}