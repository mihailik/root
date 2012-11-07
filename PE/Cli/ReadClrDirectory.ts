/// <reference path="../IO/BinaryReader.ts" />

/// <reference path="../PEFormat/PEFile.ts" />
/// <reference path="../PEFormat/DataDirectory.ts" />
/// <reference path="../PEFormat/DataDirectoryKind.ts" />
/// <reference path="../PEFormat/PEFileReader.ts" />

/// <reference path="../ModuleDefinition.ts" />
/// <reference path="../Version.ts" />

module Mi.PE.Cli {

    export class ReadClrDirectory {
        private static clrHeaderSize = 72;
        
        cb: number;
        metadataDir: Mi.PE.PEFormat.DataDirectory;
        entryPointToken: number;
        resourcesDir: Mi.PE.PEFormat.DataDirectory;
        strongNameSignatureDir: Mi.PE.PEFormat.DataDirectory;
        codeManagerTableDir: Mi.PE.PEFormat.DataDirectory;
        vtableFixupsDir: Mi.PE.PEFormat.DataDirectory;
        exportAddressTableJumpsDir: Mi.PE.PEFormat.DataDirectory;
        managedNativeHeaderDir: Mi.PE.PEFormat.DataDirectory;

        constructor(_module: ModuleDefinition, reader: Mi.PE.IO.BinaryReader) {
            // shift to CLR directory
            var clrDirectory = _module.pe.optionalHeader.dataDirectories[<number>Mi.PE.PEFormat.DataDirectoryKind.Clr];

            var clrDirReader = reader.readAtVirtualOffset(clrDirectory.address);

            // CLR header
            this.cb = clrDirReader.readInt();

            if (this.cb < ReadClrDirectory.clrHeaderSize)
                throw new Error(
                    "Unexpectedly short CLR header structure " + this.cb + " reported by Cb field " +
                    "(expected at least " + ReadClrDirectory.clrHeaderSize + ").");

            _module.runtimeVersion = new Version(clrDirReader.readShort(), clrDirReader.readShort());

            this.metadataDir = new Mi.PE.PEFormat.DataDirectory(
                clrDirReader.readInt(),
                clrDirReader.readInt());

            _module.imageFlags = <ClrImageFlags>clrDirReader.readInt();

            // need to convert to meaningful value before sticking into ModuleDefinition
            this.entryPointToken = clrDirReader.readInt();

            this.resourcesDir = new Mi.PE.PEFormat.DataDirectory(
                clrDirReader.readInt(),
                clrDirReader.readInt());

            this.strongNameSignatureDir = new Mi.PE.PEFormat.DataDirectory(
                clrDirReader.readInt(),
                clrDirReader.readInt());

            this.codeManagerTableDir = new Mi.PE.PEFormat.DataDirectory(
                clrDirReader.readInt(),
                clrDirReader.readInt());

            this.vtableFixupsDir = new Mi.PE.PEFormat.DataDirectory(
                clrDirReader.readInt(),
                clrDirReader.readInt());

            this.exportAddressTableJumpsDir = new Mi.PE.PEFormat.DataDirectory(
                clrDirReader.readInt(),
                clrDirReader.readInt());

            this.managedNativeHeaderDir = new Mi.PE.PEFormat.DataDirectory(
                clrDirReader.readInt(),
                clrDirReader.readInt());
        }
    }
}