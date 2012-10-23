/// <reference path="DosHeader.ts" />
/// <reference path="PEHeader.ts" />

module Mi.PE.PEFormat {
    export class PEFile {
        dosHeader: DosHeader;
        dosStub: Uint8Array;
        peHeader: PEHeader;
        optionalHeader;
        sectionHeaders;
    }
}