/// <reference path="metadata/ClrImageFlags.ts" />
/// <reference path="metadata/ClrDirectory.ts" />
/// <reference path="metadata/ClrMetadata.ts" />
/// <reference path="metadata/MetadataStreams.ts" />
/// <reference path="metadata/TableStream.ts" />
/// <reference path="metadata/rowEnums.ts" />
/// <reference path="metadata/AssemblyReader.ts" />
/// <reference path="../headers/PEFile.ts" />

module pe.managed {
	export class AssemblyDefinition {
		headers: headers.PEFile = null;

		//HashAlgId shall be one of the specified values. [ERROR]
		hashAlgId: metadata.AssemblyHashAlgorithm = metadata.AssemblyHashAlgorithm.None;

		//MajorVersion, MinorVersion, BuildNumber, and RevisionNumber can each have any value.
		version: string = "";

		//Flags shall have only those values set that are specified. [ERROR]
		flags: metadata.AssemblyFlags = 0;

		//PublicKey can be null or non-null.
		publicKey: string = "";

		//Name shall index a non-empty string in the String heap. [ERROR]
		//. The string indexed by Name can be of unlimited length.
		name: string = "";

		//Culture  can be null or non-null.
		//If Culture is non-null, it shall index a single string from the list specified (ECMA-335 para23.1.3). [ERROR]
		culture: string = "";

		modules: ModuleDefinition[] = [];

		read(reader: io.BinaryReader) {
		    var asmReader = new metadata.AssemblyReader();
		    asmReader.read(reader, this);
		}

		toString() {
		    return this.name+", version="+this.version;
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

		toString() {
		    return this.name + " " + this.imageFlags;
		}
	}

	export class TypeDefinition {
		attributes: number = 0;

		name: string = "";
		namespace: string = "";

		fields: FieldDefinition[] = [];
		methods: MethodDefinition[] = [];

		extendsType: any = null;

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
		signature = null;

		toString() {
			return this.name;
		}
	}

	export class MethodDefinition {
		attributes: number = 0;
		implAttributes: number = 0;
		name: string = "";
		parameters: any[] = [];
	}

	export class ParameterDefinition {
		attributes: number = 0;
		name: string = "";
	}

	export class PropertyDefinition {
		attributes: number = 0;
		name: string = "";
	}

	export interface TypeReference {
		name: string;
		namespace: string;
	}

	export class ExternalTypeReference {
		name: string;
		namespace: string;
	}
}