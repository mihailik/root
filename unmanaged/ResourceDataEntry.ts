/// <reference path="../pe.ts" />

module pe.unmanaged {
    export class ResourceDataEntry {
        name: string;
        integerId: number;
        dataRva: number;
        size: number;
        codepage: number;
        reserved: number;

        read(reader: io.BinaryReader) {
            this.dataRva = reader.readInt();
            this.size = reader.readInt();
            this.codepage = reader.readInt();
            this.reserved = reader.readInt();
        }
    }
}