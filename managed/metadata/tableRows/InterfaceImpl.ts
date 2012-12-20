/// <reference path="../TableStreamReader.ts" />
module pe.managed.metadata {
	// The TableKind.InterfaceImpl table records the interfaces a type implements explicitly.
	// Conceptually, each row in the TableKind.InterfaceImpl table indicates that Class implements Interface.
	// There should be no duplicates in the TableKind.InterfaceImpl table, based upon non-null Class and Interface values  [WARNING]
	// There can be many rows with the same value for Class (since a class can implement many interfaces).
	// There can be many rows with the same value for Interface (since many classes can implement the same interface).
	// [ECMA-335 para22.23]
	export class InterfaceImpl {
		// An index into the TypeDef table.
		// Shall be non-null [ERROR]
		// If Class is non-null, then:
		// a. Class shall index a valid row in the TableKind.TypeDef table  [ERROR]
		// b. Interface shall index a valid row in the TabeKind.TypeDef. or TableKind.TypeRef table [ERROR]
		// c. The row in the TableKind.TypeDef, TabeKind.TypeRef, or TableKind.TypeSpec table
		// indexed by Interface  shall be an interface (Flags.TypeAttributes.Interface = 1), not a TypeAttributes.Class or TypeAttributes.ValueType  [ERROR]
		classIndex: number;

		interface: CodedIndex;

		internalReadRow(reader: TableStreamReader): void {
			this.classIndex = reader.readTableRowIndex(TableKind.TypeDef);
			this.interface = reader.readTypeDefOrRef();
		}
	}
}