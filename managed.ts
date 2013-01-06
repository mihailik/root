/// <reference path="Long.ts" />
/// <reference path="io.ts" />
/// <reference path="headers.ts" />

module pe.managed2 {

	export class AppDomain {
		assemblies: Assembly[] = [];
		mscorlib: Assembly = new Assembly();

		constructor() {
			this.mscorlib.name = "msorlib";

			var objectType = new Type(null, this.mscorlib, "System", "Object") 
			var valueType = new Type(objectType, this.mscorlib, "System", "ValueType");
			var enumType = new Type(valueType, this.mscorlib, "System", "Enum");

			this.mscorlib.types.push(
				new Type(valueType, this.mscorlib, "System", "Void"),
				new Type(valueType, this.mscorlib, "System", "Boolean"),
				new Type(valueType, this.mscorlib, "System", "Char"),
				new Type(valueType, this.mscorlib, "System", "SByte"),
				new Type(valueType, this.mscorlib, "System", "Byte"),
				new Type(valueType, this.mscorlib, "System", "Int16"),
				new Type(valueType, this.mscorlib, "System", "UInt16"),
				new Type(valueType, this.mscorlib, "System", "Int32"),
				new Type(valueType, this.mscorlib, "System", "UInt32"),
				new Type(valueType, this.mscorlib, "System", "Int64"),
				new Type(valueType, this.mscorlib, "System", "UInt64"),
				new Type(valueType, this.mscorlib, "System", "Single"),
				new Type(valueType, this.mscorlib, "System", "Double"),
				new Type(valueType, this.mscorlib, "System", "String"),
				new Type(objectType, this.mscorlib, "System", "TypedReference"),
				new Type(valueType, this.mscorlib, "System", "IntPtr"),
				new Type(valueType, this.mscorlib, "System", "UIntPtr"),
				objectType,
				valueType,
				enumType,
				new Type(objectType, this.mscorlib, "System", "Type"));
		}

		read(reader: io.BufferReader): Assembly {
			var context = new AssemblyReading(this);
			var result = context.read(reader);
			return result;
		}
	}

	export class Assembly {
		fileHeaders = new headers.PEFileHeaders();

		name: string = "";
		version: string = null;
		publicKey: string = null;
		
		isGhost: bool = true;

		runtimeVersion: string = "";
		specificRuntimeVersion: string = "";
		imageFlags: metadata.ClrImageFlags = 0;
		metadataVersion: string = "";
		tableStreamVersion: string = "";
		generation: number = 0;
		moduleName: string = "";
		mvid: string = "";
		encId: string = "";
		encBaseId: string = "";

		types: Type[] = [];
		customAttributes: any[] = [];

		toString() {
			return this.name + ", Version=" + this.version + ", Culture=neutral, PublicKeyToken=" + (this.publicKey && this.publicKey.length ? this.publicKey : "null");
		}
	}

	export class Type implements TypeReference {
		isGhost = true;
		fields: FieldInfo[] = [];
		methods: MethodInfo[] = [];
		properties: PropertyInfo[] = [];
		events: EventInfo[] = [];
		customAttributes: any = [];

		constructor(public baseType: TypeReference, public assembly: Assembly, public name: string, public namespace: string) {
		}
		
		getBaseType() { return this.baseType; }
		getAssembly() { return this.assembly; }
		getFullName() {
			if (this.namespace && this.namespace.length)
				return this.namespace + "." + this.name;
			else
				return this.name;
		}

		toString() {
			return this.getFullName();
		}
	}

	export interface TypeReference {
		getBaseType(): TypeReference;
		getAssembly(): Assembly;
		getFullName(): string;
	}

	export class ConstructedGenericType implements TypeReference {
		constructor(public genericType: TypeReference, public genericArguments: TypeReference[]) {
		}

		getBaseType() { return this.genericType.getBaseType(); }
		getAssembly() { return this.genericType.getAssembly(); }
		getFullName() { return this.genericType.getFullName() + "[" + this.genericArguments.join(",") + "]"; }

		toString() {
			return this.getFullName();
		}
	}

	export class FieldInfo {
		constructor(public attributes: metadata.FieldAttributes, public name: string, public fieldType: TypeReference) {
		}
	}

	export class PropertyInfo {
		constructor(public name: string, public propertyType: TypeReference) {
		}
	}

	export class MethodInfo {
		constructor(public name: string) {
		}
	}

	export class EventInfo {
		constructor(public name: string) {
		}
	}

	class AssemblyReading {
		reader: io.BufferReader = null;
		fileHeaders: headers.PEFileHeaders = null;
		clrDirectory: ClrDirectory = null;
		clrMetadata: ClrMetadata = null;
		metadataStreams: MetadataStreams = null;
		tableStream: TableStream = null;

		constructor(public appDomain: AppDomain) {
		}

		read(reader: io.BufferReader): Assembly {
			this.reader = reader;
			this.readFileHeaders();
			this.readClrDirectory();
			this.readClrMetadata();
			this.readMetadataStreams();
			this.readTableStream();

			return null;
		}

		readFileHeaders() {
			this.fileHeaders = new headers.PEFileHeaders();
			this.fileHeaders.read(this.reader);

			this.reader.sections = this.fileHeaders.sectionHeaders;
		}

		readClrDirectory() {
			var clrDataDirectory = this.fileHeaders.optionalHeader.dataDirectories[headers.DataDirectoryKind.Clr];

			this.reader.setVirtualOffset(clrDataDirectory.address);
			this.clrDirectory = new ClrDirectory();
			this.clrDirectory.read(this.reader);
		}

		readClrMetadata() {
			this.reader.setVirtualOffset(this.clrDirectory.metadataDir.address);

			this.clrMetadata = new ClrMetadata();
			this.clrMetadata.read(this.reader);
		}

