/// <reference path="../TableStreamReader.ts" />
/// <reference path="../rowEnums.ts" />
module pe.managed.metadata {
	//The first row of the TableKind.TypeDef table represents the pseudo class that acts as parent for functions and variables defined at module scope.
	//[ECMA-335 para22.37]
	export class TypeDef {
		typeDefinition: TypeDefinition;

		//An index into the TableKind.TypeDef, TableKind.TypeRef, or TableKind.TypeSpec table;
		//more precisely, a TypeDefOrRef (ECMA para24.2.6) coded index.
		extends: CodedIndex<TypeDefOrRef>;

		//An index into the TableKind.Field table;
		//it marks the first of a contiguous run of Fields owned by this Type.
		fieldList: number;

		//An index into the TableKind.MethodDef table;
		//it marks the first of a continguous run of Methods owned by this Type.
		methodList: number;

		read(reader: TableStreamReader): void {
			this.typeDefinition = new TypeDefinition();
			
			this.typeDefinition.Attributes = reader.readInt();
			this.typeDefinition.Name = reader.readString();
			this.typeDefinition.Namespace = reader.readString();
			this.extends = reader.readCodedIndex<TypeDefOrRef>();
			this.fieldList = reader.readTableRowIndex(TableKind.Field);
			this.methodList = reader.readTableRowIndex(TableKind.MethodDef);
		}
	}
}