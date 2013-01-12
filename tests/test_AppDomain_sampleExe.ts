/// <reference path="../pe.ts" />
/// <reference path="sampleExe.ts" />

module test_AppDomain_sampleExe {

	export function constructor_succeeds() {
		var appDomain = new pe.managed2.AppDomain();
	}

	export function read_succeeds() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var appDomain = new pe.managed2.AppDomain();
		var asm = appDomain.read(bi);
	}

	export function read_toString() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var appDomain = new pe.managed2.AppDomain();
		var asm = appDomain.read(bi);

		var expectedFullName = "sample, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null";

		if (asm.toString() !== expectedFullName)
			throw asm.toString() + " expected " + expectedFullName;
	}
}