/// <reference path="ClrDirectory.ts" />
/// <reference path="ClrMetadata.ts" />
/// <reference path="MetadataStreams.ts" />
/// <reference path="enums.ts" />
/// <reference path="AssemblyReader.ts" />
/// <reference path="../headers/PEFileHeaders.ts" />

/// <reference path="AssemblyOS.ts" />
/// <reference path="AssemblyProcessor.ts" />
/// <reference path="AssemblyRef.ts" />
/// <reference path="AssemblyRefOS.ts" />
/// <reference path="AssemblyRefProcessor.ts" />
/// <reference path="ClassLayout.ts" />
/// <reference path="Constant.ts" />
/// <reference path="CustomAttribute.ts" />
/// <reference path="DeclSecurity.ts" />
/// <reference path="Event.ts" />
/// <reference path="EventMap.ts" />
/// <reference path="ExportedType.ts" />
/// <reference path="FieldLayout.ts" />
/// <reference path="FieldMarshal.ts" />
/// <reference path="FieldRVA.ts" />
/// <reference path="File.ts" />
/// <reference path="GenericParam.ts" />
/// <reference path="GenericParamConstraint.ts" />
/// <reference path="ImplMap.ts" />
/// <reference path="InterfaceImpl.ts" />
/// <reference path="ManifestResource.ts" />
/// <reference path="MemberRef.ts" />
/// <reference path="MethodImpl.ts" />
/// <reference path="MethodSemantics.ts" />
/// <reference path="MethodSpec.ts" />
/// <reference path="ModuleRef.ts" />
/// <reference path="NestedClass.ts" />
/// <reference path="PropertyMap.ts" />
/// <reference path="StandAloneSig.ts" />
/// <reference path="TypeSpec.ts" />

module pe.managed {
	export class AssemblyDefinition {
		headers: headers.PEFileHeaders = null;

		// HashAlgId shall be one of the specified values. [ERROR]
		hashAlgId: AssemblyHashAlgorithm = AssemblyHashAlgorithm.None;

		// MajorVersion, MinorVersion, BuildNumber, and RevisionNumber can each have any value.
		version: string = "";

		// Flags shall have only those values set that are specified. [ERROR]
		flags: AssemblyFlags = 0;

		// publicKey can be null or non-null.
		// (note that the Flags.PublicKey bit specifies whether the 'blob' is a full public key, or the short hashed token).
		publicKey: string = "";

		// Name shall index a non-empty string in the String heap. [ERROR]
		// . The string indexed by Name can be of unlimited length.
		name: string = "";

		// Culture  can be null or non-null.
		// If Culture is non-null, it shall index a single string from the list specified (ECMA-335 para23.1.3). [ERROR]
		culture: string = "";

		modules: ModuleDefinition[] = [];

		read(reader: io.BufferReader) {
		    var asmReader = new AssemblyReader();
		    asmReader.read(reader, this);
		}

		toString() {
		    return this.name+", version="+this.version + (this.publicKey ? ", publicKey=" + this.publicKey : "");
		}

		internalReadRow(reader: TableStreamReader): void {
			this.hashAlgId = reader.readInt();
			this.version = reader.readShort() + "." + reader.readShort() + "." + reader.readShort() + "." + reader.readShort();
			this.flags = reader.readInt();
			this.publicKey = reader.readBlobHex();
			this.name = reader.readString();
			this.culture = reader.readString();
		}
	}

	export class ModuleDefinition {
		runtimeVersion: string = "";
		specificRuntimeVersion: string = "";

		imageFlags: ClrImageFlags = 0;

		metadataVersion: string = "";

		tableStreamVersion: string = "";


		// Ushort
		generation: number = 0;

		name: string = "";

		// The mvid column shall index a unique GUID in the GUID heap (ECMA-335 para24.2.5)
		// that identifies this instance of the module.
		// The mvid can be ignored on read by conforming implementations of the CLI.
		// The mvid should be newly generated for every module,
		// using the algorithm specified in ISO/IEC 11578:1996
		// (Annex A) or another compatible algorithm.

		// [Rationale: While the VES itself makes no use of the Mvid,
		// other tools (such as debuggers, which are outside the scope of this standard)
		// rely on the fact that the <see cref="Mvid"/> almost always differs from one module to another.
		// end rationale]
		mvid: string = "";

		encId: string = "";
		encBaseId: string = "";

		types: TypeDefinition[] = [];
		debugExternalTypeReferences: ExternalType[] = [];

		toString() {
			return this.name + " " + this.imageFlags;
		}

		internalReadRow(reader: TableStreamReader): void {
			this.generation = reader.readShort();
			this.name = reader.readString();
			this.mvid = reader.readGuid();
			this.encId = reader.readGuid();
			this.encBaseId = reader.readGuid();
		}
	}

	export class TypeReference {
		getName(): string { throw new Error("Not implemented."); }
		getNamespace(): string { throw new Error("Not implemented."); }

		toString() {
			var ns = this.getNamespace();
			var nm = this.getName();
			if (ns && ns.length)
				return ns + "." + nm;
			else
				return nm;
		}
	}

	// TODO: resolve to the actual type on creation
	export class MVar extends TypeReference {
		constructor(public index: number) {
			super();
		}

		getName(): string { return "M" + this.index; }
		getNamespace(): string { return null; }
	}

