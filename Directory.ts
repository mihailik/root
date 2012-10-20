module Mi.PE {
    export class Directory {
        constructor (
            public address: number,
            public size: number) {
        }

        toString() { return this.address.toString(16) + ":" + this.size.toString(16) + "h"; }
    }
}