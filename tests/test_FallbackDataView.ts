/// <reference path="../pe.ts" />

module test_FallbackDataView {

	export function constructor_succeeds() {
		var bi = new pe.io.FallbackDataView([]);
	}

	export function constructor_nullArgument_throws() {
    	try {
    		var bi = new pe.io.FallbackDataView(null);
    	}
		catch (expectedError) {
			return;
		}

		throw "Error was not thrown.";
	}

	export function content1_getUint8_0_1() {
		var bi = new pe.io.FallbackDataView([1]);

		var b = bi.getUint8(0);
		if (b !== 1)
			throw b;
	}

	export function content12_getUint8_1_2() {
		var bi = new pe.io.FallbackDataView([1, 2]);

		var b = bi.getUint8(1);
		if (b !== 2)
			throw b;
	}

	export function content1_getUint8_1_throws() {
		try {
			var bi = new pe.io.FallbackDataView([1]);

			var b = bi.getUint8(1);
		}
		catch (epectedError) {
			return;
		}

		throw "Error was not thrown.";
	}

	export function content1_0_2_getUint8_1_undefined() {
		var bi = new pe.io.FallbackDataView([1], 0, 2);

		var b = bi.getUint8(1);
		if (typeof(b) !== "undefined")
			throw b;
	}

	export function content12_getUint16_0_0x0201() {
		var bi = new pe.io.FallbackDataView([1, 2]);

		var b = bi.getUint16(0);
		if (b !== 0x0201)
			throw "ox" + b.toString(16);
	}

	export function contentFE_getUint16_0_0x0E0F() {
		var bi = new pe.io.FallbackDataView([0xF, 0xE]);

		var b = bi.getUint16(0);
		if (b !== 0x0E0F)
			throw "ox" + b.toString(16);
	}

	export function content1FE_getUint16_1_0x0E0F() {
		var bi = new pe.io.FallbackDataView([1, 0xF, 0xE]);

		var b = bi.getUint16(1);
		if (b !== 0x0E0F)
			throw "ox" + b.toString(16);
	}

	export function content1234_getUint32_0_0x04030201() {
		var bi = new pe.io.FallbackDataView([1, 2, 3, 4]);

		var b = bi.getUint32(0);
		if (b !== 0x04030201)
			throw "ox" + b.toString(16);
	}

	export function contentFEDC_getUint32_0_0x0C0D0E0F() {
		var bi = new pe.io.FallbackDataView([0xF, 0xE, 0xD, 0xC]);

		var b = bi.getUint32(0);
		if (b !== 0x0C0D0E0F)
			throw "ox" + b.toString(16);
	}

	export function content7FEDC_getUint32_1_0x0C0D0E0F() {
		var bi = new pe.io.FallbackDataView([7, 0xF, 0xE, 0xD, 0xC]);

		var b = bi.getUint32(1);
		if (b !== 0x0C0D0E0F)
			throw "ox" + b.toString(16);
	}
}