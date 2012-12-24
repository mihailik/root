/// <reference path="../Long.ts" />
/// <reference path="AddressRange.ts" />

module pe.io {
	var checkBufferReaderOverrideOnFirstCreation = true;

	export class BufferReader {
		private _view: DataView;
		public offset: number = 0;

		public sections: AddressRangeMap[] = [];
		private _currentSectionIndex: number = 0;

		constructor(array: number[]);
		constructor(buffer: ArrayBuffer);
		constructor(view: DataView);
		constructor(view: any) {
			if (checkBufferReaderOverrideOnFirstCreation) {
				// whatever we discover, stick to it, don't repeat it again
				checkBufferReaderOverrideOnFirstCreation = false;

				var global = (function () { return this; })();
				if (!("DataView" in global)) {
					// the environment doesn't support DataView,
					// fall back on ArrayBuffer
					io.BufferReader = <any>ArrayReader;
					return new ArrayReader(view);
				}
			}

			if (!view)
				return;

			if ("getUint8" in view) {
				this._view = <DataView>view;
			}
			else if ("byteLength" in view) {
				this._view = new DataView(<ArrayBuffer>view);
			}
			else {
				var arrb = new ArrayBuffer(view.length);
				this._view = new DataView(arrb);
				for (var i = 0; i < view.length; i++) {
					this._view.setUint8(i, view[i]);
				}
			}
		}

		readByte(): number {
			var result = this._view.getUint8(this.offset);
			this.offset++;
			return result;
		}

		peekByte(): number {
			var result = this._view.getUint8(this.offset);
			return result;
		}

		readShort(): number {
			var result = this._view.getUint16(this.offset, true);
			this.offset += 2;
			return result;
		}

		readInt(): number {
			var result = this._view.getUint32(this.offset, true);
			this.offset += 4;
			return result;
		}

		readLong(): pe.Long {
			var lo = this._view.getUint32(this.offset, true);
			var hi = this._view.getUint32(this.offset + 4, true);
			this.offset += 8;
			return new pe.Long(lo, hi);
		}

		readBytes(length: number): Uint8Array {
			var result = new Uint8Array(
				this._view.buffer,
				this._view.byteOffset + this.offset,
				length);

			this.offset += length;
			return result;
		}

		readZeroFilledAscii(length: number) {
			var chars = [];

			for (var i = 0; i < length; i++) {
				var charCode = this._view.getUint8(this.offset + i);

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
				var nextChar = this._view.getUint8(this.offset + chars.length);
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

			this.offset += byteLength;

			return chars.join("");
		}

		readUtf8Z(maxLength: number): string {
			var buffer = "";
			var isConversionRequired = false;

			for (var i = 0; !maxLength || i < maxLength; i++) {
				var b = this._view.getUint8(this.offset + i);

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
			if (this._currentSectionIndex >= 0
				&& this._currentSectionIndex < this.sections.length) {
				var s = this.sections[this._currentSectionIndex];
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
					this._currentSectionIndex = i;
					this.offset = relative + s.address;
					return;
				}
			}

			throw new Error("Address is outside of virtual address space.");
		}

		private tryMapToVirtual(offset: number): number {
			if (this._currentSectionIndex >= 0
				&& this._currentSectionIndex < this.sections.length) {
				var s = this.sections[this._currentSectionIndex];
				var relative = offset - s.address;
				if (relative >=0 && relative < s.size)
					return relative + s.virtualAddress;
			}

			for (var i = 0; i < this.sections.length; i++) {
				var s = this.sections[i];
				var relative = offset - s.address;
				if (relative >=0 && relative < s.size) {
					this._currentSectionIndex = i;
					return relative + s.virtualAddress;
				}
			}

			return -1;
		}
	}

	export class ArrayReader extends BufferReader {
		public offset: number = 0;

		public sections: AddressRangeMap[] = [];
		private _currentSectionIndex: number = 0;

		constructor(private _array: number[]) {
			super(null);
		}

		readByte(): number {
			var result = this._array[this.offset];
			this.offset++;
			return result;
		}

		peekByte(): number {
			var result = this._array[this.offset];
			return result;
		}

		readShort(): number {
			var result =
				this._array[this.offset] +
				(this._array[this.offset + 1] << 8);
			this.offset += 2;
			return result;
		}

		readInt(): number {
			var result =
				this._array[this.offset] +
				(this._array[this.offset + 1] << 8) +
				(this._array[this.offset + 2] << 16) +
				(this._array[this.offset + 3] * 0x1000000);
			this.offset += 4;
			return result;
		}

		readLong(): pe.Long {
			var lo = this.readInt();
			var hi = this.readInt();
			return new pe.Long(lo, hi);
		}

		readBytes(length: number): Uint8Array {
			var result = this._array.slice(this.offset, this.offset + length);
			this.offset += length;
			return <any>result;
		}

		readZeroFilledAscii(length: number) {
			var chars = [];

			for (var i = 0; i < length; i++) {
				var charCode = this._array[this.offset + i];

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
				var nextChar = this._array[this.offset + chars.length];
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

			this.offset += byteLength;

			return chars.join("");
		}

		readUtf8Z(maxLength: number): string {
			var buffer = "";
			var isConversionRequired = false;

			for (var i = 0; !maxLength || i < maxLength; i++) {
				var b = this._array[this.offset + i];

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
			if (this._currentSectionIndex >= 0
				&& this._currentSectionIndex < this.sections.length) {
				var s = this.sections[this._currentSectionIndex];
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
					this._currentSectionIndex = i;
					this.offset = relative + s.address;
					return;
				}
			}

			throw new Error("Address is outside of virtual address space.");
		}

		private tryMapToVirtual(offset: number): number {
			if (this._currentSectionIndex >= 0
				&& this._currentSectionIndex < this.sections.length) {
				var s = this.sections[this._currentSectionIndex];
				var relative = offset - s.address;
				if (relative >=0 && relative < s.size)
					return relative + s.virtualAddress;
			}

			for (var i = 0; i < this.sections.length; i++) {
				var s = this.sections[i];
				var relative = offset - s.address;
				if (relative >=0 && relative < s.size) {
					this._currentSectionIndex = i;
					return relative + s.virtualAddress;
				}
			}

			return -1;
		}
	}
}