/// <reference path="Version.ts" />
/// <reference path="Machine.ts" />

/// <reference path="PEFormat/PEFile.ts" />

/// <reference path="Cli/ClrImageFlags.ts" />

module Mi.PE {
    export class ModuleDefinition {
        pe: PEFormat.PEFile;

        runtimeVersion: Version;

        imageFlags: Mi.PE.Cli.ClrImageFlags;

        metadataVersion: Version;
        metadataVersionString: string;

        tableStreamVersion: Version;


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
}