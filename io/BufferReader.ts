/// <reference path="../Long.ts" />
/// <reference path="AddressRange.ts" />
/// <reference path="../overrides.ts" />

module pe.io {
	export class BufferReader {
		private view: DataView;
		public offset: number = 0;

		public sections: AddressRangeMap[] = [];
		private currentSectionIndex: number = 0;

		constructor(buffer: ArrayBuffer, bufferOffset?: number, length?: number) {
			this.view =
				typeof (length) === "number" ? new overrides.DataView(buffer, bufferOffset, length) :
				typeof (bufferOffset) === "number" ? new overrides.DataView(buffer, bufferOffset) :
				new overrides.DataView(buffer);
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

		readBytes(length: number): Uint8Array {
			this.verifyBeforeRead(length);

			var result = new overrides.Uint8Array(
				this.view.buffer,
				this.view.byteOffset + this.offset,
				length);

			this.offset += length;
			return result;
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
			var buffer = "";
			var isConversionRequired = false;

			for (var i = 0; !maxLength || i < maxLength; i++) {
				var b = this.view.getUint8(this.offset + i);

				if (b == 0) {
					i++;
					break;
				}

				if (b < 127) {
					buffer += String.fromCharCode(b);
				}
				else {
					isConversionRequired = true;
					buffer += "%";
					buffer += b.toString(16);
				}
			}

			this.verifyBeforeRead(i);
			this.offset += i;

			if (isConversionRequired)
				return decodeURIComponent(buffer);
			else
				return buffer;
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
			//if (this.sections.length === 0)
				return;

			if (this.tryMapToVirtual(this.offset) < 0)
				throw new Error("Original offset does not map into virtual space.");

			if (size<=1 || this.tryMapToVirtual(this.offset + size) >= 0)
				return;

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
}