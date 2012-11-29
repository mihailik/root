/// <reference path="../DosHeader.ts" />

module test_DosHeader {

    export function constructor_succeeds(ts) {
        var doh = new pe.DosHeader();
        ts.ok();
    }

    export function mz_defaultMZ() {
        var doh = new pe.DosHeader();
        if (doh.mz!==pe.MZSignature.MZ)
            throw doh.mz;
    }
}