	// TODO: resolve to the actual type on creation
	export class Var extends TypeReference {
		constructor(public index: number) {
			super();
		}

		getName(): string { return "T" + this.index; }
		getNamespace(): string { return null; }
	}

	export class TypeDefinition extends TypeReference {
		// A 4-byte bitmask of type TypeAttributes, ECMA-335 para23.1.15.
		attributes: number = 0;

		name: string = "";
		namespace: string = "";

		fields: FieldDefinition[] = [];
		methods: MethodDefinition[] = [];

		baseType: any = null;

		internalFieldList: number;
		internalMethodList: number;

		constructor() {
			super();
		}

		getName() { return this.name; }
		getNamespace() { return this.namespace; }

		internalReadRow(reader: TableStreamReader): void {
			this.attributes = reader.readInt();
			this.name = reader.readString();
			this.namespace = reader.readString();
			this.baseType = reader.readTypeDefOrRef();

			this.internalFieldList = reader.readTableRowIndex(TableKind.FieldDefinition);
			this.internalMethodList = reader.readTableRowIndex(TableKind.MethodDefinition);
		}
	}

	export class FieldDefinition {
		attributes: number = 0;
		name: string = "";
		customModifiers: any[] = null;
		customAttributes: any[] = null;
		type: TypeReference = null;
		value: ConstantValue;

		toString() {
			return this.name + (this.value ? " = " + this.value : "");
		}

		internalReadRow(reader: TableStreamReader): void {
			this.attributes = reader.readShort();
			this.name = reader.readString();
			reader.readFieldSignature(this);
		}
	}

	export class FieldSignature {
		customModifiers: any[];
		type: TypeReference;
	}

	export class MethodDefinition {
		attributes: MethodAttributes = 0;
		implAttributes: MethodImplAttributes = 0;
		name: string = "";
		parameters: any[] = [];

		signature: MethodSignature = new MethodSignature();

		locals: any[] = [];

		// The MethodDefEntry.RVA column is computed when the image for the PE file is emitted
		// and points to the COR_ILMETHOD structure
		// for the body of the method (ECMA-335 para25.4)
		internalRva: number = 0;
		internalParamList: number = 0;

		toString() {
			var result = this.name;
			result += "(";
			if (this.parameters) {
				for (var i = 0; i < this.parameters.length; i++) {
					if (i>0)
						result += ", ";
					result += this.parameters[i];
					if (this.signature
						&& this.signature.parameters
						&& i < this.signature.parameters.length)
						result += ": " + this.signature.parameters[i].type;
				}
			}
			result += ")";
			return result;
		}

		internalReadRow(reader: TableStreamReader): void {
			this.internalRva = reader.readInt();
			this.implAttributes = reader.readShort();
			this.attributes = reader.readShort();
			this.name = reader.readString();
			reader.readMethodSignature(this.signature);

			this.internalParamList = reader.readTableRowIndex(TableKind.ParameterDefinition);
		}
	}

	export class CustomModifier {
		constructor(public required: bool, public type: TypeReference) {
		}

		toString() {
			return (this.required ? "<req> " : "") + this.type;
		}
	}

	export class ParameterDefinition {
		attributes: number = 0;
		name: string = "";
		index: number = 0;

		internalReadRow(reader: TableStreamReader): void {
			this.attributes = reader.readShort();
			this.index = reader.readShort();
			this.name = reader.readString();
		}

		toString() {
			return this.name;
		}
	}

	export class PropertyDefinition {
		attributes: number = 0;
		name: string = "";
		
		isStatic: bool = false;
		customAttributes: any[];
		customModifiers: any[];
		type: TypeReference;
		parameters: any[];

		internalReadRow(reader: TableStreamReader): void {
			this.attributes = reader.readShort();
			this.name = reader.readString();
			reader.readPropertySignature(this);
		}

		toString() {
			return this.name + (this.parameters ? "[" + this.parameters.length + "]" : "") + ":" + this.type;
		}
	}

	export class LocalVariable {
		type: TypeReference;
		customModifiers: any[];
		isPinned: bool;
	}

	export class ExternalType extends TypeReference {
		constructor(public assemblyRef: any, private name: string, private namespace: string) {
			super();
		}

		getName() { return this.name; }
		getNamespace() { return this.namespace; }

		internalReadRow(reader: TableStreamReader): void {
			this.assemblyRef = reader.readResolutionScope();

			this.name = reader.readString();
			this.namespace = reader.readString();
		}
	}

	export class PointerType extends TypeReference {
		constructor(public baseType: TypeReference) {
			super();
		}

		getName() { return this.baseType.getName() + "*"; }
		getNamespace() { return this.baseType.getNamespace(); }
	}

	export class ByRefType extends TypeReference {
		constructor(public baseType: TypeReference) {
			super();
		}

		getName() { return this.baseType.getName() + "&"; }
		getNamespace() { return this.baseType.getNamespace(); }
	}

	export class SZArrayType extends TypeReference {
		constructor(public elementType: TypeReference) {
			super();
		}

		getName() { return this.elementType.getName() + "[]"; }
		getNamespace() { return this.elementType.getNamespace(); }

		toString() {
			return this.getNamespace() + "." + this.getName();
		}
	}

	export class SentinelType extends TypeReference {
		constructor(public baseType: TypeReference) {
			super();
		}

		getName() { return this.baseType.getName() + "!sentinel"; }
		getNamespace() { return this.baseType.getNamespace(); }