		readMetadataStreams() {
			this.metadataStreams = new MetadataStreams();
			this.metadataStreams.read(
				this.clrDirectory.metadataDir.address,
				this.clrMetadata.streamCount,
				this.reader);
		}

		readTableStream() {
			this.tableStream = new TableStream();
			this.tableStream.read(this.reader);
		}
	}

	class ClrDirectory {

		private static clrHeaderSize = 72;

		cb: number = 0;
		runtimeVersion: string = "";
		imageFlags: metadata.ClrImageFlags = 0;
		metadataDir: io.AddressRange = null;
		entryPointToken: number = 0;
		resourcesDir: io.AddressRange = null;
		strongNameSignatureDir: io.AddressRange = null;
		codeManagerTableDir: io.AddressRange = null;
		vtableFixupsDir: io.AddressRange = null;
		exportAddressTableJumpsDir: io.AddressRange = null;
		managedNativeHeaderDir: io.AddressRange = null;

		read(readerAtClrDataDirectory: io.BufferReader) {
			// shift to CLR directory
			var clrDirReader = readerAtClrDataDirectory;

			// CLR header
			this.cb = clrDirReader.readInt();

			if (this.cb < ClrDirectory.clrHeaderSize)
				throw new Error(
					"Unexpectedly short CLR header structure " + this.cb + " reported by Cb field " +
					"(expected at least " + ClrDirectory.clrHeaderSize + ").");

			this.runtimeVersion = clrDirReader.readShort() + "." + clrDirReader.readShort();

			this.metadataDir = new io.AddressRange(
				clrDirReader.readInt(),
				clrDirReader.readInt());

			this.imageFlags = clrDirReader.readInt();

			// need to convert to meaningful value before sticking into ModuleDefinition
			this.entryPointToken = clrDirReader.readInt();

			this.resourcesDir = new io.AddressRange(
				clrDirReader.readInt(),
				clrDirReader.readInt());

			this.strongNameSignatureDir = new io.AddressRange(
				clrDirReader.readInt(),
				clrDirReader.readInt());

			this.codeManagerTableDir = new io.AddressRange(
				clrDirReader.readInt(),
				clrDirReader.readInt());

			this.vtableFixupsDir = new io.AddressRange(
				clrDirReader.readInt(),
				clrDirReader.readInt());

			this.exportAddressTableJumpsDir = new io.AddressRange(
				clrDirReader.readInt(),
				clrDirReader.readInt());

			this.managedNativeHeaderDir = new io.AddressRange(
				clrDirReader.readInt(),
				clrDirReader.readInt());
		}
	}

	class ClrMetadata {

		mdSignature: metadata.ClrMetadataSignature = metadata.ClrMetadataSignature.Signature;
		metadataVersion: string = "";
		runtimeVersion: string = "";
		mdReserved: number = 0;
		mdFlags: number = 0;
		streamCount: number = 0;

		read(clrDirReader: io.BufferReader) {
			this.mdSignature = clrDirReader.readInt();
			if (this.mdSignature != metadata.ClrMetadataSignature.Signature)
				throw new Error("Invalid CLR metadata signature field " + (<number>this.mdSignature).toString(16) + "h (expected " + (<number>metadata.ClrMetadataSignature.Signature).toString(16).toUpperCase() + "h).");

			this.metadataVersion = clrDirReader.readShort() + "." + clrDirReader.readShort();

			this.mdReserved = clrDirReader.readInt();

			var metadataStringVersionLength = clrDirReader.readInt();
			this.runtimeVersion = clrDirReader.readZeroFilledAscii(metadataStringVersionLength);

			this.mdFlags = clrDirReader.readShort();

			this.streamCount = clrDirReader.readShort();
		}
	}

	class MetadataStreams {
		guids: string[] = [];
		strings: io.AddressRange = null;
		tables: io.AddressRange = null;

		read(metadataBaseAddress: number, streamCount: number, reader: io.BufferReader) {

			var guidRange: io.AddressRange;

			for (var i = 0; i < streamCount; i++) {
				var range = new io.AddressRange(
					reader.readInt(),
					reader.readInt());

				range.address += metadataBaseAddress;

				var name = this.readAlignedNameString(reader);


				switch (name) {
					case "#GUID":
						guidRange = range;
						continue;

					case "#Strings":
						this.strings = range;
						continue;

					case "#~":
					case "#-":
						this.tables = range;
						continue;
				}

				(<any>this)[name] = range;
			}

			if (guidRange) {
				var saveOffset = reader.offset;
				reader.setVirtualOffset(guidRange.address);

				this.guids = Array(guidRange.size / 16);
				for (var i = 0; i < this.guids.length; i++) {
					var guid = this.readGuidForStream(reader);
					this.guids[i] = guid;
				}

				reader.offset = saveOffset;
			}
		}

		private readAlignedNameString(reader: io.BufferReader) {
			var result = "";
			while (true) {
				var b = reader.readByte();
				if (b == 0)
					break;

				result += String.fromCharCode(b);
			}

			var skipCount = -1 + ((result.length + 4) & ~3) - result.length;
			for (var i = 0; i < skipCount; i++) {
				reader.readByte();
			}

			return result;
		}

		private readGuidForStream(reader: io.BufferReader) {
			var guid = "{";
			for (var i = 0; i < 4; i++) {
				var hex = reader.readInt().toString(16);
				guid +=
					"00000000".substring(0, 8 - hex.length) + hex;
			}
			guid += "}";
			return guid;
		}
	}

	class TableStream {
		reserved0: number = 0;
		version: string = "";

		// byte
		heapSizes: number = 0;

		reserved1: number = 0;

		tableCounts: number[] = [];

