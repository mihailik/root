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

    export function numberOfSymbols_default0() {
        var peh = new pe.PEHeader();
        if (peh.numberOfSymbols !== 0)
            throw peh.numberOfSymbols;
    }

    export function sizeOfOptionalHeader_default0() {
        var peh = new pe.PEHeader();
        if (peh.sizeOfOptionalHeader !== 0)
            throw peh.sizeOfOptionalHeader;
    }

    export function characteristics_defaultDll() {
        var peh = new pe.PEHeader();
        if (peh.characteristics !== pe.ImageCharacteristics.Dll)
            throw peh.characteristics;
    }

    export function toString_default() {
        var peh = new pe.PEHeader();
        if (peh.toString() !== peh.machine + " " + peh.characteristics + " Sections[0]")
            throw peh.toString();
    }
}