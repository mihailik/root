/// <reference path="MemberDefinitions.ts" />

module pe.managed {
	// One or more rows can refer to the same row in the TableKind.MethodDefinition or TableKind.MemberRef table.
	// (There can be multiple instantiations of the same generic method.)
	// [ECMA-335 para22.29]
	export class MethodSpec {
		// An index into the TableKind.MethodDefinition or TableKind.MemberRef table,
		// specifying to which generic method this row refers;
		// that is, which generic method this row is an instantiation of;
		// more precisely, a MethodDefOrRef (ECMA-335 para24.2.6) coded index.
		method: any;

		instantiation: TypeReference[] = [];

		internalReadRow(reader: TableStreamReader): void {
			this.method = reader.readMethodDefOrRef();
			reader.readMethodSpec(this.instantiation);
		}
	}

	export class MethodSpecSig {
		constructor(public blob: any) {
		}
	}
}