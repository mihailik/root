/// <reference path="BinaryReader.ts" />
/// <reference path="../PEFormat/DataDirectory.ts" />

module Mi.PE.IO {
    export class RvaBinaryReader extends BinaryReader {
        private baseReader: BinaryReader;

        constructor (
            baseReader: BinaryReader,
            private virtualByteOffset: number,
            private sections: { physical: PEFormat.DataDirectory; virtual: PEFormat.DataDirectory; }[] = []) {

            super();

            for (var i = 0; i < this.sections.length; i++) {
                if (this.sections[i].virtual.contains(virtualByteOffset)) {
                    var newByteOffset = this.sections[i].physical.address + (virtualByteOffset - this.sections[i].virtual.address);
                    this.baseReader = baseReader.readAtOffset(newByteOffset);
                    this.virtualByteOffset = virtualByteOffset;
                    return;
                }
            }

            throw new Error("Virtual address "+virtualByteOffset.toString(16).toUpperCase()+"h does not fall into any of "+this.sections.length+" sections ("+this.sections.join(" ")+").");
        }

        readAtOffset(offset: number): BinaryReader {
            return new RvaBinaryReader(
                this.baseReader,
                offset,
                this.sections);
        }

        readByte(): number {
            this.beforeRead(1);
            return this.baseReader.readByte();
        }

        readShort(): number {
            this.beforeRead(2);
            return this.baseReader.readShort();
        }

        readInt(): number{
            this.beforeRead(4);
            return this.baseReader.readInt();
        }

        readLong(): Long{
            this.beforeRead(8);
            return this.baseReader.readLong();
        }

        readBytes(count: number): Uint8Array{
            this.beforeRead(count);
            return this.baseReader.readBytes(count);
        }

        skipBytes(count: number): void{
            this.beforeRead(count);
            return this.baseReader.skipBytes(count);
        }

        private beforeRead(size: number) {
            // TODO check that it falls into range
            this.virtualByteOffset += size;
        }
    }
}