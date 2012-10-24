/// <reference path="DosHeader.ts" />
/// <reference path="PEHeader.ts" />
/// <reference path="OptionalHeader.ts" />

module Mi.PE.PEFormat {
    export class PEFile {
        dosHeader: DosHeader;
        dosStub: Uint8Array;
        peHeader: PEHeader;
        optionalHeader: OptionalHeader;
        sectionHeaders: SectionHeader[];

        toString() {
            var result = 
                "dosHeader: " + (this.dosHeader ? this.dosHeader + "" : "null") + " " +
                "dosStub: " + (this.dosStub ? "[" + this.dosStub.length + "]" : "null") + " " +
                "peHeader: " + (this.peHeader ? this.peHeader + "" : "null") + " " +
                "optionalHeader: " + (this.optionalHeader ? this.optionalHeader + "" : "null") + " " +
                "sectionHeaders: " + (this.sectionHeaders ? "[" + this.sectionHeaders.length + "]" : "null");
            return result;
        }
    }
}