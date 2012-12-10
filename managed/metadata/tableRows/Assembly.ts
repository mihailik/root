/// <reference path="../TableStreamReader.ts" />
/// <reference path="../rowEnums.ts" />
module pe.managed.metadata {
	//The Assembly table shall contain zero or one row. [ERROR]
	//[ECMA-335 para22.2]
	export class Assembly {
		assemblyDefinition: AssemblyDefinition = null;

		read(reader: TableStreamReader): void {
			if (!this.assemblyDefinition)
				this.assemblyDefinition = new AssemblyDefinition();

			this.assemblyDefinition.hashAlgId = reader.readInt();
			this.assemblyDefinition.version = reader.readShort() + "." + reader.readShort() + "." + reader.readShort() + "." + reader.readShort();
			this.assemblyDefinition.flags = reader.readInt();
			this.assemblyDefinition.publicKey = reader.readBlob();
			this.assemblyDefinition.name = reader.readString();
			this.assemblyDefinition.culture = reader.readString();
		}
	}
}