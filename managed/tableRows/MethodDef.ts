/// <reference path="../metadata/TableStream.ts" />
/// <reference path="../MemberDefinitions.ts" />

module pe.managed.metadata {
    export class MethodDef {
        method = new MethodDefinition();

        rva: number;
        signature: any;
        paramList: number;

        read(reader: TableStreamReader) {
            this.rva = reader.readInt();
            this.method.implAttributes = reader.readShort();
            this.method.attributes = reader.readShort();
            this.method.name = reader.readString();
            this.signature = reader.readBlob();
            this.paramList = reader.readTableRowIndex(TableTypes.Param.index);
        }
    }
}