		read(tableReader: io.BufferReader) {
			this.reserved0 = tableReader.readInt();

			// Note those are bytes, not shorts!
			this.version = tableReader.readByte() + "." + tableReader.readByte();

			this.heapSizes = tableReader.readByte();
			this.reserved1 = tableReader.readByte();

			var valid = tableReader.readLong();
			var sorted = tableReader.readLong();

			var bits = valid.lo;
			for (var tableIndex = 0; tableIndex < 32; tableIndex++) {
				if (bits & 1) {
					var rowCount = tableReader.readInt();
					this.tableCounts[tableIndex] = rowCount;
				}
				bits = bits >> 1;
			}

			bits = valid.hi;
			for (var i = 0; i < 32; i++) {
				var tableIndex = i + 32;
				if (bits & 1) {
					var rowCount = tableReader.readInt();
					this.tableCounts[tableIndex] = rowCount;
				}
				bits = bits >> 1;
			}
		}
	}

	class TableReader {
		readByte(): number { return 0; }
		readShort(): number { return 0; }
		readInt(): number { return 0; }

		readString(): number { return 0; }
		readGuid(): number { return 0; }
		
		readResolutionScope(): number { return 0; }
		readTypeDefOrRef(): number { return 0; }

		readBlobIndex(): number { return 0; }

		readParamTableIndex(): number { return 0; }
		readFieldTableIndex(): number { return 0; }
		readMethodDefTableIndex(): number { return 0; }
		readMemberRefParent(): number { return 0; }
		readHasConstant(): number { return 0; }
		readHasCustomAttribute(): number { return 0; }
		readCustomAttributeType(): number { return 0; }
		readHasFieldMarshal(): number { return 0; }
		readHasDeclSecurity(): number { return 0; }
	}

	module tables {
		// ECMA-335 II.22.30
		export class Module {
			static TableKind = 0x00;

			generation: number = 0;
			name: number = 0;
			mvid: number = 0;
			encId: number = 0;
			encBaseId: number = 0;

			read(reader: TableReader) {
				this.generation = reader.readShort();
				this.name = reader.readString();
				this.mvid = reader.readGuid();
				this.encId = reader.readGuid();
				this.encBaseId = reader.readGuid();
			}
		}

		// ECMA-335 II.22.38
		export class TypeRef {
			static TableKind = 0x01;

			resolutionScope: number = 0;
			name: number = 0;
			namespace: number = 0;

			read(reader: TableReader) {
				this.resolutionScope = reader.readResolutionScope();
				this.name = reader.readString();
				this.namespace = reader.readString();
			}
		}

		// ECMA-335 II.22.37
		export class TypeDef {
			static TableKind = 0x02;

			flags: metadata.TypeAttributes = 0;
			name: number = 0;
			namespace: number = 0;
			extends: number = 0;
			fieldList: number = 0;
			methodList: number = 0;

			read(reader: TableReader) {
				this.flags = reader.readInt();
				this.name = reader.readString();
				this.namespace = reader.readString();
				this.extends = reader.readTypeDefOrRef();

				this.fieldList = reader.readFieldTableIndex();
				this.methodList = reader.readMethodDefTableIndex();
			}
		}

		// ECMA-335 II.22.15
		export class Field {
			static TableKind = 0x04;

			attributes: number = 0;
			name: number = 0;
			signature: number = 0;

			read(reader: TableReader) {
				this.attributes = reader.readShort();
				this.name = reader.readString();
				this.signature = reader.readBlobIndex();
			}
		}

		//ECMA-335 II.22.26
		export class MethodDef {
			static TableKind = 0x06;

			rva: number = 0;
			implAttributes: metadata.MethodImplAttributes = 0; 
			attributes: metadata.MethodAttributes = 0;
			name: number = 0;
			signature: number = 0;
			paramList: number = 0;
			
			read(reader: TableReader) {
				this.rva = reader.readInt();
				this.implAttributes = reader.readShort();
				this.attributes = reader.readShort();
				this.name = reader.readString();
				this.signature = reader.readBlobIndex();
				this.paramList = reader.readParamTableIndex();
			}
		}

		// ECMA-335 II.22.33
		export class Param {
			static TableKind = 0x08;

			flags: number = 0;
			sequence: number = 0;
			name: number = 0;

			read(reader: TableReader) {
				this.flags = reader.readShort();
				this.sequence = reader.readShort();
				this.name = reader.readString();
			}
		}

		// ECMA-335 II.22.25
		export class MemberRef {
			static TableKind = 0x0A;

			class: number = 0;
			name: number = 0;
			signature: number = 0;

			read(reader: TableReader) {
				this.class = reader.readMemberRefParent();
				this.name = reader.readString();
				this.signature = reader.readBlobIndex();
			}
		}

		// ECMA-335 II.22.9
		export class Constant {
			static TableKind = 0x0B;

			type: number = 0;
			parent: number = 0;
			value: number = 0;

			read(reader: TableReader) {
				this.type = reader.readByte();
				var padding = reader.readByte();
				this.parent = reader.readHasConstant();
				this.value = reader.readBlobIndex();
			}
		}

		// ECMA-335 II.22.10
		export class CustomAttribute {
			static TableKind = 0x0C;

			parent: number = 0;
			type: number = 0;
			value: number = 0;

			read(reader: TableReader) {
				this.parent = reader.readHasCustomAttribute();
				this.type = reader.readCustomAttributeType();
				this.value = reader.readBlobIndex();
			}
		}

		// ECMA-335 II.22.17
		export class FieldMarshal {
			static TableKind = 0x0D;

			parent: number = 0;
			nativeType: number = 0;

			read(reader: TableReader) {
				this.parent = reader.readHasFieldMarshal();
				this.nativeType = reader.readBlobIndex();
			}
		}

		// ECMA-335 II.22.11
		export class DeclSecurity {
			static TableKind = 0x0E;

			action: number = 0;
			parent: number = 0;
			permissionSet: number = 0;

