/// <reference path="../TableStreamReader.ts" />
module pe.managed.metadata {
	//One or more rows can refer to the same row in the TableKind.MethodDef or TableKind.MemberRef table.
	//(There can be multiple instantiations of the same generic method.)
	//[ECMA-335 para22.29]
	export class MethodSpec {
		//An index into the TableKind.MethodDef or TableKind.MemberRef table,
		//specifying to which generic method this row refers;
		//that is, which generic method this row is an instantiation of;
		//more precisely, a MethodDefOrRef (ECMA-335 para24.2.6) coded index.
		method: CodedIndex<MethodDefOrRef>;

		//The signature of this instantiation.
		//The signature stored at Instantiation shall be a valid instantiation
		//of the signature of the generic method stored at Method  [ERROR]
		instantiation: MethodSpec;

		read(reader: TableStreamReader): void {
			this.method = reader.readMethodDefOrRef();
			this.instantiation = reader.readMethodSpec();
		}
	}
}