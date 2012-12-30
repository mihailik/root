/// <reference path="../pe.ts" />
/// <reference path="sampleExe.ts" />

module test_AssemblyReader_sampleExe {

	export function read_succeeds() {
		var bi = new pe.io.BufferReader(sampleExe.bytes);
		var asmCache = new pe.managed2.AssemblyCache();
		var asm = asmCache.read(bi);
	}
}