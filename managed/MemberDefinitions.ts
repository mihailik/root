/// <reference path="metadata/ClrImageFlags.ts" />
/// <reference path="metadata/ClrDirectory.ts" />
/// <reference path="metadata/ClrMetadata.ts" />
/// <reference path="metadata/MetadataStreams.ts" />
/// <reference path="metadata/TableStream.ts" />

module pe.managed {
    export class ModuleDefinition {
        runtimeVersion: string = "";

        imageFlags: metadata.ClrImageFlags = 0;

        metadataVersion: string = "";
        //runtimeVersion: string = "";

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
    }

    export class TypeDefinition {
        attributes: number = 0;

        name: string = "";
        namespace: string = "";

        fields: FieldDefinition[] = [];

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

    export class TypeReference {
    }
}