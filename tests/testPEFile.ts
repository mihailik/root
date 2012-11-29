/// <reference path="../PEFile.ts" />

module test_PEFile {

    export function constructor_succeeds(ts) {
        var pefi = new pe.PEFile();
        ts.ok();
    }

    export function dosHeader_defaultNotNull(ts) {
        var pefi = new pe.PEFile();
        if (!pefi.dosHeader)
            ts.fail();
        else
            ts.ok();
    }

    export function peHeader_defaultNotNull(ts) {
        var pefi = new pe.PEFile();
        if (!pefi.peHeader)
            ts.fail();
        else
            ts.ok();
    }

    export function optionalHeader_defaultNotNull(ts) {
        var pefi = new pe.PEFile();
        if (!pefi.optionalHeader)
            ts.fail();
        else
            ts.ok();
    }

    export function sectionHeaders_defaultZeroLength(ts) {
        var pefi = new pe.PEFile();
        if (pefi.sectionHeaders.length!==0)
            ts.fail();
        else
            ts.ok();
    }

    export function toString_default(ts) {
        var pefi = new pe.PEFile();
        var expectedToString =
            "dosHeader: " + pefi.dosHeader +
            " dosStub: null" +
            " peHeader: [" + pefi.peHeader.machine + "]" +
            " optionalHeader: [" + pefi.optionalHeader.subsystem + "," + pefi.optionalHeader.imageVersion + "]" +
            " sectionHeaders: [0]";

        if (pefi.toString()!==expectedToString)
            ts.fail(pefi.toString() + " instead of expected " + expectedToString);
        else
            ts.ok();
    }
}