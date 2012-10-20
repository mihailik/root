/// <reference path="Version.ts" />
/// <reference path="Machine.ts" />

module Mi.PE {
    export class AssemblyDefinition {
        machine: Machine;
        timestamp: Date;
        imageCharacteristics: number;

        osVersion: Version;
        imageVersion: Version;

        win32Version: number;
        subsystem: number;
        dllCharacteristics: number;

        runtimeVersion: Version;

        imageFlags: number;

        metadataVersion: Version;
        metadataVersionString: string;
    }
}