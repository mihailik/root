/// <reference path="../SectionHeader.ts" />

module test_SectionHeader {

    export function constructor_succeeds() {
        var seh = new pe.SectionHeader();
    }

    export function name_defaultEmptyString() {
        var seh = new pe.SectionHeader();
        if (seh.name !== "")
            throw seh.name;
    }

    export function virtualRange_default() {
        var seh = new pe.SectionHeader();
        if (seh.virtualRange.address !== 0 || seh.virtualRange.size !== 0)
            throw seh.virtualRange;
    }

    export function pointerToRelocations_default0() {
        var seh = new pe.SectionHeader();
        if (seh.pointerToRelocations !== 0)
            throw seh.pointerToRelocations;
    }
}