			read(reader: TableReader) {
				this.action = reader.readShort();
				this.parent = reader.readHasDeclSecurity();
				this.permissionSet = reader.readBlobIndex();
			}
		}

		// ECMA-335 II.22.36
		export class StandAloneSig {
			static TableKind = 0x11;

			signature: number = 0;

			read(reader: TableReader) {
				this.signature = reader.readBlobIndex();
			}
		}
	}

	export module metadata {

		export enum ClrImageFlags {
			ILOnly = 0x00000001,
			_32BitRequired = 0x00000002,
			ILLibrary = 0x00000004,
			StrongNameSigned = 0x00000008,
			NativeEntryPoint = 0x00000010,
			TrackDebugData = 0x00010000,
			IsIbcoptimized = 0x00020000,	// NEW
		}

		export enum ClrMetadataSignature {
			Signature = 0x424a5342
		}

		export enum AssemblyHashAlgorithm {
			None = 0x0000,
			Reserved = 0x8003,
			Sha1 = 0x8004
		}

		export enum AssemblyFlags {
			// The assembly reference holds the full (unhashed) public key.
			PublicKey = 0x0001,

			// The implementation of this assembly used at runtime is not expected to match the version seen at compile time.
			// (See the text following this table.)
			Retargetable = 0x0100,

			// Reserved 
			// (a conforming implementation of the CLI can ignore this setting on read;
			// some implementations might use this bit to indicate
			// that a CIL-to-native-code compiler should not generate optimized code).
			DisableJITcompileOptimizer = 0x4000,

			// Reserved
			// (a conforming implementation of the CLI can ignore this setting on read;
			// some implementations might use this bit to indicate
			// that a CIL-to-native-code compiler should generate CIL-to-native code map).
			EnableJITcompileTracking = 0x8000
		}

		// [ECMA-335 para23.1.16]
		export enum ElementType {

			// Marks end of a list.
			End = 0x00,

			Void = 0x01,

			Boolean = 0x02,

			Char = 0x03,

			I1 = 0x04,
			U1 = 0x05,
			I2 = 0x06,
			U2 = 0x07,
			I4 = 0x08,
			U4 = 0x09,
			I8 = 0x0a,
			U8 = 0x0b,
			R4 = 0x0c,
			R8 = 0x0d,
			String = 0x0e,

			// Followed by type.
			Ptr = 0x0f,

			// Followed by type.
			ByRef = 0x10,

			// Followed by TypeDef or TypeRef token.
			ValueType = 0x11,

			// Followed by TypeDef or TypeRef token.
			Class = 0x12,

			// Generic parameter in a generic type definition, represented as number (compressed unsigned integer).
			Var = 0x13,

			// type rank boundsCount bound1 … loCount lo1 …
			Array = 0x14,

			// Generic type instantiation.  Followed by type typearg-count type-1 .managed.. type-n.
			GenericInst = 0x15,

			TypedByRef = 0x16,

			// System.IntPtr
			I = 0x18,

			// System.UIntPtr
			U = 0x19,

			// Followed by full method signature.
			FnPtr = 0x1b,

			// System.Object
			Object = 0x1c,

			// Single-dim array with 0 lower bound
			SZArray = 0x1d,

			// Generic parameter in a generic method definition, represented as number (compressed unsigned integer).
			MVar = 0x1e,

			// Required modifier: followed by TypeDef or TypeRef token.
			CMod_ReqD = 0x1f,

			// Optional modifier: followed by TypeDef or TypeRef token.
			CMod_Opt = 0x20,

			// Implemented within the CLI.
			Internal = 0x21,

			// Or'd with following element types.
			Modifier = 0x40,

			// Sentinel for vararg method signature.
			Sentinel = 0x01 | Modifier,

			// Denotes a local variable that points at a pinned object,
			Pinned = 0x05 | Modifier,

			R4_Hfa = 0x06 | Modifier,
			R8_Hfa = 0x07 | Modifier,

			// Indicates an argument of type System.Type.
			ArgumentType_ = 0x10 | Modifier,

			// Used in custom attributes to specify a boxed object (ECMA-335 para23.3).
			CustomAttribute_BoxedObject_ = 0x11 | Modifier,

			// Reserved_ = 0x12 | Modifier,

			// Used in custom attributes to indicate a FIELD (ECMA-335 para22.10, 23.3).
			CustomAttribute_Field_ = 0x13 | Modifier,

			// Used in custom attributes to indicate a PROPERTY (ECMA-335 para22.10, 23.3).
			CustomAttribute_Property_ = 0x14 | Modifier,

			// Used in custom attributes to specify an enum (ECMA-335 para23.3).
			CustomAttribute_Enum_ = 0x55
		}

		// Look in ECMA-335 para22.11.
		export enum SecurityAction {

			// Without further checks, satisfy Demand for the specified permission.
			// Valid scope: Method, Type;
			Assert = 3,

			// Check that all callers in the call chain have been granted specified permission,
			// throw SecurityException (see ECMA-335 paraPartition IV) on failure.
			// Valid scope: Method, Type.
			Demand = 2,

			// Without further checks refuse Demand for the specified permission.
			// Valid scope: Method, Type.
			Deny = 4,

			// The specified permission shall be granted in order to inherit from class or override virtual method.
			// Valid scope: Method, Type 

			InheritanceDemand = 7,

			// Check that the immediate caller has been granted the specified permission;
			// throw SecurityException (see ECMA-335 paraPartition IV) on failure.
			// Valid scope: Method, Type.
			LinkDemand = 6,

			//  Check that the current assembly has been granted the specified permission;
			//  throw SecurityException (see Partition IV) otherwise.
			//  Valid scope: Method, Type.
			NonCasDemand = 0, // TODO: find the correct value

			// Check that the immediate caller has been granted the specified permission;
			// throw SecurityException (see Partition IV) otherwise.
			// Valid scope: Method, Type.
			NonCasLinkDemand = 0,  // TODO: find the correct value

