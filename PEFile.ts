/// <reference path="BinaryReader.ts" />

module Mi.PE {

    var mzSignature = 23117;
    var DosHeaderSize = 64;

    export interface PEFileSuccess {
        (peFile: PEFile);
    }

    export class Directory {
        constructor (
            public address: number,
            public size: number) {
        }

        toString() { return this.address + ":" + this.size; }
    }

    export class SectionHeader {
        constructor (
            public name: string,
            public map: Directory,
            public sizeOfRawData: number,
            public pointerToRawData: number) {
        }
    }

    export class Version {
        constructor (
            public major: number,
            public minor: number) {
        }

        toString() { return this.major + "." + this.minor; }
    }

    export class PEFile {
        private static dosHeaderSize = 64;
        private static peHeaderSize = 6;
        private static sectionHeaderSize = 10;
        private static clrHeaderSize = 72;
        private static clrDataDirectoryIndex = 14;

        machine: number;
        timestamp: Date;
        imageCharacteristics: number;

        osVersion: Version;
        imageVersion: Version;

        win32Version: number;
        subsystem: number;
        dllCharacteristics: number;

        runtimeVersion: Version;

        imageFlags: number;

        metadataVersion: Version;

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
            onsuccess: { (): void; },
            onfailure: Failure) {

            reader.readUint32(
                DosHeaderSize / 4,
                dosHeader => {
                    try { this.continueWithDosHeader(dosHeader, reader, onsuccess, onfailure); }
                    catch (error) { onfailure(error); return; }
                }, onfailure);
        }

        private continueWithDosHeader(
            dosHeader: Uint32Array,
            reader: BinaryReader,
            onsuccess: { (): void; },
            onfailure: Failure) {
            
            var lfanew = this.parseDosHeader(dosHeader);

            reader.offset = lfanew;

            reader.readUint32(
                PEFile.peHeaderSize,
                peHeader => {
                    try { this.continueWithPEHeader(peHeader, reader, onsuccess, onfailure); }
                    catch (error) { onfailure(error); return; }
                }, onfailure);
        }

        private continueWithPEHeader(
            peHeader: Uint32Array,
            reader: BinaryReader,
            onsuccess: { (): void; },
            onfailure: Failure) {

            var peHeaderOutput = this.parsePEHeader(peHeader);

            reader.readUint32(
                peHeaderOutput.sizeOfOptionalHeader / 4,
                optionalHeader => {

                    try { this.continueWithOptionalHeader(optionalHeader, peHeaderOutput, reader, onsuccess, onfailure); }
                    catch (error) { onfailure(error); return; }
                }, onfailure);
        }

        private continueWithOptionalHeader(
            optionalHeader: Uint32Array,
            peHeaderOutput: { numberOfSections: number; sizeOfOptionalHeader: number; },
            reader: BinaryReader,
            onsuccess: { (): void; },
            onfailure: Failure) {
            var optionalHeaderOutput = this.parseOptionalHeader(optionalHeader);

            reader.readUint32(
                peHeaderOutput.numberOfSections * PEFile.sectionHeaderSize,
                sectionHeadersBytes => {
                    try { this.continueWithSectionHeaders(sectionHeadersBytes, peHeaderOutput.numberOfSections, optionalHeaderOutput, reader, onsuccess, onfailure); }
                    catch (error) { onfailure(error); return; }
                }, onfailure);
        }

        private continueWithSectionHeaders(
            sectionHeadersBytes: Uint32Array,
            numberOfSections: number,
            optionalHeaderOutput: { numberOfRvaAndSizes: number; sectionsStartOffset: number; clrDirectory: Directory; },
            reader: BinaryReader,
            onsuccess: { (): void; },
            onfailure: Failure) {

            var sectionHeaders = this.parseSectionHeaders(
                sectionHeadersBytes,
                numberOfSections);

            var clrDirRawOffset = this.mapVirtualRegion(
                optionalHeaderOutput.clrDirectory,
                sectionHeaders);

            reader.offset = clrDirRawOffset;
            reader.readUint32(
                optionalHeaderOutput.clrDirectory.size / 4,
                clrDirectory => {
                    try { this.continueWithClrDirectory(clrDirectory, sectionHeaders, reader, onsuccess, onfailure); }
                    catch (error) { onfailure(error); return; }
                }, onfailure);
        }

        private continueWithClrDirectory(
            clrDirectory: Uint32Array,
            sectionHeaders: SectionHeader[],
            reader: BinaryReader,
            onsuccess: { (): void; },
            onfailure: Failure) {
            var clrDirectoryOutput = this.parseClrDirectory(clrDirectory);

            var metadataDirRawOffset = this.mapVirtualRegion(
                clrDirectoryOutput.metadataDir,
                sectionHeaders);

            reader.offset = metadataDirRawOffset;

            reader.readUint32(
                clrDirectoryOutput.metadataDir.size / 4,
                metadata => {
                    try { this.continueWithClrMetadata(metadata, sectionHeaders, reader, onsuccess, onfailure); }
                    catch (error) { onfailure(error); return; }
                }, onfailure);
        }

