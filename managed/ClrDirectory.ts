/// <reference path="enums.ts" />
/// <reference path="../io.ts" />

module pe.managed {

	export class ClrDirectory {
		private static clrHeaderSize = 72;
		
		cb: number = 0;
		runtimeVersion: string = "";
		imageFlags: ClrImageFlags = 0;
		metadataDir: io.AddressRange = null;
		entryPointToken: number = 0;
		resourcesDir: io.AddressRange = null;
		strongNameSignatureDir: io.AddressRange = null;
		codeManagerTableDir: io.AddressRange = null;
		vtableFixupsDir: io.AddressRange = null;
		exportAddressTableJumpsDir: io.AddressRange = null;
		managedNativeHeaderDir: io.AddressRange = null;

		read(clrDirReader: io.BufferReader) {
			// CLR header
			this.cb = clrDirReader.readInt();

			if (this.cb < ClrDirectory.clrHeaderSize)
				throw new Error(
					"Unexpectedly short CLR header structure " + this.cb + " reported by Cb field " +
					"(expected at least " + ClrDirectory.clrHeaderSize + ").");

			this.runtimeVersion = clrDirReader.readShort() + "." + clrDirReader.readShort();

			this.metadataDir = new io.AddressRange(
				clrDirReader.readInt(),
				clrDirReader.readInt());

			this.imageFlags = clrDirReader.readInt();

			// need to convert to meaningful value before sticking into ModuleDefinition
			this.entryPointToken = clrDirReader.readInt();

			this.resourcesDir = new io.AddressRange(
				clrDirReader.readInt(),
				clrDirReader.readInt());

			this.strongNameSignatureDir = new io.AddressRange(
				clrDirReader.readInt(),
				clrDirReader.readInt());

			this.codeManagerTableDir = new io.AddressRange(
				clrDirReader.readInt(),
				clrDirReader.readInt());

			this.vtableFixupsDir = new io.AddressRange(
				clrDirReader.readInt(),
				clrDirReader.readInt());

			this.exportAddressTableJumpsDir = new io.AddressRange(
				clrDirReader.readInt(),
				clrDirReader.readInt());

			this.managedNativeHeaderDir = new io.AddressRange(
				clrDirReader.readInt(),
				clrDirReader.readInt());
		}
	}
}