/// <reference path="BinaryReader.ts" />

module Mi.PE {

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

        toString() { return this.name + " " + this.sizeOfRawData + "." + this.pointerToRawData + " => " + this.map; }
    }

    export class Version {
        constructor (
            public major: number,
            public minor: number) {
        }

        toString() { return this.major + "." + this.minor; }
    }

    export class PEFile {

        private static mzSignature = 0x5a4D;
        private static peSignature = 0x4550;
        private static nt32Magic = 0x010B;
        private static nt64Magic = 0x020B;
        private static clrMetadataSignature = 0x424a5342;

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
        metadataVersionString: string;

        read(reader: BinaryReader) {

            // DOS header
            var mzCheck = reader.readShort();

            if (mzCheck != PEFile.mzSignature)
                throw new Error("MZ signature is invalid: " + mzCheck.toString(16) + "h.");

            reader.byteOffset = PEFile.dosHeaderSize - 4;

            var lfanew = reader.readInt();


            reader.byteOffset = lfanew;
            // PE header

            var peCheck = reader.readInt();

            if (peCheck != PEFile.peSignature)
                throw new Error("PE signature is invalid: " + peCheck.toString(16) + "h.");

            this.machine = reader.readShort();

            var numberOfSections = reader.readShort();

            var timestampSecondsFromEpochUtc = reader.readInt();

            // ensure it is in UTC
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

            reader.byteOffset += 8;

            var sizeOfOptionalHeader = reader.readShort();

            this.imageCharacteristics = reader.readShort();


            // Optional header
            var magicCheck = reader.readShort();
            if (magicCheck != PEFile.nt32Magic && magicCheck != PEFile.nt64Magic)
                throw new Error("PE magic is invalid: " + mzCheck.toString(16) + "h (expected NT32:" + PEFile.nt32Magic.toString(16) + "h or NT64:" + PEFile.nt64Magic.toString(16) + "h.");

            reader.byteOffset += 38;

            this.osVersion = new Version(
                reader.readShort(),
                reader.readShort());

            this.imageVersion = new Version(
                reader.readShort(),
                reader.readShort());

            reader.byteOffset += 4; // subsystemVersion

            this.win32Version = reader.readInt();

            reader.byteOffset += 12;

            this.subsystem = reader.readShort();
            this.dllCharacteristics = reader.readShort();

            reader.byteOffset += (magicCheck == PEFile.nt32Magic ? 16 : 32) + 4;

            var numberOfRvaAndSizes = reader.readInt();;
            if (numberOfRvaAndSizes < PEFile.clrDataDirectoryIndex + 1)
                throw new Error("PE image does not contain CLR directory (only " + numberOfRvaAndSizes + " directories found).");

            reader.byteOffset += PEFile.clrDataDirectoryIndex * 8;

            var clrDirectory = new Directory(
                reader.readInt(),
                reader.readInt());

            // skip the rest of directories
            reader.byteOffset += (numberOfRvaAndSizes - PEFile.clrDataDirectoryIndex - 1) * 8;


            // Section headers

            var sectionHeaders: SectionHeader[] = [];
            
            for (var i = 0; i < numberOfSections; i++) {
                var sectionHeaderIndex = i * PEFile.sectionHeaderSize;
                var sectionName = this.readZeroFilledString(reader, 8);

                 // note that the order is reverse here: size then address
                var virtualSize = reader.readInt();
                var virtualAddress = reader.readInt();

                sectionHeaders[i] = new SectionHeader(
                    sectionName,
                    new Directory(virtualAddress, virtualSize),
                    reader.readInt(),
                    reader.readInt());
            }


            // CLR directory
            var clrDirRawOffset = this.mapVirtualRegion(
                clrDirectory,
                sectionHeaders);

            reader.byteOffset = clrDirRawOffset;

            var cb = reader.readInt();
            if (cb < PEFile.clrHeaderSize)
                throw new Error("CLR directory is unusually small.");

            this.runtimeVersion = new Version(
                reader.readShort(),
                reader.readShort());

            var metadataDir = new Directory(
                reader.readInt(),
                reader.readInt());

            this.imageFlags = reader.readInt();

            var entryPointToken = reader.readInt();

            var resourceDir = new Directory(
                reader.readInt(),
                reader.readInt());


            // CLR metadata directory

            var metadataDirRawOffset = this.mapVirtualRegion(
                metadataDir,
                sectionHeaders);

            reader.byteOffset = metadataDirRawOffset;

            
            var clrMetadataSignatureCheck = reader.readInt();

            if (clrMetadataSignatureCheck!=PEFile.clrMetadataSignature)
                throw new Error("Invalid CLR metadata signature " + clrMetadataSignatureCheck.toString(16) + "h (" + PEFile.clrMetadataSignature + "h expected).");

            this.metadataVersion = new Version(
                reader.readShort(),
                reader.readShort());

            var metadataVersionStringLength = reader.readInt();
            this.metadataVersionString = this.readZeroFilledString(reader, metadataVersionStringLength);
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

        private readZeroFilledString(reader: BinaryReader, maxLength: number) {
            var chars = "";

            for (var i = 0; i < maxLength; i++) {
                var charCode = reader.readByte();

                if (i>chars.length
                    || charCode == 0)
                    continue;

                chars += String.fromCharCode(charCode);
            }
            
            return chars;
        }
    }
}