/// <reference path="../TableStreamReader.ts" />
module pe.managed.metadata {
	//The rows in the TableKind.ModuleRef table result from .module extern directives in the Assembly (ECMA-335 §6.5).
	//[ECMA-335 §22.31]
	export class ModuleRef {
		name: string;

		read(reader: TableStreamBinaryReader): void {
			this.name = reader.readString();
		}
	}
}