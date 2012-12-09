/// <reference path="../TableStreamReader.ts" />
module pe.managed.metadata {
	//[ECMA-335 §22.32]
	export class NestedClass {
		//An index into the TableKind.TypeDef table.
		nestedClass: uint;

		//An index into the TableKind.TypeDef table.
		enclosingClass: uint;

		read(reader: io.BinaryReader): void {
			this.nestedClass = reader.readTableIndex(TableKind.TypeDef);
			this.enclosingClass = reader.readTableIndex(TableKind.TypeDef);
		}
	}
}