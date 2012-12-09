// <reference path="../TableStreamReader.ts" />
module pe.managed.metadata {
	//The TableKind.ExportedType table holds a row for each type:
	//a. Defined within other modules of this Assembly; that is exported out of this Assembly.
	//In essence, it stores TableKind.TypeDef row numbers of all types
	//that are marked public in other modules that this Assembly comprises.
	//The actual target row in a TableKind.TypeDef table is given by the combination of TypeDefId
	//(in effect, row number) and Implementation (in effect, the module that holds the target TableKind.TypeDef table).
	//Note that this is the only occurrence in metadata of foreign tokens;
	//that is, token values that have a meaning in another module.
	//(A regular token value is an index into a table in the current module);
	//OR
	//b. Originally defined in this Assembly but now moved to another Assembly.
	//Flags must have TypeAttributes.IsTypeForwarder set
	//and Implementation is an TableKind.AssemblyRef
	//indicating the Assembly the type may now be found in.
	//The full name of the type need not be stored directly.
	//Instead, it can be split into two parts at any included '.'
	//(although typically this is done at the last '.' in the full name).
	//The part preceding the '.' is stored as the TypeNamespace
	//and that following the '.' is stored as the TypeName.
	//If there is no '.' in the full name,
	//then the TypeNamespace shall be the index of the empty string.
	//[ECMA-335 §22.14]
	//The rows in the TableKind. table are the result of the .class extern directive (ECMA-335 §6.7).
	export class ExportedType {
		//A 4-byte bitmask of type TypeAttributes, ECMA-335 §23.1.15.
		flags: TypeAttributes;

		//A 4-byte index into a TableKind.TypeDef table of another module in this Assembly.
		//This column is used as a hint only.
		//If the entry in the target TableKind.TypeDef table
		//matches the TypeName and TypeNamespace entries in this table,
		//resolution has succeeded.
		//But if there is a mismatch, the CLI shall fall back to a search
		//of the target TableKind.TypeDef table.
		//Ignored and should be zero if Flags has TypeAttributes.IsTypeForwarder set.
		typeDefId: number;

		typeName: string;

		typeNamespace: string;

		//This is an index (more precisely, an Implementation (ECMA-335 §24.2.6) coded index)
		//into either of the following tables:
		//* TableKind.File table, where that entry says which module in the current assembly holds the TableKind.TypeDef;
		//* TableKind.ExportedType table, where that entry is the enclosing Type of the current nested Type;
		//* TableKind.AssemblyRef table, where that entry says in which assembly the type may now be found
		//(Flags must have the TypeAttributes.IsTypeForwarder flag set).
		implementation: CodedIndex<Implementation>;

		read(reader: TableStreamBinaryReader): void {
			this.flags = (TypeAttributes)reader.readUInt();
			this.typeDefId = reader.readUInt();
			this.typeName = reader.readString();
			this.typeNamespace = reader.readString();
			this.implementation = reader.readCodedIndex<Implementation>();
		}
	}
}