/// <reference path="BinaryReader.ts" />

module Mi.PE {

    var mzSignature = 23117;
    var DosHeaderSize = 64;

    export interface PEFileSuccess {
        (peFile: PEFile);
    }

    export class Directory {
        virtualAddress: number;
        size: number;

        constructor (virtualAddress: number, size: number) {
            this.virtualAddress = virtualAddress;
            this.size = size;
        }

        toString() { return this.virtualAddress + ":" + this.size; }
    }

    export class Version {
        major: number;
        minor: number;

        constructor (major: number, minor: number) {
            this.major = major;
            this.minor = minor;
        }

        toString() { return this.major + "." + this.minor; }
    }

    export class PEFile {
        static dosHeaderSize = 64;
        static peHeaderSize = 6;
        static sectionHeaderSize = 10;
        static clrHeaderSize = 72;

        machine: number;
        timestamp: Date;
        imageCharacteristics: number;

        osVersion: Version;
        imageVersion: Version;

        win32Version: number;
        subsystem: number;
        dllCharacteristics: number;

        runtimeVersion: Version;

        metadataDir: Directory;

        imageFlags: number;

        entryPointToken: number;

        resourceDir: Directory;

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

                    try { var lfanew = this.parseDosHeader(dosHeader); }
                    catch (error) { onfailure(error); return; }

                    reader.offset = lfanew;

                    reader.readUint32(
                        PEFile.peHeaderSize,
                        peHeader => {

                            try { var peHeaderOutput = this.parsePEHeader(peHeader); }
                            catch (error) { onfailure(error); return; }

                            alert("optionalHeader @"+reader.offset);

                            reader.readUint32(
                                peHeaderOutput.sizeOfOptionalHeader,
                                optionalHeader => {

                                    try { var optionalHeaderOutput = this.parseOptionalHeader(optionalHeader); }
                                    catch (error) { onfailure(error); return; }

                                    reader.offset = optionalHeaderOutput.sectionsStartOffset;
                                    reader.readUint32(
                                        peHeaderOutput.numberOfSections * PEFile.sectionHeaderSize,
                                        sectionHeadersBytes => {

                                            try {
                                                var sectionHeaders = this.parseSectionHeaders(
                                                    sectionHeadersBytes,
                                                    peHeaderOutput.numberOfSections);


                                                var clrDirRawOffset = this.mapVirtualRegion(
                                                    optionalHeaderOutput.clrDirVA, optionalHeaderOutput.clrDirSize,
                                                    sectionHeaders);
                                            }
                                            catch (error) {
                                                onfailure(error);
                                                return;
                                            }

                                            reader.offset = clrDirRawOffset;
                                            reader.readUint32(
                                                optionalHeaderOutput.clrDirSize,
                                                clrDirectory => {

                                                    try { this.parseClrDirectory(clrDirectory); }
                                                    catch (error) { onfailure(error); return; }

                                                    onsuccess();
                                                }, onfailure);
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

            this.osVersion = new Version(
                optionalHeader[10] & 0xFFFF,
                optionalHeader[10] >> 16);

            this.imageVersion = new Version(
                optionalHeader[11] & 0xFFFF,
                (optionalHeader[11] >> 16) & 0xFFFF);

            this.win32Version = optionalHeader[12];

            this.subsystem = optionalHeader[17] & 0xFFFF;
            this.dllCharacteristics = (optionalHeader[17] >> 16) & 0xFFFF;

            var rvaCountHeaderOffset = 17 + 1 + (magic == nt32Magic ? 4 : 4 * 2) + 1;

            var numberOfRvaAndSizes = optionalHeader[rvaCountHeaderOffset];
            var clrDataDirectoryIndex = 14;
            if (numberOfRvaAndSizes < clrDataDirectoryIndex + 1)
                throw new Error("PE image does not contain CLR directory.");

            var clrDirHeaderOffset = rvaCountHeaderOffset + 1 + clrDataDirectoryIndex * 2;
            var clrDirVA = optionalHeader[clrDirHeaderOffset];
            var clrDirSize = optionalHeader[clrDirHeaderOffset + 1];

            return {
                numberOfRvaAndSizes: numberOfRvaAndSizes,
                sectionsStartOffset: rvaCountHeaderOffset + 4 + numberOfRvaAndSizes * 4,
                clrDirVA: clrDirVA,
                clrDirSize: clrDirSize
            };
        }

        private parseSectionHeaders(sectionHeaders: Uint32Array, numberOfSections: number) {
            var sections: { virtualSize: number; virtualAddress: number; sizeOfRawData: number; pointerToRawData: number; };
            var _a: any = [];
            sections = _a;

            for (var i = 0; i < numberOfSections; i++) {
                sections[i] = {
                    virtualSize: sectionHeaders[i * PEFile.sectionHeaderSize + 2],
                    virtualAddress: sectionHeaders[i * PEFile.sectionHeaderSize + 3],
                    sizeOfRawData: sectionHeaders[i * PEFile.sectionHeaderSize + 4],
                    pointerToRawData: sectionHeaders[i * PEFile.sectionHeaderSize + 5]
                };
            }

            return sections;
        }

        private mapVirtualRegion(
            va: number, size: number,
            sectionHeaders) {
            for (var i = 0; i < sectionHeaders.length; i++) {
                var sec = sectionHeaders[i];

                if (va >= sec.virtualAddress
                    && va + size <= sec.virtualAddress + sec.virtualSize) {

                    var sectionOffset = va - sec.virtualAddress;

                    return sec.pointerToRawData + sectionOffset;
                }
            }
        }

        private parseClrDirectory(clrDirectory: Uint32Array) {
            var cb = clrDirectory[0];
            if (cb < PEFile.clrHeaderSize)
                throw new Error("CLR directory is unusually small.");

            alert("clrDirectory: " + clrDirectory.length);

            this.runtimeVersion = new Version(
                clrDirectory[1] & 0xFFFF,
                (clrDirectory[1] >> 16) & 0xFFFF);

            this.metadataDir = new Directory(
                clrDirectory[2],
                clrDirectory[3]);

            this.imageFlags = clrDirectory[4];

            this.entryPointToken = clrDirectory[5];

            this.resourceDir = new Directory(
                clrDirectory[6],
                clrDirectory[7]);
        }
    }
}