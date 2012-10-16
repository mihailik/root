/// <reference path="BinaryReader.ts" />

var mzSignature = 23117;
var DosHeaderSize = 64;

interface PEFileSuccess {
    (peFile: PEFile);
}

class PEFile {
    static dosHeaderSize = 64;
    static peHeaderSize = 6;
    static sectionHeaderSize = 10;

    machine: number;
    timestamp: Date;
    imageCharacteristics: number;
    addressOfEntryPoint: number;
    majorOSVersion: number;
    minorOSVersion: number;
    majorImageVersion: number;
    minorImageVersion: number;
    win32Version: number;
    subsystem: number;
    dllCharacteristics: number;

    static read(
        reader: BinaryReader,
        onsuccess: PEFileSuccess,
        onfailure: Failure) {

        var pe = new PEFile();
        pe.readCore(
            reader,
            () => onsuccess(pe),
            onfailure);
    }

    readCore(
        reader: BinaryReader,
        onsuccess,
        onfailure: Failure) {

        reader.readUint32(
            DosHeaderSize / 4,
            dosHeader => {
                var lfanew = this.parseDosHeader(dosHeader);

                reader.offset = lfanew;

                reader.readUint32(
                    PEFile.peHeaderSize,
                    peHeader => {

                        var peHeaderOutput = this.parsePEHeader(peHeader);

                        reader.readUint32(
                            peHeaderOutput.sizeOfOptionalHeader,
                            optionalHeader => {

                                var optionalHeaderOutput = this.parseOptionalHeader(optionalHeader);

                                reader.offset = optionalHeaderOutput.sectionsStartOffset;
                                reader.readUint32(
                                    peHeaderOutput.numberOfSections * PEFile.sectionHeaderSize,
                                    sectionHeaders => {

                                        this.parseSectionHeaders(
                                            sectionHeaders,
                                            peHeaderOutput.numberOfSections);

                                        onsuccess();
                                    }, onfailure);
                            }, onfailure);
                    }, onfailure);
            }, onfailure);
    }

    private parseDosHeader(dosHeader: Uint32Array) {

        var mzPlus = dosHeader[0];
        mzPlus = mzPlus & 0xFFFF;

        if (mzPlus != mzSignature)
            throw new Error("MZ signature is invalid.");

        var lfanew = dosHeader[dosHeader.length - 1];
        return lfanew;
    }

    private parsePEHeader(peHeader: Uint32Array) {
        var peSignature = 17744;

        if (peHeader[0] != peSignature)
            throw new Error("PE signature is invalid.");

        this.machine = peHeader[1] & 0xFFFF;

        var numberOfSections = peHeader[1] >> 16;

        var timestampSecondsFromEpochUtc = peHeader[2];
        this.timestamp = new Date(timestampSecondsFromEpochUtc * 1000);
        this.timestamp = new Date(
            Date.UTC(
                this.timestamp.getFullYear(),
                this.timestamp.getMonth(),
                this.timestamp.getDate(),
                this.timestamp.getHours(),
                this.timestamp.getMinutes(),
                this.timestamp.getSeconds(),
                this.timestamp.getMilliseconds()));

        var sizeOfOptionalHeader = peHeader[5] & 0xFFFF;
        this.imageCharacteristics = peHeader[5] >> 16;

        return { numberOfSections: numberOfSections, sizeOfOptionalHeader: sizeOfOptionalHeader };
    }

    private parseOptionalHeader(optionalHeader: Uint32Array) {

        var nt32Magic = 0x010B;
        var nt64Magic = 0x020B;

        var magic = optionalHeader[0] & 0xFFFF;
        if (magic != nt32Magic && magic != nt64Magic)
            throw new Error("PE magic field is invalid.");

        this.addressOfEntryPoint = optionalHeader[4];

        this.majorOSVersion = optionalHeader[10] & 0xFFFF;
        this.minorOSVersion = optionalHeader[10] >> 16;

        this.majorImageVersion = optionalHeader[11] & 0xFFFF;
        this.minorImageVersion = (optionalHeader[11] >> 16) & 0xFFFF;

        this.win32Version = optionalHeader[12];

        this.subsystem = optionalHeader[17] & 0xFFFF;
        this.dllCharacteristics = (optionalHeader[17] >> 16) & 0xFFFF;

        var rvaCountHeaderOffset = magic == nt32Magic ? 23 : 23 + 4;

        var numberOfRvaAndSizes = optionalHeader[rvaCountHeaderOffset];
        var clrDataDirectoryIndex = 14;
        if (numberOfRvaAndSizes < clrDataDirectoryIndex + 1)
            throw new Error("PE image does not contain CLR directory.");

        var clrDirHeaderOffset = rvaCountHeaderOffset + 4 + clrDataDirectoryIndex * 4;
        var clrDirVA = optionalHeader[clrDirHeaderOffset];
        var clrDirSize = optionalHeader[clrDirHeaderOffset + 4];

        return {
            numberOfRvaAndSizes: numberOfRvaAndSizes,
            sectionsStartOffset: rvaCountHeaderOffset + 4 + numberOfRvaAndSizes * 4,
            clrDirVA: clrDirVA,
            clrDirSize: clrDirSize
        };
    }

    private parseSectionHeaders(sectionHeaders: Uint32Array, numberOfSections: number) {
        var sections = new Array[numberOfSections];
        for (var i = 0; i < numberOfSections; i++) {
            sections[i] = {
                virtualSize: sectionHeaders[i*PEFile.sectionHeaderSize +2],
                virtualAddress: sectionHeaders[i*PEFile.sectionHeaderSize +3],
                sizeOfRawData: sectionHeaders[i*PEFile.sectionHeaderSize +4],
                pointerToRawData: sectionHeaders[i*PEFile.sectionHeaderSize +5],
                toString: () => {
                    "["+this.virtualSize.toString(16)+":"+
                }
            };
        }

        var debug: any = this;
        debug.sections = sections;
    }
}