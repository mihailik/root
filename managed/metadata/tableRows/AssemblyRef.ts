/// <reference path="../TableStreamReader.ts" />
/// <reference path="../rowEnums.ts" />
module pe.managed.metadata {
	//The AssemblyRef table shall contain no duplicates
	//(where duplicate rows are deemd to be those having the same
	//MajorVersion, MinorVersion, BuildNumber, RevisionNumber, PublicKeyOrToken, Name, and Culture). [WARNING]
	//[ECMA-335 §22.5]
	export class AssemblyRef {
		//MajorVersion, MinorVersion, BuildNumber, and RevisionNumber can each have any value.
		version: string;

		//Flags shall have only one bit set, the PublicKey bit (ECMA-335 §23.1.2). All other bits shall be zero. [ERROR]
		flags: AssemblyFlags;

		//PublicKeyOrToken can be null, or non-null
		//(note that the Flags.PublicKey bit specifies whether the 'blob' is a full public key, or the short hashed token).
		//If non-null, then PublicKeyOrToken shall index a valid offset in the Blob heap. [ERROR]
		publicKeyOrToken: string;

		//Name shall index a non-empty string, in the String heap (there is no limit to its length). [ERROR]
		name: string;

		//Culture can be null or non-null.
		//If non-null, it shall index a single string from the list specified (ECMA-335 §23.1.3). [ERROR]
		culture: string;

		//HashValue can be null or non-null.
		//If non-null, then HashValue shall index a non-empty 'blob' in the Blob heap. [ERROR]
		hashValue: string;

		read(reader: TableStreamBinaryReader): void {
			this.version = reader.readVersion();
			this.flags = reader.readInt();
			this.publicKeyOrToken = reader.readBlob();
			this.name = reader.readString();
			this.culture = reader.readString();
			this.hashValue = reader.readBlob();
		}
	}
}