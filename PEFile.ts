/// <reference path="DosHeader.ts" />
/// <reference path="PEHeader.ts" />
/// <reference path="OptionalHeader.ts" />
// <reference path="SectionHeader.ts" />

class PEFile {
    dosHeader: DosHeader;
    dosStub: Uint8Array;
    peHeader: PEHeader;
    optionalHeader: OptionalHeader;
//    sectionHeaders: SectionHeader[];

    //toString() {
    //    var result =
    //        "dosHeader: " + (this.dosHeader ? this.dosHeader + "" : "null") + " " +
    //        "dosStub: " + (this.dosStub ? "[" + this.dosStub.length + "]" : "null") + " " +
    //        "peHeader: " + (this.peHeader ? "[" + this.peHeader.machine + "]" : "null") + " " +
    //        "optionalHeader: " + (this.optionalHeader ? "[" + this.optionalHeader.subsystem + "," + this.optionalHeader.imageVersion + "]" : "null") + " " +
    //        "sectionHeaders: " + (this.sectionHeaders ? "[" + this.sectionHeaders.length + "]" : "null");
    //    return result;
    //}
}