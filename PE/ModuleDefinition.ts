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
    }
}