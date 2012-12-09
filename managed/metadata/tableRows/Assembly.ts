<reference path="../TableStreamReader.ts" />
module pe.managed.metadata {
	//The Assembly table shall contain zero or one row. [ERROR]
	//[ECMA-335 §22.2]
	export class Assembly {
		//HashAlgId shall be one of the specified values. [ERROR]
		hashAlgId: AssemblyHashAlgorithm;

		//MajorVersion, MinorVersion, BuildNumber, and RevisionNumber can each have any value.
		version: string;

		//Flags shall have only those values set that are specified. [ERROR]
		flags: AssemblyFlags;

		//PublicKey can be null or non-null.
		publicKey: byte[];

		//Name shall index a non-empty string in the String heap. [ERROR]
		//. The string indexed by Name can be of unlimited length.
		name: string;

		//Culture  can be null or non-null.
		//If Culture is non-null, it shall index a single string from the list specified (ECMA-335 §23.1.3). [ERROR]
		culture: string;

		read(reader: io.BinaryReader): void {
			this.hashAlgId = (AssemblyHashAlgorithm)reader.readUInt();
			this.version = reader.readVersion();
			this.flags = (AssemblyFlags)reader.readUInt();
			this.publicKey = reader.readBlob();
			this.name = reader.readString();
			this.culture = reader.readString();
		}
	}
}