			// Reserved for implementation-specific use.
			// Valid scope: Assembly.
			PrejitGrant = 0,  // TODO: find the correct value

			// Without further checks, refuse Demand for all permissions other than those specified.
			// Valid scope: Method, Type 
			PermitOnly = 5,

			// Specify the minimum permissions required to runmanaged.
			// Valid scope: Assembly.
			RequestMinimum = 8,

			// Specify the optional permissions to grant.
			// Valid scope: Assembly.
			RequestOptional = 9,

			// Specify the permissions not to be granted.
			// Valid scope: Assembly.
			RequestRefuse = 10
		}

		// [ECMA-335 para23.1.4]
		export enum EventAttributes {

			// Event is special.
			SpecialName = 0x0200,

			// CLI provides 'special' behavior, depending upon the name of the event.
			RTSpecialName = 0x0400,
		}

		export enum TypeAttributes {
			// Visibility attributes

			// Use this mask to retrieve visibility information.
			// These 3 bits contain one of the following values:
			// NotPublic, Public,
			// NestedPublic, NestedPrivate,
			// NestedFamily, NestedAssembly,
			// NestedFamANDAssem, NestedFamORAssem.
			VisibilityMask = 0x00000007,

			// Class has no public scope.
			NotPublic = 0x00000000,

			// Class has public scope.
			Public = 0x00000001,

			// Class is nested with public visibility.
			NestedPublic = 0x00000002,

			// Class is nested with private visibility.
			NestedPrivate = 0x00000003,

			// Class is nested with family visibility.
			NestedFamily = 0x00000004,

			// Class is nested with assembly visibility.
			NestedAssembly = 0x00000005,

			// Class is nested with family and assembly visibility.
			NestedFamANDAssem = 0x00000006,

			// Class is nested with family or assembly visibility.
			NestedFamORAssem = 0x00000007,


			// Class layout attributes

			// Use this mask to retrieve class layout information.
			// These 2 bits contain one of the following values:
			// AutoLayout, SequentialLayout, ExplicitLayout.
			LayoutMask = 0x00000018,

			// Class fields are auto-laid out.
			AutoLayout = 0x00000000,

			// Class fields are laid out sequentially.
			SequentialLayout = 0x00000008,

			// Layout is supplied explicitly.
			ExplicitLayout = 0x00000010,


			// Class semantics attributes

			// Use this mask to retrive class semantics information.
			// This bit contains one of the following values:
			// Class, Interface.
			ClassSemanticsMask = 0x00000020,

			// Type is a class.
			Class = 0x00000000,

			// Type is an interface.
			Interface = 0x00000020,


			// Special semantics in addition to class semantics

			// Class is abstract.
			Abstract = 0x00000080,

			// Class cannot be extended.
			Sealed = 0x00000100,

			// Class name is special.
			SpecialName = 0x00000400,


			// Implementation Attributes

			// Class/Interface is imported.
			Import = 0x00001000,

			// Reserved (Class is serializable)
			Serializable = 0x00002000,


			// String formatting Attributes

			// Use this mask to retrieve string information for native interop.
			// These 2 bits contain one of the following values:
			// AnsiClass, UnicodeClass, AutoClass, CustomFormatClass.
			StringFormatMask = 0x00030000,

			// LPSTR is interpreted as ANSI.
			AnsiClass = 0x00000000,

			// LPSTR is interpreted as Unicode.
			UnicodeClass = 0x00010000,

			// LPSTR is interpreted automatically.
			AutoClass = 0x00020000,

			// A non-standard encoding specified by CustomStringFormatMask.
			CustomFormatClass = 0x00030000,

			// Use this mask to retrieve non-standard encoding information for native interop.
			// The meaning of the values of these 2 bits isunspecified.
			CustomStringFormatMask = 0x00C00000,


			// Class Initialization Attributes

			// Initialize the class before first static field access.
			BeforeFieldInit = 0x00100000,


			// Additional Flags

			// CLI provides 'special' behavior, depending upon the name of the Type
			RTSpecialName = 0x00000800,

			// Type has security associate with it.
			HasSecurity = 0x00040000,

			// This ExportedTypeEntry is a type forwarder.
			IsTypeForwarder = 0x00200000
		}

		// [ECMA-335 para23.1.5]
		export enum FieldAttributes {

			// These 3 bits contain one of the following values:
			// CompilerControlled, Private,
			// FamANDAssem, Assembly,
			// Family, FamORAssem,
			// Public.
			FieldAccessMask = 0x0007,

			// Member not referenceable.
			CompilerControlled = 0x0000,

			// Accessible only by the parent type.
			Private = 0x0001,

			// Accessible by sub-types only in this Assembly.
			FamANDAssem = 0x0002,

			// Accessibly by anyone in the Assembly.
			Assembly = 0x0003,

			// Accessible only by type and sub-types.
			Family = 0x0004,

			// Accessibly by sub-types anywhere, plus anyone in assembly.
			FamORAssem = 0x0005,

			// Accessibly by anyone who has visibility to this scope field contract attributes.
			Public = 0x0006,


			// Defined on type, else per instance.
			Static = 0x0010,

			// Field can only be initialized, not written to after init.
			InitOnly = 0x0020,

			// Value is compile time constant.
			Literal = 0x0040,

			// Reserved (to indicate this field should not be serialized when type is remoted).
			NotSerialized = 0x0080,

			// Field is special.
			SpecialName = 0x0200,


			// Interop Attributes

			// Implementation is forwarded through PInvoke.
			PInvokeImpl = 0x2000,


			// Additional flags

			// CLI provides 'special' behavior, depending upon the name of the field.
			RTSpecialName = 0x0400,

			// Field has marshalling information.
			HasFieldMarshal = 0x1000,

