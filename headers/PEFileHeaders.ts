/// <reference path="DosHeader.ts" />
/// <reference path="PEHeader.ts" />
/// <reference path="OptionalHeader.ts" />
/// <reference path="SectionHeader.ts" />
/// <reference path="../io/io.ts" />

module pe.headers {

    export class PEFileHeaders {
    	location = new io.AddressRange();

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
                "optionalHeader: " + (this.optionalHeader ? "[" + io.formatEnum(this.optionalHeader.subsystem, Subsystem) + "," + this.optionalHeader.imageVersion + "]" : "null") + " " +
                "sectionHeaders: " + (this.sectionHeaders ? "[" + this.sectionHeaders.length + "]" : "null");
            return result;
        }

        read(reader: io.BinaryReader) {
            var dosHeaderSize: number = 64;

            if (!this.dosHeader)
                this.dosHeader = new DosHeader();
            this.dosHeader.readOld(reader);

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

		read2(reader: io.BufferReader) {
            var dosHeaderSize: number = 64;

			if (!this.location)
				this.location = new io.AddressRange();

			this.location.address = reader.offset;

            if (!this.dosHeader)
                this.dosHeader = new DosHeader();
            this.dosHeader.read(reader);

            var dosHeaderLength = this.dosHeader.lfanew - dosHeaderSize;
            if (dosHeaderLength > 0) {
            	var global = (function () { return this; })();

				if (!this.dosStub)
					this.dosStub = ("Uint8Array" in global) ? new Uint8Array(dosHeaderLength) : <any>Array(dosHeaderLength);

				for (var i = 0; i < dosHeaderLength; i++) {
					this.dosStub[i] = reader.readByte();
				}
            }
            else {
            	this.dosStub = null;
            }

            if (!this.peHeader)
                this.peHeader = new PEHeader();
            this.peHeader.read2(reader);

            if (!this.optionalHeader)
                this.optionalHeader = new OptionalHeader();
            this.optionalHeader.read2(reader);

            if (this.peHeader.numberOfSections > 0) {
                if (!this.sectionHeaders || this.sectionHeaders.length != this.peHeader.numberOfSections)
                    this.sectionHeaders = Array(this.peHeader.numberOfSections);

                for (var i = 0; i < this.sectionHeaders.length; i++) {
                    if (!this.sectionHeaders[i])
                        this.sectionHeaders[i] = new SectionHeader();
                    this.sectionHeaders[i].read2(reader);
                }
            }

            this.location.size = reader.offset - this.location.address;
        }
    }
}