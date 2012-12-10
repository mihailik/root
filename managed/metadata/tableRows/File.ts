/// <reference path="../TableStreamReader.ts" />
/// <reference path="../rowEnums.ts" />
module pe.managed.metadata {
	//[ECMA-335 para22.19]
	export class File {
		//A 4-byte bitmask of type FileAttributes, ECMA-335 para23.1.6.
		//If this module contains a row in the TableKind.Assembly table
		//(that is, if this module 'holds the manifest')
		//then there shall not be any row in the TableKind.File table for this module; i.e., no self-reference. [ERROR]
		//If the TableKind.File table is empty, then this, by definition, is a single-file assembly.
		//In this case, the TableKind.ExportedType table should be empty  [WARNING]
		flags: FileAttributes;

		//Name shall index a non-empty string in the String heap.
		//It shall be in the format filename.extension  (e.g., 'foo.dll', but not 'c:\utils\foo.dll'). [ERROR]
		//There shall be no duplicate rows; that is, rows with the same Name value. [ERROR]
		name: string;

		//HashValue shall index a non-empty 'blob' in the Blob heap. [ERROR]
		hashValue: string;

		read(reader: TableStreamReader): void {
			this.flags = reader.readInt();
			this.name = reader.readString();
			this.hashValue = io.bytesToHex(reader.readBlob());
		}
	}
}