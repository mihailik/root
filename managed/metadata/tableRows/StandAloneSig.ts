/// <reference path="../TableStreamReader.ts" />
module pe.managed.metadata {
	//Signatures are stored in the metadata Blob heap.
	//In most cases, they are indexed by a column in some table --
	//FieldEntry.Signature, Method.Signature, MemberRef.Signature, etc.
	//However, there are two cases that require a metadata token for a signature
	//that is not indexed by any metadata table.
	//The TableKind.StandAloneSig table fulfils this need.
	//It has just one column, which points to a Signature in the Blob heap.
	//The signature shall describe either:
	//* a method – code generators create a row in the TableKind.StandAloneSig table for each occurrence of a calli CIL instruction.
	//That row indexes the call-site signature for the function pointer operand of the calli instruction.
	//* local variables – code generators create one row in the TableKind.StandAloneSig table for each method,
	//to describe all of its local variables.
	//The .locals directive (ECMA-335 para15.4.1) in ILAsm generates a row in the TableKind.StandAloneSig table.
	//[ECMA-335 para22.36]
	export class StandAloneSig {
		//The signature 'blob' indexed by Signature shall be a valid METHOD or LOCALS signature. [ERROR]
		//Duplicate rows are allowed.
		signatureBlob: any;

		read(reader: TableStreamReader): void {
			this.signatureBlob = reader.readBlob();
		}
	}
}