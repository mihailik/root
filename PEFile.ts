/// <reference path="headers/DosHeader.ts" />
/// <reference path="headers/PEHeader.ts" />
/// <reference path="headers/OptionalHeader.ts" />
/// <reference path="headers/SectionHeader.ts" />
/// <reference path="io.ts" />

module pe {

    export class PEFile {
        dosHeader: headers.DosHeader = new headers.DosHeader();
        dosStub: Uint8Array;
        peHeader: headers.PEHeader = new headers.PEHeader();
        optionalHeader: headers.OptionalHeader = new headers.OptionalHeader();
        sectionHeaders: headers.SectionHeader[] = [];

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
                this.dosHeader = new headers.DosHeader();
            this.dosHeader.read(reader);

            if (this.dosHeader.lfanew > dosHeaderSize)
                this.dosStub = reader.readBytes(this.dosHeader.lfanew - dosHeaderSize);
            else
                this.dosStub = null;

            if (!this.peHeader)
                this.peHeader = new headers.PEHeader();
            this.peHeader.read(reader);

            if (!this.optionalHeader)
                this.optionalHeader = new headers.OptionalHeader();
            this.optionalHeader.read(reader);

            if (this.peHeader.numberOfSections > 0) {
                if (!this.sectionHeaders || this.sectionHeaders.length != this.peHeader.numberOfSections)
                    this.sectionHeaders = Array(this.peHeader.numberOfSections);

                for (var i = 0; i < this.sectionHeaders.length; i++) {
                    if (!this.sectionHeaders[i])
                        this.sectionHeaders[i] = new headers.SectionHeader();
                    this.sectionHeaders[i].read(reader);
                }
            }
        }
    }
}