// <reference path="../TableStreamReader.ts" />
module pe.managed.metadata {
	//This record should not be emitted into any PE file.
	//However, if present in a PE file, it shall be treated as if all its fields were zero.
	//It shall be ignored by the CLI.
	//[ECMA-335 §22.3]
	export class AssemblyOS {
		osplatformID: number;

		osmajorVersion: number;

		osminorVersion: number;

		read(reader: TableStreamBinaryReader): void {
			this.osplatformID = reader.readUInt();
			this.osmajorVersion = reader.readUInt();
			this.osminorVersion = reader.readUInt();
		}
	}
}