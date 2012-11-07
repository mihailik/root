/// <reference path="../IO/BinaryReader.ts" />
/// <reference path="../IO/IO.ts" />

/// <reference path="../PEFormat/PEFileReader.ts" />

/// <reference path="../ModuleDefinition.ts" />

/// <reference path="ReadClrDirectory.ts" />
/// <reference path="ClrMetadataSignature.ts" />

module Mi.PE.Cli {
    export class ReadClrMetadata {

        mdReserved: number;
        mdFlags: number;
        streams: ReadStreams;
        
        constructor (_module: ModuleDefinition, clrDirectory: ReadClrDirectory, reader: Mi.PE.IO.BinaryReader) {
            // shift to CLR metadata
            var clrDirReader = reader.readAtVirtualOffset(clrDirectory.metadataDir.address);
            //var clrDirReader = reader;
            //clrDirReader.virtualByteOffset = clrDirectory.metadataDir.address;

            var mdSignature = <ClrMetadataSignature>clrDirReader.readInt();
            if (mdSignature != ClrMetadataSignature.Signature)
                throw new Error("Invalid CLR metadata signature field " + (<number>mdSignature).toString(16) + "h (expected " + (<number>ClrMetadataSignature.Signature).toString(16) + "h).");

            _module.metadataVersion = new Version(
                clrDirReader.readShort(),
                clrDirReader.readShort());

            this.mdReserved = clrDirReader.readInt();

            var metadataStringVersionLength = clrDirReader.readInt();
            _module.metadataVersionString = clrDirReader.readZeroFilledAscii(metadataStringVersionLength);

            this.mdFlags = clrDirReader.readShort();

            var streamCount = clrDirReader.readShort();

            this.streams = new ReadStreams(_module, clrDirectory.metadataDir, streamCount, clrDirReader);
        }
    }
}