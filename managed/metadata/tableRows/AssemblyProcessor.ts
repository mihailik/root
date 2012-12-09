// <reference path="../TableStreamReader.ts" />
module pe.managed.metadata {
	//This record should not be emitted into any PE file.
	//However, if present in a PE file, it should be treated as if its field were zero.
	//It should be ignored by the CLI.
	//[ECMA-335 §22.4]
	export class AssemblyProcessor {
		processor: number;

		read(reader: TableStreamBinaryReader): void {
			this.processor = reader.readUInt();
		}
	}
}