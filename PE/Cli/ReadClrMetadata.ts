/// <reference path="../IO/BinaryReader.ts" />

/// <reference path="../PEFormat/PEFile.ts" />
/// <reference path="../PEFormat/PEFileReader.ts" />

/// <reference path="../ModuleDefinition.ts" />

/// <reference path="ReadClrDirectory.ts" />

module Mi.PE.Cli {
    export class ReadClrMetadata {
        
        constructor (_module: ModuleDefinition, clrDirectory: ReadClrDirectory, reader: Mi.PE.IO.BinaryReader) {
            // shift to CLR metadata
            reader.byteOffset = Mi.PE.PEFormat.mapVirtual(clrDirectory.metadataDir, _module.pe.sectionHeaders);


        }
    }
}