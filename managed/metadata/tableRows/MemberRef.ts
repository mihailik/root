/// <reference path="../TableStreamReader.ts" />
module pe.managed.metadata {
	// The TableKind.MemberRef table combines two sorts of references, to Methods and to Fields of a class,
	// known as 'MethodRef' and 'FieldRef', respectively.
	// [ECMA-335 para22.25]
	export class MemberRef {
		// An index into the TabeKind.MethodDef, TableKind.ModuleRef,
		// TableKind.TypeDef, TableKind.TypeRef, or TableKind.TypeSpec tables;
		// more precisely, a MemberRefParent (ECMA-335 para24.2.6) coded index.
		// An entry is made into the TableKind.MemberRef table
		// whenever a reference is made in the CIL code to a method or field
		// which is defined in another module or assembly.
		// (Also, an entry is made for a call to a method with a VARARG signature, even when it is defined in the same module as the call site.)
		classIndex: CodedIndex;

		name: string;

		signatureBlob: any;

		internalReadRow(reader: TableStreamReader): void {
			this.classIndex = reader.readMemberRefParent();
			this.name = reader.readString();
			this.signatureBlob = reader.readBlob();
		}
	}
}