/// <reference path="Directory.ts" />

module Mi.PE {
    export class SectionHeader {
        constructor (
            public name: string,
            public map: Directory,
            public sizeOfRawData: number,
            public pointerToRawData: number) {
        }

        toString() { return this.name + " " + this.sizeOfRawData.toString(16) + ":" + this.pointerToRawData.toString(16) + "h=>" + this.map; }
    }
}