			// Field has default.
			HasDefault = 0x8000,

			// Field has RVA.
			HasFieldRVA = 0x0100
		}

		// [ECMA-335 para23.1.6]
		export enum FileAttributes {

			// This is not a resource file.
			ContainsMetaData = 0x0000,

			// This is a resource file or other non-metadata-containing file.
			ContainsNoMetaData = 0x0001
		}

		// [ECMA-335 para23.1.7]
		export enum GenericParamAttributes {

			// These 2 bits contain one of the following values:
			// VarianceMask,
			// None,
			// Covariant,
			// Contravariant.
			VarianceMask = 0x0003,

			// The generic parameter is non-variant and has no special constraints.
			None = 0x0000,

			// The generic parameter is covariant.
			Covariant = 0x0001,

			// The generic parameter is contravariant.
			Contravariant = 0x0002,


			// These 3 bits contain one of the following values:
			// ReferenceTypeConstraint,
			// NotNullableValueTypeConstraint,
			// DefaultConstructorConstraint.
			SpecialConstraintMask = 0x001C,

			// The generic parameter has the class special constraint.
			ReferenceTypeConstraint = 0x0004,

			// The generic parameter has the valuetype special constraint.
			NotNullableValueTypeConstraint = 0x0008,

			// The generic parameter has the .ctor special constraint.
			DefaultConstructorConstraint = 0x0010
		}

		// [ECMA-335 para23.1.8]
		export enum PInvokeAttributes {

			// PInvoke is to use the member name as specified.
			NoMangle = 0x0001,


			// Character set

			// These 2 bits contain one of the following values:
			// CharSetNotSpec,
			// CharSetAnsi,
			// CharSetUnicode,
			// CharSetAuto.
			CharSetMask = 0x0006,

			CharSetNotSpec = 0x0000,
			CharSetAnsi = 0x0002,
			CharSetUnicode = 0x0004,
			CharSetAuto = 0x0006,


			// Information about target function. Not relevant for fields.
			SupportsLastError = 0x0040,


			// Calling convention

			// These 3 bits contain one of the following values:
			// CallConvPlatformapi,
			// CallConvCdecl,
			// CallConvStdcall,
			// CallConvThiscall,
			// CallConvFastcall.
			CallConvMask = 0x0700,
			CallConvPlatformapi = 0x0100,
			CallConvCdecl = 0x0200,
			CallConvStdcall = 0x0300,
			CallConvThiscall = 0x0400,
			CallConvFastcall = 0x0500
		}

		// [ECMA-335 para23.1.9]
		export enum ManifestResourceAttributes {

			// These 3 bits contain one of the following values:
			VisibilityMask = 0x0007,

			// The Resource is exported from the Assembly.
			Public = 0x0001,

			// The Resource is private to the Assembly.
			Private = 0x0002
		}

		export enum MethodImplAttributes {

			// These 2 bits contain one of the following values:
			// IL, Native, OPTIL, Runtime.
			CodeTypeMask = 0x0003,

			// Method impl is CIL.
			IL = 0x0000,

			// Method impl is native.
			Native = 0x0001,

			// Reserved: shall be zero in conforming implementations.
			OPTIL = 0x0002,

			// Method impl is provided by the runtime.
			Runtime = 0x0003,


			// Flags specifying whether the code is managed or unmanaged.
			// This bit contains one of the following values:
			// Unmanaged, Managed.
			ManagedMask = 0x0004,

			// Method impl is unmanaged, otherwise managed.
			Unmanaged = 0x0004,

			// Method impl is managed.
			Managed = 0x0000,


			// Implementation info and interop

			// Indicates method is defined; used primarily in merge scenarios.
			ForwardRef = 0x0010,

			// Reserved: conforming implementations can ignore.
			PreserveSig = 0x0080,

			// Reserved: shall be zero in conforming implementations.
			InternalCall = 0x1000,

			// Method is single threaded through the body.
			Synchronized = 0x0020,

			// Method cannot be inlined.
			NoInlining = 0x0008,

			// Range check value.
			MaxMethodImplVal = 0xffff,

			// Method will not be optimized when generating native code.
			NoOptimization = 0x0040,
		}

		// [ECMA-335 para23.1.10]
		export enum MethodAttributes {

			// These 3 bits contain one of the following values:
			// CompilerControlled, 
			// Private, 
			// FamANDAssem, 
			// Assem, 
			// Family, 
			// FamORAssem, 
			// Public
			MemberAccessMask = 0x0007,

			// Member not referenceable.
			CompilerControlled = 0x0000,


			// Accessible only by the parent type.
			Private = 0x0001,

			// Accessible by sub-types only in this Assembly.
			FamANDAssem = 0x0002,

			// Accessibly by anyone in the Assembly.
			Assem = 0x0003,

			// Accessible only by type and sub-types.
			Family = 0x0004,

			// Accessibly by sub-types anywhere, plus anyone in assembly.
			FamORAssem = 0x0005,

			// Accessibly by anyone who has visibility to this scope.
			Public = 0x0006,


			// Defined on type, else per instance.
			Static = 0x0010,

			// Method cannot be overridden.
			Final = 0x0020,

			// Method is virtual.
			Virtual = 0x0040,

			// Method hides by name+sig, else just by name.
			HideBySig = 0x0080,


			// Use this mask to retrieve vtable attributes. This bit contains one of the following values:
			// ReuseSlot, NewSlot.
			VtableLayoutMask = 0x0100,

			// Method reuses existing slot in vtable.
			ReuseSlot = 0x0000,

			// Method always gets a new slot in the vtable.
			NewSlot = 0x0100,


			// Method can only be overriden if also accessible.
			Strict = 0x0200,

			// Method does not provide an implementation.
			Abstract = 0x0400,

			// Method is special.
			SpecialName = 0x0800,


			// Interop attributes

