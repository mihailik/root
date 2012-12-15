module pe.io {
    export class AddressRange {
        constructor (public address?: number, public size?: number) {
            if (!this.address)
                this.address = 0;
            if (!this.size)
                this.size = 0;
        }

        contains(address: number): bool {
            return address >= this.address && address < this.address + this.size;
        }

        toString() { return this.address.toString(16).toUpperCase() + ":" + this.size.toString(16).toUpperCase() + "h"; }
    }

    export class VirtualAddressRange extends AddressRange {
        constructor(address?: number, size?: number, public virtualAddress?: number) {
            super(address, size);

            if (!this.virtualAddress)
                this.virtualAddress = 0;
        }

        containsVirtual(virtualAddress: number): bool {
            return virtualAddress >= this.virtualAddress && virtualAddress < this.virtualAddress + this.size;
        }

        toString() { return this.address.toString(16).toUpperCase() + ":" + this.size.toString(16).toUpperCase() + "@" + this.virtualAddress + "h"; }
    }
}