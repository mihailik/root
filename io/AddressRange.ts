module pe.io {
    export class AddressRange {
        constructor (
            public address?: number,
            public size?: number) {
            if (!address)
                this.address = 0;
            if (!size)
                this.size = 0;
        }

        contains(address: number): bool {
            return address >= this.address && address < this.address + this.size;
        }

        toString() { return this.address.toString(16).toUpperCase() + ":" + this.size.toString(16).toUpperCase() + "h"; }
    }
}