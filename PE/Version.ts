/// <reference path="IO/BinaryReader.ts" />

module Mi.PE {
    export class Version {
        constructor (
            public major: number,
            public minor: number) {
        }

        toString() { return this.major + "." + this.minor; }
    }
}