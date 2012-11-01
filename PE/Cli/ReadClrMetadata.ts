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
        streamCount: number;
        
        constructor (_module: ModuleDefinition, clrDirectory: ReadClrDirectory, reader: Mi.PE.IO.BinaryReaderWithAsciiz) {
            // shift to CLR metadata
            reader.byteOffset = Mi.PE.PEFormat.mapVirtual(clrDirectory.metadataDir, _module.pe.sectionHeaders);

            var mdSignature = <ClrMetadataSignature>reader.readInt();
            if (mdSignature != ClrMetadataSignature.Signature)
                throw new Error("Invalid CLR metadata signature field " + (<number>mdSignature).toString(16) + "h (expected " + (<number>ClrMetadataSignature.Signature).toString(16) + "h).");

            _module.metadataVersion = new Version(
                reader.readShort(),
                reader.readShort());

            this.mdReserved = reader.readInt();

            var metadataStringVersionLength = reader.readInt();
            _module.metadataVersionString = Mi.PE.IO.readZeroFilledString(reader, metadataStringVersionLength);

            this.mdFlags = reader.readShort();

            this.streamCount = reader.readShort();
        }
    }
}