// <reference path="../TableStreamReader.ts" />
module pe.managed.metadata {
	//[ECMA-335 §22.30]
	//The Generation, EncId, and EncBaseId columns can be written as zero,
	//and can be ignored by conforming implementations of the CLI.
	//The rows in the TableKind.Module table result from .module directives in the Assembly (ECMA-335 §6.4).
	export class Module {
		generation: number;

		name: string;

		//The Mvid column shall index a unique GUID in the GUID heap (ECMA-335 §24.2.5)
		//that identifies this instance of the module.
		//The Mvid can be ignored on read by conforming implementations of the CLI.
		//The Mvid should be newly generated for every module,
		//using the algorithm specified in ISO/IEC 11578:1996
		//(Annex A) or another compatible algorithm.
		//[Rationale: While the VES itself makes no use of the Mvid,
		//other tools (such as debuggers, which are outside the scope of this standard)
		//rely on the fact that the Mvid almost always differs from one module to another.
		//end rationale]
		mvid: Guid?;

		encId: Guid?;

		encBaseId: Guid?;

		read(reader: TableStreamBinaryReader): void {
			this.generation = reader.readUShort();
			this.name = reader.readString();
			this.mvid = reader.readGuid();
			this.encId = reader.readGuid();
			this.encBaseId = reader.readGuid();
		}
	}
}