/// <reference path="DosHeader.ts" />
/// <reference path="PEHeader.ts" />
/// <reference path="OptionalHeader.ts" />
/// <reference path="SectionHeader.ts" />
/// <reference path="Subsystem.ts" />
/// <reference path="Machine.ts" />
/// <reference path="../Internal/FormatEnum.ts" />

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
                "peHeader: " + (this.peHeader ? "["+Mi.PE.Internal.formatEnum(this.peHeader.machine, Machine)+"]" : "null") + " " +
                "optionalHeader: " + (this.optionalHeader ? "["+Mi.PE.Internal.formatEnum(this.optionalHeader.subsystem, Subsystem)+","+this.optionalHeader.imageVersion + "]" : "null") + " " +
                "sectionHeaders: " + (this.sectionHeaders ? "[" + this.sectionHeaders.length + "]" : "null");
            return result;
        }
    }
}