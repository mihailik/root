/// <reference path="../pe.ts" />

module test_BufferReader {

	class TestFallbackDataView extends pe.io.FallbackDataView {
		constructor(buffer: number[], bufferOffset?: number, length?: number) {
			super(buffer, bufferOffset, length);
		}

		setUint8(bufferOffset: number, value: number): void {
			if (bufferOffset < (<any>this).bufferOffset || bufferOffset + 1 > (<any>this).bufferOffset + (<any>this).length)
				throw new Error("Buffer overflow.");

			(<any>this).buffer[(<any>this).bufferOffset + bufferOffset] = value;
		}
	}

	function wrapInPolyfillsIfNecessary(test: () => void): void {
		var global = (function () { return this; })();

		if (global.ArrayBuffer) {
			test();
			return;
		}

		var savedArrayBuffer = global.ArrayBuffer;
		var savedDataView = global.DataView;

		global.ArrayBuffer = Array;
		global.DataView = TestFallbackDataView;

		try {
			test();
		}
		finally {
			if (typeof(savedArrayBuffer) === "undefined")
				delete global.ArrayBuffer;
			else
				global.ArrayBuffer = savedArrayBuffer;

			if (typeof(savedDataView) === "undefined")
				delete global.DataView;
			else
				global.DataView = savedDataView;
		}
	}

	export function constructor_WithArrayBuffer0_succeeds() {
		wrapInPolyfillsIfNecessary(function () {
			var bi = new pe.io.BufferReader(new ArrayBuffer(0));
		});
	}

	export function constructor_WithArrayBuffer10_succeeds() {
		wrapInPolyfillsIfNecessary(function () {
			var bi = new pe.io.BufferReader(new ArrayBuffer(0));
		});
	}

	export function with123_readByte_1() {
		wrapInPolyfillsIfNecessary(function () {
			var buf = new ArrayBuffer(3);
			var vi = new DataView(buf);
			vi.setUint8(0, 1);
			vi.setUint8(1, 2);
			vi.setUint8(2, 3);

			var bi = new pe.io.BufferReader(buf);

			var b = bi.readByte();
			if (b !== 1)
				throw b;
		});
	}
}