		toString() {
			return this.getNamespace() + "." + this.getName();
		}
	}

	export class KnownType extends TypeReference {
		private static byElementType: KnownType[] = [];

		constructor(private name: string, private internalElementType: ElementType) {
			super();
			KnownType.byElementType[internalElementType] = this;
		}

		getName() { return this.name; }
		getNamespace() { return "System"; }

		static internalGetByElementName(elementType: ElementType): KnownType {
			var result = KnownType.byElementType[elementType];
			return result;
		}

		static Void = new KnownType("Void", ElementType.Void);
		static Boolean = new KnownType("Boolean", ElementType.Boolean);
		static Char = new KnownType("Char", ElementType.Char);
		static SByte = new KnownType("SByte", ElementType.I1);
		static Byte = new KnownType("Byte", ElementType.U1);
		static Int16 = new KnownType("Int16", ElementType.I2);
		static UInt16 = new KnownType("UInt16", ElementType.U2);
		static Int32 = new KnownType("Int32", ElementType.I4);
		static UInt32 = new KnownType("UInt32", ElementType.U4);
		static Int64 = new KnownType("Int64", ElementType.I8);
		static UInt64 = new KnownType("UInt64", ElementType.U8);
		static Single = new KnownType("Single", ElementType.R4);
		static Double = new KnownType("Double", ElementType.R8);
		static String = new KnownType("String", ElementType.String);
		static TypedReference = new KnownType("TypedReference", ElementType.TypedByRef);
		static IntPtr = new KnownType("IntPtr", ElementType.I);
		static UIntPtr = new KnownType("UIntPtr", ElementType.U);
		static Object = new KnownType("Object", ElementType.Object);

		toString() {
			return this.getNamespace() + "." + this.getName();
		}
	}

	export class GenericInstantiation extends TypeReference {
		genericType: TypeReference = null;
		arguments: TypeReference[] = null;

		getName(): string {
			return this.genericType.getName();
		}

		getNamespace(): string {
			return this.genericType.getNamespace();
		}

		toString() {
			return this.getNamespace() + "." + this.getName();
		}
	}

	export class FunctionPointerType extends TypeReference {
		methodSignature: MethodSignature = null;

		getName(): string {
			return this.methodSignature.toString();
		}

		getNamespace(): string {
			return "<function*>";
		}

		toString() {
			return this.getNamespace() + "." + this.getName();
		}
	}

	export class ArrayType extends TypeReference {
		constructor(public elementType: TypeReference, public dimensions: ArrayDimensionRange[]) {
			super();
		}

		getName(): string {
			return this.elementType.getName() + "[" + this.dimensions.join(", ") + "]";
		}

		getNamespace(): string {
			return this.elementType.getNamespace();
		}

		toString() {
			return this.getNamespace() + "." + this.getName();
		}
	}

	export class ArrayDimensionRange {
		lowBound: number = 0;
		length: number = 0;

		toString() {
			return this.lowBound + ".managed." + (this.lowBound + this.length - 1) + "]";
		}
	}

	export class MethodSignature {
		callingConvention: CallingConventions = 0;
		parameters: ParameterSignature[] = [];
		extraParameters: ParameterSignature[] = null;
		returnType: TypeReference = null;

		toString() {
			var result = "(" + this.parameters.join(", ");
			if (this.extraParameters && this.extraParameters.length) {
				if (result.length > 1)
					result += ", " + this.extraParameters.join(", ");
			}
			result += ")";
			result += " => " + this.returnType;
			return result;
		}
	}

	export class ParameterSignature {
		constructor(public customModifiers: any[], public type: TypeReference) {
		}

		toString() {
			return "_: " + this.type;
		}
	}

	export class ConstantValue {
		constructor(public type: TypeReference, public value: any) {
		}

		valueOf() { return this.value; }
	}

	export class CustomAttributeData {
		fixedArguments: any[];
		namedArguments: any[];
		constructor() {
		}
	}

	export class TableStreamReader {
		private stringHeapCache: string[] = [];

