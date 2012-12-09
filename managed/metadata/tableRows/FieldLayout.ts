/// <reference path="../TableStreamReader.ts" />
module pe.managed.metadata {
	//Note that each Field in any Type is defined by its Signature.
	//When a Type instance (i.e., an object) is laid out by the CLI, each Field is one of four kinds:
	//* Scalar: for any member of built-in type, such as int32.
	//The size of the field is given by the size of that intrinsic, which varies between 1 and 8 bytes.
	//* ObjectRef: for ElementType.Class, ElementType.String, ElementType.Object,
	//ElementType.Array, ElementType.SZArray.
	//* Pointer: for ElementType.Ptr, ElementType.FNPtr.
	//* ValueType: for ElementType.VaueType.
	//The instance of that ValueType is actually laid out in this object,
	//so the size of the field is the size of that ValueType.
	//Note that metadata specifying explicit structure layout can be valid for use on one platform but not on another,
	//since some of the rules specified here are dependent on platform-specific alignment rules.
	//[ECMA-335 para22.16]
	//A row in the TableKind.FieldLayout table is created if the .field directive for the parent field has specified a field offset (ECMA-335 para16).
	export class FieldLayout {
		//Offset shall be zero or more. [ERROR]
		//Among the rows owned by a given Type it is perfectly  valid for several rows to have the same value of Offset.
		//ElementType.ObjectRef and a ElementType.ValueType cannot have the same offset. [ERROR]
		//Every Field of an ExplicitLayout Type shall be given an offset;
		//that is, it shall have a row in the FieldLayout table. [ERROR]
		offset: number;

		//An index into the Field table.
		field: number;

		read(reader: TableStreamBinaryReader): void {
			this.offset = reader.readInt();
			this.field = reader.readTableRowIndex(TableKind.Field);
		}
	}
}