/// <reference path="MemberDefinitions.ts" />

module pe.managed {
	// This record should not be emitted into any PE file.
	// However, if present in a PE file, it should be treated as if its field were zero.
	// It should be ignored by the CLI.
	// [ECMA-335 para22.4]
	export class AssemblyProcessor {
		processor: number;

		internalReadRow(reader: TableStreamReader): void {
			this.processor = reader.readInt();
		}
	}
}