// <reference path="BinaryReader.ts" />

module pe.io {
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
            var result = this.createUint32Array(count);
            for (var i = 0; i < count; i++) {
                result[i] = this.dataView.getUint8(this.byteOffset + i);
            }
            this.byteOffset += count;
            return result;
        }

        skipBytes(count: number) {
            this.byteOffset += count;
        }

        clone(): BinaryReader {
            return new DataViewBinaryReader(this.dataView, this.byteOffset);
        }

        readAtOffset(absoluteByteOffset: number): BinaryReader {
            return new DataViewBinaryReader(this.dataView, absoluteByteOffset);
        }

        createUint32Array(count: number) {
            return new Uint32Array(count);
        }
    }
}