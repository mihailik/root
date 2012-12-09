/// <reference path="../TableStreamReader.ts" />
/// <reference path="../rowEnums.ts" />
module pe.managed.metadata {
	//Conceptually, each row in the TableKind.Field table is owned by one, and only one, row in the TableKind.TypeDef table.
	//However, the owner of any row in the TableKind.Field table is not stored anywhere in the TableKind.Field table itself.
	//There is merely a 'forward-pointer' from each row in the TableKind.TypeDef table
	//(the TypeDefEntry.FieldList column).
	//[ECMA-335 para22.15]
	//Each row in the Field table results from a top-level .field directive (ECMA-335 para5.10), or a .field directive inside a Type (ECMA-335 para10.2).
	export class Field {
		fieldDefinition: FieldDefinition;

		signature: FieldSig;

		read(reader: TableStreamBinaryReader): void {
			this.fieldDefinition = new FieldDefinition();
			this.fieldDefinition.Attributes = reader.readShort();
			this.fieldDefinition.Name = reader.readString();
			this.signature = reader.readFieldSignature();
		}
	}
}