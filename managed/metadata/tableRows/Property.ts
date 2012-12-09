<reference path="../TableStreamReader.ts" />
module pe.managed.metadata {
	//Properties within metadata are best viewed as a means to gather together collections of methods
	//defined on a class, give them a name, and not much else.
	//The methods are typically get_ and set_ methods,
	//already defined on the class, and inserted like any other methods into the TableKind.MethodDef table.
	//Within the rows owned by a given row in the TableKind.TypeDef table,
	//there shall be no duplicates based upon Name+Type. [ERROR]
	//[ECMA-335 §22.34]
	//Property tables do a little more than group together existing rows from other tables.
	//The TableKind.Property table has columns for Flags, Name and Type.
	//In addition, the TableKind.MethodSemantics table has a column to record whether the method it points at is a set_, a get_ or other.
	export class Property {
		propertyDefinition: PropertyDefinition;

		//An index into the Blob heap.
		//The name of this column is misleading.
		//It does not index a TableKind.TypeDef or TableKind.TypeRef table —
		//instead it indexes the signature in the Blob heap of the Property.
		//Type shall index a non-null signature in the Blob heap. [ERROR]
		//The signature indexed by Type shall be a valid signature for a property
		//(ie, low nibble of leading byte is 0x8).
		//Apart from this leading byte, the signature is the same as the property‘s  get_ method. [ERROR]
		type: PropertySig;

		read(reader: io.BinaryReader): void {
			this.propertyDefinition = new PropertyDefinition();
			this.propertyDefinition.Attributes = (PropertyAttributes)reader.readUShort();
			this.propertyDefinition.Name = reader.readString();
			this.type = reader.readPropertySignature();
		}
	}
}