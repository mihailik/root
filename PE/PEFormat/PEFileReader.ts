// <reference path="PEFile.ts" />
// <reference path="DosHeader.ts" />
// <reference path="PEHeader.ts" />
// <reference path="OptionalHeader.ts" />
// <reference path="SectionHeader.ts" />

// <reference path="MZSignature.ts" />
// <reference path="PESignature.ts" />
// <reference path="PEMagic.ts" />
// <reference path="DllCharacteristics.ts" />

// <reference path="SectionCharacteristics.ts" />

// <reference path="../IO/BinaryReader.ts" />

module Mi.PE.PEFormat {
    var dosHeaderSize: number = 64;

    export function readPEFile(peFile: PEFile, reader: Mi.PE.IO.BinaryReader) {
        if (!peFile.dosHeader)
            peFile.dosHeader = new DosHeader();

        readDosHeader(peFile.dosHeader, reader);

        if (peFile.dosHeader.lfanew > dosHeaderSize)
            peFile.dosStub = reader.readBytes(peFile.dosHeader.lfanew - dosHeaderSize);

        if (!peFile.peHeader)
            peFile.peHeader = new PEHeader();

        readPEHeader(peFile.peHeader, reader);

        if (!peFile.optionalHeader)
            peFile.optionalHeader = new OptionalHeader();

        readOptionalHeader(peFile.optionalHeader, reader);

        if (peFile.peHeader.numberOfSections > 0) {
            peFile.sectionHeaders = Array(peFile.peHeader.numberOfSections);
            for (var i = 0; i < peFile.sectionHeaders.length; i++) {
                var sectionHeader = new SectionHeader();
                readSectionHeader(sectionHeader, reader);
                reader.addSection(sectionHeader.rawData, sectionHeader.virtualRange);
                peFile.sectionHeaders[i] = sectionHeader;
            }
        }
    }

    function readDosHeader(dosHeader: DosHeader, reader: Mi.PE.IO.BinaryReader) {
        dosHeader.mz = reader.readShort();
        if (dosHeader.mz != MZSignature.MZ)
            throw new Error("MZ signature is invalid: " + (<number>(dosHeader.mz)).toString(16) + "h.");

        dosHeader.cblp = reader.readShort();
        dosHeader.cp = reader.readShort();
        dosHeader.crlc = reader.readShort();
        dosHeader.cparhdr = reader.readShort();
        dosHeader.minalloc = reader.readShort();
        dosHeader.maxalloc = reader.readShort();
        dosHeader.ss = reader.readShort();
        dosHeader.sp = reader.readShort();
        dosHeader.csum = reader.readShort();
        dosHeader.ip = reader.readShort();
        dosHeader.cs = reader.readShort();
        dosHeader.lfarlc = reader.readShort();
        dosHeader.ovno = reader.readShort();

        dosHeader.res1 =
            reader.readInt() +
            ((reader.readInt() << 14) * 4); // JavaScript can handle large integers, but cannot do '<<' around them.

        dosHeader.oemid = reader.readShort();
        dosHeader.oeminfo = reader.readShort();

        dosHeader.reserved =
        [
            reader.readInt(),
            reader.readInt(),
            reader.readInt(),
            reader.readInt(),
            reader.readInt()
        ];

        dosHeader.lfanew = reader.readInt();
    }

    function readPEHeader(peHeader: PEHeader, reader: Mi.PE.IO.BinaryReader) {
        peHeader.pe = reader.readInt();
        if (peHeader.pe != <number>PESignature.PE)
            throw new Error("PE signature is invalid: " + (<number>(peHeader.pe)).toString(16) + "h.");

        peHeader.machine = reader.readShort();
        peHeader.numberOfSections = reader.readShort();
        var timestampNum = reader.readInt();
        var timestamp = new Date(timestampNum * 1000);
        var timestamp = new Date(
            Date.UTC(
                timestamp.getFullYear(),
                timestamp.getMonth(),
                timestamp.getDate(),
                timestamp.getHours(),
                timestamp.getMinutes(),
                timestamp.getSeconds(),
                timestamp.getMilliseconds()));

        peHeader.timestamp = timestamp;

        peHeader.pointerToSymbolTable = reader.readInt();
        peHeader.numberOfSymbols = reader.readInt();
        peHeader.sizeOfOptionalHeader = reader.readShort();
        peHeader.characteristics = reader.readShort();
    }

