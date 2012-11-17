// <reference path="MZSignature.ts" />
// <reference path="Long.ts" />

export class DosHeader {
    mz: MZSignature;

    // Bytes on last page of file.
    cblp: number;

    // Pages in file.
    cp: number;

    // Relocations.
    crlc: number;

    // Size of header in paragraphs.
    cparhdr: number;

    // Minimum extra paragraphs needed.
    minalloc: number;

    // Maximum extra paragraphs needed.
    maxalloc: number;

    // Initial (relative) SS value.
    ss: number;

    // Initial SP value.
    sp: number;

    // Checksum.
    csum: number;

    // Initial IP value.
    ip: number;

    // Initial (relative) CS value.
    cs: number;

    // File address of relocation table.
    lfarlc: number;

    // Overlay number.
    ovno: number;

    res1: Long;

    // OEM identifier (for e_oeminfo).
    oemid: number;

    // OEM information: number; e_oemid specific.
    oeminfo: number;

    reserved: number[]; // uint[5]

    // uint: File address of PE header.
    lfanew: number;

    toString() {
        var result =
            "[" +
            (this.mz == MZSignature.MZ ? "MZ" :
            typeof this.mz == "number" ? (<number>this.mz).toString(16) + "h" :
            typeof this.mz) + "]" +

            ".lfanew=" +
            (typeof this.lfanew == "number" ? this.lfanew.toString(16) + "h" :
            typeof this.lfanew);

        return result;
    }
}