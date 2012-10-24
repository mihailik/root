/// <reference path="Directory.ts" />

module Mi.PE.Internal {
    export class StreamHeader {
        constructor (public name: string, public map: Directory) {
        }

        toString() { return this.name + " " + this.map; }
    }
}