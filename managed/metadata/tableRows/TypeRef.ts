/// <reference path="../TableStreamReader.ts" />
/// <reference path="../../MemberDefinitions.ts" />

module pe.managed.metadata {
	// The first row of the TypeDef table represents the pseudo class that acts as parent for functions and variables defined at module scope.
	// [ECMA-335 para22.38]
	export class TypeRef {
		resolutionScope: CodedIndex;

		typeReference: ExternalType;

		read(reader: TableStreamReader): void {
			this.typeReference = new ExternalType();

			this.resolutionScope = reader.readResolutionScope();
			this.typeReference.name = reader.readString();
			this.typeReference.namespace = reader.readString();
		}
	}
}