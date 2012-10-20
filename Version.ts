/// <reference path="BinaryReader.ts" />

module Mi.PE {
    export class Version {
        constructor (
            public major: number,
            public minor: number) {
        }

        toString() { return this.major + "." + this.minor; }

        static read(reader: BinaryReader) {
            return new Version(reader.readShort(), reader.readShort());
        }
    }
}