			// Implementation is forwarded through PInvoke.
			PInvokeImpl = 0x2000,

			// Reserved: shall be zero for conforming implementations.
			UnmanagedExport = 0x0008,


			// Additional flags

			// CLI provides 'special' behavior, depending upon the name of the method.
			RTSpecialName = 0x1000,

			// Method has security associated with it.
			HasSecurity = 0x4000,

			// Method calls another method containing security code.
			RequireSecObject = 0x8000
		}

		// [ECMA-335 para23.1.12]
		export enum MethodSemanticsAttributes {

			// Setter for property.
			Setter = 0x0001,

			// Getter for property.
			Getter = 0x0002,

			// Other method for property or event.
			Other = 0x0004,

			// AddOn method for event.
			// This refers to the required add_ method for events.  (ECMA-335 para22.13)
			AddOn = 0x0008,

			// RemoveOn method for event.
			// This refers to the required remove_ method for events. (ECMA-335 para22.13)
			RemoveOn = 0x0010,

			// Fire method for event.
			// This refers to the optional raise_ method for events. (ECMA-335 para22.13)
			Fire = 0x0020
		}

		// [ECMA-335 para23.1.13]
		export enum ParamAttributes {

			// Param is [In].
			In = 0x0001,

			// Param is [out].
			Out = 0x0002,

			// Param is optional.
			Optional = 0x0010,

			// Param has default value.
			HasDefault = 0x1000,

			// Param has FieldMarshal.
			HasFieldMarshal = 0x2000,

			// Reserved: shall be zero in a conforming implementation.
			Unused = 0xcfe0,
		}

		// [ECMA-335 para23.1.14]
		export enum PropertyAttributes {

			// Property is special.
			SpecialName = 0x0200,

			// Runtime(metadata internal APIs) should check name encoding.
			RTSpecialName = 0x0400,

			// Property has default.
			HasDefault = 0x1000,

			// Reserved: shall be zero in a conforming implementation.
			Unused = 0xe9ff
		}

		// [ECMA-335 para23.2.3]
		export enum CallingConventions {
			// Used to encode the keyword 'default' in the calling convention, see ECMA para15.3.
			Default = 0x0,

			C = 0x1,

			StdCall = 0x2,

			FastCall = 0x4,

			// Used to encode the keyword 'vararg' in the calling convention, see ECMA para15.3.
			VarArg = 0x5,

			// Used to indicate that the method has one or more generic parameters.
			Generic = 0x10,

			// Used to encode the keyword 'instance' in the calling convention, see ECMA para15.3.
			HasThis = 0x20,

			// Used to encode the keyword 'explicit' in the calling convention, see ECMA para15.3.
			ExplicitThis = 0x40,

			// (ECMA para23.1.16), used to encode '.managed..' in the parameter list, see ECMA para15.3.
			Sentinel = 0x41,
		}

		export enum TableKind {
			// The rows in the Module table result from .module directives in the Assembly.
			ModuleDefinition = 0x00,

			// Contains ResolutionScope, TypeName and TypeNamespace columns.
			ExternalType = 0x01,

			// The first row of the TypeDef table represents the pseudo class that acts as parent for functions and variables 
			// defined at module scope.
			// If a type is generic, its parameters are defined in the GenericParam table (para22.20). Entries in the 
			// GenericParam table reference entries in the TypeDef table; there is no reference from the TypeDef table to the 
			// GenericParam table.
			TypeDefinition = 0x02,

			// Each row in the Field table results from a top-level .field directive, or a .field directive inside a 
			// Type. 
			FieldDefinition = 0x04,

			// Conceptually, every row in the MethodDef table is owned by one, and only one, row in the TypeDef table.
			// The rows in the MethodDef table result from .method directives (para15). The RVA column is computed when 
			// the image for the PE file is emitted and points to the COR_ILMETHOD structure for the body of the method.
			MethodDefinition = 0x06,

			// Conceptually, every row in the Param table is owned by one, and only one, row in the MethodDef table.
			// The rows in the Param table result from the parameters in a method declaration (para15.4), or from a .param
			// attribute attached to a method.
			ParameterDefinition = 0x08,

			// Combines two sorts of references, to Methods and to Fields of a class, known as 'MethodRef' and 'FieldRef', respectively.
			// An entry is made into the MemberRef table whenever a reference is made in the CIL code to a method or field 
			// which is defined in another module or assembly.  (Also, an entry is made for a call to a method with a VARARG
			// signature, even when it is defined in the same module as the call site.) 
			MemberRef = 0x0A,

			// Used to store compile-time, constant values for fields, parameters, and properties.
			Constant = 0x0B,

			// Stores data that can be used to instantiate a Custom Attribute (more precisely, an 
			// object of the specified Custom Attribute class) at runtime.
			// A row in the CustomAttribute table for a parent is created by the .custom attribute, which gives the value of 
			// the Type column and optionally that of the Value column.
			CustomAttribute = 0x0C,

			// The FieldMarshal table  'links' an existing row in the Field or Param table, to information 
			// in the Blob heap that defines how that field or parameter (which, as usual, covers the method return, as 
			// parameter number 0) shall be marshalled when calling to or from unmanaged code via PInvoke dispatch.
			// A row in the FieldMarshal table is created if the .field directive for the parent field has specified a marshal attribute.
			FieldMarshal = 0x0D,

			// The rows of the DeclSecurity table are filled by attaching a .permission or .permissionset directive 
			// that specifies the Action and PermissionSet on a parent assembly or parent type or method.
			DeclSecurity = 0x0E,

			// Used to define how the fields of a class or value type shall be laid out by the CLI.
			// (Normally, the CLI is free to reorder and/or insert gaps between the fields defined for a class or value type.)
			ClassLayout = 0x0F,

			// Records the interfaces a type implements explicitly.  Conceptually, each row in the 
			// InterfaceImpl table indicates that Class implements Interface.
			InterfaceImpl = 0x09,

