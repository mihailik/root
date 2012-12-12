/// <reference path="../Long.ts" />

module pe.io {
	export class BufferReader {
		private view: DataView;
		private offset: number;

		constructor(buffer: ArrayBuffer, bufferOffset?: number, length?: number) {
			if (buffer.byteLength)
				this.view = new DataView(buffer, bufferOffset, length);
			else
				this.view = <any>buffer; // for funny business with overrides
		}

		readByte(): number {
			var result = this.view.getUint8(this.offset);
			this.offset++;
			return result;
		}

		readShort(): number {
			var result = this.view.getUint16(this.offset);
			this.offset += 2;
			return result;
		}

		readInt(): number {
			var result = this.view.getUint32(this.offset);
			this.offset += 4;
			return result;
		}

		readLong(): pe.Long {
			var lo = this.view.getUint32(this.offset);
			var hi = this.view.getUint32(this.offset + 4);
			this.offset += 8;
			return new pe.Long(lo, hi);
		}

		readZeroFilledAscii(length: number) {
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

		readAsciiZ(): string {
			var chars = [];

			while (true) {
				var nextChar = this.view.getUint8(this.offset + chars.length);
				if (nextChar == 0)
					break;

				chars.push(String.fromCharCode(nextChar));
			}

			this.offset += chars.length;

			return chars.join("");
		}

		readUtf8z(maxLength: number): string {
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

			this.offset += i;

			if (isConversionRequired)
				return decodeURIComponent(buffer.join(""));
			else
				return buffer.join();
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

	export class FallbackBufferReader extends BufferReader {
		private offset: number;
		constructor(private buffer: number[], private bufferOffset?: number, private length?: number) {
			super(<any>new FallbackDataView(buffer, bufferOffset, length));
		}
	}
}