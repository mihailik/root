/// <reference path="../TableStreamReader.ts" />
module pe.managed.metadata {
	//The TableKind.PropertyMap and TableKind.Property tables result from putting the .property directive on a class (ECMA-335 §17).
	//[ECMA-335 §22.35]
	export class PropertyMap {
		//An index into the TableKind.TypeDef table.
		parent: uint;

		//An index into the TableKind.Property table.
		//It marks the first of a contiguous run of Properties owned by Parent.
		propertyList: uint;

		read(reader: io.BinaryReader): void {
			this.parent = reader.readTableIndex(TableKind.TypeDef);
			this.propertyList = reader.readTableIndex(TableKind.Property);
		}
	}
}