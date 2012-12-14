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

	export function with123_readShort_0x0201() {
		wrapInPolyfillsIfNecessary(function () {
			var buf = new ArrayBuffer(3);
			var vi = new DataView(buf);
			vi.setUint8(0, 1);
			vi.setUint8(1, 2);
			vi.setUint8(2, 3);

			var bi = new pe.io.BufferReader(buf);

			var b = bi.readShort();
			if (b !== 0x0201)
				throw "0x" + b.toString(16);
		});
	}

	export function with1234_readInt_0x04030201() {
		wrapInPolyfillsIfNecessary(function () {
			var buf = new ArrayBuffer(4);
			var vi = new DataView(buf);
			vi.setUint8(0, 1);
			vi.setUint8(1, 2);
			vi.setUint8(2, 3);
			vi.setUint8(3, 4);

			var bi = new pe.io.BufferReader(buf);

			var b = bi.readInt();
			if (b !== 0x04030201)
				throw "0x" + b.toString(16);
		});
	}

	export function withFEDC_readInt_0x0C0D0E0F() {
		wrapInPolyfillsIfNecessary(function () {
			var buf = new ArrayBuffer(4);
			var vi = new DataView(buf);
			vi.setUint8(0, 0xF);
			vi.setUint8(1, 0xE);
			vi.setUint8(2, 0xD);
			vi.setUint8(3, 0xC);

			var bi = new pe.io.BufferReader(buf);

			var b = bi.readInt();
			if (b !== 0x0C0D0E0F)
				throw "0x" + b.toString(16);
		});
	}

	export function with01_readInt_throws() {
		wrapInPolyfillsIfNecessary(function () {
			var buf = new ArrayBuffer(2);
			var vi = new DataView(buf);
			vi.setUint8(0, 0xF);
			vi.setUint8(1, 0xE);

			var bi = new pe.io.BufferReader(buf);

			bi.readByte();

			try {
				var b = bi.readInt();
			}
			catch (expectedError) {
				return;
			}

			throw "Error expected.";
		});
	}

	export function withFEDCBA21_readLong_1020A0BC0D0E0Fh() {
		wrapInPolyfillsIfNecessary(function () {
			var buf = new ArrayBuffer(8);
			var vi = new DataView(buf);
			vi.setUint8(0, 0xF);
			vi.setUint8(1, 0xE);
			vi.setUint8(2, 0xD);
			vi.setUint8(3, 0xC);
			vi.setUint8(4, 0xB);
			vi.setUint8(5, 0xA);
			vi.setUint8(6, 0x2);
			vi.setUint8(7, 0x1);

			var bi = new pe.io.BufferReader(buf);

			var b = bi.readLong();
			if (b.toString() !== "1020A0BC0D0E0Fh")
				throw b.toString();
		});
	}

	export function with0FEDCBA21_readByte_readLong_1020A0BC0D0E0Fh() {
		wrapInPolyfillsIfNecessary(function () {
			var buf = new ArrayBuffer(9);
			var vi = new DataView(buf);
			vi.setUint8(0, 0);
			vi.setUint8(1, 0xF);
			vi.setUint8(2, 0xE);
			vi.setUint8(3, 0xD);
			vi.setUint8(4, 0xC);
			vi.setUint8(5, 0xB);
			vi.setUint8(6, 0xA);
			vi.setUint8(7, 0x2);
			vi.setUint8(8, 0x1);

			var bi = new pe.io.BufferReader(buf);

			bi.readByte();

			var b = bi.readLong();
			if (b.toString() !== "1020A0BC0D0E0Fh")
				throw b.toString();
		});
	}

	export function with01_readByte_readLong_throws() {
		wrapInPolyfillsIfNecessary(function () {
			var buf = new ArrayBuffer(2);
			var vi = new DataView(buf);
			vi.setUint8(0, 0);
			vi.setUint8(1, 0xF);

			var bi = new pe.io.BufferReader(buf);

			bi.readByte();

			try {
				var b = bi.readLong();
			}
			catch (expectedError) {
				return;
			}

			throw "Error expected.";
		});
	}

	export function with0_readZeroFilledAscii_1() {
		wrapInPolyfillsIfNecessary(function () {
			var buf = new ArrayBuffer(1);
			var vi = new DataView(buf);
			vi.setUint8(0, 0);

			var bi = new pe.io.BufferReader(buf);

			var b = bi.readZeroFilledAscii(1);
			if (b !== "")
				throw b;
		});
	}

	export function with0_readZeroFilledAscii_0() {
		wrapInPolyfillsIfNecessary(function () {
			var buf = new ArrayBuffer(1);
			var vi = new DataView(buf);
			vi.setUint8(0, 0);

			var bi = new pe.io.BufferReader(buf);

			var b = bi.readZeroFilledAscii(0);
			if (b !== "")
				throw b;
		});
	}

	export function withA0_readZeroFilledAscii_2() {
		wrapInPolyfillsIfNecessary(function () {
			var buf = new ArrayBuffer(2);
			var vi = new DataView(buf);
			vi.setUint8(0, ("A").charCodeAt(0));
			vi.setUint8(1, 0);

			var bi = new pe.io.BufferReader(buf);

			var b = bi.readZeroFilledAscii(2);
			if (b !== "A")
				throw b;
		});
	}

	export function withA0_readZeroFilledAscii_1() {
		wrapInPolyfillsIfNecessary(function () {
			var buf = new ArrayBuffer(2);
			var vi = new DataView(buf);
			vi.setUint8(0, ("A").charCodeAt(0));
			vi.setUint8(1, 0);

			var bi = new pe.io.BufferReader(buf);

			var b = bi.readZeroFilledAscii(1);
			if (b !== "A")
				throw b;
		});
	}

	export function withAB0_readByte_readZeroFilledAscii_1() {
		wrapInPolyfillsIfNecessary(function () {
			var buf = new ArrayBuffer(3);
			var vi = new DataView(buf);
			vi.setUint8(0, ("A").charCodeAt(0));
			vi.setUint8(1, ("B").charCodeAt(0));
			vi.setUint8(2, 0);

			var bi = new pe.io.BufferReader(buf);

			bi.readByte();

			var b = bi.readZeroFilledAscii(1);
			if (b !== "B")
				throw b;
		});
	}

	export function withAB0_readByte_readZeroFilledAscii_2() {
		wrapInPolyfillsIfNecessary(function () {
			var buf = new ArrayBuffer(3);
			var vi = new DataView(buf);
			vi.setUint8(0, ("A").charCodeAt(0));
			vi.setUint8(1, ("B").charCodeAt(0));
			vi.setUint8(2, 0);

			var bi = new pe.io.BufferReader(buf);

			bi.readByte();

			var b = bi.readZeroFilledAscii(2);
			if (b !== "B")
				throw b;
		});
	}

	export function withAB0_readByte_readZeroFilledAscii_3_throws() {
		wrapInPolyfillsIfNecessary(function () {
			var buf = new ArrayBuffer(3);
			var vi = new DataView(buf);
			vi.setUint8(0, ("A").charCodeAt(0));
			vi.setUint8(1, ("B").charCodeAt(0));
			vi.setUint8(2, 0);

			var bi = new pe.io.BufferReader(buf);

			bi.readByte();

			try {
				var b = bi.readZeroFilledAscii(3);
			}
			catch (expectedError) {
				return;
			}

			throw "Error expected.";
			
		});
	}

	export function with0_readAsciiZ_1() {
		wrapInPolyfillsIfNecessary(function () {
			var buf = new ArrayBuffer(1);
			var vi = new DataView(buf);
			vi.setUint8(0, 0);

			var bi = new pe.io.BufferReader(buf);

			var b = bi.readAsciiZ(1);
			if (b !== "")
				throw b;
		});
	}

	export function with0_readAsciiZ_0() {
		wrapInPolyfillsIfNecessary(function () {
			var buf = new ArrayBuffer(1);
			var vi = new DataView(buf);
			vi.setUint8(0, 0);

			var bi = new pe.io.BufferReader(buf);

			var b = bi.readAsciiZ(0);
			if (b !== "")
				throw b;
		});
	}

	export function withA0_readAsciiZ_2() {
		wrapInPolyfillsIfNecessary(function () {
			var buf = new ArrayBuffer(2);
			var vi = new DataView(buf);
			vi.setUint8(0, ("A").charCodeAt(0));
			vi.setUint8(1, 0);

			var bi = new pe.io.BufferReader(buf);

			var b = bi.readAsciiZ(2);
			if (b !== "A")
				throw b;
		});
	}

	export function withA0_readAsciiZ_1() {
		wrapInPolyfillsIfNecessary(function () {
			var buf = new ArrayBuffer(2);
			var vi = new DataView(buf);
			vi.setUint8(0, ("A").charCodeAt(0));
			vi.setUint8(1, 0);

			var bi = new pe.io.BufferReader(buf);

			var b = bi.readAsciiZ(1);
			if (b !== "A")
				throw b;
		});
	}

	export function withAB0_readByte_readAsciiZ_1() {
		wrapInPolyfillsIfNecessary(function () {
			var buf = new ArrayBuffer(3);
			var vi = new DataView(buf);
			vi.setUint8(0, ("A").charCodeAt(0));
			vi.setUint8(1, ("B").charCodeAt(0));
			vi.setUint8(2, 0);

			var bi = new pe.io.BufferReader(buf);

			bi.readByte();

			var b = bi.readAsciiZ(1);
			if (b !== "B")
				throw b;
		});
	}

	export function withAB0_readByte_readAsciiZ_2() {
		wrapInPolyfillsIfNecessary(function () {
			var buf = new ArrayBuffer(3);
			var vi = new DataView(buf);
			vi.setUint8(0, ("A").charCodeAt(0));
			vi.setUint8(1, ("B").charCodeAt(0));
			vi.setUint8(2, 0);

			var bi = new pe.io.BufferReader(buf);

			bi.readByte();

			var b = bi.readAsciiZ(2);
			if (b !== "B")
				throw b;
		});
	}

	export function withAB0_readByte_readAsciiZ_3() {
		wrapInPolyfillsIfNecessary(function () {
			var buf = new ArrayBuffer(3);
			var vi = new DataView(buf);
			vi.setUint8(0, ("A").charCodeAt(0));
			vi.setUint8(1, ("B").charCodeAt(0));
			vi.setUint8(2, 0);

			var bi = new pe.io.BufferReader(buf);

			bi.readByte();

			var b = bi.readAsciiZ(3);
			
			if (b !== "B")
				throw b;
		});
	}

	export function withABC_readByte_readAsciiZ_3_throws() {
		wrapInPolyfillsIfNecessary(function () {
			var buf = new ArrayBuffer(3);
			var vi = new DataView(buf);
			vi.setUint8(0, ("A").charCodeAt(0));
			vi.setUint8(1, ("B").charCodeAt(0));
			vi.setUint8(2, ("C").charCodeAt(0));

			var bi = new pe.io.BufferReader(buf);

			bi.readByte();

			try {
				var b = bi.readAsciiZ(3);
			}
			catch (expectedError) {
				return;
			}

			throw "Error expected.";
			
		});
	}
}