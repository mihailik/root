/// <reference path="MemberDefinitions.ts" />
/// <reference path="enums.ts" />

module pe.managed {
	// These records should not be emitted into any PE file.
	// However, if present in a PE file, they should be treated as-if their fields were zero.
	// They should be ignored by the CLI.
	// [ECMA-335 para22.6]
	export class AssemblyRefOS {
		definition: AssemblyDefinition;
		hashValue: string;

		internalReadRow(reader: TableStreamReader): void {
			if (!this.definition)
				this.definition = new AssemblyDefinition();

			this.definition.version = reader.readShort() + "." + reader.readShort() + "." + reader.readShort() + "." + reader.readShort();
			this.definition.flags = reader.readInt();
			this.definition.publicKey = reader.readBlobHex();
			this.definition.name = reader.readString();
			this.definition.culture = reader.readString();
			this.hashValue = reader.readBlobHex();
		}
	}
}