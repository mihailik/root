module Mi.PE.IO {
    export interface BinaryReader {
        byteOffset: number;

        readByte(): number;
        readShort(): number;
        readInt(): number;
        readLong(): { lo: number; hi: number; };
        readBytes(count: number): Uint8Array;

        readZeroFilledAscii(length: number): string;
        readUtf8z(maxLength: number): string;

        addSection(physical: any, virtual: any): void;
        virtualByteOffset: number;
    }
}