/// <reference path="../pe.ts" />

module test_BufferReader_arrays {

	export function constructor_WithEmptyArray_succeeds() {
		var bi = new pe.io.BufferReader([]);
	}

	export function constructor_WithArrayOf10_succeeds() {
		var bi = new pe.io.BufferReader([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
	}

	export function with123_readByte_1() {
		var bi = new pe.io.BufferReader([1, 2, 3]);

		var b = bi.readByte();
		if (b !== 1)
			throw b;
	}

	export function with123_readShort_0x0201() {
		var bi = new pe.io.BufferReader([1, 2, 3]);

		var b = bi.readShort();
		if (b !== 0x0201)
			throw "0x" + b.toString(16);
	}

	export function with1234_readInt_0x04030201() {
		var bi = new pe.io.BufferReader([1, 2, 3, 4]);

		var b = bi.readInt();
		if (b !== 0x04030201)
			throw "0x" + b.toString(16);
	}

	export function withFEDC_readInt_0x0C0D0E0F() {
		var bi = new pe.io.BufferReader([0xF, 0xE, 0xD, 0xC]);

		var b = bi.readInt();
		if (b !== 0x0C0D0E0F)
			throw "0x" + b.toString(16);
	}

	export function with01_readInt_throws() {
		var bi = new pe.io.BufferReader([0xF, 0xE]);

		bi.readByte();

		try {
			var b = bi.readInt();
		}
		catch (expectedError) {
			return;
		}

		throw "Error expected.";
	}

	export function withFEDCBA21_readLong_1020A0BC0D0E0Fh() {
		var bi = new pe.io.BufferReader([0xF, 0xE, 0xD, 0xC, 0xB, 0xA, 2, 1]);

		var b = bi.readLong();
		if (b.toString() !== "1020A0BC0D0E0Fh")
			throw b.toString();
	}

	export function with0FEDCBA21_readByte_readLong_1020A0BC0D0E0Fh() {
		var bi = new pe.io.BufferReader([0, 0xF, 0xE, 0xD, 0xC, 0xB, 0xA, 2, 1]);

		bi.readByte();

		var b = bi.readLong();
		if (b.toString() !== "1020A0BC0D0E0Fh")
			throw b.toString();
	}

	export function with01_readByte_readLong_throws() {
		var bi = new pe.io.BufferReader([0, 1]);

		bi.readByte();

		try {
			var b = bi.readLong();
		}
		catch (expectedError) {
			return;
		}

		throw "Error expected.";
	}

	export function with0_readZeroFilledAscii_1() {
		var bi = new pe.io.BufferReader([0]);

		var b = bi.readZeroFilledAscii(1);
		if (b !== "")
			throw b;
	}

	export function with0_readZeroFilledAscii_0() {
		var bi = new pe.io.BufferReader([0]);

		var b = bi.readZeroFilledAscii(0);
		if (b !== "")
			throw b;
	}

	export function withA0_readZeroFilledAscii_2() {
		var bi = new pe.io.BufferReader([("A").charCodeAt(0), 0]);

		var b = bi.readZeroFilledAscii(2);
		if (b !== "A")
			throw b;
	}

	export function withA0_readZeroFilledAscii_1() {
		var bi = new pe.io.BufferReader([("A").charCodeAt(0), 0]);

		var b = bi.readZeroFilledAscii(1);
		if (b !== "A")
			throw b;
	}

	export function withAB0_readByte_readZeroFilledAscii_1() {
		var bi = new pe.io.BufferReader([("A").charCodeAt(0), ("B").charCodeAt(0), 0]);

		bi.readByte();

		var b = bi.readZeroFilledAscii(1);
		if (b !== "B")
			throw b;
	}

	export function withAB0_readByte_readZeroFilledAscii_2() {
		var bi = new pe.io.BufferReader([("A").charCodeAt(0), ("B").charCodeAt(0), 0]);

		bi.readByte();

		var b = bi.readZeroFilledAscii(2);
		if (b !== "B")
			throw b;
	}

	export function withAB0_readByte_readZeroFilledAscii_3_throws() {
		var bi = new pe.io.BufferReader([("A").charCodeAt(0), ("B").charCodeAt(0), 0]);

		bi.readByte();

		try {
			var b = bi.readZeroFilledAscii(3);
		}
		catch (expectedError) {
			return;
		}

		throw "Error expected.";
	}

	export function with0_readAsciiZ_1() {
		var bi = new pe.io.BufferReader([0]);

		var b = bi.readAsciiZ(1);
		if (b !== "")
			throw b;
	}

	export function with0_readAsciiZ_0() {
		var bi = new pe.io.BufferReader([0]);

		var b = bi.readAsciiZ(0);
		if (b !== "")
			throw b;
	}

	export function withA0_readAsciiZ_2() {
		var bi = new pe.io.BufferReader([("A").charCodeAt(0), 0]);

		var b = bi.readAsciiZ(2);
		if (b !== "A")
			throw b;
	}

	export function withASpace_readAsciiZ_1() {
		var bi = new pe.io.BufferReader([("A").charCodeAt(0), 32]);

		var b = bi.readAsciiZ(1);
		if (b !== "A")
			throw b;
	}

	export function withA0_readAsciiZ_1() {
		var bi = new pe.io.BufferReader([("A").charCodeAt(0), 0]);

		var b = bi.readAsciiZ(1);
		if (b !== "A")
			throw b;
	}

	export function withAB0_readByte_readAsciiZ_1() {
		var bi = new pe.io.BufferReader([("A").charCodeAt(0), ("B").charCodeAt(0), 0]);

		bi.readByte();

		var b = bi.readAsciiZ(1);
		if (b !== "B")
			throw b;
	}

	export function withAB0_readByte_readAsciiZ_2() {
		var bi = new pe.io.BufferReader([("A").charCodeAt(0), ("B").charCodeAt(0), 0]);

		bi.readByte();

		var b = bi.readAsciiZ(2);
		if (b !== "B")
			throw b;
	}

	export function withAB0_readByte_readAsciiZ_3() {
		var bi = new pe.io.BufferReader([("A").charCodeAt(0), ("B").charCodeAt(0), 0]);

		bi.readByte();

		var b = bi.readAsciiZ(3);

		if (b !== "B")
			throw b;
	}

	export function withABC_readByte_readAsciiZ_3_throws() {
		var bi = new pe.io.BufferReader([("A").charCodeAt(0), ("B").charCodeAt(0), ("B").charCodeAt(0)]);

		bi.readByte();

		try {
			var b = bi.readAsciiZ(3);
		}
		catch (expectedError) {
			return;
		}

		throw "Error expected.";
	}

	export function with0_readUtf8Z_1() {
		var bi = new pe.io.BufferReader([0]);

		var b = bi.readUtf8Z(1);
		if (b !== "")
			throw b;
	}

	export function with0_readUtf8Z_0() {
		var bi = new pe.io.BufferReader([0]);

		var b = bi.readUtf8Z(0);
		if (b !== "")
			throw b;
	}

	export function withA0_readUtf8Z_2() {
		var bi = new pe.io.BufferReader([("A").charCodeAt(0), 0]);

		var b = bi.readUtf8Z(2);
		if (b !== "A")
			throw b;
	}

	export function withASpace_readUtf8Z_1() {
		var bi = new pe.io.BufferReader([("A").charCodeAt(0), 32]);

		var b = bi.readUtf8Z(1);
		if (b !== "A")
			throw b;
	}

	export function withA0_readUtf8Z_1() {
		var bi = new pe.io.BufferReader([("A").charCodeAt(0), 0]);

		var b = bi.readUtf8Z(1);
		if (b !== "A")
			throw b;
	}

	export function withAB0_readByte_readUtf8Z_1() {
		var bi = new pe.io.BufferReader([("A").charCodeAt(0), ("B").charCodeAt(0), 0]);

		bi.readByte();

		var b = bi.readUtf8Z(1);
		if (b !== "B")
			throw b;
	}

	export function withAB0_readByte_readUtf8Z_2() {
		var bi = new pe.io.BufferReader([("A").charCodeAt(0), ("B").charCodeAt(0), 0]);

		bi.readByte();

		var b = bi.readUtf8Z(2);
		if (b !== "B")
			throw b;
	}

	export function withAB0_readByte_readUtf8Z_3() {
		var bi = new pe.io.BufferReader([("A").charCodeAt(0), ("B").charCodeAt(0), 0]);

		bi.readByte();

		var b = bi.readUtf8Z(3);

		if (b !== "B")
			throw b;
	}

	export function withABC_readByte_readUtf8Z_3_throws() {
		var bi = new pe.io.BufferReader([("A").charCodeAt(0), ("B").charCodeAt(0), ("C").charCodeAt(0)]);

		bi.readByte();

		try {
			var b = bi.readUtf8Z(3);
		}
		catch (expectedError) {
			return;
		}

		throw "Error expected.";
	}

	export function withChineseMi_readUtf8Z() {
		var bi = new pe.io.BufferReader([0xE6, 0x9C, 0xAA]);

		var b = bi.readUtf8Z(3);
		if (b.charCodeAt(0) !== 26410)
			throw b + " (" + b.charCodeAt(0) + ") expected " + String.fromCharCode(26410) + " (26410)";
	}

	export function withChineseMiSpaceSpace_readUtf8Z() {
		var bi = new pe.io.BufferReader([0xE6, 0x9C, 0xAA, 32, 32]);

		var b = bi.readUtf8Z(3);
		if (b.charCodeAt(0) !== 26410)
			throw b + " (" + b.charCodeAt(0) + ") expected " + String.fromCharCode(26410) + " (26410)";
	}

	export function withRussianSch_readUtf8Z() {
		var bi = new pe.io.BufferReader([0xD0, 0xA9]);

		var b = bi.readUtf8Z(2);
		if (b.charCodeAt(0) !== 1065)
			throw b + " (" + b.charCodeAt(0) + ") expected " + String.fromCharCode(1065) + " (1065)";
	}

	export function withRussianSchSpaceSpace_readUtf8Z() {
		var bi = new pe.io.BufferReader([0xD0, 0xA9, 32, 32]);

		var b = bi.readUtf8Z(2);
		if (b.charCodeAt(0) !== 1065)
			throw b + " (" + b.charCodeAt(0) + ") expected " + String.fromCharCode(1065) + " (1065)";
	}
}