/// <reference path="../PEFile.ts" />

module test_PEFile {

export function constructor_succeeds(ts) {
	var pefi = new pe.PEFile();
	ts.ok();
}

export function dosHeader_notNull(ts) {
	var pefi = new pe.PEFile();
	if (!pefi.dosHeader)
		ts.fail();
	else
		ts.ok();
}

}