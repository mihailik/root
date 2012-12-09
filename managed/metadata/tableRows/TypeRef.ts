/// <reference path="../TableStreamReader.ts" />
module pe.managed.metadata {
	//The first row of the TypeDef table represents the pseudo class that acts as parent for functions and variables defined at module scope.
	//[ECMA-335 para22.38]
	export class TypeRef {
		resolutionScope: CodedIndex<ResolutionScope>;

		typeReference: TypeReference.External;

		read(reader: TableStreamReader): void {
			this.typeReference = new TypeReference.External();
			
			this.resolutionScope = reader.readResolutionScope();
			this.typeReference.Name = reader.readString();
			this.typeReference.Namespace = reader.readString();
		}
	}
}