		constructor(
			private baseReader: io.BufferReader,
			private streams: MetadataStreams,
			private tables: any[][]) {

			this.readResolutionScope = this.createCodedIndexReader(
				TableKind.ModuleDefinition,
				TableKind.ModuleRef,
				TableKind.AssemblyRef,
				TableKind.ExternalType);

			this.readTypeDefOrRef = this.createCodedIndexReader(
				TableKind.TypeDefinition,
				TableKind.ExternalType,
				TableKind.TypeSpec);

			this.readHasConstant = this.createCodedIndexReader(
				TableKind.FieldDefinition,
				TableKind.ParameterDefinition,
				TableKind.PropertyDefinition);

			this.readHasCustomAttribute = this.createCodedIndexReader(
				TableKind.MethodDefinition,
				TableKind.FieldDefinition,
				TableKind.ExternalType,
				TableKind.TypeDefinition,
				TableKind.ParameterDefinition,
				TableKind.InterfaceImpl,
				TableKind.MemberRef,
				TableKind.ModuleDefinition,
				<TableKind>0xFFFF, // TableKind.Permission,
				TableKind.PropertyDefinition,
				TableKind.Event,
				TableKind.StandAloneSig,
				TableKind.ModuleRef,
				TableKind.TypeSpec,
				TableKind.AssemblyDefinition,
				TableKind.AssemblyRef,
				TableKind.File,
				TableKind.ExportedType,
				TableKind.ManifestResource,
				TableKind.GenericParam,
				TableKind.GenericParamConstraint,
				TableKind.MethodSpec);

			this.readCustomAttributeType = this.createCodedIndexReader(
				<TableKind>0xFFFF, //TableKind.Not_used_0,
				<TableKind>0xFFFF, //TableKind.Not_used_1,
				TableKind.MethodDefinition,
				TableKind.MemberRef,
				<TableKind>0xFFFF //TableKind.Not_used_4
			);

			this.readHasDeclSecurity = this.createCodedIndexReader(
				TableKind.TypeDefinition,
				TableKind.MethodDefinition,
				TableKind.AssemblyDefinition);

			this.readImplementation = this.createCodedIndexReader(
				TableKind.File,
				TableKind.AssemblyRef,
				TableKind.ExportedType);

			this.readHasFieldMarshal = this.createCodedIndexReader(
				TableKind.FieldDefinition,
				TableKind.ParameterDefinition);

			this.readTypeOrMethodDef = this.createCodedIndexReader(
				TableKind.TypeDefinition,
				TableKind.MethodDefinition);

			this.readMemberForwarded = this.createCodedIndexReader(
				TableKind.FieldDefinition,
				TableKind.MethodDefinition);

			this.readMemberRefParent = this.createCodedIndexReader(
				TableKind.TypeDefinition,
				TableKind.ExternalType,
				TableKind.ModuleRef,
				TableKind.MethodDefinition,
				TableKind.TypeSpec);

			this.readMethodDefOrRef = this.createCodedIndexReader(
				TableKind.MethodDefinition,
				TableKind.MemberRef);

			this.readHasSemantics = this.createCodedIndexReader(
				TableKind.Event,
				TableKind.PropertyDefinition);
		}

		readResolutionScope: () => any;
		readTypeDefOrRef: () => any;
		readHasConstant: () => any;
		readHasCustomAttribute: () => any;
		readCustomAttributeType: () => any;
		readHasDeclSecurity: () => any;
		readImplementation: () => any;
		readHasFieldMarshal: () => any;
		readTypeOrMethodDef: () => any;
		readMemberForwarded: () => any;
		readMemberRefParent: () => any;
		readMethodDefOrRef: () => any;
		readHasSemantics: () => any;

		readByte(): number { return this.baseReader.readByte(); }
		readInt(): number { return this.baseReader.readInt(); }
		readShort(): number { return this.baseReader.readShort(); }

		readString(): string {
			var pos = this.readPos(this.streams.strings.size);

			var result: string;
			if (pos == 0) {
				result = null;
			}
			else {
				result = this.stringHeapCache[pos];

				if (!result) {
					if (pos > this.streams.strings.size)
						throw new Error("String heap position overflow.");

					var saveOffset = this.baseReader.offset;
					this.baseReader.setVirtualOffset(this.streams.strings.address + pos);
					result = this.baseReader.readUtf8Z(1024 * 1024 * 1024); // strings longer than 1GB? Not supported for a security excuse.
					this.baseReader.offset = saveOffset;

					this.stringHeapCache[pos] = result;
				}
			}

			return result;
		}

		readGuid(): string {
			var index = this.readPos(this.streams.guids.length);

			if (index == 0)
				return null;
			else
				return this.streams.guids[(index - 1) / 16];
		}

		readBlobHex(): string {
			var blobIndex = this.readBlobIndex();
			var saveOffset = this.baseReader.offset;

			this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
			var length = this.readBlobSize();

			var result = "";
			for (var i = 0; i < length; i++) {
				var hex = this.baseReader.readByte().toString(16);
				if (hex.length==1)
					result += "0";
				result += hex;
			}

			this.baseReader.offset = saveOffset;

			return result;
		}

		readBlob(): Uint8Array {
			var blobIndex = this.readBlobIndex();
			var saveOffset = this.baseReader.offset;

			this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
			var length = this.readBlobSize();

			var result = this.baseReader.readBytes(length);

			this.baseReader.offset = saveOffset;

			return result;
		}

		private readBlobIndex(): number {
			return this.readPos(this.streams.blobs.size);
		}

		private readBlobSize(): number {
			var length;
			var b0 = this.baseReader.readByte();
			if (b0 < 0x80) {
				length = b0;
			}
			else {
				var b1 = this.baseReader.readByte();

				if ((b0 & 0xC0) == 0x80) {
					length = ((b0 & 0x3F) << 8) + b1;
				}
				else {
					var b2 = this.baseReader.readByte();
					var b3 = this.baseReader.readByte();
					length = ((b0 & 0x3F) << 24) + (b1 << 16) + (b2 << 8) + b3;
				}
			}

			return length;
		}

		readTableRowIndex(tableIndex: number): number {
			var tableRows = this.tables[tableIndex];

			return this.readPos(tableRows ? tableRows.length : 0);
		}

