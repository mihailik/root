/// <reference path="../TableStreamReader.ts" />
/// <reference path="../CustomAttributeData.ts" />
module pe.managed.metadata {
	//The TableKind.CustomAttribute table stores data that can be used to instantiate a Custom Attribute
	//(more precisely, an object of the specified Custom Attribute class) at runtime.
	//The column called Type is slightly misleading --
	//it actually indexes a constructor method --
	//the owner of that constructor method is the Type of the Custom Attribute.
	//A row in the CustomAttribute table for a parent is created by the .custom attribute,
	//which gives the value of the Type column and optionally that of the Value column (ECMA-335 para21).
	//[ECMA-335 para22.10]
	//All binary values are stored in little-endian format
	//(except for PackedLen items, which are used only as a count for the number of bytes to follow in a UTF8 string).
	export class CustomAttribute {
		//Parent can be an index into any metadata table, except the TableKind.CustomAttribute table itself  [ERROR]
		parent: CodedIndex;

		//Type shall index a valid row in the TableKind.Method or TableKind.MemberRef table.
		//That row shall be a constructor method
		//(for the class of which this information forms an instance)  [ERROR]
		type: CodedIndex;

		value: CustomAttributeData;

		read(reader: TableStreamReader): void {
			this.parent = reader.readHasCustomAttribute();
			this.type = reader.readCustomAttributeType();
			this.value = new CustomAttributeData(reader.readBlob());
		}
	}
}