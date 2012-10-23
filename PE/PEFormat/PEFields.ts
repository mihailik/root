/// <reference path="../Version.ts" />
/// <reference path="../Machine.ts" />
/// <reference path="../BinaryReader.ts" />

/// <reference path="DosHeader.ts" />

module Mi.PE.PEFormat {
    export class PEFields {
        dosHeader: DosHeader;

        machine: Machine;
        timestamp: Date;
        imageCharacteristics: number;

        osVersion: Version;
        imageVersion: Version;

        win32Version: number;
        subsystem: number;
        dllCharacteristics: number;

        read: (reader: BinaryReader) => void;
    }
}