		private createCodedIndexReader(...tableTypes: TableKind[]): () => any {
			var tableDebug = [];
			var maxTableLength = 0;
			for (var i = 0; i < tableTypes.length; i++) {

				var table = this.tables[tableTypes[i]];
				if (!table) {
					tableDebug.push(null);
					continue;
				}

				tableDebug.push(table.length);
				maxTableLength = Math.max(maxTableLength, table.length);
			}

			function calcRequredBitCount(maxValue) {
				var bitMask = maxValue;
				var result = 0;

				while (bitMask != 0) {
					result++;
					bitMask >>= 1;
				}

				return result;
			}

			var tableKindBitCount = calcRequredBitCount(tableTypes.length - 1);
			var tableIndexBitCount = calcRequredBitCount(maxTableLength);
			//var debug = { maxTableLength: maxTableLength, calcRequredBitCount: calcRequredBitCount, tableLengths: tableDebug };

			return () => {
				var result = tableKindBitCount + tableIndexBitCount <= 16 ?
					this.baseReader.readShort() : // it fits within short
					this.baseReader.readInt(); // it does not fit within short

				//debug.toString();

				var resultIndex = result >> tableKindBitCount;
				var resultTableIndex = result - (resultIndex << tableKindBitCount);

				var table = tableTypes[resultTableIndex];

				if (resultIndex == 0)
					return null;

				resultIndex--;

				var row = this.tables[table][resultIndex];

				return row;
			};
		}

		private readPos(spaceSize: number): number {
			if (spaceSize < 65535)
				return this.baseReader.readShort();
			else
				return this.baseReader.readInt();
		}

		readMethodSignature(definition: MethodSignature): void {
			var blobIndex = this.readBlobIndex();
			var saveOffset = this.baseReader.offset;

			this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
			var length = this.readBlobSize();

			this.readSigMethodDefOrRefOrStandalone(definition);

			this.baseReader.offset = saveOffset;
		}

		readMethodSpec(instantiation: TypeReference[]): void {
			var blobIndex = this.readBlobIndex();
			var saveOffset = this.baseReader.offset;

			this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
			var length = this.readBlobSize();

			var leadByte = this.baseReader.readByte();
			if (leadByte !== 0x0A)
				throw new Error("Incorrect lead byte " + leadByte + " in MethodSpec signature.");

			var genArgCount = this.readCompressedInt();
			instantiation.length = genArgCount;

			for (var i = 0; i < genArgCount; i++) {
				var type = this.readSigTypeReference();
				instantiation.push(type);
			}

			this.baseReader.offset = saveOffset;
		}

		// ECMA-335 para23.2.1, 23.2.2, 23.2.3
		private readSigMethodDefOrRefOrStandalone(sig: MethodSignature): void {
			var b = this.baseReader.readByte();

			sig.callingConvention = b;

			var genParameterCount = b & CallingConventions.Generic ?
				this.readCompressedInt() :
				0;

			var paramCount = this.readCompressedInt();

			var returnTypeCustomModifiers = this.readSigCustomModifierList();
			var returnType = this.readSigTypeReference();

			sig.parameters = [];

			sig.extraParameters =
				(sig.callingConvention & CallingConventions.VarArg)
				|| (sig.callingConvention & CallingConventions.C) ?
					[] :
					null;

			for (var i = 0; i < paramCount; i++) {
				var p = this.readSigParam();

				if (sig.extraParameters && sig.extraParameters.length > 0) {
					sig.extraParameters.push(p);
				}
				else {
					if (sig.extraParameters && this.baseReader.peekByte()===CallingConventions.Sentinel) {
						this.baseReader.offset++;
						sig.extraParameters.push(p);
					}
					else {
						sig.parameters.push(p);
					}
				}
			}
		}

		// ECMA-335 para23.2.4
		readFieldSignature(definition: FieldDefinition): void {
			var blobIndex = this.readBlobIndex();
			var saveOffset = this.baseReader.offset;

			this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
			var length = this.readBlobSize();

			var leadByte = this.baseReader.readByte();
			if (leadByte !== 0x06)
				throw new Error("Field signature lead byte 0x" + leadByte.toString(16).toUpperCase() + " is invalid.");

			definition.customModifiers = this.readSigCustomModifierList();

			definition.type = this.readSigTypeReference();

			this.baseReader.offset = saveOffset;
		}

		// ECMA-335 para23.2.5
		readPropertySignature(definition: PropertyDefinition): void {
			var blobIndex = this.readBlobIndex();
			var saveOffset = this.baseReader.offset;

			this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
			var length = this.readBlobSize();

			var leadByte = this.baseReader.readByte();
			if (!(leadByte & 0x08))
				throw new Error("Property signature lead byte 0x" + leadByte.toString(16).toUpperCase() + " is invalid.");

			definition.isStatic = !(leadByte & CallingConventions.HasThis);

			var paramCount = this.readCompressedInt();

			definition.customModifiers = this.readSigCustomModifierList();

			definition.type = this.readSigTypeReference();

			if (!definition.parameters)
				definition.parameters = [];
			definition.parameters.length = paramCount;

			for (var i = 0; i < paramCount; i++) {
				definition.parameters[i] = this.readSigParam();
			}

			this.baseReader.offset = saveOffset;
		}

