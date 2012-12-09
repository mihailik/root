/// <reference path="../TableStreamReader.ts" />
module pe.managed.metadata {
	//These records should not be emitted into any PE file.
	//However, if present in a PE file, they should be treated as-if their fields were zero.
	//They should be ignored by the CLI.
	//[ECMA-335 §22.6]
	export class AssemblyRefOS {
		version: string;

		flags: AssemblyFlags;

		publicKeyOrToken: byte[];

		name: string;

		culture: string;

		hashValue: byte[];

		read(reader: io.BinaryReader): void {
			this.version = reader.readVersion();
			this.flags = (AssemblyFlags)reader.readUInt();
			this.publicKeyOrToken = reader.readBlob();
			this.name = reader.readString();
			this.culture = reader.readString();
			this.hashValue = reader.readBlob();
		}
	}
}