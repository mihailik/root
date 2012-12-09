// <reference path="../TableStreamReader.ts" />
module pe.managed.metadata {
	//The TabeKind.FieldMarshal table has two columns.
	//It 'links' an existing row in the TableKind.Field or TabeKind.Param table,
	//to information in the Blob heap that defines how that field or parameter
	//(which, as usual, covers the method return, as parameter number 0)
	//shall be marshalled when calling to or from unmanaged code via PInvoke dispatch.
	//[ECMA-335 §22.17]
	//Note that TableKind.FieldMarshal information is used only by code paths that arbitrate operation with unmanaged code.
	//In order to execute such paths, the caller, on most platforms, would be installed with elevated security permission.
	//Once it invokes unmanaged code, it lies outside the regime that the CLI can check—it is simply trusted not to violate the type system.
	//A row in the FieldMarshal table is created if the .field directive for the parent field has specified a marshal attribute (§16.1).
	export class FieldMarshal {
		//An index into TableKind.Field or TableKind.Param table;
		//more precisely, a HasFieldMarshal (ECMA-335 §24.2.6) coded index.
		parent: CodedIndex<HasFieldMarshal>;

		//An index into the Blob heap.
		//For the detailed format of the 'blob', see ECMA-335 §23.4.
		nativeType: MarshalSpec;

		read(reader: TableStreamBinaryReader): void {
			this.parent = reader.readCodedIndex<HasFieldMarshal>();
			this.nativeType = new MarshalSpec(reader.readBlob());
		}
	}
}