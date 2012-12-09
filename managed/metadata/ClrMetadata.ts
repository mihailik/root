// <reference path="ClrMetadataSignature.ts" />
// <reference path="../../io/io.ts" />

module pe.managed.metadata {
    export class ClrMetadata {

        mdSignature: ClrMetadataSignature = ClrMetadataSignature.Signature;
        metadataVersion: string = "";
        runtimeVersion: string = "";
        mdReserved: number = 0;
        mdFlags: number = 0;
        streamCount: number = 0;
        
        read(clrDirReader: io.BinaryReader) {
            this.mdSignature = clrDirReader.readInt();
            if (this.mdSignature != ClrMetadataSignature.Signature)
                throw new Error("Invalid CLR metadata signature field " + (<number>this.mdSignature).toString(16) + "h (expected " + (<number>ClrMetadataSignature.Signature).toString(16).toUpperCase() + "h).");

            this.metadataVersion = clrDirReader.readShort() + "." + clrDirReader.readShort();

            this.mdReserved = clrDirReader.readInt();

            var metadataStringVersionLength = clrDirReader.readInt();
            this.runtimeVersion = clrDirReader.readZeroFilledAscii(metadataStringVersionLength);

            this.mdFlags = clrDirReader.readShort();

            this.streamCount = clrDirReader.readShort();
        }
    }
}