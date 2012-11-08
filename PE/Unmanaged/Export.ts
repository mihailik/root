/// <reference path="../IO/BinaryReader.ts" />

module Mi.PE.Unmanaged {
    export class Export {
        name: string;
        ordinal: number;

        // The address of the exported symbol when loaded into memory, relative to the image base.
        // For example, the address of an exported function.
        exportRva: number;

        // Null-terminated ASCII string in the export section.
        // This string must be within the range that is given by the export table data directory entry.
        // This string gives the DLL name and the name of the export (for example, "MYDLL.expfunc")
        // or the DLL name and the ordinal number of the export (for example, "MYDLL.#27").
        forwarder: number;

        read(reader: Mi.PE.IO.BinaryReader) {
            throw new Error("Not implemented yet.");
        }
    }
}