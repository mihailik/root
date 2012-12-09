/// <reference path="../TableStreamReader.ts" />
module pe.managed.metadata {
	//Conceptually, each row in the TableKind.FieldRVA table is an extension to exactly one row in the TableKind.Field table,
	//and records the RVA (Relative Virtual Address) within the image file at which this field‘s initial value is stored.
	//A row in the TableKind.FieldRVA table is created for each static parent field that has specified the optional data label (ECMA-335 §16).
	//The RVA column is the relative virtual address of the data in the PE file (ECMA-335 §16.3).
	//[ECMA-335 §22.18]
	export class FieldRVA {
		//A 4-byte constant.
		rva: uint;

		//An index into TableKind.Field table.
		field: uint;

		read(reader: io.BinaryReader): void {
			this.rva = reader.readUInt();
			this.field = reader.readTableIndex(TableKind.Field);
		}
	}
}