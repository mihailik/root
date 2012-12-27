/// <reference path="../TableStreamReader.ts" />
/// <reference path="../../MemberDefinitions.ts" />
/// <reference path="../rowEnums.ts" />

module pe.managed.metadata {
	// Conceptually, every row in the TableKind.MethodDef table is owned by one, and only one, row in the TableKind.TypeDef table.
	// The rows in the MethodDef table result from .method directives (ECMA-335 para15).
	// [Note: If Signature is GENERIC (0x10), the generic arguments are described in the GenericParam table (ECMA-335 para22.20).
	// end note]
	// [ECMA-335 para22.26]
	export class MethodDef {
		definition: MethodDefinition = new MethodDefinition();

		// The MethodDefEntry.RVA column is computed when the image for the PE file is emitted
		// and points to the COR_ILMETHOD structure
		// for the body of the method (ECMA-335 para25.4)
		internalRva: number = 0;

		internalParamList: number = 0;

		internalReadRow(reader: TableStreamReader): void {
			if (!this.definition)
				this.definition = new MethodDefinition();
			
			this.internalRva = reader.readInt();
			this.definition.implAttributes = reader.readShort();
			this.definition.attributes = reader.readShort();
			this.definition.name = reader.readString();
			reader.readMethodSignature(this.definition.signature);
			this.internalParamList = reader.readTableRowIndex(TableKind.ParameterDefinition);
		}
	}
}