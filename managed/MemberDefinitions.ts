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

		constructor() {
			super();
		}

		getName() { return this.name; }
		getNamespace() { return this.namespace; }
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

		internalReadRow(reader: metadata.TableStreamReader): void {
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
		attributes: number = 0;
		implAttributes: number = 0;
		name: string = "";
		parameters: any[] = [];

		signature: MethodSignature = new MethodSignature();

		locals: any[];

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
		
		isStatic: bool = false;
		customAttributes: any[];
		customModifiers: any[];
		type: TypeReference;
		parameters: any[];

		internalReadRow(reader: metadata.TableStreamReader): void {
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

		internalReadRow(reader: metadata.TableStreamReader): void {
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
		constructor(public baseType: TypeReference) {
			super();
		}

		getName() { return this.baseType.getName() + "[]"; }
		getNamespace() { return this.baseType.getNamespace(); }

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
		constructor(private name: string) {
			super();
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
			return this.lowBound + ".." + (this.lowBound + this.length - 1) + "]";
		}
	}

	export class MethodSignature {
		callingConvention: metadata.CallingConventions = 0;
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
		constructor(public type: metadata.ElementType, public value: any) {
		}

		valueOf() { return this.value; }
	}
}