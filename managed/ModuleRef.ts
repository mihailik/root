/// <reference path="MemberDefinitions.ts" />

module pe.managed {
	// The rows in the TableKind.ModuleRef table result from .module extern directives in the Assembly (ECMA-335 para6.5).
	// [ECMA-335 para22.31]
	export class ModuleRef {
		name: string;

		internalReadRow(reader: TableStreamReader): void {
			this.name = reader.readString();
		}
	}
}