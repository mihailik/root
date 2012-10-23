module Mi.PE.PEFormat {
    export class DataDirectory {
        constructor (
            public address: number,
            public size: number) {
        }

        toString() { return this.address.toString(16) + ":" + this.size.toString(16) + "h"; }
    }
}