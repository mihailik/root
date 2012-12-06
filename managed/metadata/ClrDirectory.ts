/// <reference path="ClrImageFlags.ts" />
/// <reference path="../../io/io.ts" />
/// <reference path="../../headers/AddressRange.ts" />

module pe.managed.metadata {

    export class ReadClrDirectory {
        private static clrHeaderSize = 72;
        
        cb: number;
        runtimeVersion: string;
        imageFlags: ClrImageFlags;
        metadataDir: headers.AddressRange;
        entryPointToken: number;
        resourcesDir: headers.AddressRange;
        strongNameSignatureDir: headers.AddressRange;
        codeManagerTableDir: headers.AddressRange;
        vtableFixupsDir: headers.AddressRange;
        exportAddressTableJumpsDir: headers.AddressRange;
        managedNativeHeaderDir: headers.AddressRange;

        read(readerAtClrDataDirectory: io.BinaryReader) {
            // shift to CLR directory
            var clrDirReader = readerAtClrDataDirectory;

            // CLR header
            this.cb = clrDirReader.readInt();

            if (this.cb < ReadClrDirectory.clrHeaderSize)
                throw new Error(
                    "Unexpectedly short CLR header structure " + this.cb + " reported by Cb field " +
                    "(expected at least " + ReadClrDirectory.clrHeaderSize + ").");

            this.runtimeVersion = clrDirReader.readShort() + "." + clrDirReader.readShort();

            this.metadataDir = new headers.AddressRange(
                clrDirReader.readInt(),
                clrDirReader.readInt());

            this.imageFlags = clrDirReader.readInt();

            // need to convert to meaningful value before sticking into ModuleDefinition
            this.entryPointToken = clrDirReader.readInt();

            this.resourcesDir = new headers.AddressRange(
                clrDirReader.readInt(),
                clrDirReader.readInt());

            this.strongNameSignatureDir = new headers.AddressRange(
                clrDirReader.readInt(),
                clrDirReader.readInt());

            this.codeManagerTableDir = new headers.AddressRange(
                clrDirReader.readInt(),
                clrDirReader.readInt());

            this.vtableFixupsDir = new headers.AddressRange(
                clrDirReader.readInt(),
                clrDirReader.readInt());

            this.exportAddressTableJumpsDir = new headers.AddressRange(
                clrDirReader.readInt(),
                clrDirReader.readInt());

            this.managedNativeHeaderDir = new headers.AddressRange(
                clrDirReader.readInt(),
                clrDirReader.readInt());
        }
    }
}