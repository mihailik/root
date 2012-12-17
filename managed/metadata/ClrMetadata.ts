/// <reference path="ClrMetadataSignature.ts" />
/// <reference path="../../io/io.ts" />

module pe.managed.metadata {
    export class ClrMetadata {

    	location = new io.AddressRangeMap();

        mdSignature: ClrMetadataSignature = ClrMetadataSignature.Signature;
        metadataVersion: string = "";
        runtimeVersion: string = "";
        mdReserved: number = 0;
        mdFlags: number = 0;
        streamCount: number = 0;
        
        read(clrDirReader: io.BufferReader) {
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

        read2(reader: io.BufferReader) {
			if (!this.location)
				this.location = new io.AddressRangeMap(reader.offset, 0, reader.getVirtualOffset());

            this.mdSignature = reader.readInt();
            if (this.mdSignature != ClrMetadataSignature.Signature)
                throw new Error("Invalid CLR metadata signature field " + (<number>this.mdSignature).toString(16) + "h (expected " + (<number>ClrMetadataSignature.Signature).toString(16).toUpperCase() + "h).");

            this.metadataVersion = reader.readShort() + "." + reader.readShort();

            this.mdReserved = reader.readInt();

            var metadataStringVersionLength = reader.readInt();
            this.runtimeVersion = reader.readZeroFilledAscii(metadataStringVersionLength);

            this.mdFlags = reader.readShort();

            this.streamCount = reader.readShort();

            this.location.size = reader.offset - this.location.address;
        }
    }
}