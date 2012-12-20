/// <reference path="../TableStreamReader.ts" />
/// <reference path="../../MemberDefinitions.ts" />

module pe.managed.metadata {
	// The first row of the TypeDef table represents the pseudo class that acts as parent for functions and variables defined at module scope.
	// [ECMA-335 para22.38]
	export class TypeRef {
		resolutionScope: CodedIndex;

		definition: ExternalType;

		read(reader: TableStreamReader): void {
			this.resolutionScope = reader.readResolutionScope();

			var name = reader.readString();
			var namespace = reader.readString();

			this.definition = new ExternalType(null, name, namespace);
		}
	}
}