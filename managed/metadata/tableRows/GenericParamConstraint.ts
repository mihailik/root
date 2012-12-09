/// <reference path="../TableStreamReader.ts" />
module pe.managed.metadata {
	//The TableKind.GenericParamConstraint table records the constraints for each generic parameter.
	//Each generic parameter can be constrained to derive from zero or one class.
	//Each generic parameter can be constrained to implement zero or more interfaces.
	//Conceptually, each row in the TableKind.GenericParamConstraint table is 'owned' by a row in the TableKind.GenericParam table.
	//All rows in the TableKind.GenericParamConstraint table for a given Owner shall refer to distinct constraints.
	//Note that if Constraint is a TableKind.TypeRef to System.ValueType,
	//then it means the constraint type shall be System.ValueType, or one of its sub types.
	//However, since System.ValueType itself is a reference type,
	//this particular mechanism does not guarantee that the type is a non-reference type.
	//[ECMA-335 para22.21]
	export class GenericParamConstraint {
		//An index into the TableKind.GenericParam table, specifying to which generic parameter this row refers.
		owner: number;

		//An index into the TableKind.TypeDef, TableKind.TypeRef, or TableKind.TypeSpec tables,
		//specifying from which class this generic parameter is constrained to derive;
		//or which interface this generic parameter is constrained to implement;
		//more precisely, a TypeDefOrRef (ECMA-335 para24.2.6) coded index.
		constraint: CodedIndex<TypeDefOrRef>;

		read(reader: TableStreamBinaryReader): void {
			this.owner = reader.readTableRowIndex(TableKind.GenericParam);
			this.constraint = reader.readCodedIndex<TypeDefOrRef>();
		}
	}
}