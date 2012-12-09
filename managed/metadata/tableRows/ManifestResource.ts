/// <reference path="../TableStreamReader.ts" />
module pe.managed.metadata {
	//[ECMA-335 §22.24]
	//The rows in the table result from .mresource directives on the Assembly (ECMA-335 §6.2.2).
	export class ManifestResource {
		//A 4-byte constant.
		//The Offset specifies the byte offset within the referenced file at which this resource record begins.
		//Offset shall be a valid offset into the target file, starting from the Resource entry in the CLI header. [ERROR]
		//If the resource is an index into the TableKind.File table, Offset shall be zero. [ERROR]
		offset: number;

		//A 4-byte bitmask of type ManifestResourceAttributes, ECMA-335 §23.1.9.
		flags: ManifestResourceAttributes;

		name: string;

		//An index into a TableKind.File table, a TableKind.AssemblyRef table, or  null;
		//more precisely, an Implementation (ECMA-335 §24.2.6) coded index.
		//Implementation specifies which file holds this resource.
		//Implementation can be null or non-null (if null, it means the resource is stored in the current file).
		implementation: CodedIndex<Implementation>;

		read(reader: TableStreamBinaryReader): void {
			this.offset = reader.readInt();
			this.flags = (ManifestResourceAttributes)reader.readInt();
			this.name = reader.readString();
			this.implementation = reader.readCodedIndex<Implementation>();
		}
	}
}