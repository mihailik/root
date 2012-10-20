/// <reference path="../BinaryReader.ts" />
/// <reference path="../PEFile.ts" />
/// <reference path="../Version.ts" />

/// <reference path="Directory.ts" />
/// <reference path="SectionHeader.ts" />
/// <reference path="StreamHeader.ts" />
/// <reference path="BinaryReaderExtensions.ts" />

module Mi.PE.Internal {
    export class PEFileReader {
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
        
        static read(pe: PEFile, reader: BinaryReader) {

            // DOS header
            var mzCheck = reader.readShort();

            if (mzCheck != PEFileReader.mzSignature)
                throw new Error("MZ signature is invalid: " + mzCheck.toString(16) + "h.");

            reader.byteOffset = PEFileReader.dosHeaderSize - 4;

            var lfanew = reader.readInt();


            reader.byteOffset = lfanew;
            // PE header

            var peCheck = reader.readInt();

            if (peCheck != PEFileReader.peSignature)
                throw new Error("PE signature is invalid: " + peCheck.toString(16) + "h.");

            pe.machine = reader.readShort();

            var numberOfSections = reader.readShort();

            var timestampSecondsFromEpochUtc = reader.readInt();

            // ensure it is in UTC
            pe.timestamp = new Date(timestampSecondsFromEpochUtc * 1000);
            pe.timestamp = new Date(
                Date.UTC(
                    pe.timestamp.getFullYear(),
                    pe.timestamp.getMonth(),
                    pe.timestamp.getDate(),
                    pe.timestamp.getHours(),
                    pe.timestamp.getMinutes(),
                    pe.timestamp.getSeconds(),
                    pe.timestamp.getMilliseconds()));

            reader.byteOffset += 8;

            var sizeOfOptionalHeader = reader.readShort();

            pe.imageCharacteristics = reader.readShort();


            // Optional header
            var magicCheck = reader.readShort();
            if (magicCheck != PEFileReader.nt32Magic && magicCheck != PEFileReader.nt64Magic)
                throw new Error("PE magic is invalid: " + mzCheck.toString(16) + "h (expected NT32:" + PEFileReader.nt32Magic.toString(16) + "h or NT64:" + PEFileReader.nt64Magic.toString(16) + "h.");

            reader.byteOffset += 38;

            pe.osVersion = Version.read(reader);

            pe.imageVersion = Version.read(reader);

            reader.byteOffset += 4; // subsystemVersion

            pe.win32Version = reader.readInt();

            reader.byteOffset += 12;

            pe.subsystem = reader.readShort();
            pe.dllCharacteristics = reader.readShort();

            reader.byteOffset += (magicCheck == PEFileReader.nt32Magic ? 16 : 32) + 4;

            var numberOfRvaAndSizes = reader.readInt();;
            if (numberOfRvaAndSizes < PEFileReader.clrDataDirectoryIndex + 1)
                throw new Error("PE image does not contain CLR directory (only " + numberOfRvaAndSizes + " directories found).");

            reader.byteOffset += PEFileReader.clrDataDirectoryIndex * 8;

            var clrDirectory = Internal.Directory.read(reader);

            // skip the rest of directories
            reader.byteOffset += (numberOfRvaAndSizes - PEFileReader.clrDataDirectoryIndex - 1) * 8;


            // Section headers

            var sectionHeaders: Internal.SectionHeader[] = [];
            
            for (var i = 0; i < numberOfSections; i++) {
                var sectionHeaderIndex = i * PEFileReader.sectionHeaderSize;
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
            if (cb < PEFileReader.clrHeaderSize)
                throw new Error("CLR directory is unusually small.");

            pe.runtimeVersion = Version.read(reader);

            var metadataDir = Internal.Directory.read(reader);

            pe.imageFlags = reader.readInt();

            var entryPointToken = reader.readInt();

            var resourceDir = Internal.Directory.read(reader);


            // CLR metadata directory

            var metadataDirRawOffset = Internal.SectionHeader.mapVirtual(
                metadataDir,
                sectionHeaders);

            reader.byteOffset = metadataDirRawOffset;

            
            var clrMetadataSignatureCheck = reader.readInt();

            if (clrMetadataSignatureCheck!=PEFileReader.clrMetadataSignature)
                throw new Error("Invalid CLR metadata signature " + clrMetadataSignatureCheck.toString(16) + "h (" + PEFileReader.clrMetadataSignature + "h expected).");

            pe.metadataVersion = Version.read(reader);

            reader.byteOffset += 4;

            var metadataVersionStringLength = reader.readInt();
            pe.metadataVersionString = Internal.BinaryReaderExtensions.readZeroFilledString(reader, metadataVersionStringLength);

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
                        pe.guids = [];
                        pe.guids[stream.map.size / 16 - 1] = ""; // 16 bytes per GUID
                        for (var iGuid = 0; iGuid < pe.guids.length; iGuid++) {
                            var guid = Internal.BinaryReaderExtensions.readGuid(reader);
                            pe.guids[iGuid] = guid;
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

            PEFileReader.readTableStream(
                pe,
                stringHeapHeader,
                blobHeapHeader,
                tableStreamHeader,
                reader);
        }

        static private readTableStream(
            pe: PEFile,
            stringHeapHeader: Internal.StreamHeader,
            blobHeapHeader: Internal.StreamHeader,
            tableStreamHeader: Internal.StreamHeader,
            reader: BinaryReader) {

            reader.byteOffset += 4;

            // Unusually, this version is in byte, not in 16-bit components.
            pe.tableStreamVersion = Version.read(reader);

            var heapSizes = reader.readByte();

            reader.byteOffset += 1;

            var valid1 = reader.readInt();
            var valid2 = reader.readInt();

            var sorted1 = reader.readInt();
            var sorted2 = reader.readInt();

                            
        }

    }
}