/// <reference path="../DosHeader.ts" />

module test_DosHeader {

    export function constructor_succeeds() {
        var doh = new pe.DosHeader();
    }

    export function mz_defaultMZ() {
        var doh = new pe.DosHeader();
        if (doh.mz !== pe.MZSignature.MZ)
            throw doh.mz;
    }

    export function cblp_default144() {
        var doh = new pe.DosHeader();
        if (doh.cblp !== 144)
            throw doh.cblp;
    }

    export function cp_default3() {
        var doh = new pe.DosHeader();
        if (doh.cp !== 3)
            throw doh.cp;
    }

    export function crlc_default0() {
        var doh = new pe.DosHeader();
        if (doh.crlc !== 0)
            throw doh.crlc;
    }

    export function cparhdr_default4() {
        var doh = new pe.DosHeader();
        if (doh.cparhdr !== 4)
            throw doh.cparhdr;
    }

    export function minalloc_default0() {
        var doh = new pe.DosHeader();
        if (doh.minalloc !== 0)
            throw doh.minalloc;
    }

    export function maxalloc_default0() {
        var doh = new pe.DosHeader();
        if (doh.maxalloc !== 0)
            throw doh.maxalloc;
    }

    export function ss_default0() {
        var doh = new pe.DosHeader();
        if (doh.ss !== 0)
            throw doh.ss;
    }

    export function sp_default0() {
        var doh = new pe.DosHeader();
        if (doh.sp !== 0)
            throw doh.sp;
    }

    export function csum_default0() {
        var doh = new pe.DosHeader();
        if (doh.csum !== 0)
            throw doh.csum;
    }

    export function cs_default0() {
        var doh = new pe.DosHeader();
        if (doh.cs !== 0)
            throw doh.cs;
    }

    export function lfarlc_default0() {
        var doh = new pe.DosHeader();
        if (doh.lfarlc !== 0)
            throw doh.lfarlc;
    }

    export function ovno_default0() {
        var doh = new pe.DosHeader();
        if (doh.ovno !== 0)
            throw doh.ovno;
    }

    export function res1_default0() {
        var doh = new pe.DosHeader();
        if (doh.res1.hi !== 0 || doh.res1.lo !== 0)
            throw doh.res1;
    }

    export function oemid_default0() {
        var doh = new pe.DosHeader();
        if (doh.oemid !== 0)
            throw doh.oemid;
    }

    export function oeminfo_default0() {
        var doh = new pe.DosHeader();
        if (doh.oeminfo !== 0)
            throw doh.oeminfo;
    }

    export function reserved_defaultArray5() {
        var doh = new pe.DosHeader();
        if (doh.reserved.length !== 5
            || doh.reserved[0] !== 0
            || doh.reserved[1] !== 0
            || doh.reserved[2] !== 0
            || doh.reserved[3] !== 0
            || doh.reserved[4] !== 0)
            throw doh.reserved;
    }

    export function lfanew_default0() {
        var doh = new pe.DosHeader();
        if (doh.lfanew !== 0)
            throw doh.lfanew;
    }

    export function toString_default() {
        var doh = new pe.DosHeader();
        if (doh.toString() !== "[MZ].lfanew=0h")
            throw doh.toString();
    }

    export function toString_mz_oxEA() {
        var doh = new pe.DosHeader();
        doh.mz = 0xEA;
        if (doh.toString() !== "[EAh].lfanew=0h")
            throw doh.toString();
    }

    export function toString_lfanew_oxFF803() {
        var doh = new pe.DosHeader();
        doh.lfanew = 0xFF803;
        if (doh.toString() !== "[MZ].lfanew=FF803h")
            throw doh.toString();
    }
}