			// A row in the FieldLayout table is created if the .field directive for the parent field has specified a field offset.
			FieldLayout = 0x10,

			// Signatures are stored in the metadata Blob heap.  In most cases, they are indexed by a column in some table -
			// Field.Signature, Method.Signature, MemberRef.Signature, etc.  However, there are two cases that require a 
			// metadata token for a signature that is not indexed by any metadata table.  The StandAloneSig table fulfils this 
			// need.  It has just one column, which points to a Signature in the Blob heap.
			StandAloneSig = 0x11,

			// The EventMap and Event tables result from putting the .event directive on a class.
			EventMap = 0x12,

			// The EventMap and Event tables result from putting the .event directive on a class.
			Event = 0x14,

			// The PropertyMap and Property tables result from putting the .property directive on a class.
			PropertyMap = 0x15,

			// Does a little more than group together existing rows from other tables.
			PropertyDefinition = 0x17,

			// The rows of the MethodSemantics table are filled by .property and .event directives.
			MethodSemantics = 0x18,

			// s let a compiler override the default inheritance rules provided by the CLI. Their original use 
			// was to allow a class C, that inherited method M from both interfaces I and J, to provide implementations for 
			// both methods (rather than have only one slot for M in its vtable). However, MethodImpls can be used for other 
			// reasons too, limited only by the compiler writer‘s ingenuity within the constraints defined in the Validation rules.
			// ILAsm uses the .override directive to specify the rows of the MethodImpl table.
			MethodImpl = 0x19,

			// The rows in the ModuleRef table result from .module extern directives in the Assembly.
			ModuleRef = 0x1A,

			//  Contains just one column, which indexes the specification of a Type, stored in the Blob heap.  
			//  This provides a metadata token for that Type (rather than simply an index into the Blob heap). This is required, 
			//  typically, for array operations, such as creating, or calling methods on the array class.
			//  Note that TypeSpec tokens can be used with any of the CIL instructions that take a TypeDef or TypeRef token; 
			//  specifically, castclass, cpobj, initobj, isinst, ldelema, ldobj, mkrefany, newarr, refanyval, sizeof, stobj, 
			//  box, and unbox.
			TypeSpec = 0x1B,

			// Holds information about unmanaged methods that can be reached from managed code, 
			// using PInvoke dispatch. 
			// A row is entered in the ImplMap table for each parent Method (para15.5) that is defined with a .pinvokeimpl
			// interoperation attribute specifying the MappingFlags, ImportName, and ImportScope.
			ImplMap = 0x1C,

			// Conceptually, each row in the FieldRVA table is an extension to exactly one row in the Field table, and records 
			// the RVA (Relative Virtual Address) within the image file at which this field‘s initial value is stored.
			// A row in the FieldRVA table is created for each static parent field that has specified the optional data
			// label.  The RVA column is the relative virtual address of the data in the PE file.
			FieldRVA = 0x1D,

			// ECMA-335 para22.2.
			AssemblyDefinition = 0x20,

			// ECMA-335 para22.4 Shall be ignored by the CLI.
			AssemblyProcessor = 0x21,

			// ECMA-335 para22.3 Shall be ignored by the CLI.
			AssemblyOS = 0x22,

			// The table is defined by the .assembly extern directive (para6.3).  Its columns are filled using directives 
			// similar to those of the Assembly table except for the PublicKeyOrToken column, which is defined using the 
			// .publickeytoken directive.
			AssemblyRef = 0x23,

			// ECMA-335 para22.7 Shall be ignored by the CLI.
			AssemblyRefProcessor = 0x24,

			// ECMA-335 para22.6 Shall be ignored by the CLI.
			AssemblyRefOS = 0x25,

			// The rows of the File table result from .file directives in an Assembly.
			File = 0x26,

			// Holds a row for each type:
			// a. Defined within other modules of this Assembly; that is exported out of this Assembly.  In essence, it 
			// stores TypeDef row numbers of all types that are marked public in other modules that this Assembly 
			// comprises.  
			// The actual target row in a TypeDef table is given by the combination of TypeDefId (in effect, row 
			// number) and Implementation (in effect, the module that holds the target TypeDef table).  Note that this 
			// is the only occurrence in metadata of foreign tokens; that is, token values that have a meaning in 
			// another module.  (A regular token value is an index into a table in the current module); OR
			// b. Originally defined in this Assembly but now moved to another Assembly. Flags must have 
			// IsTypeForwarder set and Implementation is an AssemblyRef indicating the Assembly the type may 
			// now be found in.
			ExportedType = 0x27,

			//  The rows in the table result from .mresource directives on the Assembly.
			ManifestResource = 0x28,

			// NestedClass is defined as lexically 'inside' the text of its enclosing Type.
			NestedClass = 0x29,

			// Stores the generic parameters used in generic type definitions and generic method 
			// definitions.  These generic parameters can be constrained (i.e., generic arguments shall extend some class 
			// and/or implement certain interfaces) or unconstrained.  (Such constraints are stored in the 
			// GenericParamConstraint table.)
			// Conceptually, each row in the GenericParam table is owned by one, and only one, row in either the TypeDef or 
			// MethodDef tables.
			GenericParam = 0x2A,

			// Records the signature of an instantiated generic method.
			// Each unique instantiation of a generic method (i.e., a combination of Method and Instantiation) shall be 
			// represented by a single row in the table.
			MethodSpec = 0x2B,

			// Records the constraints for each generic parameter.  Each generic parameter
			// can be constrained to derive from zero or one class.  Each generic parameter can be constrained to implement 
			// zero or more interfaces.
			// Conceptually, each row in the GenericParamConstraint table is ?owned‘ by a row in the GenericParam table.
			GenericParamConstraint = 0x2C,
		}
	}
}