/// <reference path="enums.ts" />
/// <reference path="../io.ts" />

module pe.managed {
	export class ClrMetadata {

		mdSignature: ClrMetadataSignature = ClrMetadataSignature.Signature;
		metadataVersion: string = "";
		runtimeVersion: string = "";
		mdReserved: number = 0;
		mdFlags: number = 0;
		streamCount: number = 0;
		
		read(reader: io.BufferReader) {
			this.mdSignature = reader.readInt();
			if (this.mdSignature != ClrMetadataSignature.Signature)
				throw new Error("Invalid CLR metadata signature field " + (<number>this.mdSignature).toString(16) + "h (expected " + (<number>ClrMetadataSignature.Signature).toString(16).toUpperCase() + "h).");

			this.metadataVersion = reader.readShort() + "." + reader.readShort();

			this.mdReserved = reader.readInt();

			var metadataStringVersionLength = reader.readInt();
			this.runtimeVersion = reader.readZeroFilledAscii(metadataStringVersionLength);

			this.mdFlags = reader.readShort();

			this.streamCount = reader.readShort();
		}
	}
}