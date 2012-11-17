/// <reference path="DosHeader.ts" />
/// <reference path="PEHeader.ts" />
/// <reference path="OptionalHeader.ts" />
/// <reference path="SectionHeader.ts" />
/// <reference path="io.ts" />

class PEFile {
    dosHeader: DosHeader;
    dosStub: Uint8Array;
    peHeader: PEHeader;
    optionalHeader: OptionalHeader;
    sectionHeaders: SectionHeader[];

    toString() {
        var result =
            "dosHeader: " + (this.dosHeader ? this.dosHeader + "" : "null") + " " +
            "dosStub: " + (this.dosStub ? "[" + this.dosStub.length + "]" : "null") + " " +
            "peHeader: " + (this.peHeader ? "[" + this.peHeader.machine + "]" : "null") + " " +
            "optionalHeader: " + (this.optionalHeader ? "[" + this.optionalHeader.subsystem + "," + this.optionalHeader.imageVersion + "]" : "null") + " " +
            "sectionHeaders: " + (this.sectionHeaders ? "[" + this.sectionHeaders.length + "]" : "null");
        return result;
    }

    read(reader: io.BinaryReader) {
        var dosHeaderSize: number = 64;

        if (this.dosHeader==null)
            this.dosHeader = new DosHeader();
        this.dosHeader.read(reader);

        if (this.dosHeader.lfanew > dosHeaderSize)
            this.dosStub = reader.readBytes(this.dosHeader.lfanew - dosHeaderSize);
        else
            this.dosStub = null;

        if (this.peHeader==null)
            this.peHeader = new PEHeader();
        this.peHeader.read(reader);
    }
}