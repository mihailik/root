/// <reference path="MemberDefinitions.ts" />

module pe.managed {

	// [ECMA-335 para22.32]
	export class NestedClass {
		// An index into the TableKind.TypeDef table.
		nestedClass: number;

		// An index into the TableKind.TypeDef table.
		enclosingClass: number;

		internalReadRow(reader: TableStreamReader): void {
			this.nestedClass = reader.readTableRowIndex(TableKind.TypeDefinition);
			this.enclosingClass = reader.readTableRowIndex(TableKind.TypeDefinition);
		}
	}
}