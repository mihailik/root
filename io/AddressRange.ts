module pe.io {
    export class AddressRange {
        constructor (public address?: number, public size?: number) {
            if (!this.address)
                this.address = 0;
            if (!this.size)
                this.size = 0;
        }

        mapRelative(offset: number): number {
        	var result = offset - this.address;
			if (result >= 0 && result < this.size)
				return result;
			else
				return -1;
        }

        toString() { return this.address.toString(16).toUpperCase() + ":" + this.size.toString(16).toUpperCase() + "h"; }
    }

    export class AddressRangeMap extends AddressRange {
        constructor(address?: number, size?: number, public virtualAddress?: number) {
            super(address, size);

            if (!this.virtualAddress)
                this.virtualAddress = 0;
        }

        toString() { return this.address.toString(16).toUpperCase() + ":" + this.size.toString(16).toUpperCase() + "@" + this.virtualAddress + "h"; }
    }
}