    function readOptionalHeader(optionalHeader: OptionalHeader, reader: Mi.PE.IO.BinaryReader) {
        optionalHeader.peMagic = <PEMagic>reader.readShort();

        if (optionalHeader.peMagic != PEMagic.NT32
            && optionalHeader.peMagic != PEMagic.NT64)
            throw Error("Unsupported PE magic value " + (<number>optionalHeader.peMagic).toString(16) + "h.");

        optionalHeader.linkerVersion = new Version(reader.readByte(), reader.readByte());

        optionalHeader.sizeOfCode = reader.readInt();
        optionalHeader.sizeOfInitializedData = reader.readInt();
        optionalHeader.sizeOfUninitializedData = reader.readInt();
        optionalHeader.addressOfEntryPoint = reader.readInt();
        optionalHeader.baseOfCode = reader.readInt();

        if (optionalHeader.peMagic == PEMagic.NT32) {
            optionalHeader.baseOfData = reader.readInt();
            optionalHeader.imageBase = reader.readInt();
        }
        else {
            optionalHeader.imageBase = reader.readLong();
        }

        optionalHeader.sectionAlignment = reader.readInt();
        optionalHeader.fileAlignment = reader.readInt();
        optionalHeader.operatingSystemVersion = new Version(reader.readShort(), reader.readShort());
        optionalHeader.imageVersion = new Version(reader.readShort(), reader.readShort());
        optionalHeader.subsystemVersion = new Version(reader.readShort(), reader.readShort());
        optionalHeader.win32VersionValue = reader.readInt();
        optionalHeader.sizeOfImage = reader.readInt();
        optionalHeader.sizeOfHeaders = reader.readInt();
        optionalHeader.checkSum = reader.readInt();
        optionalHeader.subsystem = <Subsystem>reader.readShort();
        optionalHeader.dllCharacteristics = <DllCharacteristics>reader.readShort();

        if (optionalHeader.peMagic == PEMagic.NT32) {
            optionalHeader.sizeOfStackReserve = reader.readInt();
            optionalHeader.sizeOfStackCommit = reader.readInt();
            optionalHeader.sizeOfHeapReserve = reader.readInt();
            optionalHeader.sizeOfHeapCommit = reader.readInt();
        }
        else {
            optionalHeader.sizeOfStackReserve = reader.readLong();
            optionalHeader.sizeOfStackCommit = reader.readLong();
            optionalHeader.sizeOfHeapReserve = reader.readLong();
            optionalHeader.sizeOfHeapCommit = reader.readLong();
        }

        optionalHeader.loaderFlags = reader.readInt();
        optionalHeader.numberOfRvaAndSizes = reader.readInt();

        if (optionalHeader.dataDirectories == null
            || optionalHeader.dataDirectories.length != optionalHeader.numberOfRvaAndSizes)
            optionalHeader.dataDirectories = <DataDirectory[]>(Array(optionalHeader.numberOfRvaAndSizes));

        for (var i = 0; i < optionalHeader.dataDirectories.length; i++) {
            optionalHeader.dataDirectories[i] = readDataDirectory(reader);
        }
    }

    function readDataDirectory(reader: Mi.PE.IO.BinaryReader) {
        var virtualAddress = reader.readInt();
        var size = reader.readInt();
        return new DataDirectory(virtualAddress, size);
    }

    function readSectionHeader(sectionHeader: SectionHeader, reader: Mi.PE.IO.BinaryReader) {
        sectionHeader.name = reader.readZeroFilledAscii(8);

        var virtualSize = reader.readInt();
        var virtualAddress = reader.readInt();
        sectionHeader.virtualRange = new DataDirectory(virtualAddress, virtualSize);

        var sizeOfRawData = reader.readInt();
        var pointerToRawData = reader.readInt();
        sectionHeader.rawData = new DataDirectory(pointerToRawData, sizeOfRawData);

        sectionHeader.pointerToRelocations = reader.readInt();
        sectionHeader.pointerToLinenumbers = reader.readInt();
        sectionHeader.numberOfRelocations = reader.readShort();
        sectionHeader.numberOfLinenumbers = reader.readShort();
        sectionHeader.characteristics = <SectionCharacteristics>reader.readInt();
    }
}