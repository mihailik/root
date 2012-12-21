/// <reference path="metadata/ClrImageFlags.ts" />
/// <reference path="metadata/ClrDirectory.ts" />
/// <reference path="metadata/ClrMetadata.ts" />
/// <reference path="metadata/MetadataStreams.ts" />
/// <reference path="metadata/TableStream.ts" />
/// <reference path="metadata/rowEnums.ts" />
/// <reference path="metadata/AssemblyReader.ts" />
/// <reference path="../headers/PEFileHeaders.ts" />

module pe.managed {
	export class AssemblyDefinition {
		headers: headers.PEFileHeaders = null;

		// HashAlgId shall be one of the specified values. [ERROR]
		hashAlgId: metadata.AssemblyHashAlgorithm = metadata.AssemblyHashAlgorithm.None;

		// MajorVersion, MinorVersion, BuildNumber, and RevisionNumber can each have any value.
		version: string = "";

		// Flags shall have only those values set that are specified. [ERROR]
		flags: metadata.AssemblyFlags = 0;

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
		    var asmReader = new metadata.AssemblyReader();
		    asmReader.read(reader, this);
		}

		toString() {
		    return this.name+", version="+this.version + (this.publicKey ? ", publicKey=" + this.publicKey : "");
		}
	}

	export class ModuleDefinition {
		runtimeVersion: string = "";
		specificRuntimeVersion: string = "";

		imageFlags: metadata.ClrImageFlags = 0;

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
	}

	export class TypeDefinition {
		// A 4-byte bitmask of type TypeAttributes, ECMA-335 para23.1.15.
		attributes: number = 0;

		name: string = "";
		namespace: string = "";

		fields: FieldDefinition[] = [];
		methods: MethodDefinition[] = [];

		baseType: any = null;

		toString() {
			var result = "";
			if (this.namespace)
				result += this.namespace;
			if (this.name)
				result += (result.length > 0 ? "." + this.name : this.name);

			return result;
		}
	}

	export class FieldDefinition {
		attributes: number = 0;
		name: string = "";
		customModifiers: any[];
		customAttributes: any[];
		type: TypeReference;

		toString() {
			return this.name;
		}
	}

	export class MethodDefinition {
		attributes: number = 0;
		implAttributes: number = 0;
		name: string = "";
		parameters: any[] = [];

		signature: MethodSignature = null;

		locals: any[];

		toString() {
		    var result = this.name;
		    result += "(";
		    if (this.parameters) {
		        for (var i = 0; i < this.parameters.length; i++) {
                    if (i>0)
                        result += ", ";
                    result += this.parameters[i];
		        }
		    }
		    result += ")";
		    return result;
		}
	}

	export class Local {
		customAttributes: any[];
		constraint: any;
		type: TypeReference;
	}

	export class CustomModifier {
		constructor(public required: bool, public type: TypeReference) {
		}
	}

	export class ParameterDefinition {
		attributes: number = 0;
		name: string = "";
		index: number = 0;

		internalReadRow(reader: metadata.TableStreamReader): void {
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
		
		hasThis: bool = false;
		customAttributes: any[];
		propertyType: TypeReference;
		parameters: any[];
	}

	export interface TypeReference {
		getName(): string;
		getNamespace(): string;
	}

	export class ExternalType implements TypeReference {
		constructor(public assemblyRef: any, private name: string, private namespace: string) {
		}

		getName() { return this.name; }
		getNamespace() { return this.namespace; }

		internalReadRow(reader: metadata.TableStreamReader): void {
			this.assemblyRef = reader.readResolutionScope();

			this.name = reader.readString();
			this.namespace = reader.readString();
		}

		toString() {
			return this.assemblyRef + " " + this.namespace + "." + this.name;
		}
	}

	export class PointerType implements TypeReference {
		constructor(public baseType: TypeReference) {
		}

		getName() { return this.baseType.getName() + "*"; }
		getNamespace() { return this.baseType.getNamespace(); }
	}

	export class ByRefType implements TypeReference {
		constructor(public baseType: TypeReference) {
		}

		getName() { return this.baseType.getName() + "&"; }
		getNamespace() { return this.baseType.getNamespace(); }
	}

	export class SZArrayType implements TypeReference {
		constructor(public baseType: TypeReference) {
		}

		getName() { return this.baseType.getName() + "[]"; }
		getNamespace() { return this.baseType.getNamespace(); }
	}

	export class SentinelType implements TypeReference {
		constructor(public baseType: TypeReference) {
		}

		getName() { return this.baseType.getName() + "!sentinel"; }
		getNamespace() { return this.baseType.getNamespace(); }
	}

	export class PinnedType implements TypeReference {
		constructor(public baseType: TypeReference) {
		}

		getName() { return this.baseType.getName() + "!pinned"; }
		getNamespace() { return this.baseType.getNamespace(); }
	}

	export class KnownType implements TypeReference {
		constructor(private name: string) {
		}

		getName() { return this.name; }
		getNamespace() { return "System"; }

		static Void = new KnownType("Void");
		static Boolean = new KnownType("Boolean");
		static Char = new KnownType("Char");
		static SByte = new KnownType("SByte");
		static Byte = new KnownType("Byte");
		static Int16 = new KnownType("Int16");
		static UInt16 = new KnownType("UInt16");
		static Int32 = new KnownType("Int32");
		static UInt32 = new KnownType("UInt32");
		static Int64 = new KnownType("Int64");
		static UInt64 = new KnownType("UInt64");
		static Single = new KnownType("Single");
		static Double = new KnownType("Double");
		static String = new KnownType("String");
		static TypedReference = new KnownType("TypedReference");
		static IntPtr = new KnownType("IntPtr");
		static UIntPtr = new KnownType("UIntPtr");
		static Object = new KnownType("Object");
	}

	export class MethodSignature {
		callingConvention: metadata.CallingConventions = 0;
		parameters: TypeReference[] = [];
		extraParameters: TypeReference[] = null;
		returnType: TypeReference = null;
	}
}