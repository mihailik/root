/// <reference path="../pe.ts" />

module pe.unmanaged {
    export class ResourceDataEntry {
        name: string = "";
        integerId: number = 0;
        dataRva: number = 0;
        size: number = 0;
        codepage: number = 0;
        reserved: number = 0;

        read(reader: io.BinaryReader) {
            this.dataRva = reader.readInt();
            this.size = reader.readInt();
            this.codepage = reader.readInt();
            this.reserved = reader.readInt();
        }
    }
}