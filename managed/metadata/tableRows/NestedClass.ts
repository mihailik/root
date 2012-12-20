/// <reference path="../TableStreamReader.ts" />

module pe.managed.metadata {
	// [ECMA-335 para22.32]
	export class NestedClass {
		// An index into the TableKind.TypeDef table.
		nestedClass: number;

		// An index into the TableKind.TypeDef table.
		enclosingClass: number;

		read(reader: TableStreamReader): void {
			this.nestedClass = reader.readTableRowIndex(TableKind.TypeDef);
			this.enclosingClass = reader.readTableRowIndex(TableKind.TypeDef);
		}
	}
}