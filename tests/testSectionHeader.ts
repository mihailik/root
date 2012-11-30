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
}