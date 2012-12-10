/// <reference path="../TableStreamReader.ts" />
/// <reference path="../rowEnums.ts" />
module pe.managed.metadata {
	//The Constant table is used to store compile-time, constant values for fields, parameters, and properties.
	//[ECMA-335 para22.9]
	export class Constant {
		//Type (a 1-byte constant, followed by a 1-byte padding zero); see ECMA-335 para23.1.16.
		//The encoding of Type for the nullref value for FieldInit in ilasm (ECMA-335 para16.2)
		//is ElementType.Class with a Value of a 4-byte zero.
		//Unlike uses of ElementType.Class in signatures, this one is not followed by a type token.
		//Type shall be exactly one of:
		//ElementType.Boolean,
		//ElementType.Char,
		//ElementType.I1,  ElementType.U1,
		//ElementType.I2, ElementType.U2,
		//ElementType.I4, ElementType.U4,
		//ElementType.I8, ElementType.U8,
		//ElementType.R4, ElementType.R8,
		//or ElementType.String;
		//or ElementType.Class with a ConstantEntry.Value of zero (ECMA-335 para23.1.16) [ERROR]
		type: ElementType;

		//Parent (an index into the TableKind.Param, TableKind.Field, or TableKind.Property table;
		//more precisely, a HasConstant (ECMA-335 para24.2.6) coded index).
		//Parent shall index a valid row in the TableKind.Param, TableKind.Field, or TableKind.Property table. [ERROR]
		//There shall be no duplicate rows, based upon Parent[ERROR]
		parent: CodedIndex;

		value: string;

		read(reader: TableStreamReader): void {
			this.type = reader.readByte();
			var padding = reader.readByte();
			this.parent = reader.readHasConstant();
			this.value = <any>reader.readBlob();
		}
	}
}