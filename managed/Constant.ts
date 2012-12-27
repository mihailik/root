/// <reference path="MemberDefinitions.ts" />
/// <reference path="enums.ts" />

module pe.managed {
	// The Constant table is used to store compile-time, constant values for fields, parameters, and properties.
	// [ECMA-335 para22.9]
	export class Constant {
		isSingleton = true;

		internalReadRow(reader: TableStreamReader): void {
			var type = reader.readByte();
			var padding = reader.readByte();
			var parent = reader.readHasConstant();
			var constValue = new ConstantValue(KnownType.internalGetByElementName(type), reader.readConstantValue(type));
			parent.value = constValue;
		}
	}
}