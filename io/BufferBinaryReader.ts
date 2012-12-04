/// <reference path="BinaryReader.ts" />

module pe.io {
    export class BufferBinaryReader extends BinaryReader {
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
            return new BufferBinaryReader(this.arrayOfBytes, absoluteByteOffset);
        }
    }
}