        private continueWithClrMetadata(
            metadata: Uint32Array,
            sectionHeaders: SectionHeader[],
            reader: BinaryReader,
            onsuccess: { (): void; },
            onfailure: Failure) {

            this.parseClrMetadata(metadata);

            onsuccess();
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

            this.osVersion = new Version(
                optionalHeader[10] & 0xFFFF,
                optionalHeader[10] >> 16);

            this.imageVersion = new Version(
                optionalHeader[11] & 0xFFFF,
                (optionalHeader[11] >> 16) & 0xFFFF);

            this.win32Version = optionalHeader[12];

            this.subsystem = optionalHeader[17] & 0xFFFF;
            this.dllCharacteristics = (optionalHeader[17] >> 16) & 0xFFFF;

            var rvaCountHeaderIndex = 17 + 1 + (magic == nt32Magic ? 4 : 4 * 2) + 1;

            var numberOfRvaAndSizes = optionalHeader[rvaCountHeaderIndex];
            if (numberOfRvaAndSizes < PEFile.clrDataDirectoryIndex + 1)
                throw new Error("PE image does not contain CLR directory.");

            var clrDirHeaderIndex = rvaCountHeaderIndex + 1 + PEFile.clrDataDirectoryIndex * 2;
            var clrDirectory = new Directory(
                optionalHeader[clrDirHeaderIndex],
                optionalHeader[clrDirHeaderIndex + 1]);

            return {
                numberOfRvaAndSizes: numberOfRvaAndSizes,
                sectionsStartOffset: (rvaCountHeaderIndex + 1 + numberOfRvaAndSizes * 2)  * 4,
                clrDirectory: clrDirectory
            };
        }

        private parseSectionHeaders(sectionHeaders: Uint32Array, numberOfSections: number) {
            var sections: SectionHeader[] = [];

            for (var i = 0; i < numberOfSections; i++) {
                var sectionHeaderIndex = i * PEFile.sectionHeaderSize;
                var sectionName = this.parseSectionName(
                    sectionHeaders[sectionHeaderIndex],
                    sectionHeaders[sectionHeaderIndex + 1]);

                sections[i] = new SectionHeader(
                    sectionName,
                    new Directory(
                        sectionHeaders[sectionHeaderIndex + 3],
                        sectionHeaders[sectionHeaderIndex + 2]), // note that the order is reverse here: size then address
                    sectionHeaders[sectionHeaderIndex + 4],
                    sectionHeaders[sectionHeaderIndex + 5]);
            }

            return sections;
        }

        private parseSectionName(int1: number, int2: number) {
            var sectionNameMaxLength = 8;
            
            var chars = "";

            for (var i = 0; i < 4; i++) {
                var charCode = (int1 >> (i*8)) & 0xFF;

                if (charCode==0)
                    break;

                chars += String.fromCharCode(charCode);
            }

            if (chars.length == 4) {
                for (var i = 0; i < 4; i++) {
                    var charCode = (int2 >> (i*8)) & 0xFF;

                    if (charCode==0)
                        break;

                    chars += String.fromCharCode(charCode);
                }
            }

            return chars;
        }

        private mapVirtualRegion(
            directory: Directory,
            sectionHeaders: SectionHeader[]) {
            for (var i = 0; i < sectionHeaders.length; i++) {
                var sec = sectionHeaders[i];

                if (directory.address >= sec.map.address
                    && directory.address + directory.size <= sec.map.address + sec.map.size) {

                    var sectionOffset = directory.address - sec.map.address;

                    return sec.pointerToRawData + sectionOffset;
                }
            }

            throw new Error("Cannot map " + directory + " within any section.");
        }

        private parseClrDirectory(clrDirectory: Uint32Array) {
            var cb = clrDirectory[0];
            if (cb < PEFile.clrHeaderSize)
                throw new Error("CLR directory is unusually small.");

            this.runtimeVersion = new Version(
                clrDirectory[1] & 0xFFFF,
                (clrDirectory[1] >> 16) & 0xFFFF);

            var metadataDir = new Directory(
                clrDirectory[2],
                clrDirectory[3]);

            this.imageFlags = clrDirectory[4];

            var entryPointToken = clrDirectory[5];

            var resourceDir = new Directory(
                clrDirectory[6],
                clrDirectory[7]);

            return {
                metadataDir: metadataDir,
                entryPointToken: entryPointToken,
                resourceDir: resourceDir
            };
        }

        private parseClrMetadata(metadata: Uint32Array) {
            var clrMetadataSignature = 0x424a5342;
            
            var signature = metadata[0];

            if (signature!=clrMetadataSignature)
                throw new Error("Invalid CLR metadata signature.");

            this.metadataVersion = new Version(
                metadata[1] & 0xFFFF,
                (metadata[1] >> 16) & 0xFFFF);

            var metadataVersionStringLength = metadata[2];

        }
    }
}