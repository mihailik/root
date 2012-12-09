/// <reference path="../TableStreamReader.ts" />
module pe.managed.metadata {
	//TableKind.MethodImpl tables let a compiler override the default inheritance rules provided by the CLI
	//[ECMA-335 §22.27]
	export class MethodImpl {
		//An index into the TableKind.TypeDef table.
		//ILAsm uses the .override directive to specify the rows of the TableKind.MethodImpl table (ECMA-335 §10.3.2 and ECMA-335 §15.4.1).
		class: uint;

		//An index into the MethodDef or MemberRef table;
		//more precisely, a MethodDefOrRef (ECMA-335 §24.2.6) coded index.
		//The method indexed by MethodBody shall be virtual. [ERROR]
		//The method indexed by MethodBody shall have its Method.RVA != 0
		//(cannot be an unmanaged method reached via PInvoke, for example). [ERROR]
		methodBody: CodedIndex<MethodDefOrRef>;

		//An index into the TableKind.MethodDef or TableKind.MemberRef table;
		//more precisely, a MethodDefOrRef (ECMA-335 §24.2.6) coded index.
		//The method indexed by MethodDeclaration shall have Flags.Virtual set. [ERROR]
		methodDeclaration: CodedIndex<MethodDefOrRef>;

		read(reader: io.BinaryReader): void {
			this.class = reader.readTableIndex(TableKind.TypeDef);
			this.methodBody = reader.readCodedIndex<MethodDefOrRef>();
			this.methodDeclaration = reader.readCodedIndex<MethodDefOrRef>();
		}
	}
}