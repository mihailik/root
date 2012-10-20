/// <reference path="../Version.ts" />
/// <reference path="../Machine.ts" />

module Mi.PE.PEFormat {
    export class PEFields {
        machine: Machine;
        timestamp: Date;
        imageCharacteristics: number;

        osVersion: Version;
        imageVersion: Version;

        win32Version: number;
        subsystem: number;
        dllCharacteristics: number;
    }
}