		// ECMA-335 para23.2.6, 23.2.9
		readSigLocalVar(): any[] {
			var leadByte = this.baseReader.readByte();
			if (leadByte !== 0x07)
				throw new Error("LocalVarSig signature lead byte 0x" + leadByte.toString(16).toUpperCase() + " is invalid.");

			var count = this.readCompressedInt();
			var result: any[] = Array(count);

			for (var i = 0; i < count; i++) {
				var v = new LocalVariable();

				var varLeadByte = this.baseReader.peekByte();
				if (varLeadByte === ElementType.TypedByRef) {
					this.baseReader.offset++;
					v.type = KnownType.TypedReference;
				}
				else {
					while (true) {
						var cmod = this.readSigCustomModifierOrNull();
						if (cmod) {
							if (!v.customModifiers)
								v.customModifiers = [];
							v.customModifiers.push(cmod);
							continue;
						}

						// ECMA-335 para23.2.9
						if (this.baseReader.peekByte() === ElementType.Pinned) {
							this.baseReader.offset++;
							v.isPinned = true;
							continue;
						}
					}

					v.type = this.readSigTypeReference();
				}

				result.push(v);
			}

			return result;
		}

		// ECMA-335 para23.2.7
		private readSigCustomModifierOrNull(): any {
			var s = this.baseReader.peekByte();

			switch (s) {
				case ElementType.CMod_Opt:
					this.baseReader.offset++;
					return new CustomModifier(false, this.readSigTypeDefOrRefOrSpecEncoded());

				case ElementType.CMod_ReqD:
					this.baseReader.offset++;
					return new CustomModifier(true, this.readSigTypeDefOrRefOrSpecEncoded());

				default:
					return null;
			}
		}

		// ECMA-335 para23.2.8
		private readSigTypeDefOrRefOrSpecEncoded(): TypeReference {
			var uncompressed = this.readCompressedInt();
			var index = Math.floor(uncompressed / 4);
			var tableKind = uncompressed - index * 4;

			var table;
			switch (tableKind) {
				case 0:
					table = this.tables[TableKind.TypeDefinition];
					break;

				case 1:
					table = this.tables[TableKind.ExternalType];
					break;

				case 2:
					table = this.tables[TableKind.TypeSpec];
					break;

				default:
					throw new Error("Unknown table kind " + tableKind + " in encoded index.");
			}

			var typeReference = table[index];

			return typeReference.definition ? typeReference.definition : typeReference;
		}

		private readSigCustomModifierList(): any[] {
			var result: any[] = null;
			while (true) {
				var mod = this.readSigCustomModifierOrNull();

				if (!mod)
					return result;

				if (!result)
					result = [];

				result.push(mod);
			}
		}

		// ECMA-335 para23.2.10
		private readSigParam(): ParameterSignature {
			var customModifiers = this.readSigCustomModifierList();
			var type = this.readSigTypeReference();
			return new ParameterSignature(customModifiers, type);
		}

		// ECMA-335 para23.2.11, para23.2.12
		private readSigTypeReference(): TypeReference {
			var etype = this.baseReader.readByte();

			var directResult = KnownType.internalGetByElementName(etype);
			if (directResult)
				return directResult;

			switch (etype) {
				case ElementType.Ptr:
					return new PointerType(this.readSigTypeReference());

				case ElementType.ByRef:
					return new ByRefType(this.readSigTypeReference());

				case ElementType.ValueType:
					var value_type = this.readSigTypeDefOrRefOrSpecEncoded();
					//value_type.isValueType = true;
					return value_type;

				case ElementType.Class:
					var value_type = this.readSigTypeDefOrRefOrSpecEncoded();
					//value_type.isValueType = false;
					return value_type;

				case ElementType.Var:
					var varIndex = this.readCompressedInt();
					return new Var(varIndex);

				case ElementType.Array:
					var arrayElementType = this.readSigTypeReference();
					return this.readSigArrayShape(arrayElementType);

				case ElementType.GenericInst: {
					var genInst = new GenericInstantiation();

					var genLead = this.baseReader.readByte();
					var isValueType;
					switch (genLead) {
						case ElementType.Class: (<any>genInst).isValueType = false; break;
						case ElementType.ValueType: (<any>genInst).isValueType = true; break;
						default: throw new Error("Unexpected lead byte 0x" + genLead.toString(16).toUpperCase() + " in GenericInst type signature.");
					}

					genInst.genericType = this.readSigTypeDefOrRefOrSpecEncoded();
					var genArgCount = this.readCompressedInt();
					genInst.arguments = Array(genArgCount);
					for (var iGen = 0; iGen < genArgCount; iGen++) {
						genInst.arguments.push(this.readSigTypeReference());
					}

					return genInst;
				}

				case ElementType.FnPtr:
					var fnPointer = new FunctionPointerType();
					fnPointer.methodSignature = new MethodSignature();
					this.readSigMethodDefOrRefOrStandalone(fnPointer.methodSignature);
					return fnPointer;

				case ElementType.SZArray:
					return new SZArrayType(this.readSigTypeReference());

				case ElementType.MVar:
					var mvarIndex = this.readCompressedInt();
					return new MVar(mvarIndex);

				case ElementType.Sentinel:
					return new SentinelType(this.readSigTypeReference());

				case ElementType.Pinned:
				case ElementType.End:
				case ElementType.Internal:
				case ElementType.Modifier:
				case ElementType.R4_Hfa:
				case ElementType.R8_Hfa:
				case ElementType.ArgumentType_:
				case ElementType.CustomAttribute_BoxedObject_:
				case ElementType.CustomAttribute_Field_:
				case ElementType.CustomAttribute_Property_:
				case ElementType.CustomAttribute_Enum_:
				default:
					throw new Error("Unknown element type " + io.formatEnum(etype, ElementType)+".");
			}
		}

