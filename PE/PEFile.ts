/// <reference path="BinaryReader.ts" />
/// <reference path="Version.ts" />

/// <reference path="Internal/Directory.ts" />
/// <reference path="Internal/SectionHeader.ts" />
/// <reference path="Internal/StreamHeader.ts" />
/// <reference path="Internal/BinaryReaderExtensions.ts" />

module Mi.PE {

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

        guids: string[];

        tableStreamVersion: Version;

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

            this.osVersion = Version.read(reader);

            this.imageVersion = Version.read(reader);

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

            var clrDirectory = Internal.Directory.read(reader);

            // skip the rest of directories
            reader.byteOffset += (numberOfRvaAndSizes - PEFile.clrDataDirectoryIndex - 1) * 8;


            // Section headers

            var sectionHeaders: Internal.SectionHeader[] = [];
            
            for (var i = 0; i < numberOfSections; i++) {
                var sectionHeaderIndex = i * PEFile.sectionHeaderSize;
                var sectionName = Internal.BinaryReaderExtensions.readZeroFilledString(reader, 8);

                 // note that the order is reverse here: size then address
                var virtualSize = reader.readInt();
                var virtualAddress = reader.readInt();
                
                var sizeOfRawData = reader.readInt();
                var pointerToRawData = reader.readInt();

                sectionHeaders[i] = new Internal.SectionHeader(
                    sectionName,
                    new Internal.Directory(virtualAddress, virtualSize),
                    sizeOfRawData,
                    pointerToRawData);

                reader.byteOffset += 16;
            }


            // CLR directory
            var clrDirRawOffset = Internal.SectionHeader.mapVirtual(
                clrDirectory,
                sectionHeaders);

            reader.byteOffset = clrDirRawOffset;

            var cb = reader.readInt();
            if (cb < PEFile.clrHeaderSize)
                throw new Error("CLR directory is unusually small.");

            this.runtimeVersion = Version.read(reader);

            var metadataDir = Internal.Directory.read(reader);

            this.imageFlags = reader.readInt();

            var entryPointToken = reader.readInt();

            var resourceDir = Internal.Directory.read(reader);


            // CLR metadata directory

            var metadataDirRawOffset = Internal.SectionHeader.mapVirtual(
                metadataDir,
                sectionHeaders);

            reader.byteOffset = metadataDirRawOffset;

            
            var clrMetadataSignatureCheck = reader.readInt();

            if (clrMetadataSignatureCheck!=PEFile.clrMetadataSignature)
                throw new Error("Invalid CLR metadata signature " + clrMetadataSignatureCheck.toString(16) + "h (" + PEFile.clrMetadataSignature + "h expected).");

            this.metadataVersion = Version.read(reader);

            reader.byteOffset += 4;

            var metadataVersionStringLength = reader.readInt();
            this.metadataVersionString = Internal.BinaryReaderExtensions.readZeroFilledString(reader, metadataVersionStringLength);

            var mdFlags = reader.readShort();

            var streamCount = reader.readShort();


            // Read stream headers
            var streams: Internal.StreamHeader[] = [];
            for (var i = 0; i < streamCount; i++) {
                var offsetFromMetadataDir = reader.readInt();
                var size = reader.readInt();

                var name = "";
                while (true) {
                    var charCode = reader.readByte();
                    if (charCode==0)
                        break;

                    name += String.fromCharCode(charCode);
                }

                var skipCount = -1 + ((name.length + 4) & ~3) - name.length;
                reader.byteOffset += skipCount;

                streams[i] = new Internal.StreamHeader(
                    name,
                    new Internal.Directory(offsetFromMetadataDir + metadataDir.address, size));
            }


            // Populate streams
            var stringHeapHeader: Internal.StreamHeader;
            var blobHeapHeader: Internal.StreamHeader;
            var tableStreamHeader: Internal.StreamHeader;

            for (var i = 0; i < streams.length; i++) {

                var stream = streams[i];
                
                reader.byteOffset = Internal.SectionHeader.mapVirtual(
                    stream.map,
                    sectionHeaders);

                switch (stream.name) {
                    case "#GUID":
                        this.guids = [];
                        this.guids[stream.map.size / 16 - 1] = ""; // 16 bytes per GUID
                        for (var iGuid = 0; iGuid < this.guids.length; iGuid++) {
                            var guid = Internal.BinaryReaderExtensions.readGuid(reader);
                            this.guids[iGuid] = guid;
                        }
                        break;

                    case "#Strings":
                        stringHeapHeader = stream;
                        break;

                    case "#US": // user strings
                        break;

                    case "#Blob":
                        blobHeapHeader = stream;
                        break;

                    case "#~":
                    case "#-":
                        tableStreamHeader = stream;
                        break;
                }
            }

            // Table stream
            reader.byteOffset = Internal.SectionHeader.mapVirtual(
                tableStreamHeader.map,
                sectionHeaders);

            this.readTableStream(
                this.guids,
                stringHeapHeader,
                blobHeapHeader,
                tableStreamHeader,
                reader);
        }

        private readTableStream(
            guids: string[],
            stringHeapHeader: Internal.StreamHeader,
            blobHeapHeader: Internal.StreamHeader,
            tableStreamHeader: Internal.StreamHeader,
            reader: BinaryReader) {

            reader.byteOffset += 4;

            // Unusually, this version is in byte, not in 16-bit components.
            this.tableStreamVersion = Version.read(reader);

            var heapSizes = reader.readByte();

            reader.byteOffset += 1;

            var valid1 = reader.readInt();
            var valid2 = reader.readInt();

            var sorted1 = reader.readInt();
            var sorted2 = reader.readInt();

                            
        }
    }
}