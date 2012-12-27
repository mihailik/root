/// <reference path="MemberDefinitions.ts" />
/// <reference path="enums.ts" />

module pe.managed {
	// The Assembly table shall contain zero or one row. [ERROR]
	// [ECMA-335 para22.2]
	export class Assembly {
		definition: AssemblyDefinition = null;

		internalReadRow(reader: TableStreamReader): void {
			if (!this.definition)
				this.definition = new AssemblyDefinition();

			this.definition.hashAlgId = reader.readInt();
			this.definition.version = reader.readShort() + "." + reader.readShort() + "." + reader.readShort() + "." + reader.readShort();
			this.definition.flags = reader.readInt();
			this.definition.publicKey = reader.readBlobHex();
			this.definition.name = reader.readString();
			this.definition.culture = reader.readString();
		}
	}
}