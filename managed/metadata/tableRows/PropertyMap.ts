/// <reference path="../TableStreamReader.ts" />
module pe.managed.metadata {
	//The TableKind.PropertyMap and TableKind.Property tables result from putting the .property directive on a class (ECMA-335 para17).
	//[ECMA-335 para22.35]
	export class PropertyMap {
		//An index into the TableKind.TypeDef table.
		parent: number;

		//An index into the TableKind.Property table.
		//It marks the first of a contiguous run of Properties owned by Parent.
		propertyList: number;

		read(reader: TableStreamBinaryReader): void {
			this.parent = reader.readTableRowIndex(TableKind.TypeDef);
			this.propertyList = reader.readTableRowIndex(TableKind.Property);
		}
	}
}