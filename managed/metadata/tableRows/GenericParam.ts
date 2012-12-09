// <reference path="../TableStreamReader.ts" />
module pe.managed.metadata {
	//The TableKind.GenericParam table stores the generic parameters used in generic type definitions and generic method definitions.
	//These generic parameters can be constrained
	//(i.e., generic arguments shall extend some class and/or implement certain interfaces)
	//or unconstrained.
	//(Such constraints are stored in the TableKind.GenericParamConstraint table.)
	//Conceptually, each row in the TableKind.GenericParam table is owned by one, and only one, row
	//in either the TableKind.TypeDef or TableKind.MethodDef tables.
	//[ECMA-335 §22.20]
	export class GenericParam {
		//The 2-byte index of the generic parameter, numbered left-to-right, from zero.
		number: number;

		//A 2-byte bitmask of type GenericParamAttributes, ECMA-335 §23.1.7.
		flags: GenericParamAttributes;

		//An index into the TableKind.TypeDef or TableKind.MethodDef table,
		//specifying the Type or Method to which this generic parameter applies;
		//more precisely, a TypeOrMethodDef (ECMA-335 §24.2.6) coded index.
		//The following additional restrictions apply:
		//* Owner cannot be a non nested enumeration type; and
		//* If Owner is a nested enumeration type then Number must be less than or equal
		//to the number of generic parameters of the enclosing class.
		//Rationale: generic enumeration types serve little purpose and usually only exist to meet CLR Rule 42.
		//These additional restrictions limit the genericty of enumeration types while allowing CLS Rule 42 to be met.
		owner: CodedIndex<TypeOrMethodDef>;

		//This is purely descriptive and is used only by source language compilers and by Reflection.
		name: string;

		read(reader: TableStreamBinaryReader): void {
			this.number = reader.readUShort();
			this.flags = (GenericParamAttributes)reader.readUShort();
			this.owner = reader.readCodedIndex<TypeOrMethodDef>();
			this.name = reader.readString();
		}
	}
}