		// ECMA-335 para23.2.13
		private readSigArrayShape(arrayElementType: TypeReference): TypeReference {
			var rank = this.readCompressedInt();
			var dimensions: ArrayDimensionRange[] = Array(rank);
			for (var i = 0; i < rank; i++) {
				dimensions[i] = new ArrayDimensionRange();
			}

			var numSizes = this.readCompressedInt();
			for (var i = 0; i < numSizes; i++) {
				dimensions[i].length = this.readCompressedInt();
			}

			var numLoBounds = this.readCompressedInt();
			for (var i = 0; i < numLoBounds; i++) {
				dimensions[i].lowBound = this.readCompressedInt();
			}

			return new ArrayType(
				arrayElementType,
				dimensions);
		}

		readMemberSignature(): any {
			var blobIndex = this.readBlobIndex();
			var saveOffset = this.baseReader.offset;

			this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
			var length = this.readBlobSize();

			var result;

			var leadByte = this.baseReader.peekByte();
			if (leadByte & 0x05) {
				this.baseReader.offset++;
				result = new FieldSignature();
				result.customModifiers = this.readSigCustomModifierOrNull();
				result.type = this.readSigTypeReference();
			}
			else {
				result = new MethodSignature();
				this.readSigMethodDefOrRefOrStandalone(result);
			}

			this.baseReader.offset = saveOffset;

			return result;
		}

		// ECMA-335 paraII.23.2
		private readCompressedInt(): number {
			var result;
			var b0 = this.baseReader.readByte();
			if (b0 < 0x80) {
				result = b0;
			}
			else {
				var b1 = this.baseReader.readByte();

				if ((b0 & 0xC0) == 0x80) {
					result = ((b0 & 0x3F) << 8) + b1;
				}
				else {
					var b2 = this.baseReader.readByte();
					var b3 = this.baseReader.readByte();
					result = ((b0 & 0x3F) << 24) + (b1 << 16) + (b2 << 8) + b3;
				}
			}

			return result;
		}

		// ECMA-335 paraII.22.9
		readConstantValue(etype: ElementType): any {
			var blobIndex = this.readBlobIndex();
			var saveOffset = this.baseReader.offset;

			this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
			var length = this.readBlobSize();

			var result = this.readSigValue(etype, length);

			this.baseReader.offset = saveOffset;

			return result;
		}

		// ECMA-335 paraII.22.9 (in part of reading the actual value)
		private readSigValue(etype: ElementType, length: number): any {

			switch (etype) {
				case ElementType.Boolean:
					return this.baseReader.readByte() !== 0;
				case ElementType.Char:
					return String.fromCharCode(this.baseReader.readShort());
				case ElementType.I1:
					var result = this.baseReader.readByte();
					if (result > 0x7f)
						result -= 0xff;
					return result;
				case ElementType.U1:
					return this.baseReader.readByte();
				case ElementType.I2:
					var result = this.baseReader.readShort();
					if (result > 0x7fff)
						result -= 0xffff;
					return result;
				case ElementType.U2:
					return this.baseReader.readShort();
				case ElementType.I4:
					var result = this.baseReader.readInt();
					if (result > 0x7fffffff)
						result -= 0xffffffff;
					return result;
				case ElementType.U4:
					return this.baseReader.readInt();
				case ElementType.I8:
				case ElementType.U8:
					return this.baseReader.readLong();
				case ElementType.R4:
					return this.baseReader.readInt();
				case ElementType.R8:
					return this.baseReader.readLong();
				case ElementType.String:
					var stringValue = "";
					for (var iChar = 0; iChar < length / 2; iChar++) {
						stringValue += String.fromCharCode(this.baseReader.readShort());
					}
					return stringValue;
				case ElementType.Class:
					var classRef = this.baseReader.readInt();
					if (classRef === 0)
						return null;
					else
						return classRef;
				default:
					return "Unknown element type " + etype + ".";
			}
		}

		// ECMA-335 paraII.2.3
		readCustomAttribute(ctorSignature: MethodSignature): CustomAttributeData {
			var blobIndex = this.readBlobIndex();
			var saveOffset = this.baseReader.offset;

			this.baseReader.setVirtualOffset(this.streams.blobs.address + blobIndex);
			var length = this.readBlobSize();

			var customAttribute = new CustomAttributeData();

			var prolog = this.baseReader.readShort();
			if (prolog !== 0x0001)
				throw new Error("Incorrect prolog value 0x" + prolog.toString(16).toUpperCase() + " for CustomAttribute.");

			customAttribute.fixedArguments = [];
			for (var i = 0; i < ctorSignature.parameters.length; i++) {
				var pType: any = ctorSignature.parameters[i].type;
				customAttribute.fixedArguments.push(this.readSigFixedArg(pType));
			}

			var numNamed = this.baseReader.readShort(); // not compressed short here
			for (var i = 0; i < numNamed; i++) {
				var namedLeadByte = this.baseReader.readByte();
				var isField;
				switch (namedLeadByte) {
					case 0x53: isField = true;
					case 0x54: isField = false;
					default:
						throw new Error("Incorrect leading byte " + namedLeadByte + " for named CustomAttribute argument.");
				}

				var fieldOrPropType = this.readSigFieldOrPropType();
				var fieldOrPropName = this.readSigSerString();
				var value = this.readSigFixedArg(fieldOrPropType);
				customAttribute.namedArguments.push({ name: fieldOrPropName, type: fieldOrPropType, value: value });
			}

			this.baseReader.offset = saveOffset;

			return customAttribute;
		}

