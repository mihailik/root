/// <reference path="../TableStreamReader.ts" />
module pe.managed.metadata {
	//The TableKind.TypeSpec table has just one column,
	//which indexes the specification of a Type, stored in the Blob heap.
	//This provides a metadata token for that Type (rather than simply an index into the Blob heap).
	//This is required, typically, for array operations, such as creating, or calling methods on the array class.
	//[ECMA-335 para22.39]
	//Note that TypeSpec tokens can be used with any of the CIL instructions
	//that take a TypeDef or TypeRef token;
	//specifically, castclass, cpobj, initobj, isinst, ldelema, ldobj, mkrefany, newarr, refanyval, sizeof, stobj, box, and unbox.
	export class TypeSpec {
		signature: TypeReference;

		read(reader: TableStreamReader): void {
			this.signature = <any>reader.readBlob();
		}
	}
}