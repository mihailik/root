/// <reference path="../metadata/TableStream.ts" />
/// <reference path="../MemberDefinitions.ts" />

module pe.managed.metadata {
    export class FieldDef {
        field = new FieldDefinition();
        signature: any;

        read(reader: TableStreamReader) {
            this.field.attributes = reader.readShort();
            this.field.name = reader.readString();
            this.signature = reader.readBlob();
        }
    }
}