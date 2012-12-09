/// <reference path="../TableStreamReader.ts" />
/// <reference path="../rowEnums.ts" />
module pe.managed.metadata {
	//The Assembly table shall contain zero or one row. [ERROR]
	//[ECMA-335 para22.2]
	export class Assembly {
		assembly: AssemblyDefinition = null;

		read(reader: TableStreamReader): void {
			if (!this.assembly)
				this.assembly = new AssemblyDefinition();

			this.assembly.hashAlgId = reader.readInt();
			this.assembly.version = reader.readShort() + "." + reader.readShort() + "." + reader.readShort() + "." + reader.readShort();
			this.assembly.flags = reader.readInt();
			this.assembly.publicKey = reader.readBlob();
			this.assembly.name = reader.readString();
			this.assembly.culture = reader.readString();
		}
	}
}