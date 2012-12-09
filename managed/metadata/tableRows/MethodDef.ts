/// <reference path="../TableStreamReader.ts" />
module pe.managed.metadata {
	//Conceptually, every row in the TableKind.MethodDef table is owned by one, and only one, row in the TableKind.TypeDef table.
	//The rows in the MethodDef table result from .method directives (ECMA-335 §15).
	//The MethodDefEntry.RVA column is computed when the image for the PE file is emitted
	//and points to the COR_ILMETHOD structure
	//for the body of the method (ECMA-335 §25.4)
	//[Note: If Signature is GENERIC (0x10), the generic arguments are described in the GenericParam table (ECMA-335 §22.20).
	//end note]
	//[ECMA-335 §22.26]
	export class MethodDef {
		methodDefinition: MethodDefinition;

		rva: uint;

		signature: MethodSig;

		paramList: uint;

		read(reader: io.BinaryReader): void {
			this.methodDefinition = new MethodDefinition();
			
			this.rva = reader.readUInt();
			this.methodDefinition.ImplAttributes = (MethodImplAttributes)reader.readUShort();
			this.methodDefinition.Attributes = (MethodAttributes)reader.readUShort();
			this.methodDefinition.Name = reader.readString();
			this.signature = reader.readMethodSignature();
			this.paramList = reader.readTableIndex(TableKind.Param);
		}
	}
}