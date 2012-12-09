// <reference path="../TableStreamReader.ts" />
module pe.managed.metadata {
	//[ECMA-335 §22.28]
	//The rows of the TableKind.MethodSemantics table are filled
	//by .property (ECMA-335 §17) and .event directives (ECMA-335 §18). (See ECMA-335 §22.13 for more information.)
	//If this row is for an Event, and its Semantics is
	//MethodSemanticsAttributes.Addon
	//or MethodSemanticsAttributes.RemoveOn,
	//then the row in the TableKind.MethodDef table indexed by Method
	//shall take a Delegate as a parameter, and return void. [ERROR]
	//If this row is for an Event, and its Semantics is
	//MethodSemanticsAttributes.Fire,
	//then the row indexed in the TableKind.MethodDef table by Method
	//can return any type.
	export class MethodSemantics {
		//A 2-byte bitmask of type MethodSemanticsAttributes, ECMA-335 §23.1.12.
		//If this row is for a Property, then exactly one of
		//MethodSemanticsAttributes.Setter,
		//MethodSemanticsAttributes.Getter,
		//or MethodSemanticsAttributes.Other shall be set. [ERROR]
		//If this row is for an Event, then exactly one of
		//MethodSemanticsAttributes.AddOn,
		//MethodSemanticsAttributes.RemoveOn,
		//MethodSemanticsAttributes.Fire,
		//or MethodSemanticsAttributes.Other shall be set. [ERROR]
		semantics: MethodSemanticsAttributes;

		//An index into the TableKind.MethodDef table.
		//Method shall index a valid row in the TableKind.MethodDef table,
		//and that row shall be for a method defined on the same class as the Property or Event this row describes. [ERROR]
		method: number;

		//An index into the TableKind.Event or TableKind.Property table;
		//more precisely, a HasSemantics (ECMA-335 §24.2.6) coded index.
		association: CodedIndex<HasSemantics>;

		read(reader: TableStreamBinaryReader): void {
			this.semantics = (MethodSemanticsAttributes)reader.readUShort();
			this.method = reader.readTableRowIndex(TableKind.MethodDef);
			this.association = reader.readCodedIndex<HasSemantics>();
		}
	}
}