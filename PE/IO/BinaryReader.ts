module Mi.PE.IO {
    export interface BinaryReader {
        byteOffset: number;

        readByte(): number;
        readShort(): number;
        readInt(): number;
        readLong(): { lo: number; hi: number; };
        readBytes(count: number): Uint8Array;

        readZeroFilledAscii(maxLength: number): string;
    }

    export interface BinaryReaderWithUtf8z extends BinaryReader {
        readUtf8z(maxLength: number): string;
    }
}