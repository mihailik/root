module pe.overrides {
	var global = (function () { return this; })();

	function defineOverride(name: string, fallbackConstructor: any): any {
		if (name in global)
			return global[name];
		else
			return fallbackConstructor;
	}

	export var DataView = defineOverride("DataView", FallbackDataView);
	export var Uint8Array = defineOverride("Uint8Array", FallbackUint8Array);

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

	export function FallbackUint8Array(input: any, byteOffset?: number, length?: number) {
		if (typeof (input) === "number") {
			return Array(input);
		}
		else if ("length" in input) {
			return typeof (length) === "number" ?
				input.slice(byteOffset, byteOffset + length) :
				typeof (byteOffset) === "number" ?
				input.slice(byteOffset) :
				input.slice(0);
		}
	}
}