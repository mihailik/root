/// <reference path="../TableStreamReader.ts" />
/// <reference path="../rowEnums.ts" />

module pe.managed.metadata {
	// The AssemblyRef table shall contain no duplicates
	// (where duplicate rows are deemd to be those having the same
	// MajorVersion, MinorVersion, BuildNumber, RevisionNumber, PublicKeyOrToken, Name, and Culture). [WARNING]
	// [ECMA-335 para22.5]
	export class AssemblyRef {
		definition: AssemblyDefinition;

		// HashValue can be null or non-null.
		// If non-null, then HashValue shall index a non-empty 'blob' in the Blob heap. [ERROR]
		hashValue: string;

		read(reader: TableStreamReader): void {
			if (!this.definition)
				this.definition = new AssemblyDefinition();

			this.definition.version = reader.readShort() + "." + reader.readShort() + "." + reader.readShort() + "." + reader.readShort();
			this.definition.flags = reader.readInt();
			this.definition.publicKey = reader.readBlobHex();
			this.definition.name = reader.readString();
			this.definition.culture = reader.readString();
			this.hashValue = reader.readBlobHex();
		}

		toString() {
			return this.definition + " #" + this.hashValue;
		}
	}
}