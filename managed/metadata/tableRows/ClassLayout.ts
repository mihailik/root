/// <reference path="../TableStreamReader.ts" />
/// <reference path="../rowEnums.ts" />
module pe.managed.metadata {
	// The ClassLayout table is used to define how the fields of a class or value type shall be laid out by the CLI.
	// (Normally, the CLI is free to reorder and/or insert gaps between the fields defined for a class or value type.)
	// A ClassLayout table can contain zero or more rows.
	// [ECMA-335 para22.8]
	// The rows of the ClassLayout table are defined
	// by placing .pack and .size directives on the body of the type declaration
	// in which this type is declared (ECMA-335 para10.2).
	// When either of these directives is omitted, its corresponding value is zero.  (See ECMA-335 para10.7.)
	export class ClassLayout {
		// If Parent indexes a SequentialLayout type, then:
		// * PackingSize shall be one of {0, 1, 2, 4, 8, 16, 32, 64, 128}.
		// (0 means use the default pack size for the platform on which the application is running.) [ERROR]
		// If Parent indexes an ExplicitLayout type, then
		// * PackingSize shall be 0.
		packingSize: number;

		// ClassSize of zero does not mean the class has zero size.
		// It means that no .size directive was specified at definition time,
		// in which case, the actual size is calculated from the field types,
		// taking account of packing size (default or specified) and natural alignment on the target, runtime platform.
		// If Parent indexes a ValueType, then ClassSize shall be less than 1 MByte (0x100000 bytes). [ERROR]
		classSize: number;

		// Parent shall index a valid row in the TypeDef table, corresponding to a Class or ValueType (but not to an Interface). [ERROR]
		// The Class or ValueType indexed by Parent shall be SequentialLayout or ExplicitLayout (ECMA-335 para23.1.15).
		// (That is, AutoLayout types shall not own any rows in the ClassLayout table.) [ERROR]
		// (It makes no sense to provide explicit offsets for each field, as well as a packing size.)  [ERROR]
		parent: number;

		internalReadRow(reader: TableStreamReader): void {
			this.packingSize = reader.readShort();
			this.classSize = reader.readInt();
			this.parent = reader.readTableRowIndex(TableKind.TypeDef);
		}
	}
}