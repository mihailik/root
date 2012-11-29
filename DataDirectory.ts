module miPE {
    export class DataDirectory {
        constructor (
            public address: number,
            public size: number) {
        }

        contains(address: number): bool {
            return address >= this.address && address < this.address + this.size;
        }

        toString() { return this.address.toString(16).toUpperCase() + ":" + this.size.toString(16).toUpperCase() + "h"; }
    }
}