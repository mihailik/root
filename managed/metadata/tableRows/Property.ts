/// <reference path="../TableStreamReader.ts" />
/// <reference path="../../MemberDefinitions.ts" />
/// <reference path="../rowEnums.ts" />

module pe.managed.metadata {
	// Properties within metadata are best viewed as a means to gather together collections of methods
	// defined on a class, give them a name, and not much else.
	// The methods are typically get_ and set_ methods,
	// already defined on the class, and inserted like any other methods into the TableKind.MethodDef table.
	// Within the rows owned by a given row in the TableKind.TypeDef table,
	// there shall be no duplicates based upon Name+Type. [ERROR]
	// [ECMA-335 para22.34]
	// Property tables do a little more than group together existing rows from other tables.
	// The TableKind.Property table has columns for Flags, Name and Type.
	// In addition, the TableKind.MethodSemantics table has a column to record whether the method it points at is a set_, a get_ or other.
	export class Property {
		propertyDefinition: PropertyDefinition;

		internalReadRow(reader: TableStreamReader): void {
			this.propertyDefinition = new PropertyDefinition();
			this.propertyDefinition.attributes = reader.readShort();
			this.propertyDefinition.name = reader.readString();
			reader.readPropertySignature(this.propertyDefinition);
		}
	}
}