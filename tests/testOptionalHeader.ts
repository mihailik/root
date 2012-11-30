/// <reference path="../OptionalHeader.ts" />

module test_OptionalHeader {

    export function constructor_succeeds() {
        var oph = new pe.OptionalHeader();
    }

    export function peMagic_defaultNT32() {
        var oph = new pe.OptionalHeader();
        if (oph.peMagic !== pe.PEMagic.NT32)
            throw oph.peMagic;
    }

    export function linkerVersion_defaultEmptyString() {
        var oph = new pe.OptionalHeader();
        if (oph.linkerVersion !== "")
            throw oph.linkerVersion;
    }

    export function sizeOfCode_default0() {
        var oph = new pe.OptionalHeader();
        if (oph.sizeOfCode !== 0)
            throw oph.sizeOfCode;
    }

    export function sizeOfInitializedData_default0() {
        var oph = new pe.OptionalHeader();
        if (oph.sizeOfInitializedData !== 0)
            throw oph.sizeOfInitializedData;
    }

    export function sizeOfUninitializedData_default0() {
        var oph = new pe.OptionalHeader();
        if (oph.sizeOfUninitializedData !== 0)
            throw oph.sizeOfUninitializedData;
    }
}