		private readSigFixedArg(type: TypeReference) {
			var isArray = (<any>type).elementType && !(<any>type).dimensions;

			if (isArray) {
				var szElements = [];
				var numElem = this.baseReader.readInt(); // not compressed int here
				for (var i = 0; i < numElem; i++) {
					szElements.push(this.readSigElem((<any>type).elementType));
				}
				return szElements;
			}
			else {
				return this.readSigElem(type);
			}
		}

		private readSigFieldOrPropType(): any {
			var etype = this.baseReader.readByte();

			var result = KnownType.internalGetByElementName(etype);
			if (result)
				return result;

			switch (etype) {
				case ElementType.SZArray:
					var elementType = this.readSigFieldOrPropType();
					return new SZArrayType(elementType);

				case ElementType.CustomAttribute_Enum_:
					var enumName = this.readSigSerString();
					return new ExternalType(null, null, enumName);
			}
		}

		private readSigSerString(): string {
			if (this.baseReader.peekByte()===0xff)
				return null;

			var packedLen = this.readCompressedInt();
			var result = this.baseReader.readUtf8Z(packedLen);
			return result;
		}

		private readSigElem(type: TypeReference): any {
			//switch (type) {
			//	case KnownType.Boolean:
			//		return new ConstantValue(this.baseReader.readByte() !== 0;

			//	case KnownType.Char:
			//		return String.fromCharCode(this.baseReader.readShort());

			//	case KnownType.Single:
			//		return { raw: this.baseReader.readInt() };

			//	case KnownType.Double:
			//		return { raw: this.baseReader.readLong() };

			//	case KnownType.Byte:
			//		return this.baseReader.readByte();

			//	case KnownType.Int16:
			//}
		}
	}

	export class TableStream {
		reserved0: number = 0;
		version: string = "";

		// byte
		heapSizes: number = 0;

		reserved1: number = 0;

		tables: any[][] = null;

		externalTypes: ExternalType[] = [];

		module: ModuleDefinition = null;
		assembly: AssemblyDefinition = null;

		read(tableReader: io.BufferReader, streams: MetadataStreams) {
			this.reserved0 = tableReader.readInt();

			// Note those are bytes, not shorts!
			this.version = tableReader.readByte() + "." + tableReader.readByte();

			this.heapSizes = tableReader.readByte();
			this.reserved1 = tableReader.readByte();

			var valid = tableReader.readLong();
			var sorted = tableReader.readLong();

			var tableCounts = this.readTableCounts(tableReader, valid);

			this.initTables(tableReader, tableCounts);
			this.readTables(tableReader, streams);
		}

		private readTableCounts(reader: io.BufferReader, valid: Long): number[] {
			var result = [];

			var bits = valid.lo;
			for (var tableIndex = 0; tableIndex < 32; tableIndex++) {
				if (bits & 1) {
					var rowCount = reader.readInt();
					result[tableIndex] = rowCount;
				}
				bits = bits >> 1;
			}

			bits = valid.hi;
			for (var i = 0; i < 32; i++) {
				var tableIndex = i + 32;
				if (bits & 1) {
					var rowCount = reader.readInt();
					result[tableIndex] = rowCount;
				}
				bits = bits >> 1;
			}

			return result;
		}

		private initTables(reader: io.BufferReader, tableCounts: number[]) {
			this.tables = [];
			var tableTypes = [];

			for (var tk in TableKind) {
				if (!TableKind.hasOwnProperty(tk))
					continue;

				var tkValue = TableKind[tk];
				if (typeof(tkValue)!=="number")
					continue;

				tableTypes[tkValue] = managed[tk];
			}

			for (var tableIndex = 0; tableIndex < tableCounts.length; tableIndex++) {
				var rowCount = tableCounts[tableIndex];
				if (!rowCount)
					continue;

				this.initTable(tableIndex, rowCount, tableTypes[tableIndex]);
			}
		}

		private initTable(tableIndex: number, rowCount: number, TableType) {
			var tableRows = this.tables[tableIndex] = Array(rowCount);

			// first module is the current module
			if (tableIndex === TableKind.ModuleDefinition && tableRows.length > 0) {
				tableRows[0] = this.module;
			}

			if (tableIndex === TableKind.AssemblyDefinition && tableRows.length > 0) {
				tableRows[0] = this.assembly;
			}

			for (var i = 0; i < rowCount; i++) {
				if (!tableRows[i])
					tableRows[i] = new TableType();

				if (i===0 && tableRows[i].isSingleton)
					break;
			}
		}

		private readTables(reader: io.BufferReader, streams: MetadataStreams) {
			var tableStreamReader = new TableStreamReader(
				reader,
				streams,
				this.tables);

			for (var tableIndex = 0; tableIndex < 64; tableIndex++) {
				var tableRows = this.tables[tableIndex];

				if (!tableRows)
					continue;

				var singletonRow = null;

				for (var i = 0; i < tableRows.length; i++) {
					if (singletonRow) {
						singletonRow.internalReadRow(tableStreamReader);
						continue;
					}

					tableRows[i].internalReadRow(tableStreamReader);

					if (i === 0) {
						if (tableRows[i].isSingleton)
							singletonRow = tableRows[i];
					}
				}
			}
		}
	}
}