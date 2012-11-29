/// <reference path="../PEHeader.ts" />

module test_PEHeader {

    export function constructor_succeeds() {
        var peh = new pe.PEHeader();
    }

    export function pe_defaultPE() {
        var peh = new pe.PEHeader();
        if (peh.pe !== pe.PESignature.PE)
            throw peh.pe;
    }

    export function machine_defaultI386() {
        var peh = new pe.PEHeader();
        if (peh.machine !== pe.Machine.I386)
            throw peh.machine;
    }

    export function numberOfSections_default0() {
        var peh = new pe.PEHeader();
        if (peh.numberOfSections !== 0)
            throw peh.numberOfSections;
    }

    export function timestamp_defaultZeroDate() {
        var peh = new pe.PEHeader();
        if (peh.timestamp.getTime() !== new Date(0).getTime())
            throw peh.timestamp;
    }

    export function pointerToSymbolTable_default0() {
        var peh = new pe.PEHeader();
        if (peh.pointerToSymbolTable !== 0)
            throw peh.pointerToSymbolTable;
    }
}