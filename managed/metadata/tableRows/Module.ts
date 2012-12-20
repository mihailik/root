/// <reference path="../TableStreamReader.ts" />

module pe.managed.metadata {
	// [ECMA-335 para22.30]
	// The Generation, EncId, and EncBaseId columns can be written as zero,
	// and can be ignored by conforming implementations of the CLI.
	// The rows in the TableKind.Module table result from .module directives in the Assembly (ECMA-335 para6.4).
	export class Module {
		moduleDefinition: ModuleDefinition;

		internalReadRow(reader: TableStreamReader): void {
			if (!this.moduleDefinition)
				this.moduleDefinition = new ModuleDefinition();

			this.moduleDefinition.generation = reader.readShort();
			this.moduleDefinition.name = reader.readString();
			this.moduleDefinition.mvid = reader.readGuid();
			this.moduleDefinition.encId = reader.readGuid();
			this.moduleDefinition.encBaseId = reader.readGuid();
		}
	}
}