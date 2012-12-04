/// <reference path="DosHeader.ts" />
/// <reference path="PEHeader.ts" />
/// <reference path="OptionalHeader.ts" />
/// <reference path="SectionHeader.ts" />
/// <reference path="../io.ts" />

module pe.headers {

    export class PEFile {
        dosHeader: DosHeader = new DosHeader();
        dosStub: Uint8Array;
        peHeader: PEHeader = new PEHeader();
        optionalHeader: OptionalHeader = new OptionalHeader();
        sectionHeaders: SectionHeader[] = [];

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

            if (!this.dosHeader)
                this.dosHeader = new DosHeader();
            this.dosHeader.read(reader);

            if (this.dosHeader.lfanew > dosHeaderSize)
                this.dosStub = reader.readBytes(this.dosHeader.lfanew - dosHeaderSize);
            else
                this.dosStub = null;

            if (!this.peHeader)
                this.peHeader = new PEHeader();
            this.peHeader.read(reader);

            if (!this.optionalHeader)
                this.optionalHeader = new OptionalHeader();
            this.optionalHeader.read(reader);

            if (this.peHeader.numberOfSections > 0) {
                if (!this.sectionHeaders || this.sectionHeaders.length != this.peHeader.numberOfSections)
                    this.sectionHeaders = Array(this.peHeader.numberOfSections);

                for (var i = 0; i < this.sectionHeaders.length; i++) {
                    if (!this.sectionHeaders[i])
                        this.sectionHeaders[i] = new SectionHeader();
                    this.sectionHeaders[i].read(reader);
                }
            }
        }
    }
}