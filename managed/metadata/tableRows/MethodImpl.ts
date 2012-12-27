/// <reference path="../TableStreamReader.ts" />

module pe.managed.metadata {
	// TableKind.MethodImpl tables let a compiler override the default inheritance rules provided by the CLI
	// [ECMA-335 para22.27]
	export class MethodImpl {
		// An index into the TableKind.TypeDef table.
		// ILAsm uses the .override directive to specify the rows of the TableKind.MethodImpl table (ECMA-335 para10.3.2 and ECMA-335 para15.4.1).
		classIndex: number;

		// An index into the MethodDef or MemberRef table;
		// more precisely, a MethodDefOrRef (ECMA-335 para24.2.6) coded index.
		// The method indexed by MethodBody shall be virtual. [ERROR]
		// The method indexed by MethodBody shall have its Method.RVA != 0
		// (cannot be an unmanaged method reached via PInvoke, for example). [ERROR]
		methodBody: any;

		// An index into the TableKind.MethodDefinition or TableKind.MemberRef table;
		// more precisely, a MethodDefOrRef (ECMA-335 para24.2.6) coded index.
		// The method indexed by MethodDeclaration shall have Flags.Virtual set. [ERROR]
		methodDeclaration: any;

		internalReadRow(reader: TableStreamReader): void {
			this.classIndex = reader.readTableRowIndex(TableKind.TypeDefinition);
			this.methodBody = reader.readMethodDefOrRef();
			this.methodDeclaration = reader.readMethodDefOrRef();
		}
	}
}