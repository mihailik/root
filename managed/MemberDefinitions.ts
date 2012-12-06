/// <reference path="metadata/ClrImageFlags.ts" />

module pe.managed {
    export class ModuleDefinition {
        runtimeVersion: string;

        imageFlags: metadata.ClrImageFlags;

        metadataVersion: string;
        metadataVersionString: string;

        tableStreamVersion: string;


        // Ushort
        generation: number;

        name: string;

        // The mvid column shall index a unique GUID in the GUID heap (ECMA-335 §24.2.5)
        // that identifies this instance of the module.
        // The mvid can be ignored on read by conforming implementations of the CLI.
        // The mvid should be newly generated for every module,
        // using the algorithm specified in ISO/IEC 11578:1996
        // (Annex A) or another compatible algorithm.

        // [Rationale: While the VES itself makes no use of the Mvid,
        // other tools (such as debuggers, which are outside the scope of this standard)
        // rely on the fact that the <see cref="Mvid"/> almost always differs from one module to another.
        // end rationale]
        mvid: string;

        encId: string;
        encBaseId: string;

        types: TypeDefinition[];
    }

    export class TypeDefinition {
        attributes: number;

        name: string;
        namespace: string;

        fields: FieldDefinition[];

        extendsType: any;

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
        attributes: number;
        name: string;
        signature;

        toString() {
            return this.name;
        }
    }

    export class MethodDefinition {
        attributes: number;
        implAttributes: number;
        name: string;
        parameters: any[];
    }
}