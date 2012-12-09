// <reference path="../pe.ts" />

module test_PEFile {

    export function constructor_succeeds() {
        var pefi = new pe.headers.PEFile();
    }

    export function dosHeader_defaultNotNull() {
        var pefi = new pe.headers.PEFile();
        if (!pefi.dosHeader)
            throw pefi.dosHeader;
    }

    export function peHeader_defaultNotNull() {
        var pefi = new pe.headers.PEFile();
        if (!pefi.peHeader)
            throw pefi.peHeader;
    }

    export function optionalHeader_defaultNotNull() {
        var pefi = new pe.headers.PEFile();
        if (!pefi.optionalHeader)
            throw pefi.optionalHeader;
    }

    export function sectionHeaders_defaultZeroLength() {
        var pefi = new pe.headers.PEFile();
        if (pefi.sectionHeaders.length!==0)
            throw pefi.sectionHeaders.length;
    }

    export function toString_default() {
        var pefi = new pe.headers.PEFile();
        var expectedToString =
            "dosHeader: " + pefi.dosHeader +
            " dosStub: null" +
            " peHeader: [" + pefi.peHeader.machine + "]" +
            " optionalHeader: [" + pefi.optionalHeader.subsystem + "," + pefi.optionalHeader.imageVersion + "]" +
            " sectionHeaders: [0]";

        if (pefi.toString()!==expectedToString)
            throw pefi.toString() + " instead of expected " + expectedToString;
    }
}