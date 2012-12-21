/// <reference path="../TableStreamReader.ts" />
/// <reference path="../rowEnums.ts" />

module pe.managed.metadata {
	// The first row of the TableKind.TypeDef table represents the pseudo class that acts as parent for functions and variables defined at module scope.
	// [ECMA-335 para22.37]
	export class TypeDef {
		typeDefinition: TypeDefinition;

		// An index into the TableKind.Field table;
		// it marks the first of a contiguous run of Fields owned by this Type.
		fieldList: number;

		// An index into the TableKind.MethodDef table;
		// it marks the first of a continguous run of Methods owned by this Type.
		methodList: number;

		internalReadRow(reader: TableStreamReader): void {
			this.typeDefinition = new TypeDefinition();

			this.typeDefinition.attributes = reader.readInt();
			this.typeDefinition.name = reader.readString();
			this.typeDefinition.namespace = reader.readString();
			this.typeDefinition.baseType = reader.readTypeDefOrRef();

			this.fieldList = reader.readTableRowIndex(TableKind.FieldDefinition);
			this.methodList = reader.readTableRowIndex(TableKind.MethodDef);
		}
	}
}