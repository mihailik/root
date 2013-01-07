/// <reference path="../pe.ts" />
/// <reference path="sampleExe.ts" />

module test_AssemblyReader_sampleExe {

	export function read_succeeds() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var appDomain = new pe.managed2.AppDomain();
		var asm = appDomain.read(bi);
	}
}