/// <reference path="../PEFormat/DataDirectory.ts" />
/// <reference path="Long.ts" />

module Mi.PE.IO {
    export interface BinaryReader {
        byteOffset: number;

        readByte(): number;
        readShort(): number;
        readInt(): number;
        readLong(): Long;
        readBytes(count: number): Uint8Array;

        readZeroFilledAscii(length: number): string;
        readUtf8z(maxLength: number): string;

        addSection(physical: Mi.PE.PEFormat.DataDirectory, virtual: Mi.PE.PEFormat.DataDirectory): void;

        readAtOffset(absoluteByteOffset: number): BinaryReader;
        readAtVirtualOffset(virtualByteOffset: number): BinaryReader;
    }
}