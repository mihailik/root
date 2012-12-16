/// <reference path="../Long.ts" />
/// <reference path="AddressRange.ts" />

module pe.io {
	export class BufferReader {
		private view: DataView;
		public offset: number = 0;

		public sections: VirtualAddressRange[] = [];
		private currentSectionIndex: number = 0;

		constructor(buffer: number[], bufferOffset?: number, length?: number);
		constructor(buffer: ArrayBuffer, bufferOffset?: number, length?: number);
		constructor(buffer: any, bufferOffset?: number, length?: number) {
			if ("byteLength" in buffer) {
				this.view =
					typeof (length) === "number" ? new DataView(buffer, bufferOffset, length) :
					typeof (bufferOffset) === "number" ? new DataView(buffer, bufferOffset) :
					new DataView(buffer);
			}
			else {
				this.view = <any>new FallbackDataView(buffer, bufferOffset, length);
			}
		}

		readByte(): number {
			this.verifyBeforeRead(1);

			var result = this.view.getUint8(this.offset);
			this.offset++;
			return result;
		}

		readShort(): number {
			this.verifyBeforeRead(2);

			var result = this.view.getUint16(this.offset, true);
			this.offset += 2;
			return result;
		}

		readInt(): number {
			this.verifyBeforeRead(4);

			var result = this.view.getUint32(this.offset, true);
			this.offset += 4;
			return result;
		}

		readLong(): pe.Long {
			this.verifyBeforeRead(8);

			var lo = this.view.getUint32(this.offset, true);
			var hi = this.view.getUint32(this.offset + 4, true);
			this.offset += 8;
			return new pe.Long(lo, hi);
		}

		readZeroFilledAscii(length: number) {
			this.verifyBeforeRead(length);

			var chars = [];

			for (var i = 0; i < length; i++) {
				var charCode = this.view.getUint8(this.offset + i);

				if (charCode == 0)
					continue;

				chars.push(String.fromCharCode(charCode));
			}

			this.offset += length;

			return chars.join("");
		}

		readAsciiZ(maxLength: number = 1024): string {
			var chars = [];

			var byteLength = 0;
			while (true) {
				var nextChar = this.view.getUint8(this.offset + chars.length);
				if (nextChar == 0) {
					byteLength = chars.length + 1;
					break;
				}

				chars.push(String.fromCharCode(nextChar));
				if (chars.length == maxLength) {
					byteLength = chars.length;
					break;
				}
			}

			this.verifyBeforeRead(byteLength);
			this.offset += byteLength;

			return chars.join("");
		}

		readUtf8Z(maxLength: number): string {
			var buffer = [];
			var isConversionRequired = false;

			for (var i = 0; !maxLength || i < maxLength; i++) {
				var b = this.view.getUint8(this.offset + i);

				if (b == 0) {
					i++;
					break;
				}

				if (b < 127) {
					buffer.push(String.fromCharCode(b));
				}
				else {
					isConversionRequired = true;
					buffer.push("%");
					buffer.push(b.toString(16));
				}
			}

			this.verifyBeforeRead(i);
			this.offset += i;

			if (isConversionRequired)
				return decodeURIComponent(buffer.join(""));
			else
				return buffer.join("");
		}

		getVirtualOffset(): number {
			var result = this.tryMapToVirtual(this.offset);
			if (result <0)
				throw new Error("Cannot map current position into virtual address space.");
			return result;
		}

		setVirtualOffset(rva: number): void {
			if (this.currentSectionIndex >= 0
				&& this.currentSectionIndex < this.sections.length) {
				var s = this.sections[this.currentSectionIndex];
				var relative = rva - s.virtualAddress;
				if (relative >= 0 && relative < s.size) {
					this.offset = relative + s.address;
					return;
				}
			}

			for (var i = 0; i < this.sections.length; i++) {
				var s = this.sections[i];
				var relative = rva - s.virtualAddress;
				if (relative >=0 && relative < s.size) {
					this.currentSectionIndex = i;
					this.offset = relative + s.address;
					return;
				}
			}

			throw new Error("Address is outside of virtual address space.");
		}

		private verifyBeforeRead(size: number): void {
			if (this.sections.length === 0)
				return;

			if (this.tryMapToVirtual(this.offset) < 0)
				throw new Error("Original offset does not map into virtual space.");

			if (size<=1 || this.tryMapToVirtual(this.offset + size) >= 0)
				return;

			throw new Error("Reading " + size + " bytes exceeds the virtual mapped space.");
		}

		private verifyAfterRead(size: number): void {
			if (this.sections.length === 0)
				return;

			if (this.tryMapToVirtual(this.offset - size) < 0)
				throw new Error("Original offset does not map into virtual space.");

			if (size<=1 || this.tryMapToVirtual(this.offset - 1) >= 0)
				return;

			this.offset -= size;
			throw new Error("Reading " + size + " bytes exceeds the virtual mapped space.");
		}

		private tryMapToVirtual(offset: number): number {
			if (this.currentSectionIndex >= 0
				&& this.currentSectionIndex < this.sections.length) {
				var s = this.sections[this.currentSectionIndex];
				var relative = offset - s.address;
				if (relative >=0 && relative < s.size)
					return relative + s.virtualAddress;
			}

			for (var i = 0; i < this.sections.length; i++) {
				var s = this.sections[i];
				var relative = offset - s.address;
				if (relative >=0 && relative < s.size) {
					this.currentSectionIndex = i;
					return relative + s.virtualAddress;
				}
			}

			return -1;
		}
	}

	export class FallbackDataView {
		constructor(private buffer: number[], private bufferOffset?: number, private length?: number) {
			if (!this.bufferOffset)
				this.bufferOffset = 0;
			if (!this.length)
				this.length = this.buffer.length;
		}

		getUint8(offset: number): number {
			if (offset < this.bufferOffset || offset + 1 > this.bufferOffset + this.length)
				throw new Error("Buffer overflow.");

			return this.buffer[this.bufferOffset + offset];
		}

		getUint16(offset: number): number {
			if (offset < this.bufferOffset || offset + 2 > this.bufferOffset + this.length)
				throw new Error("Buffer overflow.");

			var result =
				this.buffer[this.bufferOffset + offset] +
				(this.buffer[this.bufferOffset + offset + 1] << 8);

			return result;
		}

		getUint32(offset: number): number {
			if (offset < this.bufferOffset || offset + 4 > this.bufferOffset + this.length)
				throw new Error("Buffer overflow.");

			var result =
				this.buffer[this.bufferOffset + offset] +
				(this.buffer[this.bufferOffset + offset + 1] << 8) +
				(this.buffer[this.bufferOffset + offset + 2] +
				(this.buffer[this.bufferOffset + offset + 3] << 8)) * 65536;

			return result;
		}
	}
}