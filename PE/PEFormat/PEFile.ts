/// <reference path="DosHeader.ts" />
/// <reference path="PEHeader.ts" />
/// <reference path="OptionalHeader.ts" />

module Mi.PE.PEFormat {
    export class PEFile {
        dosHeader: DosHeader;
        dosStub: Uint8Array;
        peHeader: PEHeader;
        optionalHeader: OptionalHeader;
        sectionHeaders;
    }
}